import json
import os
import signal
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from mcp_monitor_sdk import MonitoredFastMCP

TODOS_PATH = Path(__file__).resolve().parent / "todos.json"
todos: dict[str, dict] = {}
persist_ok = True


def load_todos() -> None:
    global persist_ok
    if not TODOS_PATH.exists():
        return
    try:
        raw = json.loads(TODOS_PATH.read_text())
        todos.clear()
        for item in raw:
            todos[item["id"]] = item
    except Exception:
        persist_ok = False
        raise


def save_todos() -> None:
    if not persist_ok:
        return
    items = sorted(todos.values(), key=lambda item: item["createdAt"])
    TODOS_PATH.write_text(json.dumps(items, indent=2) + "\n")


def as_text_list() -> str:
    if not todos:
        return "No todos."
    items = sorted(todos.values(), key=lambda item: item["createdAt"])
    return "\n".join(
        f"{'[x]' if item['completed'] else '[ ]'} {item['id']} {item['text']}"
        for item in items
    )


server = MonitoredFastMCP(
    "todo-mcp",
    server_name=os.environ.get("MCP_SERVER_NAME", "todo-mcp-py"),
    instance_secret=os.environ["MCP_MONITOR_SECRET"],
    metrics_server_url=os.environ.get(
        "METRICS_SERVER_URL", "http://localhost:8000/v1/metrics"
    ),
    log_level=os.environ.get("LOG_LEVEL", "info"),
)


@server.tool(name="todos_add", description="Add a todo item")
def todos_add(text: str) -> dict:
    todo_id = str(uuid4())
    todo = {
        "id": todo_id,
        "text": text,
        "completed": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    todos[todo_id] = todo
    save_todos()
    return {"content": f"Added {todo_id}", "todo": todo}


@server.tool(name="todos_list", description="List all todos")
def todos_list() -> dict:
    return {"content": as_text_list(), "todos": list(todos.values())}


@server.tool(name="todos_toggle", description="Toggle a todo completed state by id")
def todos_toggle(id: str) -> dict:
    todo = todos.get(id)
    if not todo:
        raise ValueError(f"Not found: {id}")
    todo = {**todo, "completed": not todo["completed"]}
    todos[id] = todo
    save_todos()
    return {"content": f"Toggled {id} -> {todo['completed']}", "todo": todo}


@server.tool(name="todos_remove", description="Remove a todo by id")
def todos_remove(id: str) -> dict:
    if id not in todos:
        raise ValueError(f"Not found: {id}")
    del todos[id]
    save_todos()
    return {"content": f"Removed {id}", "removedId": id}


def main() -> None:
    if "MCP_MONITOR_SECRET" not in os.environ:
        sys.stderr.write("MCP_MONITOR_SECRET is required\n")
        sys.exit(1)

    try:
        load_todos()
    except Exception as error:
        sys.stderr.write(f"Failed to load todos: {error}\n")

    def shutdown(_signum, _frame):
        raise SystemExit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    server.run()


if __name__ == "__main__":
    main()
