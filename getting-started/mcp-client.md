# MCP Client Setup

PubFi exposes generic route and capability tools over MCP. The hosted endpoint is:

```text
https://mcp.pubfi.ai
```

The discovery manifest is:

```text
https://mcp.pubfi.ai/.well-known/mcp.json
```

## Tools

- `pubfi.capabilities.search`
- `pubfi.route.plan`
- `pubfi.route.execute`
- `pubfi.route.explain`
- `pubfi.schema.get`

Provider ids, exact paths, methods, request policies, response policies, and readiness appear as
Registry catalog or route-result data. They are not public tool names.

## Auth

All hosted MCP `tools/call` requests require a PubFi API key. Public handshake and introspection
methods, such as `initialize`, `ping`, `tools/list`, `resources/list`, `resources/templates/list`,
`prompts/list`, and `notifications/initialized`, can be called without a key:

```text
Authorization: Bearer <PubFi API key>
X-PubFi-Api-Key: <PubFi API key>
```

Do not pass upstream provider keys as MCP arguments. PubFi leases upstream credentials server-side
when the selected route is callable and configured.

## Local Stdio Bridge

The current public-safe local example lives in the source repository at:

```text
examples/agents/pubfi-route-tools-mcp/
```

PubFi's MCP server is hosted at `https://mcp.pubfi.ai`. The local file is not a second MCP backend
and it does not run provider logic locally. It is a dependency-free stdio bridge for MCP clients
that launch tools as local commands. The bridge forwards `initialize`, `ping`, `tools/list`, and
authenticated `tools/call` requests to the hosted Rust MCP endpoint, then writes the response back
to stdio. Other hosted public introspection methods remain available on `https://mcp.pubfi.ai`;
the local bridge keeps its stdio surface intentionally small.

```sh
export PROD_PUBFI_API_KEY='<PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

## Recommended Agent Flow

1. Call `pubfi.capabilities.search` with a query or exact path and method.
2. Call `pubfi.route.plan` with the exact `raw_path` and `method`.
3. Call `pubfi.route.explain` when the plan needs a reason readback.
4. Call `pubfi.schema.get` before constructing execution input.
5. Call `pubfi.route.execute` only for an exact ready `raw_path` and `method`.

## Tool Inputs

The hosted `tools/list` method publishes the current JSON Schema for each tool. The current public
input fields are:

| Tool | Input fields |
| --- | --- |
| `pubfi.capabilities.search` | `query`, `raw_path`, `method` |
| `pubfi.route.plan` | `raw_path`, `method`, `objective`, `query` |
| `pubfi.route.execute` | required `raw_path`, `method`; optional `query`, `body`, `idempotency_key`, `request_id` |
| `pubfi.route.explain` | `raw_path`, `method`, `objective`, `query` |
| `pubfi.schema.get` | `tool` |

## Fail-Closed Behavior

Unsupported paths, methods, non-ready operations, invalid exact query or body bytes, and supplier
procurement attempts return explicit gate readbacks rather than silently calling upstream APIs.

MCP execution uses the API-key lane. It does not accept `PAYMENT-SIGNATURE` and does not provide an
x402 payment flow.
