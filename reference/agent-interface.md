# Agent Interface Reference

## Hosted MCP

```text
https://mcp.pubfi.ai
https://mcp.pubfi.ai/.well-known/mcp.json
```

## Public API Schema

```text
https://api.pubfi.ai/openapi.json
```

## Generic MCP Tools

| Tool | Purpose | Public input fields |
| --- | --- | --- |
| `pubfi.capabilities.search` | Search the installed Registry v2 catalog without provider I/O or usage. | `query`, `raw_path`, `method` |
| `pubfi.route.plan` | Plan an exact Registry route without provider I/O or usage. | `raw_path`, `method`, `objective`, `query` |
| `pubfi.route.execute` | Execute one exact Registry path through the same data plane as the HTTP gateway. This requires a PubFi API key and may consume allocation. | required `raw_path`, `method`; optional `query`, `body`, `idempotency_key`, `request_id` |
| `pubfi.route.explain` | Explain a Registry route decision without provider I/O or usage. | `raw_path`, `method`, `objective`, `query` |
| `pubfi.schema.get` | Return PubFi MCP input and output schema details for a named tool, especially `pubfi.route.execute`. This is read-only and intended for agent setup and validation before planning or execution. | `tool` |

Durable provider-specific public tools are rejected. Provider identity belongs in route-result data,
not tool names.

## Auth

```text
Authorization: Bearer <PubFi API key>
X-PubFi-Api-Key: <PubFi API key>
```

Upstream provider keys remain server-side.

## Execution Rule

`pubfi.route.execute` executes only an exact ready path and method from the installed Registry
generation. Unsupported paths, methods, non-ready operations, and invalid exact query or body bytes
fail closed with explicit reasons.

MCP uses only the API-key and allocation lane. Accountless x402 is available only on explicitly
eligible HTTP gateway routes.
