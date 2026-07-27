---
title: Public Surfaces
description: Current public PubFi product, Registry, API, MCP, and agent-readable URLs.
---

This inventory lists current public contracts and public-facing route families. Some runtime
operations still require account, API-key, or x402 authorization.

## Environment Entry Points

| Environment | Web | API | MCP |
| --- | --- | --- | --- |
| Staging | `https://stg.pubfi.ai` | `https://api-stg.pubfi.ai` | `https://mcp-stg.pubfi.ai` |
| Production | `https://pubfi.ai` | `https://api.pubfi.ai` | `https://mcp.pubfi.ai` |

The Staging login entry is `https://stg.pubfi.ai/login`.

For the selected API root, use:

- `/reference` for the interactive reference;
- `/openapi.json` for Runtime OpenAPI; and
- `/v1/capabilities` for the installed Registry catalog.

For the selected MCP root, use `/.well-known/mcp.json` for discovery metadata.

Staging is the Base Sepolia (`eip155:84532`) test boundary for eligible accountless x402 routes.
The current staging catalog and challenge remain the availability and payment-term authority.
This boundary does not establish Production x402 availability. See the [Staging
guide](/getting-started/staging).

## Product And Discovery

- `https://pubfi.ai`
- `https://pubfi.ai/pricing`
- `https://pubfi.ai/blog`
- `https://pubfi.ai/blog/{slug}`
- `https://pubfi.ai/products/{slug}`
- `https://pubfi.ai/discovery`
- `https://pubfi.ai/discovery/api/{source_slug}`
- `https://pubfi.ai/discovery/category/{slug}`
- `https://pubfi.ai/discovery/chain/{slug}`
- `https://pubfi.ai/discovery/compare/{slug-a}-vs-{slug-b}`
- `https://pubfi.ai/discovery/sources`
- `https://pubfi.ai/discovery/sources/page/{page}`
- `https://pubfi.ai/discovery/topic/{slug}`
- `https://pubfi.ai/login`
- `https://pubfi.ai/privacy-policy`
- `https://pubfi.ai/terms-of-service`

Discovery describes source fit and public evidence. It does not prove that a Registry operation is
ready.

## Runtime Schemas And Catalogs

- `https://api.pubfi.ai/reference`
- `https://api.pubfi.ai/openapi.json`
- `https://api.pubfi.ai/v1/capabilities`

`/v1/capabilities` is the public catalog for the installed Registry v2 generation. Runtime OpenAPI
is the executable HTTP schema for current `ready` operations. PubFi does not publish separate
static provider OpenAPI files as execution authority.

## MCP Discovery

- `https://api.pubfi.ai/.well-known/mcp.json`
- `https://api.pubfi.ai/.well-known/glama.json`
- `https://mcp.pubfi.ai/.well-known/mcp.json`
- `https://pubfi.ai/.well-known/mcp.json`
- `https://pubfi.ai/.well-known/mcp/server-card.json`
- `https://pubfi.ai/.well-known/mcp-registry-auth`

The registry-auth proof route is optional and can return `404`. MCP discovery and `tools/list` are
public. `pubfi.route.execute` accepts PubFi API-key authentication or accountless x402 on an
eligible route.

## Gateway Contract

```text
GET|POST https://api.pubfi.ai/v1/gateway/{*path}
```

The exact current Registry matcher defines `{*path}`. API-key execution requires
`invoke_provider`, active admission, and sufficient allocation. An explicitly eligible operation
can instead return an accountless x402 V2 challenge when no API key is present.

## Authenticated Account And Purchase Families

- `https://api.pubfi.ai/v1/billing-accounts`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/api-keys`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/usage`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/billing`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/purchase-offers`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/purchases`

These URLs are public API contracts, but their data is private. Purchase route presence does not
prove that a current offer exists.

## Agent-Readable And Crawler Files

- `https://pubfi.ai/agents.md`
- `https://pubfi.ai/llms.txt`
- `https://pubfi.ai/llms-full.txt`
- `https://pubfi.ai/discovery.md`
- `https://pubfi.ai/discovery/api/{source_slug}.md`
- `https://pubfi.ai/discovery/topic/{slug}.md`
- `https://pubfi.ai/discovery/agent-capabilities.json`
- `https://pubfi.ai/sitemap.xml`
- `https://pubfi.ai/robots.txt`
- `https://pubfi.ai/50e4aa84-257b-4ff4-a822-5da3d567384c.txt`

## Service Status Surfaces

- `https://api.pubfi.ai/healthz`
- `https://api.pubfi.ai/readyz`
- `https://api.pubfi.ai/version`
- `https://api.pubfi.ai/metrics`

Health, readiness, version, and metrics are operational evidence only. They do not prove that a
specific route, x402 offer, registered purchase offer, provider response, or payment is available.
Apply the same rule to the corresponding Staging status surfaces.

## Public-Safe Rule

These surfaces can publish schemas, source-selection context, route policies, and placeholder
examples. They must not expose:

- API keys or provider credentials;
- signed x402 payloads, `PAYMENT-SIGNATURE`, or `PAYMENT-RESPONSE`;
- wallet secrets or unredacted payment identities;
- account, purchase, checkout, usage, or billing data;
- private runtime readbacks or operator records; or
- unsupported claims about uptime, payment completion, ranking, traffic, or citations.
