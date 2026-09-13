import json
import os
import signal
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from mcp_monitor_sdk import MonitoredFastMCP

STORE_PATH = Path(__file__).resolve().parent / "restaurant.json"
store: dict = {"menu": [], "tables": [], "orders": []}
persist_ok = True


def load_store() -> None:
    global persist_ok
    if not STORE_PATH.exists():
        return
    try:
        raw = json.loads(STORE_PATH.read_text())
        store["menu"] = raw.get("menu", [])
        store["tables"] = raw.get("tables", [])
        store["orders"] = raw.get("orders", [])
    except Exception:
        persist_ok = False
        raise


def save_store() -> None:
    if not persist_ok:
        return
    STORE_PATH.write_text(json.dumps(store, indent=2) + "\n")


def find_menu(item_id: str) -> dict | None:
    return next((item for item in store["menu"] if item["id"] == item_id), None)


def find_table(table_id: str) -> dict | None:
    return next((table for table in store["tables"] if table["id"] == table_id), None)


def find_order(order_id: str) -> dict | None:
    return next((order for order in store["orders"] if order["id"] == order_id), None)


def menu_text() -> str:
    if not store["menu"]:
        return "Menu is empty."
    return "\n".join(
        f"{item['name']}  {item['category']}  {item['price']}  ({item['id']})"
        for item in store["menu"]
    )


def tables_text() -> str:
    if not store["tables"]:
        return "No tables."
    return "\n".join(
        f"T{table['number']}  {table['seats']} seats  {table['status']}  ({table['id']})"
        for table in store["tables"]
    )


def orders_text(orders: list[dict]) -> str:
    if not orders:
        return "No orders."
    lines = []
    for order in orders:
        table = find_table(order["tableId"])
        table_label = f"T{table['number']}" if table else order["tableId"]
        items = ", ".join(
            f"{line['name']} x{line['qty']}" for line in order["items"]
        )
        lines.append(
            f"{order['id']}  {table_label}  {order['status']}  {items}  total={order['total']}"
        )
    return "\n".join(lines)


server = MonitoredFastMCP(
    "restaurant-mcp",
    api_key=os.environ["MCP_API_KEY"],
    metrics_server_url=os.environ.get(
        "METRICS_SERVER_URL",
        "https://mcp-metrics-server.just-a-dev.workers.dev/v1/metrics",
    ),
    log_level=os.environ.get("LOG_LEVEL", "info"),
)


@server.tool(name="menu_add", description="Add a menu item")
def menu_add(name: str, price: float, category: str) -> dict:
    item = {
        "id": str(uuid4()),
        "name": name,
        "price": float(price),
        "category": category,
    }
    store["menu"].append(item)
    save_store()
    return {"content": f"Added {name} ({item['id']})", "item": item}


@server.tool(name="menu_list", description="List menu items")
def menu_list() -> dict:
    return {"content": menu_text(), "menu": store["menu"]}


@server.tool(name="menu_remove", description="Remove a menu item by id")
def menu_remove(id: str) -> dict:
    item = find_menu(id)
    if not item:
        raise ValueError(f"Menu item not found: {id}")
    store["menu"] = [entry for entry in store["menu"] if entry["id"] != id]
    save_store()
    return {"content": f"Removed {id}", "removedId": id}


@server.tool(name="tables_add", description="Add a restaurant table")
def tables_add(number: int, seats: int) -> dict:
    if any(table["number"] == number for table in store["tables"]):
        raise ValueError(f"Table number already exists: {number}")
    table = {
        "id": str(uuid4()),
        "number": int(number),
        "seats": int(seats),
        "status": "free",
    }
    store["tables"].append(table)
    save_store()
    return {"content": f"Added table {number} ({table['id']})", "table": table}


@server.tool(name="tables_list", description="List restaurant tables")
def tables_list() -> dict:
    return {"content": tables_text(), "tables": store["tables"]}


@server.tool(name="tables_set_status", description="Set a table free or occupied")
def tables_set_status(id: str, status: str) -> dict:
    if status not in {"free", "occupied"}:
        raise ValueError("status must be free or occupied")
    table = find_table(id)
    if not table:
        raise ValueError(f"Table not found: {id}")
    table["status"] = status
    save_store()
    return {"content": f"Table {table['number']} is {status}", "table": table}


@server.tool(name="orders_create", description="Create an order for a table")
def orders_create(tableId: str, menuId: str, qty: int) -> dict:
    table = find_table(tableId)
    if not table:
        raise ValueError(f"Table not found: {tableId}")
    item = find_menu(menuId)
    if not item:
        raise ValueError(f"Menu item not found: {menuId}")
    if qty < 1:
        raise ValueError("qty must be at least 1")
    order = {
        "id": str(uuid4()),
        "tableId": tableId,
        "status": "open",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "items": [
            {
                "menuId": menuId,
                "name": item["name"],
                "price": item["price"],
                "qty": int(qty),
            }
        ],
        "total": item["price"] * int(qty),
    }
    table["status"] = "occupied"
    store["orders"].append(order)
    save_store()
    return {"content": f"Opened order {order['id']} on T{table['number']}", "order": order}


@server.tool(name="orders_add_item", description="Add a menu item to an open order")
def orders_add_item(orderId: str, menuId: str, qty: int) -> dict:
    order = find_order(orderId)
    if not order:
        raise ValueError(f"Order not found: {orderId}")
    if order["status"] != "open":
        raise ValueError(f"Order is not open: {orderId}")
    item = find_menu(menuId)
    if not item:
        raise ValueError(f"Menu item not found: {menuId}")
    if qty < 1:
        raise ValueError("qty must be at least 1")
    existing = next((line for line in order["items"] if line["menuId"] == menuId), None)
    if existing:
        existing["qty"] += int(qty)
    else:
        order["items"].append(
            {
                "menuId": menuId,
                "name": item["name"],
                "price": item["price"],
                "qty": int(qty),
            }
        )
    order["total"] = sum(line["price"] * line["qty"] for line in order["items"])
    save_store()
    return {"content": f"Updated order {orderId}", "order": order}


@server.tool(name="orders_list", description="List orders, optionally by table")
def orders_list(tableId: str = "") -> dict:
    orders = store["orders"]
    if tableId:
        orders = [order for order in orders if order["tableId"] == tableId]
    return {"content": orders_text(orders), "orders": orders}


@server.tool(name="orders_complete", description="Complete an open order and free the table")
def orders_complete(orderId: str) -> dict:
    order = find_order(orderId)
    if not order:
        raise ValueError(f"Order not found: {orderId}")
    if order["status"] != "open":
        raise ValueError(f"Order is not open: {orderId}")
    order["status"] = "done"
    table = find_table(order["tableId"])
    if table and not any(
        other["tableId"] == table["id"] and other["status"] == "open"
        for other in store["orders"]
        if other["id"] != orderId
    ):
        table["status"] = "free"
    save_store()
    return {"content": f"Completed {orderId} total={order['total']}", "order": order}


def main() -> None:
    if "MCP_API_KEY" not in os.environ:
        sys.stderr.write("MCP_API_KEY is required\n")
        sys.exit(1)

    try:
        load_store()
    except Exception as error:
        sys.stderr.write(f"Failed to load restaurant store: {error}\n")

    def shutdown(_signum, _frame):
        raise SystemExit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    server.run()


if __name__ == "__main__":
    main()
