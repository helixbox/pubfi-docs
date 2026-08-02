---
title: Agent Interface Reference
description: Reference PubFi's hosted MCP endpoint, generic tools, authentication, inputs, and execution rules.
---

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
| `pubfi.capabilities.list` | Enumerate deterministic compact pages from the installed Registry v2 catalog. PubFi does not rank, infer intent, or select a capability. | optional `limit`, opaque `cursor`, exact `provider_key`, exact `method` |
| `pubfi.capabilities.get` | Return the full typed request, response, metering, and readiness contract for one exact capability. | required `capability_id` from `pubfi.capabilities.list` |
| `pubfi.route.execute` | Execute one exact Registry path through the same data plane as the HTTP gateway. Use either a PubFi API key, which may consume allocation, or accountless x402 on an eligible route. | required `raw_path`, `method`; optional `query`, `body`, `idempotency_key`, `request_id`; optional MCP `_meta["x402/payment"]` on a paid retry |

Durable provider-specific public tools are rejected. Provider identity belongs in route-result data,
not tool names.

`pubfi.capabilities.list` and `pubfi.capabilities.get` are public reads. Follow every opaque
`next_cursor`, select a capability in the client, and fetch its exact detail before execution.
Use `tools/list` for the current MCP input and output schemas.

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

MCP `pubfi.route.execute` supports the API-key/allocation lane and the mutually exclusive
accountless x402 lane. The unsigned x402 call returns `PaymentRequired` in a normal MCP tool
result; the paid retry uses `_meta["x402/payment"]`; the settled result uses
`_meta["x402/payment-response"]`.

Use [MCP Client Setup](/getting-started/mcp-client) for transport configuration. Use [Accountless
x402](/getting-started/x402) for payment validation and replay policy.
