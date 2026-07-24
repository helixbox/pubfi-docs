---
title: Runtime Endpoints
description: Current PubFi API, MCP, web, account, purchase, and Registry v2 endpoint families.
---

# Runtime Endpoints

This page lists the current public runtime endpoint families. It does not list internal webhook,
operator, repair, or control-plane routes.

## API Host

```text
https://api.pubfi.ai
```

### Public Service And Registry Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Process health. |
| `GET` | `/readyz` | Dependency and programmed-Registry readiness. This route can return `503` when the service must fail closed. |
| `GET` | `/version` | Runtime version metadata. |
| `GET` | `/metrics` | Operational metrics. This route is not product or route-availability evidence. |
| `GET` | `/openapi.json` | Runtime OpenAPI generated from the installed Registry v2 snapshot. |
| `GET` | `/reference` | Interactive API reference for `/openapi.json`. |
| `GET` | `/v1/capabilities` | Public `pubfi.gateway.registry.catalog.v2` catalog. |
| `GET` | `/.well-known/mcp.json` | API-host MCP discovery manifest. |
| `GET` | `/.well-known/glama.json` | Public MCP connector ownership declaration. |
| `POST` | `/` | MCP JSON-RPC endpoint. |

`GET /v1/capabilities` is the catalog endpoint. It includes the exact Registry generation,
manifest, route matcher, methods, request and response policies, meter, maximum raw units, and
current `ready` or `blocked` state.

The Runtime OpenAPI includes only current `ready` Registry operations. If the API has no valid
programmed snapshot, it marks the Registry as unavailable and does not use a static provider
fallback.

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
| API key | A PubFi API key with `invoke_provider`, active admission, and sufficient allocation. |
| Accountless x402 | No PubFi API key; the exact route must be x402-eligible and the request must satisfy the current V2 payment challenge. |

Do not send a PubFi API key and `PAYMENT-SIGNATURE` in the same request.

### Account And Purchase Routes

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/v1/billing-accounts` | Authenticated human dashboard session. |
| `GET|POST` | `/v1/billing-accounts/{billing_account_id}/api-keys` | Human Owner or Admin, or an API key for the same account with `manage_keys`. |
| `PATCH|DELETE` | `/v1/billing-accounts/{billing_account_id}/api-keys/{id}` | Human Owner or Admin, or an API key for the same account with `manage_keys`. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/usage` | Human account member, or an API key for the same account with `read_usage`. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/billing` | Human account member, or an API key for the same account with `read_usage`. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/purchase-offers` | Human account member. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/purchases` | Human account member. |
| `POST` | `/v1/billing-accounts/{billing_account_id}/purchases` | Human Owner or Admin. Requires `Idempotency-Key` and a current advertised `offerKey`. |
| `GET` | `/v1/billing-accounts/{billing_account_id}/purchases/{purchase_id}` | Human account member. |

Purchase responses are private and use `Cache-Control: private, no-store`. The presence of these
routes does not prove that a purchase offer is currently available.

## MCP Host

```text
https://mcp.pubfi.ai
```

Current endpoint families:

- `POST /` for MCP JSON-RPC;
- `GET /healthz`;
- `GET /readyz`;
- `GET /version`; and
- `GET /.well-known/mcp.json`.

The handshake, ping, `tools/list`, resource listing, and prompt listing methods are public.
Every `tools/call` requires a PubFi API key with `invoke_provider`. MCP execution uses the API-key
and allocation lane. MCP does not use x402.

## Web Host

```text
https://pubfi.ai
```

Current public endpoint families include:

- `/`, `/pricing`, `/blog`, `/blog/{slug}`, and `/products/{slug}`;
- `/discovery` and its source, category, chain, comparison, topic, and Markdown routes;
- `/login`, `/privacy-policy`, and `/terms-of-service`;
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
