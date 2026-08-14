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
| `pubfi.capabilities.get` | Return the full typed request, response, method-specific billing, and readiness contract for one exact capability. | required `capability_id` from `pubfi.capabilities.list` |
| `pubfi.route.execute` | Execute one exact Registry path through the same data plane as the HTTP gateway. Use a PubFi API key for priced execution or an advertised account-level `:free` variant, or use accountless x402 on an eligible route. | required `raw_path`, `method`; optional `query`, `body`, `idempotency_key`, `request_id`; optional MCP `_meta["x402/payment"]` on a paid retry |

Durable provider-specific public tools are rejected. Provider identity belongs in route-result data,
not tool names.

`pubfi.capabilities.list` and `pubfi.capabilities.get` are public reads. Follow every opaque
`next_cursor`, select a capability in the client, and fetch its exact detail before execution.
Use `tools/list` for the current MCP input and output schemas.

## Auth

```text
Authorization: Bearer <PubFi API key>
```

`X-PubFi-Api-Key` is not accepted. Its presence still selects the credential lane, so an
accountless x402 call must omit it as well as `Authorization`.

Upstream provider keys remain server-side.

## Execution Rule

`pubfi.route.execute` executes only an exact ready path and method from the installed Registry
generation. Unsupported paths, methods, non-ready operations, and invalid exact query or body bytes
fail closed with explicit reasons. The optional `query` is forwarded byte-for-byte when it is a
valid RFC 3986 query component of at most 65,536 encoded bytes. Duplicate and undeclared fields are
allowed; PubFi does not enforce source-declared query-field or value relationships. The optional
`body` remains subject to the selected operation's body policy.

Catalog and detail schema v5 expose billing under the selected method's `operations[]` entry.
`quantro_priced` carries a positive `credit_cost` and independent x402 terms under one immutable
price version. `free_health` is public and has no Credit or x402 charge. `pricing_unavailable`
cannot enter a paid execution lane.

An optional capability-level `free_rate_limit` advertises that the exact `GET` or `POST` operation
has an API-key-authenticated free variant. Its required fields are `requests_per_window`,
`window_seconds`, `max_concurrency`, and `permit_ttl_seconds`; it can also include `quota`,
`total_request_limit`, and `bucket_scope`. Append `:free` to the final segment of `raw_path` only
when that field is present, keep the provider query intended for the selected operation, and keep
the body required by its body policy. The same variant appears in Runtime OpenAPI as
`x-pubfi-free-variant`. A successful MCP result has
`execution_status: registry_free_route_executed` and `credits_charged: 0`; it does not reserve or
emit Credit usage. Anonymous and x402 admissions cannot use this suffix.

MCP `pubfi.route.execute` supports the API-key/allocation lane and the mutually exclusive
accountless x402 lane. The unsigned x402 call returns `PaymentRequired` in a normal MCP tool
result; the paid retry uses `_meta["x402/payment"]`; the settled result uses
`_meta["x402/payment-response"]`. If payment processing rejects a paid retry and supplies a new
requirement, the error result preserves the official `PaymentRequired` fields in
`structuredContent` and adds an `error` message. Validate it as a new challenge before signing
again.

Use [MCP Client Setup](/getting-started/mcp-client) for transport configuration. Use [Accountless
x402](/getting-started/x402) for payment validation and replay policy.
