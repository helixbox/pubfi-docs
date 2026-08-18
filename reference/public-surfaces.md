---
title: Public Surfaces
description: Current public PubFi product, Registry, API, MCP, and agent-readable URLs.
---

This inventory lists current public contracts and public-facing route families. Some runtime
operations still require account, API-key, or x402 authorization.

## Environment Entry Points

| Environment | Web | API | Authenticated MCP | MCP x402 |
| --- | --- | --- | --- | --- |
| Staging | `https://stg.pubfi.ai` | `https://api-stg.pubfi.ai` | `https://mcp-stg.pubfi.ai` | `https://mcp-stg.pubfi.ai/x402` |
| Production | `https://pubfi.ai` | `https://api.pubfi.ai` | `https://mcp.pubfi.ai` | `https://mcp.pubfi.ai/x402` |

The Staging login entry is `https://stg.pubfi.ai/login`.

For the selected API root, use:

- `/reference` for the interactive reference;
- `/openapi.json` for Runtime OpenAPI; and
- `/v1/status` and `/v1/status/gateway` for public-safe service and Gateway status; and
- `/v1/capabilities` for the installed Registry catalog; and
- `/v1/operation-pricing-inventory` for the complete public-safe producer pricing projection.

For the selected MCP root, use `/.well-known/mcp.json` for discovery metadata and
`/.well-known/oauth-protected-resource` for OAuth resource metadata. Use `/x402` only for the
Bearer-free accountless MCP payment lane.

Staging is the Base Sepolia (`eip155:84532`) test boundary for eligible accountless x402 routes.
The current staging catalog and challenge remain the availability and payment-term authority.
This boundary does not establish Production x402 availability. See the [Staging
guide](/getting-started/staging).

## Product And Discovery

- `https://pubfi.ai`
- `https://pubfi.ai/pricing`
- `https://pubfi.ai/status`
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
- `https://pubfi.ai/oauth/consent` for OAuth continuation only; clients must not construct its
  opaque `authorization_id`
- `https://pubfi.ai/privacy-policy`
- `https://pubfi.ai/terms-of-service`

Discovery describes source fit and public evidence. It does not prove that a Registry operation is
ready.

## Runtime Schemas And Catalogs

- `https://api.pubfi.ai/reference`
- `https://api.pubfi.ai/openapi.json`
- `https://api.pubfi.ai/v1/capabilities`
- `https://api.pubfi.ai/v1/operation-pricing-inventory`
- `https://api.pubfi.ai/v1/status`
- `https://api.pubfi.ai/v1/status/gateway`
- `https://api.pubfi.ai/v1/status/gateway/providers/{provider_key}`
- `https://api.pubfi.ai/v1/status/gateway/operations/{capability_id}`

`/v1/capabilities` is the public catalog for the installed Registry v2 generation. Runtime OpenAPI
is the executable HTTP schema for current `ready` operations. PubFi does not publish separate
static provider OpenAPI files as execution authority.

`/v1/operation-pricing-inventory` is a no-store projection of every approved typed plan in the
same installed snapshot. It contains no selected price and is not route-execution authority. It
returns `503` rather than a partial inventory when the complete projection cannot be formed.

## MCP Discovery

- `https://api.pubfi.ai/.well-known/mcp.json`
- `https://api.pubfi.ai/.well-known/glama.json`
- `https://mcp.pubfi.ai/.well-known/mcp.json`
- `https://mcp.pubfi.ai/.well-known/oauth-protected-resource`
- `https://mcp.pubfi.ai/x402`
- `https://pubfi.ai/.well-known/mcp.json`
- `https://pubfi.ai/.well-known/mcp/server-card.json`
- `https://pubfi.ai/.well-known/mcp-registry-auth`

The registry-auth proof route is optional and can return `404`. MCP discovery and `tools/list` are
public. On the authenticated root, `pubfi.route.execute` accepts a PubFi API key or OAuth access
token. Eligible accountless x402 execution uses `/x402` without a Bearer credential.

## Gateway Contract

```text
GET|POST https://api.pubfi.ai/v1/gateway/{*path}
```

The exact current Registry matcher defines `{*path}`. API-key execution requires a key for the
endpoint environment, active admission, and sufficient allocation. An explicitly eligible
operation can instead return an accountless x402 V2 challenge when no API-key carrier is present.

## Authenticated Account And Purchase Families

- `https://api.pubfi.ai/v1/billing-accounts`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/api-keys`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/usage`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/billing`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/credit-balance`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/free-quotas`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/purchase-offers`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/purchases`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/credit-auto-reload`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/credit-auto-reload/payment-method-setups`
- `https://api.pubfi.ai/v1/billing-accounts/{billing_account_id}/credit-auto-reload/payment-method-setups/{setup_id}`

These URLs are public API contracts, but their data is private. Purchase route presence does not
prove that a current offer exists. The dashboard calls the customer feature **Auto Top-Up**;
`credit-auto-reload` is the stable API route name.

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

The public `/status` page presents the no-store `/v1/status` and `/v1/status/gateway` contracts.
Provider detail comes from the provider status route. The status APIs report `unknown` when
evidence is missing, stale, or incoherent; they do not convert missing evidence into an empty
successful state. Status does not replace the current Registry catalog as execution authority.

## Public-Safe Rule

These surfaces can publish schemas, source-selection context, route policies, and placeholder
examples. They must not expose:

- API keys or provider credentials;
- signed x402 payloads, `PAYMENT-SIGNATURE`, or `PAYMENT-RESPONSE`;
- wallet secrets or unredacted payment identities;
- account, purchase, checkout, usage, or billing data;
- private runtime readbacks or operator records; or
- unsupported claims about uptime, payment completion, ranking, traffic, or citations.
