# MCP Metrics Server

A lightweight metrics collection server built with Hono and Bun.

## Features

- Fast Bun runtime
- Minimal Hono framework
- CORS enabled
- Request logging
- Health check endpoint

## Installation

```bash
bun install
```

## Usage

### Development (with auto-reload)

```bash
bun run dev
```

### Production

```bash
bun run start
```

Server runs on `http://localhost:8000`

## Endpoints

### `GET /`

Server info and available endpoints

### `GET /health`

Health check endpoint

### `POST /metrics`

Receive metrics batch from MCP SDK

**Request body:**

```json
[
  {
    "callId": "uuid",
    "toolName": "todos_add",
    "timestamp": "2025-12-14T18:50:10.885Z",
    "duration": 15,
    "inputSize": 31,
    "outputSize": 243,
    "success": true
  }
]
```

**Response:**

```json
{
  "received": 1,
  "timestamp": "2025-12-14T18:50:10.885Z"
}
```

## Configuration

Set port via environment variable:

```bash
PORT=8080 bun run start
```

## Connect MCP SDK

Update your MCP server to send metrics:

```typescript
import ky from "ky";

const server = new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  undefined,
  {
    batchSize: 50,
    onBatchReady: async (events) => {
      await ky.post("http://localhost:8000/metrics", {
        json: events,
      });
    },
  }
);
```

Install ky: `npm install ky` or `bun add ky`
