---
title: API Reference
description: Use PubFi's interactive API reference and Registry-derived Runtime OpenAPI.
---

PubFi publishes an interactive reference and a machine-readable Runtime OpenAPI:

- [Interactive API Reference](https://api.pubfi.ai/reference)
- [Runtime OpenAPI JSON](https://api.pubfi.ai/openapi.json)

## Runtime Authority

The Runtime OpenAPI is generated from the currently installed Registry v2 snapshot. It merges
account, purchase, health, and MCP routes with current `ready` gateway operations. It does not use
a static provider schema as a fallback.

The document identifies its Registry authority with:

- `x-pubfi-registry`;
- `x-pubfi-registry-generation`; and
- `x-pubfi-registry-manifest`.

Each generated Registry operation can also describe the exact route, provider, upstream, matcher,
readiness, request policy, response policy, billing, meter, and maximum raw units.

For an operation whose `x-pubfi-billing.mode` is `quantro_priced`, Runtime OpenAPI also copies the
method price into these top-level extensions:

| Extension | Value |
| --- | --- |
| `x-pubfi-credit-cost` | Positive Credit cost for API-key execution. |
| `x-pubfi-price-policy-key` | Stable price-policy identity. |
| `x-pubfi-price-version` | Immutable version shared by the Credit and x402 values. |
| `x-pubfi-x402` | Exact `network`, `asset`, `atomic_amount`, and `offer_id` for x402 execution. |

Runtime OpenAPI omits these four top-level price extensions for `free_health` and
`pricing_unavailable` operations. Use `x-pubfi-billing` to read the billing mode.

If no valid snapshot is programmed, the document reports that the Registry is unavailable. It
does not advertise old gateway operations in that state.

## Catalog And OpenAPI Roles

Use these surfaces together:

| Surface | Use |
| --- | --- |
| `GET /v1/capabilities` | Inspect all operations in the installed generation, including `ready` and `blocked` entries. |
| `GET /openapi.json` | Inspect request-construction metadata for current `ready` HTTP operations. |
| `GET /reference` | Explore the same OpenAPI in an interactive UI. |
| `GET /v1/operation-pricing-inventory` | Inspect the complete public-safe producer projection used to construct one immutable pricing generation. It contains no selected price and is not execution authority. |

The operation-pricing inventory uses `Cache-Control: no-store` and returns `503` instead of
silently omitting a plan that cannot form the complete approved projection.

A Discovery page is source-selection context. It is not Registry execution authority.

## Response Contract

A successful gateway request returns the provider's exact bounded response bytes for the selected
operation. It is not wrapped in a PubFi success envelope.

Every success includes:

- `Content-Type`;
- `x-pubfi-request-id`.

An API-key lane success also includes `x-pubfi-registry-generation`. A settled x402 lane success
instead includes `PAYMENT-RESPONSE` and `Cache-Control: private, no-store`.

The body and media type depend on the provider response. PubFi reduces a valid `Content-Type` to
its parameter-free media type and uses `application/octet-stream` when the value is missing or
malformed. Inspect Runtime OpenAPI for request construction and handle the advertised provider
response shapes in your client.

A bounded provider HTTP `2xx`, `4xx`, or `5xx` response keeps its provider status and exact body.
These provider responses are not PubFi error envelopes. Transport failure, redirects, oversized
data, and unsupported final status classes remain PubFi gateway failures.

## Authentication And Payment Boundary

OpenAPI visibility does not make every route anonymous.

| Route family | Caller requirement |
| --- | --- |
| Catalog, operation-pricing inventory, public status, OpenAPI, reference, health, version, and MCP discovery | No PubFi API key. |
| Gateway through the API-key lane | API key for this environment, active admission, and sufficient allocation. |
| Gateway through the accountless x402 lane | No API key; exact x402-eligible route and valid V2 request-bound payment authorization. |
| MCP `pubfi.route.execute` on the root endpoint | API key or OAuth access token for this environment. Invalid credentials and x402 metadata do not fall back. |
| MCP `pubfi.route.execute` on `/x402` | No Bearer carrier; exact x402-eligible route and official MCP payment metadata. |
| API-key auth context | API key for this environment. Returns only the existing execution principal and billing-account binding. |
| Billing-account list | Authenticated human dashboard session. |
| API-key management | Authenticated human Owner or Admin. API keys cannot manage keys. |
| Usage, billing, Credit-balance, and free-quota readback | Human account member, or an API key for the same account. |
| Purchase offer, list, and status | Authenticated human account member. |
| Purchase creation | Authenticated human Owner or Admin, current offer key, exact catalog and terms identities, valid amount, and `Idempotency-Key`. |
| Auto Top-Up state and payment-method setup status | Authenticated human account member. API keys are denied. |
| Auto Top-Up policy or payment-method setup mutation | Authenticated human Owner or Admin and `Idempotency-Key`. API keys are denied. |

Do not combine an API-key carrier with `PAYMENT-SIGNATURE`. `X-PubFi-Api-Key` is not accepted, but
its presence still selects the credential lane and conflicts with payment. Purchase route
visibility also does not prove that a current purchase offer exists.

`GET /v1/auth/context` is private and no-store. Its response contains exactly `principal_id`,
`billing_account_id`, and nullable `actor_subject_id`. Missing, invalid, OAuth, or
environment-mismatched credentials return `401`; the route does not use OAuth fallback.

## Use These Docs

Use [Registry Gateway Examples](/reference/provider-gateway-examples) for request selection,
success headers, and failure classes. Use [Payment And Execution
Modes](/concepts/payment-and-execution-modes) for the boundary between API-key allowance,
registered purchases, Credits, and accountless x402.

The dashboard calls automatic Credit purchases **Auto Top-Up**. The API keeps the
`credit-auto-reload` route name. Auto Top-Up is off until an Owner or Admin explicitly enables a
complete policy with a current offer, an active payment method, exact accepted terms, and a finite
UTC monthly limit. A temporary Auto Top-Up read conflict does not establish that the account's
other dashboard data or manual Credit purchase is unavailable.
