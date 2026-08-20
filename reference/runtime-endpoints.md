---
title: Runtime Endpoints
description: Current PubFi API, MCP, web, account, purchase, and Registry v2 endpoint families.
---

This page lists the current public runtime endpoint families. It does not list internal webhook,
operator, repair, or control-plane routes.

## Environment Roots

| Environment | Web | API | MCP |
| --- | --- | --- | --- |
| Staging | `https://stg.pubfi.ai` | `https://api-stg.pubfi.ai` | `https://mcp-stg.pubfi.ai` |
| Production | `https://pubfi.ai` | `https://api.pubfi.ai` | `https://mcp.pubfi.ai` |

Use one row for a complete test. Do not mix a staging key or session with a Production root. See the
[Staging guide](/getting-started/staging) for the complete test flow.

## API Host

```text
https://api.pubfi.ai
```

The corresponding Staging API root is `https://api-stg.pubfi.ai`. Fetch that environment's
`/v1/capabilities` and `/openapi.json` before you select a route.

### Public Service And Registry Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Process health. |
| `GET` | `/readyz` | Dependency and programmed-Registry readiness. This route can return `503` when the service must fail closed. |
| `GET` | `/version` | Runtime version metadata. |
| `GET` | `/metrics` | Operational metrics. This route is not product or route-availability evidence. |
| `GET` | `/openapi.json` | Runtime OpenAPI generated from the installed Registry v2 snapshot. |
| `GET` | `/reference` | Interactive API reference for `/openapi.json`. |
| `GET` | `/v1/status` | Public-safe PubFi component and Gateway summary using schema `pubfi.status.v1`. |
| `GET` | `/v1/status/gateway` | Public-safe Gateway signals and provider summaries using schema `pubfi.status.gateway.v1`. |
| `GET` | `/v1/status/gateway/providers/{provider_key}` | Public-safe status and operation detail for one active provider. |
| `GET` | `/v1/status/gateway/operations/{capability_id}` | Public-safe status detail for one active Registry operation. |
| `GET` | `/v1/capabilities` | Public paginated `pubfi.gateway.registry.capability-page.v5` catalog. |
| `GET` | `/v1/operation-pricing-inventory` | Public no-store `quantro.operation-pricing-inventory.v2` projection for the complete installed snapshot. |
| `GET` | `/.well-known/mcp.json` | API-host MCP discovery manifest. |
| `GET` | `/.well-known/glama.json` | Public MCP connector ownership declaration. |
| `POST` | `/` | MCP JSON-RPC endpoint. |

`GET /v1/capabilities` is the catalog endpoint. It includes the exact Registry generation,
manifest, compact capability summaries, and current `ready` or `blocked` state. Follow each opaque
`next_cursor` for the complete generation. Use Runtime OpenAPI for ready operation request and
response schemas.

`GET /v1/operation-pricing-inventory` exposes canonical operation keys, route revisions and
closures, request bounds, and `free_health` or `merchant_priced` classification for every approved
typed plan. It contains no selected price and has no route-selection or execution authority. It
returns `503` if the complete projection cannot be formed; it does not return a partial inventory.

The Runtime OpenAPI includes only current `ready` Registry operations. If the API has no valid
programmed snapshot, it marks the Registry as unavailable and does not use a static provider
fallback.

The status reads use `Cache-Control: no-store` and the states `operational`, `degraded`,
`major_outage`, or `unknown`. Missing, stale, or incoherent evidence is `unknown`; it is not
treated as healthy. Status is public-safe evidence about current PubFi components, Gateway probe
coverage, providers, and active operations. It does not replace the Registry catalog as route
authority or prove that a purchase offer or x402 challenge is available.

Status counts one source operation for each provider, method, and canonical upstream path. One
source operation can have more than one Registry route variant. In Gateway summaries,
`active_operations` counts source operations and `active_route_variants` counts route variants.
`operation_coverage` reports both counts and separates operations that are continuously monitored
from operations without continuous monitoring. Provider summaries use the same distinction.

Operation status includes `source_operation_key`, `source_revision_key`, `route_variant_key`, and
an optional `monitor_target_key`. These values bind source, route, and monitoring evidence. They
are not executable gateway paths. Each signal also identifies the responsible `owner` layer. The
Gateway response can include incidents in `suspect`, `open`, `recovering`, or `resolved` state.
Incident ownership and stage keep a provider failure separate from a PubFi Registry, credential,
or gateway failure.

### Gateway Route

```text
GET|POST /v1/gateway/{*path}
```

The installed Registry matcher defines the complete path and method. There is no fixed
provider-and-network URL convention. Clients must copy an exact current operation from
`/v1/capabilities` or `/openapi.json`.

Only `GET` and `POST` can execute. `HEAD` returns `405 Method Not Allowed`.

The gateway has two separate caller lanes:

| Lane | Requirement |
| --- | --- |
| API key | A PubFi API key for this environment, active admission, and sufficient allocation. |
| Accountless x402 | No PubFi API key; the exact route must be x402-eligible and the request must satisfy the current V2 payment challenge. |

Do not send `Authorization` or `X-PubFi-Api-Key` with `PAYMENT-SIGNATURE`. The legacy header is not
accepted, but its presence still selects the credential lane.

An exact operation whose catalog billing mode is `free_health` is public and bypasses both caller
lanes. It uses the advertised path directly; there is no `:free` suffix. A `quantro_priced`
operation uses the method-specific positive `credit_cost` for API-key execution and the independent
x402 terms from the same immutable price version.

