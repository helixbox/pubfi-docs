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

The examples below are public route-shape examples and certified readiness examples where noted.
They are not a promise that every OpenAPI-listed provider path is certified or path-complete.

## Subscan Gateway Example

Subscan examples use the network segment to select the upstream chain host, such as `polkadot` or
`acala`.

Example routes:

```text
GET /v1/gateway/subscan/polkadot/api/now
POST /v1/gateway/subscan/polkadot/api/v2/scan/accounts
POST /v1/gateway/subscan/polkadot/api/scan/account/tokens
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

## World Bank Gateway Example

World Bank uses a generated generic HTTP/OpenAPI adapter with a fixed `global` network placeholder.
The public example covers the World Bank population indicator path. The adapter applies the
upstream `format=json` static query server-side; client requests should send only caller-supported
query parameters such as `per_page` and `date`. It does not publish a PubFi copy of the World Bank
OpenAPI schema or any private provider credential material.

Example route:

```text
GET /v1/gateway/worldbank/global/v2/country/all/indicator/SP.POP.TOTL
```

Example request:

```bash
curl --location 'https://api.pubfi.ai/v1/gateway/worldbank/global/v2/country/all/indicator/SP.POP.TOTL?per_page=1&date=2022' \
  --header 'Authorization: Bearer <PubFi API key>'
```

## USGS Earthquake Gateway Example

USGS Earthquake Catalog uses a generated generic HTTP/OpenAPI adapter with a fixed `global` network
placeholder. The public example covers the earthquake event query path with the adapter's
server-applied upstream `format=geojson` static query requirement. Client requests should send only
caller-supported query parameters such as `limit`. It does not publish a PubFi copy of the USGS
OpenAPI schema or any private provider credential material.

For automated earthquake display use cases, evaluate the provider's real-time GeoJSON feed guidance
before using the query gateway for high-volume or continuously refreshed displays.

Example route:

```text
GET /v1/gateway/usgs-earthquake/global/fdsnws/event/1/query
```

Example request:

```bash
curl --location 'https://api.pubfi.ai/v1/gateway/usgs-earthquake/global/fdsnws/event/1/query?limit=1' \
  --header 'Authorization: Bearer <PubFi API key>'
```

## Research Metadata Gateway Examples

Crossref, ROR, and DataCite use generated generic HTTP/OpenAPI adapters with a fixed `global`
network placeholder. These examples cover certified metadata list endpoints only. They do not
publish PubFi-hosted provider OpenAPI snapshots, private provider credential material, or a claim
that every upstream metadata path is certified.

Example routes:

```text
GET /v1/gateway/crossref/global/works
GET /v1/gateway/ror/global/organizations
GET /v1/gateway/datacite/global/dois
```

Example requests:

```bash
curl --location 'https://api.pubfi.ai/v1/gateway/crossref/global/works?rows=1' \
  --header 'Authorization: Bearer <PubFi API key>'

curl --location 'https://api.pubfi.ai/v1/gateway/ror/global/organizations?page=1' \
  --header 'Authorization: Bearer <PubFi API key>'

curl --location 'https://api.pubfi.ai/v1/gateway/datacite/global/dois?page[size]=1' \
  --header 'Authorization: Bearer <PubFi API key>'
```

## Federal Register Gateway Example

Federal Register Documents API uses a generated generic HTTP/OpenAPI adapter with a fixed `global`
network placeholder. The public example covers the document list endpoint. It does not publish a
PubFi-hosted provider OpenAPI snapshot, private provider credential material, or a claim that every
upstream Federal Register path is certified.

Example route:

```text
GET /v1/gateway/federalregister-gov/global/api/v1/documents.json
```

Example request:

```bash
curl --location 'https://api.pubfi.ai/v1/gateway/federalregister-gov/global/api/v1/documents.json' \
  --header 'Authorization: Bearer <PubFi API key>'
```

Current public examples preserve route shape and response families, but they intentionally avoid
publishing real account data, real keys, or upstream provider credentials.

## Gateway Response Shape

Successful gateway responses use a PubFi envelope around the provider payload:

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "request_id": "<request id>",
    "provider": "degov",
    "network": "global",
    "route": "/v1/gateway/degov/global/v1/daos",
    "upstream": {
      "status": 200
    }
  }
}
```

The `data` value is the provider JSON payload returned for the routed endpoint, so its nested shape
differs by provider and route. The exact payload and upstream metadata belong to the provider
endpoint. Use the interactive [API reference](https://api.pubfi.ai/reference) and current route
readiness before treating a route as executable in production.

## Common Gateway Outcomes

| HTTP status | Code | When it happens |
| --- | --- | --- |
| `200` | `ok: true` | Gateway authenticated the request and the upstream provider returned success. |
| `401` | `pubfi.unauthorized` | No PubFi API key was sent, or the key is invalid, revoked, or inactive. |
| `402` | `gateway.insufficient_credits` | The account linked to the API key has no credits left. |
| `403` | `pubfi.forbidden` | The API key is valid but does not include the scope required for provider invocation. |
| `502` | `pubfi.gateway_failed` | Route decision, provider dispatch, or upstream gateway execution failed. |
| `503` | `pubfi.provider_credentials_not_configured` | The provider route needs a server-side credential that is not configured. |
| `503` | `pubfi.provider_credentials_unavailable` | Provider credentials are temporarily unavailable. |

## What This Page Does Not Publish

- Real PubFi API keys.
- Upstream provider keys.
- Server-side credential administration details.
- Account ids, usage rows, or billing records.
- A claim that every listed provider route is always callable.
- A claim that a gateway route is a stable public capability when a PubFi capability exists.
