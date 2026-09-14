import json
import os
import signal
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from mcp_monitor_sdk import MonitoredFastMCP

STORE_PATH = Path(__file__).resolve().parent / "shop.json"
store: dict = {"products": [], "orders": []}
persist_ok = True


def load_store() -> None:
    global persist_ok
    if not STORE_PATH.exists():
        return
    try:
        raw = json.loads(STORE_PATH.read_text())
        store["products"] = raw.get("products", [])
        store["orders"] = raw.get("orders", [])
    except Exception:
        persist_ok = False
        raise


def save_store() -> None:
    if not persist_ok:
        return
    STORE_PATH.write_text(json.dumps(store, indent=2) + "\n")


def find_product(product_id: str) -> dict | None:
    return next((item for item in store["products"] if item["id"] == product_id), None)


def find_order(order_id: str) -> dict | None:
    return next((order for order in store["orders"] if order["id"] == order_id), None)


def products_text() -> str:
    if not store["products"]:
        return "No products."
    return "\n".join(
        f"{item['name']}  {item['price']}  stock={item['stock']}  ({item['id']})"
        for item in store["products"]
    )


def orders_text(orders: list[dict]) -> str:
    if not orders:
        return "No orders."
    lines = []
    for order in orders:
        items = ", ".join(f"{line['name']} x{line['qty']}" for line in order["items"])
        lines.append(f"{order['id']}  {order['status']}  {items}  total={order['total']}")
    return "\n".join(lines)


server = MonitoredFastMCP(
    "shop-mcp",
    api_key=os.environ["MCP_API_KEY"],
    metrics_server_url=os.environ.get(
        "METRICS_SERVER_URL",
        "https://mcp-metrics-server.just-a-dev.workers.dev/v1/metrics",
    ),
    log_level=os.environ.get("LOG_LEVEL", "info"),
)


@server.tool(name="products_add", description="Add a shop product")
def products_add(name: str, price: float, stock: int) -> dict:
    if stock < 0:
        raise ValueError("stock must be >= 0")
    item = {
        "id": str(uuid4()),
        "name": name,
        "price": float(price),
        "stock": int(stock),
    }
    store["products"].append(item)
    save_store()
    return {"content": f"Added {name} ({item['id']})", "product": item}


@server.tool(name="products_list", description="List shop products")
def products_list() -> dict:
    return {"content": products_text(), "products": store["products"]}


@server.tool(name="products_remove", description="Remove a product by id")
def products_remove(id: str) -> dict:
    item = find_product(id)
    if not item:
        raise ValueError(f"Product not found: {id}")
    store["products"] = [entry for entry in store["products"] if entry["id"] != id]
    save_store()
    return {"content": f"Removed {id}", "removedId": id}


@server.tool(name="orders_create", description="Create a shop order for a product")
def orders_create(productId: str, qty: int) -> dict:
    item = find_product(productId)
    if not item:
        raise ValueError(f"Product not found: {productId}")
    if qty < 1:
        raise ValueError("qty must be at least 1")
    if item["stock"] < qty:
        raise ValueError(f"Insufficient stock for {item['name']}: have {item['stock']}")
    order = {
        "id": str(uuid4()),
        "status": "open",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "items": [
            {
                "productId": productId,
                "name": item["name"],
                "price": item["price"],
                "qty": int(qty),
            }
        ],
        "total": item["price"] * int(qty),
    }
    item["stock"] -= int(qty)
    store["orders"].append(order)
    save_store()
    return {"content": f"Opened order {order['id']}", "order": order}


@server.tool(name="orders_add_item", description="Add a product to an open shop order")
def orders_add_item(orderId: str, productId: str, qty: int) -> dict:
    order = find_order(orderId)
    if not order:
        raise ValueError(f"Order not found: {orderId}")
    if order["status"] != "open":
        raise ValueError(f"Order is not open: {orderId}")
    item = find_product(productId)
    if not item:
        raise ValueError(f"Product not found: {productId}")
    if qty < 1:
        raise ValueError("qty must be at least 1")
    if item["stock"] < qty:
        raise ValueError(f"Insufficient stock for {item['name']}: have {item['stock']}")
    existing = next((line for line in order["items"] if line["productId"] == productId), None)
    if existing:
        existing["qty"] += int(qty)
    else:
        order["items"].append(
            {
                "productId": productId,
                "name": item["name"],
                "price": item["price"],
                "qty": int(qty),
            }
        )
    item["stock"] -= int(qty)
    order["total"] = sum(line["price"] * line["qty"] for line in order["items"])
    save_store()
    return {"content": f"Updated order {orderId}", "order": order}


@server.tool(name="orders_list", description="List shop orders")
def orders_list() -> dict:
    return {"content": orders_text(store["orders"]), "orders": store["orders"]}


@server.tool(name="orders_complete", description="Complete an open shop order")
def orders_complete(orderId: str) -> dict:
    order = find_order(orderId)
    if not order:
        raise ValueError(f"Order not found: {orderId}")
    if order["status"] != "open":
        raise ValueError(f"Order is not open: {orderId}")
    order["status"] = "done"
    save_store()
    return {"content": f"Completed {orderId} total={order['total']}", "order": order}


def main() -> None:
    if "MCP_API_KEY" not in os.environ:
        sys.stderr.write("MCP_API_KEY is required\n")
        sys.exit(1)

    try:
        load_store()
    except Exception as error:
        sys.stderr.write(f"Failed to load shop store: {error}\n")

    def shutdown(_signum, _frame):
        raise SystemExit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    server.run()


if __name__ == "__main__":
    main()
