---
title: Account, Credits, Purchases, Usage, And Billing
description: Understand billing accounts, API-key access, allocations, Credits, purchases, usage, and billing reads.
---

PubFi billing accounts group API keys and product usage. Runtime admission protects provider
execution from becoming a free-form public data proxy.

## Concepts

| Concept | Meaning |
| --- | --- |
| API key | caller credential for gateway, capability, and MCP execution |
| API-key access | one fixed model for gateway or MCP execution and same-account usage and billing reads |
| billing account | owner of API keys, membership, admission, and product usage |
| starter allocation | 1,000 free `request_count` units; not Credits |
| Credit | dashboard presentation of eligible purchase-origin `request_count` units |
| admission | current account state and meter-specific raw-unit allocations used to authorize execution |
| usage fact | immutable raw-unit observation about a Registry gateway execution attempt |
| idempotency key | stable key that prevents double debit for the same accepted request |
| purchase offer | immutable provider-neutral terms that can create a meter allocation after verified settlement |
| Auto Top-Up | an optional account policy that buys a fixed whole-Credit quantity when the available Credit balance falls below its threshold |
| x402 direct sale | one accountless wallet payment for one eligible response; unrelated to Credits |

## Public Claims

Safe:

- PubFi uses API-key auth for registered-account gateway and MCP execution.
- Clients cannot request or inspect per-key scopes. Only a human Owner or Admin can manage keys.
- The runtime assigns each key to its own environment and accepts only matching keys.
- PubFi reserves a bounded amount from a fresh active allocation before provider execution, records
  actual raw-unit usage, and releases the unused remainder.
- PubFi records immutable usage evidence; `GET /v1/billing-accounts/{billing_account_id}/billing`
  is the sole authoritative billing read.
- Registered human users can inspect available purchase offers and create an idempotent purchase
  with the advertised offer key, catalog release hash, amount, and exact accepted terms identity.
- The current checked-in pricing target sets one Credit and 0.001 USDC for each priced Subscan and
  DeGov operation. Its registered-purchase base is $1 for 1,000 Credits. The installed catalog,
  Runtime OpenAPI, and current offer response remain the execution and availability authorities.
- A verified purchase can create purchase-origin Credits. A browser redirect alone cannot.
- Auto Top-Up is off by default. Human account members can read its state. Only an Owner or Admin
  can add or change the shared payment method, enable or replace the policy, or turn it off.
- Enabling Auto Top-Up requires a current eligible offer, an active shared payment method, exact
  accepted Service Credit Terms, a positive whole-Credit threshold and purchase quantity, and a
  finite UTC monthly limit that covers one full automatic purchase.
- The dashboard can isolate a temporarily unavailable Auto Top-Up panel while it keeps other valid
  account data. This state does not prove that manual Credit purchases are unavailable.
- An eligible x402 request does not create, add, or consume account Credits.
- Usage, allowance, and billing data are separate from source-selection pages.

Unsafe:

- exposing raw API keys;
- exposing account balances or usage rows;
- treating Credits as pricing, money, a stored-value wallet, or a PubFi-owned financial ledger;
- inferring billing truth from PubFi usage facts;
- implying that a purchase route means a production offer is currently available;
- treating an Auto Top-Up route or saved payment method as proof that the policy is enabled or that
  an automatic purchase succeeded;
- implying that PubFi automatically procures or pays an upstream supplier; and
- implying that x402 has an anonymous Credits balance or account billing dashboard.

## Agent Guidance

Agents should never receive raw keys inside natural-language prompts. They should call PubFi tools
through a runtime that injects credentials from a secret store.

Accountless x402 is available over the HTTP gateway and MCP `pubfi.route.execute` on the explicit
`/x402` endpoint. The authenticated MCP root instead accepts a PubFi API key or OAuth access token.
x402 does not create or consume account Credits. See [Payment And Execution
Modes](/concepts/payment-and-execution-modes).
