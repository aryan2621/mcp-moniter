.DEFAULT_GOAL := help

.PHONY: help up down api api-dev ui app \
	install install-py \
	sdk-js-build sdk-js-typecheck sdk-py-install \
	demo-todo-js demo-attendance-js demo-todo-py demo-restaurant-py \
	typecheck

help:
	@echo "MCP Monitor (local)"
	@echo ""
	@echo "Stack"
	@echo "  make up                 Docker Compose (Postgres + API)  http://localhost:8000"
	@echo "  make down               Stop Compose"
	@echo "  make api-dev            API with reload                  (needs POSTGRES_URL + INSTANCE_SECRET)"
	@echo "  make api                API once"
	@echo "  make ui                 Dashboard                        http://localhost:3000"
	@echo "  make app                Tauri desktop (starts UI)"
	@echo ""
	@echo "Install"
	@echo "  make install            npm install (server, ui, app, sdk/js, demo/js)"
	@echo "  make install-py         pip install -e sdk/py and demo/python"
	@echo ""
	@echo "SDKs"
	@echo "  make sdk-js-build       Build JS SDK"
	@echo "  make sdk-js-typecheck   Typecheck JS SDK"
	@echo "  make sdk-py-install     pip install -e sdk/py"
	@echo ""
	@echo "Demos  (MCP_MONITOR_SECRET required, min 16 chars)"
	@echo "  make demo-todo-js       JS todo MCP server"
	@echo "  make demo-attendance-js JS attendance MCP server"
	@echo "  make demo-todo-py       Python todo MCP server"
	@echo "  make demo-restaurant-py Python restaurant MCP server"
	@echo ""
	@echo "Check"
	@echo "  make typecheck          Typecheck server, UI, JS SDK, JS demo"
	@echo ""
	@echo "Copy .env.example to .env and set INSTANCE_SECRET before make up."
	@echo "Demos also use METRICS_SERVER_URL (default http://localhost:8000/v1/metrics)."

up:
	docker compose up --build

down:
	docker compose down

api-dev:
	npm --prefix server run dev

api:
	npm --prefix server run start

ui:
	npm --prefix ui run dev

app:
	npm --prefix app run dev

install:
	npm --prefix server install
	npm --prefix ui install
	npm --prefix app install
	npm --prefix sdk/js install
	npm --prefix demo/js install

install-py:
	pip install -e sdk/py
	pip install -e demo/python

sdk-js-build:
	npm --prefix sdk/js run build

sdk-js-typecheck:
	npm --prefix sdk/js run typecheck

sdk-py-install:
	pip install -e sdk/py

demo-todo-js:
	npm --prefix demo/js run todo-server

demo-attendance-js:
	npm --prefix demo/js run attendance-server

demo-todo-py:
	cd demo/python && python todo_mcp_server.py

demo-restaurant-py:
	cd demo/python && python restaurant_mcp_server.py

typecheck:
	npm --prefix server run typecheck
	npm --prefix ui run type-check
	npm --prefix sdk/js run typecheck
	npm --prefix demo/js run typecheck
