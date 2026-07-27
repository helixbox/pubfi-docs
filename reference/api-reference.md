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
readiness, request policy, response policy, meter, and maximum raw units.

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
| Gateway through the API-key lane | API key with `invoke_provider`, active admission, and sufficient allocation. |
| Gateway through the accountless x402 lane | No API key; exact x402-eligible route and valid V2 request-bound payment authorization. |
| MCP `pubfi.route.execute` | API key with `invoke_provider`, or no API key plus the official x402 metadata flow for an eligible route. |
| Billing-account list | Authenticated human dashboard session. |
| API-key management | Human Owner or Admin, or same-account API key with `manage_keys`. |
| Usage and billing readback | Human account member, or same-account API key with `read_usage`. |
| Purchase offer, list, and status | Authenticated human account member. |
| Purchase creation | Authenticated human Owner or Admin, current `offerKey`, and `Idempotency-Key`. |

Do not combine a PubFi API key with `PAYMENT-SIGNATURE`. Purchase route visibility also does not
prove that a current purchase offer exists.

## Use These Docs

Use [Registry Gateway Examples](/reference/provider-gateway-examples) for request selection,
success headers, and failure classes. Use [Payment And Execution
Modes](/concepts/payment-and-execution-modes) for the boundary between API-key allowance,
registered purchases, Credits, and accountless x402.
