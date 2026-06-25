# FAQ

## Is Discovery the same as the gateway?

No. Discovery is the public source-selection layer. Gateway and capability runtime are
authenticated execution surfaces with separate readiness gates.

## Does a listed source mean PubFi can call it?

No. A listed source can be public context, requestable, contract-ready, or blocked. Runtime
callability requires `gateway_available` readiness and live execution gates.

## Can agents use PubFi through MCP?

Yes, through generic MCP tools such as `pubfi.capabilities.search`, `pubfi.route.plan`, and
`pubfi.route.execute`. Hosted MCP requests require a PubFi API key.

## Should upstream provider keys be sent to agents?

No. Upstream provider credentials stay server-side.

## Does this docs repo prove SEO/GEO success?

No. Public docs improve crawlable context, but ranking, traffic, and AI citation success require
separate live external evidence.

## Why not put all docs only on GitHub?

GitHub is useful for source indexing and contribution, but a canonical docs site gives better
navigation, sitemap control, metadata, product trust, and conversion routing.

## Why not mirror everything on `pubfi.ai/docs`?

Full mirroring can create duplicate-content and canonical ambiguity. `pubfi.ai/docs` should keep
product-owned entry pages and selected summaries unless it is the chosen canonical URL.

