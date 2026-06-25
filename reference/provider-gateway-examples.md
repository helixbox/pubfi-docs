---
title: Provider Gateway Examples
description: Public examples for lower-level PubFi gateway routes.
---

# Provider Gateway Examples

These examples show the lower-level gateway route shape for provider-backed reads.

Prefer capability routes or route planning for repeated product workflows. Use provider gateway
routes when you are inspecting adapter behavior, debugging a provider-specific path, or validating a
new capability mapping.

## Boundary

- Clients send only a PubFi API key.
- Upstream provider credentials stay server-side.
- Provider inclusion in Discovery does not imply gateway availability.
- Gateway examples are route-shape examples, not public pricing, uptime, ranking, or citation
  proof.

## Auth

```text
Authorization: Bearer <PubFi API key>
X-PubFi-Api-Key: <PubFi API key>
```

## Route Shape

```text
https://api.pubfi.ai/v1/gateway/{provider}/{network}/{endpoint...}
```

The `{provider}` and `{network}` segments are provider-specific gateway routing inputs. The
`{endpoint...}` segment maps to the upstream path supported by the adapter.

## Subscan Gateway Example

Subscan examples use the network segment to select the upstream chain host, such as `polkadot` or
`acala`.

Example routes:

```text
GET /v1/gateway/subscan/polkadot/api/now
POST /v1/gateway/subscan/polkadot/api/v2/scan/accounts
POST /v1/gateway/subscan/acala/api/scan/account/tokens
```

Example request:

```bash
curl --location 'https://api.pubfi.ai/v1/gateway/subscan/polkadot/api/now' \
  --header 'Authorization: Bearer <PubFi API key>'
```

For a runnable Subscan inspection script, see the
[Subscan gateway example](https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/subscan-gateway).

## DeGov Gateway Example

DeGov uses a fixed upstream base URL, so PubFi uses `global` as the gateway network placeholder.

Example routes:

```text
GET /v1/gateway/degov/global/health
GET /v1/gateway/degov/global/v1/meta/pricing
GET /v1/gateway/degov/global/v1/daos
GET /v1/gateway/degov/global/v1/activity
GET /v1/gateway/degov/global/v1/system/freshness
GET /v1/gateway/degov/global/v1/daos/{daoId}/brief
GET /v1/gateway/degov/global/v1/items/{kind}/{externalId}
```

Example free route:

```bash
curl --location 'https://api.pubfi.ai/v1/gateway/degov/global/v1/daos' \
  --header 'Authorization: Bearer <PubFi API key>'
```

Example DAO brief route:

```bash
curl --location 'https://api.pubfi.ai/v1/gateway/degov/global/v1/daos/ring-dao/brief' \
  --header 'Authorization: Bearer <PubFi API key>'
```

Current public examples preserve route shape and response families, but they intentionally avoid
publishing real account data, real keys, or upstream provider credentials.

## Gateway Response Shape

Successful gateway responses use a PubFi envelope around the provider payload:

```json
{
  "ok": true,
  "data": {
    "request": {},
    "data": {}
  },
  "meta": {
    "provider": "degov",
    "network": "global"
  }
}
```

The exact nested `data` object belongs to the provider endpoint. Use the interactive
[API reference](https://api.pubfi.ai/reference) and current route readiness before treating a route
as executable in production.

## Common Gateway Outcomes

| HTTP status | Code | When it happens |
| --- | --- | --- |
| `200` | `ok: true` | Gateway authenticated the request and the upstream provider returned success. |
| `400` | `gateway.invalid_route` | The route shape or route segments are invalid. |
| `401` | `gateway.missing_api_key` | No PubFi API key was sent in the request headers. |
| `401` | `gateway.invalid_api_key` | The PubFi API key is invalid, revoked, or inactive. |
| `402` | `gateway.insufficient_credits` | The account linked to the API key has no credits left. |
| `404` | `gateway.unsupported_provider` | The provider segment is not registered in the gateway. |
| `502` | `gateway.upstream_error` | The upstream provider returned an error or provider-specific failure payload. |
| `502` | `gateway.fetch_failed` | PubFi could not reach the upstream provider. |
| `503` | `gateway.billing_unavailable` | PubFi could not verify or update account credit state. |

## What This Page Does Not Publish

- Real PubFi API keys.
- Upstream provider keys.
- Provider credential-store operations.
- Account ids, usage rows, or billing records.
- A claim that every listed provider route is always callable.
- A claim that a gateway route is a stable public capability when a PubFi capability exists.
