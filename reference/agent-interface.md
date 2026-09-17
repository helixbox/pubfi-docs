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
lane. The root exposes four fixed tools, while `/x402` exposes only the three general Registry
tools. Both expose the same public introspection methods. Their `tools/list` security, output,
annotation, and execution descriptions are endpoint-specific.

The product-site server card at `https://pubfi.ai/.well-known/mcp/server-card.json` publishes its
`version` from the current web package and sets both `serverUrl` and `transport.endpoint` to the
resolved hosted MCP origin. Staging resolves both endpoint fields to `https://mcp-stg.pubfi.ai`;
Production resolves them to `https://mcp.pubfi.ai`.

## Protocol Contract

The discovery manifest uses schema `pubfi.mcp.discovery.v6`. Its protocol object identifies MCP
`2026-07-28` as the current version and MCP `2025-11-25` as the supported legacy version. PubFi
does not create protocol sessions.

| Protocol | Entry method | Request contract | Result contract |
| --- | --- | --- | --- |
| `2026-07-28` | `server/discover` | Complete per-request protocol and client capability metadata, `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` when the method addresses a named object | Complete-result encoding |
| `2025-11-25` | `initialize` | Initialize-era lifecycle and `MCP-Protocol-Version` after initialization | Initialize-era encoding |

`server/discover` advertises only the modern version. The hosted endpoint still accepts the
legacy lifecycle (`initialize`, `notifications/initialized`, and `ping`) for compatible clients.
The local stdio bridge is modern-only; legacy clients connect directly to the hosted endpoint.

## OAuth Discovery

| Environment | Protected resource metadata | Authorization server |
| --- | --- | --- |
| Staging | `https://mcp-stg.pubfi.ai/.well-known/oauth-protected-resource` | `https://mcp-stg.pubfi.ai` |
| Production | `https://mcp.pubfi.ai/.well-known/oauth-protected-resource` | `https://mcp.pubfi.ai` |

The manifest's `auth` object advertises `pubfi_api_key` and `oauth_access_token`, sets
`fallback: false`, and publishes the protected-resource and authorization-server URLs. OAuth
consent can redirect the signed-in user to the product site's `/oauth/consent` page. Treat the
`authorization_id` as an opaque continuation value; do not construct or modify it.
The authorization-server metadata is at `/.well-known/oauth-authorization-server` on the selected
MCP origin. PubFi owns client registration, authorization, token exchange, refresh, and revocation.

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
| `pubfi.substrate.runtime_upgrade.verify` | Verify one reviewed Substrate `System.apply_authorized_upgrade` extrinsic through the authenticated account lane. This tool is not available on `/x402`. | required `network`, `expected_authorized_code_hash`, and exactly one of `extrinsic_index` or `extrinsic_hash`; optional `idempotency_key`, `request_id` |

Durable provider-specific public tools are rejected. Provider identity belongs in route-result data,
not tool names.

`pubfi.capabilities.list` and `pubfi.capabilities.get` are public reads. Follow every opaque
`next_cursor`, select a capability in the client, and fetch its exact detail before execution.
Use `tools/list` on the endpoint that the client will call. On the authenticated root, the two
capability tools declare `noauth`, while both execution tools declare `oauth2` with no scopes.
Route execution exposes only free-health, account-free, and account-paid outcomes. The runtime-
upgrade verifier is idempotent and returns only its compact proof. On `/x402`, all three tools
declare `noauth`, and route execution exposes only free-health, x402 settlement,
payment-required, and x402 error outcomes. Capability reads are read-only, idempotent, and
closed-world. Route execution is non-read-only, destructive, and non-idempotent; the authenticated
surface is closed-world, while the x402 surface is open-world.

## Auth

```text
Authorization: Bearer <PubFi API key or OAuth access token>
```

The authenticated root classifies a token with the `pf_sk_v1_` prefix as a PubFi API key. It
classifies every other Bearer token as an OAuth access token. The two credential types do not fall
back to each other. A missing credential or an invalid OAuth credential for either execution tool
returns HTTP `401`, a protected-resource `WWW-Authenticate` header, and an
MCP error tool result with `_meta["mcp/www_authenticate"]` so an OAuth-capable host can start or
repair account linking. An invalid `pf_sk_v1_` API key returns the API-key `401` error without that
tool result. Public methods reject a supplied invalid credential instead of ignoring it.

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
`data` field. An empty provider body becomes `null`. These inline forms are limited to 1 MiB.

A larger result returns exactly one HTTPS `resource_link` plus compact text and
`structuredContent.upstream_response` fallback metadata. The metadata contains `status`,
`content_type`, `bytes`, `sha256`, `expiry`, and `uri`, but no inline `body`. The link has the
provider media type, byte size, and `audience: ["user"]`. Follow the capability URI before expiry
to receive the original status, media type, and exact bytes. PubFi does not publish generic
artifact resources, templates, or a resource-read tool.

The output schema retains `free_health_executed` and `free_health` for compatibility. These
values do not make upstream health operations free. An advertised account-free `:free` result
uses `execution_status: registry_free_route_executed` and `credits_charged: 0`.

Catalog and detail schema v5 expose billing under the selected method's `operations[]` entry.
`quantro_priced` carries a positive `credit_cost` and independent x402 terms under one immutable
price version. Relayed upstream health operations follow the same pricing rules.
`pricing_unavailable` cannot enter a paid execution lane and does not fall back to free access.

An optional capability-level `free_rate_limit` advertises that the exact `GET` or `POST` operation
has an API-key-authenticated free variant. Its required fields are `requests_per_window`,
`window_seconds`, `max_concurrency`, and `permit_ttl_seconds`; it can also include `quota`,
`total_request_limit`, and `bucket_scope`. Append `:free` to the final segment of `raw_path` only
when that field is present, keep the provider query and bounded body intended for the selected
operation. The same variant appears in Runtime OpenAPI as
`x-pubfi-free-variant`. A successful MCP result has
`execution_status: registry_free_route_executed` and `credits_charged: 0`; it does not reserve or
emit Credit usage. Anonymous and x402 admissions cannot use this suffix.

Direct-HTTP response delivery is automatic on the normal authenticated paid or `:free` route. Do
not append a `:stream` suffix; the catalog and Runtime OpenAPI do not publish stream-policy
metadata. The runtime uses a 128 MiB platform ceiling, 10-second idle deadline, 120-second total
body deadline, and heavy-transfer concurrency limits of 1 per account, 4 per provider, and 8
globally. A route can impose a stricter budget. Caller-explicit idempotency retains the encrypted
response for exact replay for 24 hours; an expired replay returns `410` without another provider
request or charge.

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

## Runtime Upgrade Verification

`pubfi.substrate.runtime_upgrade.verify` is available only on the authenticated root. Supply one
PubFi API key or OAuth access token, a lowercase network id, the expected Blake2b-256 hash of the
FRAME System `AuthorizedUpgrade` code payload in `expected_authorized_code_hash`, and exactly one
extrinsic locator. Do not supply the active `:code` hash at the apply block.

The server reads at most 64 MiB of reviewed provider JSON, hashes the runtime code while decoding
it, discards the provider bytes, and returns a compact proof. The neutral completed status is
`runtime_upgrade_verification_completed`. Inspect `matches` and `extrinsic_success` independently;
a hash mismatch or unsuccessful extrinsic is a completed negative proof. The operation charges one
Credit, and an identical idempotent replay does not call the provider or charge again.

Use [MCP Client Setup](/getting-started/mcp-client) for transport configuration. Use [Accountless
x402](/getting-started/x402) for payment validation and replay policy.
