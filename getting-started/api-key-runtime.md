# API Key And Runtime

This page explains how PubFi API-key auth, billing-account admission, request allowance, usage
facts, and runtime execution fit together from a public-docs perspective.

## Runtime Surfaces

| Surface | Role |
| --- | --- |
| `api.pubfi.ai` | HTTP API for capabilities, gateway routes, account, usage, health, and OpenAPI |
| `mcp.pubfi.ai` | hosted MCP endpoint for generic PubFi route/capability tools |
| `pubfi.ai` | product UI, Discovery, docs entry, and dashboard presentation |

Staging uses the separate roots `api-stg.pubfi.ai`, `mcp-stg.pubfi.ai`, and `stg.pubfi.ai`.
Create the key through the staging dashboard and load it as `STG_PUBFI_API_KEY` in the public
examples. See the [Staging guide](/getting-started/staging).

## API Key Boundary

PubFi API keys are caller credentials for Registry gateway and MCP execution. Depending on scope,
an API key can also manage keys for its own billing account or read that account's usage and
billing data. Listing billing accounts and all purchase operations require an authenticated human
dashboard session.

Create keys from the PubFi dashboard under **Manage application keys**. Copy the key when it is
shown, because the full secret is displayed only once.

Supported public auth shapes:

```text
Authorization: Bearer <PubFi API key>
X-PubFi-Api-Key: <PubFi API key>
```

## Billing Account And Usage Model

PubFi groups API keys and product usage under billing accounts. Public docs should describe the
model at a high level:

- API keys authenticate the caller.
- Scopes determine what the caller can do.
- `invoke_provider` is required for provider-backed gateway or MCP execution.
- `manage_keys` can create, list, rename, and revoke keys for the same billing account.
- `read_usage` can read usage and authoritative billing data for the same billing account.
- A fresh active admission snapshot and sufficient meter-specific allocation are required before
  provider execution.
- The free starter allocation provides 1,000 requests and is not Credits.
- PubFi displays eligible purchase-origin `request_count` units as Credits. Credits are service
  units, not money or a PubFi-owned financial ledger.
- Usage facts record immutable raw-unit observations and execution outcomes.
- The billing-account `/billing` route is the authoritative billing read. PubFi usage rows are not
  billing truth.

## Registered Purchases

The Runtime OpenAPI includes provider-neutral purchase-offer, create, list, and status routes.
Purchase creation requires an authenticated human Owner or Admin, `Idempotency-Key`, and the strict
body `{ "offerKey": "..." }`. PubFi API keys cannot call purchase routes.

The API surface does not prove that a production offer is currently available. A client must use
the current offer response and proceed only when an offer is advertised as available.

## Execution Preflight

A route can execute only when these gates pass:

- valid PubFi API key;
- required scope;
- fresh active billing admission and sufficient raw-unit allocation;
- a matching path and method in the installed Registry generation;
- current provider readiness;
- server-side upstream credential configuration;
- source freshness evidence;
- request input validation.

## Public Docs Rule

Public docs may explain the auth, admission, allowance, usage, and billing-read model, but they must
not publish real keys, account ids, usage rows, billing-provider payloads, customer data, or
production financial records.

This API-key lane is separate from accountless x402. A request with `PAYMENT-SIGNATURE` must not
also contain a PubFi API key. See [Payment And Execution
Modes](/concepts/payment-and-execution-modes).
