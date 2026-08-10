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
| `GET /openapi.json` | Inspect the executable HTTP schema for current `ready` operations. |
| `GET /reference` | Explore the same OpenAPI in an interactive UI. |

A Discovery page is source-selection context. It is not Registry execution authority.

## Response Contract

A successful gateway request returns the validated canonical provider JSON for the selected
operation. It is not wrapped in a PubFi success envelope.

Every success includes:

- `Content-Type`;
- `x-pubfi-request-id`.

An API-key lane success also includes `x-pubfi-registry-generation`. A settled x402 lane success
instead includes `PAYMENT-RESPONSE` and `Cache-Control: private, no-store`.

The exact JSON body depends on the current operation response policy. Inspect the Runtime OpenAPI
before you parse it.

## Authentication And Payment Boundary

OpenAPI visibility does not make every route anonymous.

| Route family | Caller requirement |
| --- | --- |
| Catalog, OpenAPI, reference, health, version, and MCP discovery | No PubFi API key. |
| Gateway through the API-key lane | API key for this environment, active admission, and sufficient allocation. |
| Gateway through the accountless x402 lane | No API key; exact x402-eligible route and valid V2 request-bound payment authorization. |
| MCP `pubfi.route.execute` | API key for this environment, or no API-key carrier plus the official x402 metadata flow for an eligible route. |
| Billing-account list | Authenticated human dashboard session. |
| API-key management | Authenticated human Owner or Admin. API keys cannot manage keys. |
| Usage and billing readback | Human account member, or an API key for the same account. |
| Purchase offer, list, and status | Authenticated human account member. |
| Purchase creation | Authenticated human Owner or Admin, current `offerKey`, and `Idempotency-Key`. |
| Auto Top-Up state and payment-method setup status | Authenticated human account member. API keys are denied. |
| Auto Top-Up policy or payment-method setup mutation | Authenticated human Owner or Admin and `Idempotency-Key`. API keys are denied. |

Do not combine an API-key carrier with `PAYMENT-SIGNATURE`. `X-PubFi-Api-Key` is not accepted, but
its presence still selects the credential lane and conflicts with payment. Purchase route
visibility also does not prove that a current purchase offer exists.

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
