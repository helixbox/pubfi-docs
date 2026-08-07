---
title: Registry Gateway Examples
description: Select and call current Registry v2 gateway operations without using stale provider routes.
---

PubFi executes provider-backed requests through the currently installed Registry v2 generation.
There is no permanent provider URL pattern. Use the public catalog or Runtime OpenAPI before every
integration or route refresh.

## 1. Inspect Current Authority

Get the first page of the installed catalog:

```sh
curl --silent --show-error \
  'https://api.pubfi.ai/v1/capabilities'
```

The paginated response uses `pubfi.gateway.registry.capability-page.v5`. Each compact capability
summary includes:

- the exact generation, manifest, and compile time;
- each capability ID, public provider key, matcher, and allowed method;
- whether PubFi needs a configured upstream credential;
- one billing state for each allowed method; and
- current `ready` or `blocked` readiness.

Read each opaque `next_cursor` page to enumerate the complete installed generation. Keep the
`provider_key` and `method` filters unchanged when you send a cursor. A saved first page is not the
complete catalog.

Use the Runtime OpenAPI when you need only current `ready` operations:

```sh
curl --silent --show-error \
  'https://api.pubfi.ai/openapi.json'
```

Do not infer execution from a Discovery listing, an old example, or a saved route from a different
Registry generation.

For a free-capable route, the capability summary includes `free_rate_limit`. Runtime OpenAPI adds
`x-pubfi-free-variant` to the same operation. These fields authorize the `:free` suffix; do not
infer it from a provider name or billing mode.

### Filter Subscan Or DeGov

Use the exact public provider key to limit discovery. For example, select `subscan` or `degov`:

```sh
export PUBFI_PROVIDER_KEY='degov'

curl --silent --show-error --get \
  'https://api.pubfi.ai/v1/capabilities' \
  --data-urlencode "provider_key=${PUBFI_PROVIDER_KEY}" \
  --data-urlencode 'limit=1000' |
jq '{
  generation,
  matching_capability_count,
  next_cursor,
  capabilities: [.capabilities[] | {
    matcher,
    methods,
    readiness: .readiness.status,
    credential_required,
    operations
  }]
}'
```

