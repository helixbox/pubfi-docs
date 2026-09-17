---
title: Use The PubFi Gateway
description: Discover PubFi routes, select access, and handle PubFi-specific execution rules.
---

Use a PubFi API key with a route from the current [API Reference](https://api.pubfi.ai/reference).
[Quickstart](/getting-started/quickstart) shows one complete free request. For provider-specific
choices, see [Subscan](/providers/subscan) and [DeGov](/providers/degov).

## 1. Inspect Current Authority

| Surface | Purpose |
| --- | --- |
| [Capability catalog](https://api.pubfi.ai/v1/capabilities) | Find providers, exact routes, methods, access policies, and `ready` or `blocked` state. |
| [Runtime OpenAPI](https://api.pubfi.ai/openapi.json) | Read the request and response contract for ready routes. |
| `GET /v1/capabilities/{capability_id}` | Inspect one exact capability. |

Filter the catalog with `provider_key=<provider key>` and optionally `method`. Follow opaque
`next_cursor` values while keeping the filters unchanged. A first page is not a complete catalog.
Retain `capability_id`, `matcher`, `methods`, `readiness`, `free_rate_limit`, and `operations` when
passing a capability to an agent. A Discovery listing alone does not authorize execution.

## 2. Select An Exact Operation

Use the advertised method and gateway path. Read parameters and request bodies from that
operation's schema, rather than copying an upstream URL or another operation's request.
If a schema is empty or only `string / binary`, report the missing provider schema; transport
limits do not define JSON fields.

### Select A Network

A selector such as `{network}` chooses an upstream endpoint. Its enum lists permitted aliases,
and its examples identify their upstream targets. A path without a selector has a fixed target,
shown in its description. Keep the PubFi API origin when selecting an upstream; do not send your
PubFi key to that upstream host. See the relevant provider page for additional interpretation.

## 3. Execute With A PubFi API Key

Use `Authorization: Bearer <PubFi API key>` on `https://api.pubfi.ai`. Staging uses
`https://api-stg.pubfi.ai` and a separate key from that environment. See
[API Key And Runtime](/getting-started/api-key-runtime) for key creation and account access.
Upstream API-key instructions are not PubFi authentication. `X-PubFi-Api-Key` is not supported.

Choose the access mode for the exact operation:

| Mode | PubFi requirement |
| --- | --- |
| Account-free | Advertised `free_rate_limit` or `x-pubfi-free-variant`, `:free` suffix, PubFi Bearer key, and available account quota. |
| Account-paid | `quantro_priced` with a current method-specific `credit_cost`, PubFi Bearer key, active admission, and sufficient allocation. |

Relayed upstream health operations follow the account-paid rules. PubFi's own service health
endpoints remain public and free.

The provider credential indicated by `credential_required` is managed server-side. You do not
supply the upstream key. PubFi forwards the selected operation input and returns the provider
body without adding a success wrapper. See [API Reference](/reference/api-reference) for transport
limits and the response contract.

## 4. Execute An Advertised Free Variant

Append `:free` to the final path segment and retain the selected operation's method, body, and
PubFi Bearer key. The suffix is valid only when that exact operation advertises it. Do not remove
it to retry a failed free call as a paid request.

Free variants charge zero Credits. `pricing_unavailable` on the paid operation does not disable
an independently advertised free variant. Read rate and quota limits from the current contract;
they may be shared across routes for one account. Availability is separate in each environment.
Do not combine this lane with `PAYMENT-SIGNATURE`.

## 5. Use The Accountless x402 Lane When Eligible

Accountless x402 is a separate advertised payment mode. It uses no PubFi API key. Follow the
[Accountless x402 guide](/getting-started/x402) for challenge validation, environment selection,
and payment execution. Do not combine payment headers with Bearer credentials.

## Registry Failure Classes

PubFi Registry failures use one provider-neutral vocabulary. Provider responses described above
can use the same HTTP status numbers without a PubFi error code:

| HTTP status | Error code |
| --- | --- |
| `400` | `gateway.invalid_typed_request` |
| `401` | `gateway.unauthenticated` |
| `402` | `gateway.billing_or_admission_action_required` |
| `403` | `gateway.forbidden` |
| `404` | `gateway.no_active_matching_route` |
| `429` | `gateway.rate_reservation_or_budget_exceeded` |
| `502` | `gateway.upstream_transport_or_response_failure` |
| `502` | `gateway.upstream_response_too_large` |
| `503` | `gateway.registry_credential_admission_or_health_unavailable` |
| `504` | `gateway.upstream_timeout` |

The error body uses the standard PubFi error object:

```json
{
  "error": {
    "code": "gateway.no_active_matching_route",
    "message": "Gateway request could not be completed"
  }
}
```

Lane admission can return more specific codes. For example:

- An advertised free variant can return `gateway.free_rate_limited` with `Retry-After`, or
  `gateway.free_limit_reached` without it when a cumulative limit is exhausted.
- API-key admission can return `gateway.insufficient_meter_escrow`,
  `gateway.billing_account_inactive`, `gateway.billing_admission_unknown`, or
  `gateway.billing_admission_stale`.
- x402 can return `x402.conflicting_payment_lanes`, `x402.invalid_payment`,
  `x402.payment_failed`, `x402.claimed_payment_conflict`, `x402.provider_failure`,
  `x402.provider_timeout`, or `x402.unavailable`.

A `402` response is not always an account-allocation failure. A `PAYMENT-REQUIRED` header identifies
an x402 challenge. A failed paid retry can also return a fresh standard challenge. Validate all of
its terms before deciding whether to create a new authorization. MCP preserves the equivalent
official `PaymentRequired` fields in the error result's `structuredContent` and adds an `error`
message. Inspect the challenge and error before choosing the next action.

