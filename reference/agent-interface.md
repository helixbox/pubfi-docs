---
title: Agent Interface Reference
description: Reference PubFi's hosted MCP endpoint, generic tools, authentication, inputs, and execution rules.
---

## Hosted MCP

```text
https://mcp.pubfi.ai
https://mcp.pubfi.ai/x402
https://mcp.pubfi.ai/.well-known/mcp.json
https://mcp.pubfi.ai/.well-known/oauth-protected-resource
```

The root is the authenticated endpoint. The `/x402` endpoint is the separate accountless payment
lane. Both expose the same fixed tools and public introspection methods.

## OAuth Discovery

| Environment | Protected resource metadata | Authorization server |
| --- | --- | --- |
| Staging | `https://mcp-stg.pubfi.ai/.well-known/oauth-protected-resource` | `https://qwcbvvgcwdlpumawlajf.supabase.co/auth/v1` |
| Production | `https://mcp.pubfi.ai/.well-known/oauth-protected-resource` | `https://wuugpdblvlpptlgnxwoi.supabase.co/auth/v1` |

The discovery manifest uses schema `pubfi.mcp.discovery.v4`. Its `auth` object advertises
`pubfi_api_key` and `oauth_access_token`, sets `fallback: false`, and publishes the protected
resource and authorization-server URLs. OAuth consent can redirect the signed-in user to the
product site's `/oauth/consent` page. Treat the `authorization_id` as an opaque continuation value;
do not construct or modify it.

## Public API Schema

```text
https://api.pubfi.ai/openapi.json
```

## Generic MCP Tools

| Tool | Purpose | Public input fields |
| --- | --- | --- |
| `pubfi.capabilities.list` | Enumerate deterministic compact pages from the installed Registry v2 catalog. PubFi does not rank, infer intent, or select a capability. | optional `limit`, opaque `cursor`, exact `provider_key`, exact `method` |
| `pubfi.capabilities.get` | Return the full typed request, response, method-specific billing, and readiness contract for one exact capability. | required `capability_id` from `pubfi.capabilities.list` |
| `pubfi.route.execute` | Execute one exact Registry path through the same data plane as the HTTP gateway. Use a PubFi API key or OAuth access token on the authenticated root, or use accountless x402 on the explicit `/x402` endpoint. | required `raw_path`, `method`; optional `query`, `body`, `idempotency_key`, `request_id`; optional MCP `_meta["x402/payment"]` only on an `/x402` paid retry |

Durable provider-specific public tools are rejected. Provider identity belongs in route-result data,
not tool names.

`pubfi.capabilities.list` and `pubfi.capabilities.get` are public reads. Follow every opaque
`next_cursor`, select a capability in the client, and fetch its exact detail before execution.
Use `tools/list` for the current MCP input and output schemas.

## Auth

```text
Authorization: Bearer <PubFi API key or OAuth access token>
```

The authenticated root classifies a token with the `pf_sk_v1_` prefix as a PubFi API key. It
classifies every other Bearer token as an OAuth access token. The two credential types do not fall
back to each other. A missing or invalid credential for `pubfi.route.execute` returns `401` with a
`WWW-Authenticate` challenge that points to the environment's protected-resource metadata.

`X-PubFi-Api-Key` is not accepted. Its presence is still a Bearer carrier. The `/x402` endpoint
rejects every Bearer carrier, including `Authorization` and `X-PubFi-Api-Key`.

Upstream provider keys remain server-side.

## Execution Rule

`pubfi.route.execute` executes only an exact ready path and method from the installed Registry
generation. Unsupported paths, methods, non-ready operations, and invalid or oversized query or
body bytes fail closed with explicit reasons. The optional `query` is forwarded byte-for-byte when it is a
valid RFC 3986 query component of at most 65,536 encoded bytes. Duplicate and undeclared fields are
allowed; PubFi does not enforce source-declared query-field or value relationships. A non-empty
`POST` body is forwarded byte-for-byte within the selected route's body limit and uses the
route-selected media type. PubFi does not apply the source schema to those bytes during execution.
An empty body is omitted, and `GET` bodies are rejected.

MCP adapts provider response bytes to JSON-RPC: valid JSON becomes a JSON value, valid `text/*`
becomes a string, and other or invalid bytes become an object with `encoding: "base64"` and a
`data` field. An empty provider body becomes `null`.

Catalog and detail schema v5 expose billing under the selected method's `operations[]` entry.
`quantro_priced` carries a positive `credit_cost` and independent x402 terms under one immutable
price version. `free_health` is public and has no Credit or x402 charge. `pricing_unavailable`
cannot enter a paid execution lane.

An optional capability-level `free_rate_limit` advertises that the exact `GET` or `POST` operation
has an API-key-authenticated free variant. Its required fields are `requests_per_window`,
`window_seconds`, `max_concurrency`, and `permit_ttl_seconds`; it can also include `quota`,
`total_request_limit`, and `bucket_scope`. Append `:free` to the final segment of `raw_path` only
when that field is present, keep the provider query and bounded body intended for the selected
operation. The same variant appears in Runtime OpenAPI as
`x-pubfi-free-variant`. A successful MCP result has
`execution_status: registry_free_route_executed` and `credits_charged: 0`; it does not reserve or
emit Credit usage. Anonymous and x402 admissions cannot use this suffix.

On the authenticated root, MCP `pubfi.route.execute` accepts one PubFi API key or OAuth access
token. It rejects x402 payment metadata and never falls back to payment. OAuth execution resolves
the user to the same account admission boundary; an advertised `:free` variant remains
account-bound.

Accountless x402 uses the explicit `/x402` endpoint. That endpoint rejects Bearer credentials. An
unsigned eligible call returns `PaymentRequired` in a normal MCP tool result; the paid retry uses
`_meta["x402/payment"]`; the settled result uses
`_meta["x402/payment-response"]`. If payment processing rejects a paid retry and supplies a new
requirement, the error result preserves the official `PaymentRequired` fields in
`structuredContent` and adds an `error` message. Validate it as a new challenge before signing
again.

Use [MCP Client Setup](/getting-started/mcp-client) for transport configuration. Use [Accountless
x402](/getting-started/x402) for payment validation and replay policy.
