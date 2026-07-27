---
title: Payment And Execution Modes
description: How PubFi separates API-key usage, registered-account purchases, and accountless x402 payments.
---

PubFi has separate caller entry modes, but it does not maintain separate financial authorities for
each mode. PubFi owns route execution and product presentation. Quantro owns the provider-neutral
commercial, settlement, allocation, and receipt facts behind those product surfaces.

## Mode Comparison

| Mode | Caller identity | What authorizes execution | Commercial effect |
| --- | --- | --- | --- |
| API key and allowance | registered billing account | PubFi API key, scope, active admission, and sufficient allocation | reserves and finalizes the selected meter allocation |
| Registered purchase | authenticated account Owner or Admin | an available immutable purchase offer and provider-hosted Checkout | after verified settlement, creates a purchase-origin meter allocation shown by PubFi as Credits |
| Accountless x402 over HTTP or MCP | wallet authorization; no PubFi account or API key | one valid x402 payment bound to one eligible request | buys that response only; it does not create or consume Credits |

The free starter allocation is not Credits. PubFi uses **Credits** only for eligible,
purchase-origin `request_count` units. Credits are service units, not money, a stored-value wallet,
or a transferable token.

## HTTP Lane Selection

For an x402-enabled gateway route:

| API key | `PAYMENT-SIGNATURE` | Result |
| --- | --- | --- |
| present | absent | use the API-key and allocation lane |
| absent | absent | return `402 Payment Required` with `PAYMENT-REQUIRED` |
| absent | present | verify the x402 authorization and continue in the accountless lane |
| present | present | reject the request because the payment lanes conflict |

An invalid API key never falls back to x402. An x402 authorization never falls back to Credits.
One request cannot debit both modes.

## MCP Lane Selection

`pubfi.route.execute` has the same two mutually exclusive authorities:

- API-key transport auth selects the registered account/allocation lane.
- `params._meta["x402/payment"]` selects the accountless x402 lane.
- Sending both is a conflict.
- Sending neither on an eligible paid route returns an MCP `CallToolResult` payment requirement.

The bounded `_meta` object can contain unrelated MCP metadata. Only the `x402/payment` entry
carries payment and selects the x402 lane.

MCP is a transport adapter over the same route execution and x402 settlement owners as HTTP. It
does not create a separate balance, ledger, provider route, or commercial authority.

## x402 Environment Scope

PubFi enforces these x402 environment boundaries:

| Environment | Exact origins | Permitted network |
| --- | --- | --- |
| Staging | `https://api-stg.pubfi.ai` and `https://mcp-stg.pubfi.ai` | Base Sepolia `eip155:84532` |
| Production | `https://api.pubfi.ai` and `https://mcp.pubfi.ai` | Base mainnet `eip155:8453`, only when x402 is enabled for the exact route |

The environment boundary does not prove current route or offer availability. Use the selected
environment's live Registry catalog as route authority. Use the route's live unsigned `402`
challenge as the authority for the asset, amount, payee, timeout, and other payment terms.

An enabled route uses a bounded x402 V2 `exact` lane with:

- EIP-3009 authorization;
- fixed terms known before provider execution;
- non-streaming, bounded responses; and
- standard `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, and `PAYMENT-RESPONSE` headers;
- the official Signed Offers & Receipts extension with Ed25519 `did:web` verification; and
- the official MCP `x402/payment` and `x402/payment-response` metadata flow.

The public Base Sepolia example is Staging-only. Base Sepolia USDC has no financial value. See the
[Staging guide](/getting-started/staging) for the endpoint and credential boundary.

## x402 Settlement And Replay

PubFi binds the wallet authorization to the exact method, resource, request, and active route.
Before provider I/O, PubFi creates a durable execution fence. Only a validated, bounded provider
success can be staged for settlement.

PubFi returns the staged response only after settlement converges. A successful response includes
`PAYMENT-RESPONSE`. Replaying the exact signed request returns the same staged response and the same
payment response without a second provider call or charge.

Definite provider failures and ambiguous provider outcomes do not become billable x402 sales.
Clients should retry the exact request and authorization when recovery is allowed instead of
creating a second authorization for the same attempt.

## Registered Purchases

The public API exposes provider-neutral purchase-offer, create, list, and status routes for
registered billing accounts. Purchase creation requires an authenticated human Owner or Admin and
an `Idempotency-Key`. The caller selects only an advertised `offerKey`; the server owns amount,
currency, quantity, validity, provider, and effect.

An API route existing does not prove that a production offer is available. Clients must inspect
the current offer response. If no available offer is returned, the registered purchase lane is not
currently open for sale.

## Billing And Balance Readback

Registered accounts use the dashboard and authenticated billing routes for allocation, usage,
purchase, and billing readback.

Accountless x402 callers have no PubFi account balance, Credits balance, invoice, or anonymous
dashboard. Their payment evidence is:

- the wallet activity on the network in the accepted challenge;
- the request-bound `PAYMENT-RESPONSE`;
- the paired signed offer and signed receipt; and
- exact replay of the same signed request.

PubFi does not expose internal Quantro settlement records or payment payloads as public accountless
billing data. SIWX, a public wallet-history service, and anonymous Credits are not part of the
current release.
