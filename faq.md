---
title: FAQ
description: Answers to common questions about Discovery, Registry execution, MCP, x402, Credits, and public docs.
---

## Is Discovery the same as the gateway?

No. Discovery is the editorial source-selection layer. The Registry v2 catalog is the runtime
authority for executable routes.

## Does a listed source mean PubFi can call it?

No. A Discovery listing can be public context, requestable, or under review. A route is callable
only when the current `GET /v1/capabilities` catalog lists its exact path and method as `ready`.

## Can agents use PubFi through MCP?

Yes, through `pubfi.capabilities.list`, `pubfi.capabilities.get`, and `pubfi.route.execute`.
The catalog reads and public MCP handshake and introspection methods are available without a
PubFi API key. On the authenticated root, `pubfi.route.execute` accepts a PubFi API key or OAuth
access token. Accountless x402 payment uses the separate `/x402` endpoint, which rejects Bearer
credentials. An agent with a wallet-capable x402 MCP client can pay directly through the official
MCP metadata flow on that endpoint. It does not need a separate paid HTTP call.

## Why does my agent see only three PubFi tools?

This is the intended provider-neutral interface. Subscan and DeGov are exact `provider_key`
filters in `pubfi.capabilities.list`, not tool namespaces. The agent lists current capabilities,
gets one exact contract, and then calls `pubfi.route.execute` with its exact path and method. It
should not look for `subscan.*` or `degov.*`.

Use [MCP Client Guides](/getting-started/mcp-clients) for client configuration and safe
verification prompts.

## Do all gateway routes support x402?

No. x402 is enabled per exact Registry route. Inspect the current catalog and the route's
`402 Payment Required` response before you sign.

For endpoint and credential separation, see the [Staging guide](/getting-started/staging).

## Does x402 require an account or API key?

No. An eligible HTTP or MCP request uses a wallet authorization instead. It creates no PubFi
account, API key, Credits balance, invoice, or anonymous dashboard.

## How does an accountless caller see a balance or receipt?

The wallet's USDC balance on the network in the accepted challenge is the available payment
balance. PubFi does not mirror it as an account or Credits balance. A settled HTTP response carries
`PAYMENT-RESPONSE`; a settled MCP result carries the decoded response at
`result._meta["x402/payment-response"]`. Both include the official Ed25519 Signed Receipt. The
receipt is verifiable payment and execution evidence, not proof of an account balance, Credits
purchase, top-up, or deposit. An exact paid replay returns the same response and receipt without a
second charge. SIWX wallet-history lookup is not part of the current release.

## Does Production x402 use Base Sepolia?

No. Staging permits Base Sepolia `eip155:84532`. Production permits Base mainnet `eip155:8453` only
when x402 is enabled for the exact route. This policy does not prove that a Production x402 route
or offer is currently available. Inspect the Production catalog and the exact route's unsigned
`402` challenge before you sign.

The historical Production health acceptance on 2026-07-27 used canonical Base USDC and 0.001 USDC
per request. That route and price are not current authority. Refresh the catalog and require a new
unsigned challenge before every new payment.

## Are the free starter requests Credits?

No. The starter allocation provides 1,000 free requests. PubFi uses **Credits** only for eligible
purchase-origin `request_count` units.

## Can a registered account buy Credits?

The public API and dashboard support provider-neutral purchase offers and purchase status.
Purchase creation requires an authenticated Owner or Admin. Availability is data-driven: if the
current offer response is empty, no purchase offer is open for sale.

## What is Auto Top-Up?

Auto Top-Up is an optional registered-account policy for buying a fixed whole-Credit quantity when
the available Credit balance falls below a chosen threshold. It is off by default. An Owner or
Admin must provide an active shared payment method, accept the current Service Credit Terms, choose
a current eligible offer, and set a finite UTC monthly limit. The dashboard name is **Auto
Top-Up**; the API route name remains `credit-auto-reload`.

## Do Stripe and x402 debit the same balance?

No. A registered purchase can create a purchase-origin allocation after verified settlement.
x402 buys one eligible response directly and never creates or consumes Credits. Quantro remains
the common accounting-fact authority behind both entry modes. One request selects one authority, so
it cannot debit both.

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
