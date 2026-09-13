# MCP Metrics Server

A lightweight metrics collection server built with Hono on Cloudflare Workers.

## Features

- Cloudflare Workers runtime (Wrangler)
- Hono framework
- CORS enabled
- Request logging
- Health check endpoint

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

Server runs on `http://localhost:8000`

### Production

```bash
npm run deploy
```

## Endpoints

### `GET /`

Server info and available endpoints

### `GET /health`

Health check endpoint

### `POST /v1/metrics`

Receive metrics batch from MCP SDK (requires `X-API-Key` header)

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

## Connect MCP SDK

Update your MCP server to send metrics to `POST /v1/metrics` with `X-API-Key` header. Use the SDK's `metricsServerUrl` and `apiKey` options (e.g. `http://localhost:8000/v1/metrics`).
