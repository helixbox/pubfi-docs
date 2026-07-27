# FAQ

## Is Discovery the same as the gateway?

No. Discovery is the editorial source-selection layer. The Registry v2 catalog is the runtime
authority for executable routes.

## Does a listed source mean PubFi can call it?

No. A Discovery listing can be public context, requestable, or under review. A route is callable
only when the current `GET /v1/capabilities` catalog lists its exact path and method as `ready`.

## Can agents use PubFi through MCP?

Yes, through generic MCP tools such as `pubfi.capabilities.search`, `pubfi.route.plan`, and
`pubfi.route.execute`. Public MCP handshake and introspection methods are available without a
PubFi API key. `pubfi.route.execute` accepts either API-key admission or accountless x402 payment.
The two modes cannot be combined.

## Do all gateway routes support x402?

No. x402 is enabled per exact Registry route. Inspect the current catalog and the route's
`402 Payment Required` response before you sign.

For endpoint and credential separation, see the [Staging guide](/getting-started/staging).

## Does x402 require an account or API key?

No. An eligible HTTP or MCP request uses a wallet authorization instead. It creates no PubFi
account, API key, Credits balance, invoice, or anonymous dashboard.

## How does an accountless caller see a balance or receipt?

The wallet or chain explorer shows activity on the network in the accepted challenge. The public
Staging example uses Base Sepolia test USDC. The settled response includes the x402 payment
response and an official Ed25519 signed receipt. An exact paid replay returns the same response and
receipt. PubFi does not expose an accountless Credits balance because x402 buys one response and
does not create Credits. SIWX wallet-history lookup is not part of the current release.

## Does Production x402 use Base Sepolia?

No. Staging permits Base Sepolia `eip155:84532`. Production permits Base mainnet `eip155:8453` only
when x402 is enabled for the exact route. This policy does not prove that a Production x402 route
or offer is currently available. Inspect the Production catalog and the exact route's unsigned
`402` challenge before you sign.

## Are the free starter requests Credits?

No. The starter allocation provides 1,000 free requests. PubFi uses **Credits** only for eligible
purchase-origin `request_count` units.

## Can a registered account buy Credits?

The public API and dashboard support provider-neutral purchase offers and purchase status.
Purchase creation requires an authenticated Owner or Admin. Availability is data-driven: if the
current offer response is empty, no purchase offer is open for sale.

## Do Stripe and x402 debit the same balance?

No. A registered purchase can create a purchase-origin allocation after verified settlement.
x402 buys one eligible response directly and never creates or consumes Credits. Quantro remains
the common financial-fact authority behind both entry modes.

## Should upstream provider keys be sent to agents?

No. Upstream provider credentials stay server-side.

## Does this docs repo prove SEO/GEO success?

No. Public docs improve crawlable context, but ranking, traffic, and AI citation success require
separate live external evidence.

## Why not put all docs only on GitHub?

GitHub is useful for source indexing and contribution, but a canonical docs site gives better
navigation, sitemap control, metadata, product trust, and conversion routing.

## Why not mirror everything on `pubfi.ai/docs`?

Full mirroring can create duplicate-content and canonical ambiguity. `docs.pubfi.ai` is the canonical
docs site; legacy `pubfi.ai/docs/...` paths should redirect there instead of carrying a second copy
of the same docs pages.