If `next_cursor` is present, request the next page with the same `provider_key` and `limit`, plus
`cursor=<next_cursor>`. Continue until `next_cursor` is absent. Then select one `ready` operation
whose matching method has `billing.mode` set to `quantro_priced`, and read its positive
`billing.credit_cost`. A `free_health` operation uses its exact path without authentication,
Credits, or x402. A `pricing_unavailable` operation is not a paid execution target. Confirm the
same path and method in the [Runtime OpenAPI](https://api.pubfi.ai/openapi.json).

Use the live filtered catalogs for current operations:

- [Subscan catalog](https://api.pubfi.ai/v1/capabilities?provider_key=subscan&limit=1000) and
  [Subscan product context](https://pubfi.ai/products/subscan-api)
- [DeGov catalog](https://api.pubfi.ai/v1/capabilities?provider_key=degov&limit=1000) and
  [DeGov product context](https://pubfi.ai/products/degov-api)

PubFi's DeGov routes use the DeGov Partner Agent API at `agent-api.degov.ai`.
`atlas.degov.ai` is a UI and reference surface. It is not a second execution contract. Always
invoke the PubFi gateway path from the live catalog; do not send an upstream provider credential.

## 2. Select An Exact Operation

Copy the path and HTTP method from one current `ready` operation. Replace each documented path
parameter with a value that satisfies its schema. The resulting concrete path is the gateway path.
Do not add provider, network, or endpoint segments that are not present in the current schema.

Only `GET` and `POST` are supported. The request query and body must satisfy the exact operation
policy.

Set placeholders from the current schema:

```sh
export PUBFI_GATEWAY_PATH='<exact ready path from the Runtime OpenAPI>'
export PUBFI_GATEWAY_METHOD='<GET or POST from the same Runtime OpenAPI operation>'
```

## 3. Execute With A PubFi API Key

Send the supported API-key header:

```text
Authorization: Bearer <PubFi API key>
```

Example:

```sh
curl --include \
  --request "$PUBFI_GATEWAY_METHOD" \
  "https://api.pubfi.ai${PUBFI_GATEWAY_PATH}" \
  --header 'Authorization: Bearer <PubFi API key>'
```

The key must match the endpoint environment. The billing account must also have active admission
and enough allocation for the method-specific `credit_cost`. `X-PubFi-Api-Key` is not accepted;
remove it before accountless x402 because its presence still selects the credential lane.

For a `POST` operation, use only the JSON fields that the current OpenAPI request body permits:

```sh
export PUBFI_GATEWAY_METHOD='POST'
export PUBFI_GATEWAY_BODY='<JSON that satisfies the current operation schema>'

curl --include \
  --request "$PUBFI_GATEWAY_METHOD" \
  "https://api.pubfi.ai${PUBFI_GATEWAY_PATH}" \
  --header 'Authorization: Bearer <PubFi API key>' \
  --header 'Content-Type: application/json' \
  --data "$PUBFI_GATEWAY_BODY"
```

Do not copy a request body from another operation.

## 4. Execute An Advertised Free Variant

Only use this lane when the current capability has `free_rate_limit` or the matching Runtime
OpenAPI operation has `x-pubfi-free-variant`. The underlying operation must be a credential-free
`GET` with no request body. Append `:free` to its final path segment and use the same PubFi API key:

```sh
export PUBFI_GATEWAY_METHOD='GET'
export PUBFI_FREE_PATH='<exact advertised path with :free appended to its final segment>'

curl --include \
  --request "$PUBFI_GATEWAY_METHOD" \
  "https://api.pubfi.ai${PUBFI_FREE_PATH}" \
  --header 'Authorization: Bearer <PubFi API key>'
```

The free variant is account-level rate-limited and charges zero Credits. It does not reserve,
finalize, replay, or emit Quantro request usage. A limit rejection returns HTTP `429` with
`gateway.free_rate_limited` and `Retry-After`. Do not send `PAYMENT-SIGNATURE` for this variant.

## 5. Use The Accountless x402 Lane When Eligible

An exact gateway route can separately enable accountless x402. The public Base Sepolia example is
Staging-only. Inspect the Staging catalog and Runtime OpenAPI, then select an exact ready path and
method from that environment:

```sh
curl --silent --show-error \
  'https://api-stg.pubfi.ai/v1/capabilities'

curl --silent --show-error \
  'https://api-stg.pubfi.ai/openapi.json'
```

Do not reuse a Production-selected path or method unless the current Staging contracts advertise
the same operation as `ready`. Set new Staging values, then send the exact request without a PubFi
API key or payment signature:

```sh
export PUBFI_GATEWAY_ORIGIN='https://api-stg.pubfi.ai'
export PUBFI_GATEWAY_PATH='<exact ready path from the Staging Runtime OpenAPI>'
export PUBFI_GATEWAY_METHOD='GET'

curl --include \
  --request "$PUBFI_GATEWAY_METHOD" \
  "${PUBFI_GATEWAY_ORIGIN}${PUBFI_GATEWAY_PATH}"
```

An eligible unpaid request returns `402 Payment Required`, a `PAYMENT-REQUIRED` header, and the
same current requirements in the JSON body. Validate that challenge before a wallet signs it.

The paid retry uses `PAYMENT-SIGNATURE`. A settled success returns `PAYMENT-RESPONSE`. Never send a
PubFi API key and `PAYMENT-SIGNATURE` together. MCP `pubfi.route.execute` supports the same payment
lane through `x402/payment` and `x402/payment-response` metadata. The Base Sepolia example uses
`https://mcp-stg.pubfi.ai`.

Staging permits Base Sepolia `eip155:84532`. Production permits Base mainnet `eip155:8453` only
when the exact route has x402 enabled. The environment policy does not establish current
availability. Treat the live catalog as route authority and the live challenge as payment-term
authority.

See [Accountless x402](/getting-started/x402) for the environment safety boundary and exact replay
rules. See the [Staging guide](/getting-started/staging) for all Staging endpoints.

## Success Response

A successful gateway request returns the validated canonical provider JSON. PubFi does not wrap
the body in a stable success envelope.

Every success includes:

```text
Content-Type: <validated response media type>
x-pubfi-request-id: <request id>
```

An API-key lane success also includes:

```text
x-pubfi-registry-generation: <generation id>
```

An x402 lane success instead includes `PAYMENT-RESPONSE` and
`Cache-Control: private, no-store`.

The JSON fields depend on the selected operation response policy. Parse only the fields in the
current Runtime OpenAPI.

## Registry Failure Classes

Registry v2 uses one provider-neutral failure vocabulary:

| HTTP status | Error code |
| --- | --- |
| `400` | `gateway.invalid_typed_request` |
| `401` | `gateway.unauthenticated` |
| `402` | `gateway.billing_or_admission_action_required` |
| `403` | `gateway.forbidden` |
| `404` | `gateway.no_active_matching_route` |
| `429` | `gateway.rate_reservation_or_budget_exceeded` |
| `502` | `gateway.upstream_transport_or_response_failure` |
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

- An advertised free variant can return `gateway.free_rate_limited` with `Retry-After`.
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

## Public-Safe Boundary

Examples must not publish:

- PubFi API keys;
- `PAYMENT-SIGNATURE` or `PAYMENT-RESPONSE` values;
- wallet secrets or unredacted payment payloads;
- upstream provider credentials;
- account, purchase, usage, or billing records; or
- claims that an old path, current offer, price, uptime result, or route remains available.
