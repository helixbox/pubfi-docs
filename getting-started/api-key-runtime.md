---
title: API Key And Runtime
description: Use PubFi API keys safely and understand account admission, allocation, usage, and runtime preflight.
---

This page explains how PubFi API-key auth, billing-account admission, request allowance, usage
facts, and runtime execution fit together from a public-docs perspective.

## Runtime Surfaces

| Surface | Role |
| --- | --- |
| `api.pubfi.ai` | HTTP API for capabilities, gateway routes, account, usage, health, and OpenAPI |
| `mcp.pubfi.ai` | hosted MCP endpoint for generic PubFi route/capability tools |
| `pubfi.ai` | product UI, Discovery, docs entry, and dashboard presentation |

Staging uses the separate roots `api-stg.pubfi.ai`, `mcp-stg.pubfi.ai`, and `stg.pubfi.ai`.
Create the key through the Staging dashboard. The server assigns the Staging environment; the
client does not select it. Load the key as `STG_PUBFI_API_KEY` in the public examples. See the
[Staging guide](/getting-started/staging).

## API Key Boundary

PubFi API keys are caller credentials for Registry gateway and MCP execution. They can also read
usage and billing data for their own billing account. PubFi uses one fixed product-access model;
clients cannot request or inspect per-key scopes. Listing billing accounts, managing API keys, and
all purchase operations require an authenticated human dashboard session. Key management requires
Owner or Admin membership.

Create keys from the PubFi dashboard under **Manage application keys**. Copy the key when it is
shown, because the full secret is displayed only once. The runtime assigns the key environment.
The dashboard does not ask you to select one, and the create API accepts only a name:

```json
{
  "name": "staging-agent"
}
```

Create a separate key from each environment's dashboard. A Staging runtime creates and accepts
Staging keys; a Production runtime creates and accepts Production keys.

Supported public auth shape:

```text
Authorization: Bearer <PubFi API key>
```

`X-PubFi-Api-Key` is not accepted. Its presence still selects the credential lane, so remove it
before an accountless x402 request.

## Billing Account And Usage Model

PubFi groups API keys and product usage under billing accounts. Public docs should describe the
model at a high level:

- API keys authenticate the caller.
- Every key uses the same fixed product-access model.
- A key can execute through the gateway or MCP and read its own billing account's usage and
  authoritative billing data.
- Only an authenticated human Owner or Admin can create, list, rename, or revoke keys.
- A fresh active admission snapshot and sufficient allocation for the operation's current positive
  `credit_cost` are required before priced provider execution.
- The current checked-in pricing target sets `credit_cost: 1` for each priced Subscan and DeGov
  operation. The same target sets x402 `atomic_amount: "1000"`, or 0.001 USDC. Confirm the
  installed values in the current catalog and Runtime OpenAPI before execution.
- An advertised `:free` variant keeps the same API key and billing-account binding, but uses an
  account-level rate limiter and charges zero Credits.
- The free starter allocation provides 1,000 requests and is not Credits.
- PubFi displays eligible purchase-origin `request_count` units as Credits. Credits are service
  units, not money or a PubFi-owned financial ledger.
- Usage facts record immutable raw-unit observations and execution outcomes.
- The billing-account `/billing` route is the authoritative billing read. PubFi usage rows are not
  billing truth.

## Registered Purchases

The Runtime OpenAPI includes provider-neutral purchase-offer, create, list, and status routes.
Purchase creation requires an authenticated human Owner or Admin, `Idempotency-Key`, and the strict
body:

```json
{
  "offerKey": "<current offer key>",
  "catalogReleaseHash": "<hash from the offer>",
  "amount": "<shortest canonical USD amount>",
  "acceptedTermsVersion": "<terms version from the offer>",
  "acceptedTermsHash": "<terms hash from the offer>"
}
```

PubFi API keys cannot call purchase routes. The checked-in pricing target uses a base offer of
$1 for 1,000 Credits. Purchase amounts must be from $1 through $1,000 in $0.10 increments and
must produce a whole-Credit quantity.

The API surface does not prove that a production offer is currently available. A client must use
the current offer response and proceed only when an offer is advertised as available.

## Execution Preflight

A route can execute only when these gates pass:

- valid PubFi API key for the selected environment;
- fresh active billing admission and sufficient raw-unit allocation;
- a matching path and method in the installed Registry generation;
- current provider readiness;
- server-side upstream credential configuration;
- source freshness evidence;
- request input validation.

## Free Route Variant

The current capability catalog can advertise `free_rate_limit` for an eligible exact `GET` or
`POST` route. Runtime OpenAPI represents the same contract as `x-pubfi-free-variant`. Only then,
append `:free` to the final path segment and send the normal Bearer API key. Keep the exact query
or body required by the current operation schema. A server-side provider credential does not make
an advertised free variant ineligible.

The effective policy contains a fixed request window, a concurrency limit, a permit TTL, and can
also advertise an independent quota window, a cumulative limit, or shared bucket scope. A free
request skips Credit admission, reservation, usage emission, and replay. A retryable window or
concurrency rejection returns `429`, `gateway.free_rate_limited`, and `Retry-After`. A cumulative
limit returns `429` with `gateway.free_limit_reached` and no `Retry-After`. This lane is not
anonymous and is not x402. It is also distinct from an exact `free_health` operation, which uses
its advertised path without the suffix or authentication.

## Security Boundary

Keep real keys, account ids, usage rows, billing-provider payloads, customer data, and production
financial records out of prompts, source code, logs, and public artifacts.

This API-key lane is separate from accountless x402. A request with `PAYMENT-SIGNATURE` must not
also contain `Authorization` or `X-PubFi-Api-Key`. The legacy header is not valid authentication,
but it is still a credential carrier and conflicts with payment. See [Payment And Execution
Modes](/concepts/payment-and-execution-modes).

## Next Steps

- Use [Registry Gateway Examples](/reference/provider-gateway-examples) to select and call an exact
  current operation.
- Use the [API Reference](/reference/api-reference) for schemas and authentication requirements.
- Use [Account, Credits, Purchases, Usage, And
  Billing](/concepts/account-credit-usage) for detailed account and billing terminology.