An eligible exact `GET` or `POST` operation can also advertise an account-level free variant. The
capability catalog exposes its effective `free_rate_limit`, and Runtime OpenAPI exposes
`x-pubfi-free-variant` with the `:free` suffix and the same policy. Append `:free` to the final path
segment, keep the provider query intended for the operation, keep the body required by its body
policy, and send the normal `Authorization: Bearer <PubFi API key>` header. This variant charges
zero Credits and does not use x402. A retryable limit rejection returns `429`,
`gateway.free_rate_limited`, and `Retry-After`.
A cumulative limit returns `429` with `gateway.free_limit_reached` and no `Retry-After`. Do not
append the suffix unless the current catalog or OpenAPI operation advertises it.

### Account And Purchase Routes

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/v1/auth/context` | PubFi API key for this environment. Returns the key's existing execution principal and billing-account binding. |
| `GET` | `/v1/billing-accounts` | Authenticated human dashboard session. |
| `GET|POST` | `/v1/billing-accounts/{billing_account_id}/api-keys` | Authenticated human Owner or Admin. API keys cannot manage keys. |
| `PATCH|DELETE` | `/v1/billing-accounts/{billing_account_id}/api-keys/{id}` | Authenticated human Owner or Admin. API keys cannot manage keys. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/usage` | Human account member, or an API key for the same account. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/billing` | Human account member, or an API key for the same account. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/credit-balance` | Human account member, or an API key for the same account. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/free-quotas` | Human account member, or an API key for the same account. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/purchase-offers` | Human account member. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/purchases` | Human account member. |
| `POST` | `/v1/billing-accounts/{billing_account_id}/purchases` | Human Owner or Admin. Requires `Idempotency-Key`, current offer and catalog identities, a valid amount, and exact accepted terms identity. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/purchases/{purchase_id}` | Human account member. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/credit-auto-reload` | Human account member. API keys are denied. |
| `PUT` | `/v1/billing-accounts/{billing_account_id}/credit-auto-reload` | Human Owner or Admin. Requires `Idempotency-Key`. |
| `POST` | `/v1/billing-accounts/{billing_account_id}/credit-auto-reload/payment-method-setups` | Human Owner or Admin. Requires `Idempotency-Key` and exact current Service Credit Terms. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/credit-auto-reload/payment-method-setups/{setup_id}` | Human account member. API keys are denied. |

The auth-context response contains exactly `principal_id`, `billing_account_id`, and nullable
`actor_subject_id`. It accepts only a valid PubFi API key, rejects query parameters, and does not
fall back to OAuth. It creates no account or billing state. Use its `billing_account_id` in the
same-account read paths below.

Auth-context, purchase, and Auto Top-Up responses are private and use
`Cache-Control: private, no-store`. The presence of these routes does not prove that a purchase
offer is currently available. The dashboard uses **Auto Top-Up** for the customer feature;
`credit-auto-reload` is the stable API route name.

The focused account reads are also private and no-store. `credit-balance` returns only
`billingAccountId`, `meterKey: "request_count"`, a canonical whole-number `creditBalance` string,
and `generatedAt` from the authoritative Credit source. `free-quotas` returns the account and
observation time plus compact per-provider bucket scope, primary and optional quota windows,
concurrency, and an optional cumulative total. Its public counters are JavaScript-safe integers.
Neither response exposes internal bucket keys, permit settings, payment state, or x402 state.

API-key creation accepts only `{ "name": "..." }`. The runtime assigns `development`, `staging`,
or `production` from its trusted environment and rejects a caller-supplied `environment` field.
Key summaries still report the assigned environment.

## MCP Host

```text
https://mcp.pubfi.ai
```

The corresponding Staging MCP root is `https://mcp-stg.pubfi.ai`.

Current endpoint families:

- `POST /` for authenticated MCP JSON-RPC;
- `POST /x402` for accountless x402 MCP JSON-RPC;
- `GET /healthz`;
- `GET /readyz`;
- `GET /version`; and
- `GET /.well-known/mcp.json`; and
- `GET /.well-known/oauth-protected-resource`.

The handshake, ping, `tools/list`, resource listing, and prompt listing methods are public.
On the root endpoint, `pubfi.route.execute` accepts a PubFi API key or OAuth access token for the
endpoint environment. Invalid credentials do not fall back, and payment metadata is rejected. On
the `/x402` endpoint, `pubfi.route.execute` accepts the official x402 metadata flow for an eligible
route and rejects every Bearer credential. Other tools keep their published public or
authenticated contract.

For an advertised free variant, `pubfi.route.execute` uses the same API-key admission and the same
exact path with `:free` appended to its final segment. A successful result reports
`execution_status: registry_free_route_executed` and `credits_charged: 0`. Anonymous and x402 MCP
calls cannot use the suffix.

## Web Host

```text
https://pubfi.ai
```

The corresponding Staging web root is `https://stg.pubfi.ai`.

Current public endpoint families include:

- `/`, `/pricing`, `/status`, `/blog`, `/blog/{slug}`, and `/products/{slug}`;
- `/discovery` and its source, category, chain, comparison, topic, and Markdown routes;
- `/login`, `/oauth/consent`, `/privacy-policy`, and `/terms-of-service`;
- `/agents.md`, `/llms.txt`, and `/llms-full.txt`;
- `/sitemap.xml` and `/robots.txt`;
- `/discovery/agent-capabilities.json`;
- `/.well-known/mcp.json`;
- `/.well-known/mcp/server-card.json`; and
- `/.well-known/mcp-registry-auth`, which is optional and can return `404`.

Legacy `/docs` routes redirect to `https://docs.pubfi.ai`.

## Public-Safe Rule

Public docs can name endpoint families, public schemas, and placeholder requests. They must not
publish API keys, signed payment material, account or purchase identifiers, usage rows, billing
records, checkout URLs, provider credentials, or private runtime readbacks.
