# Account, Credits, Purchases, Usage, And Billing

PubFi billing accounts group API keys and product usage. Runtime admission protects provider
execution from becoming a free-form public data proxy.

## Concepts

| Concept | Meaning |
| --- | --- |
| API key | caller credential for gateway, capability, and MCP execution |
| scope | permission such as `invoke_provider`, `read_usage`, or `manage_keys` |
| billing account | owner of API keys, membership, admission, and product usage |
| starter allocation | 1,000 free `request_count` units; not Credits |
| Credit | dashboard presentation of eligible purchase-origin `request_count` units |
| admission | current account state and meter-specific raw-unit allocations used to authorize execution |
| usage fact | immutable raw-unit observation about a Registry gateway execution attempt |
| idempotency key | stable key that prevents double debit for the same accepted request |
| purchase offer | immutable provider-neutral terms that can create a meter allocation after verified settlement |
| x402 direct sale | one accountless wallet payment for one eligible response; unrelated to Credits |

## Public Claims

Safe:

- PubFi uses API-key auth for registered-account gateway and MCP execution.
- PubFi reserves a bounded amount from a fresh active allocation before provider execution, records
  actual raw-unit usage, and releases the unused remainder.
- PubFi records immutable usage evidence; `GET /v1/billing-accounts/{billing_account_id}/billing`
  is the sole authoritative billing read.
- Registered human users can inspect available purchase offers and create an idempotent purchase
  from an advertised `offerKey`.
- A verified purchase can create purchase-origin Credits. A browser redirect alone cannot.
- An eligible x402 request does not create, add, or consume account Credits.
- Usage, allowance, and billing data are separate from source-selection pages.

Unsafe:

- exposing raw API keys;
- exposing account balances or usage rows;
- treating Credits as pricing, money, a stored-value wallet, or a PubFi-owned financial ledger;
- inferring billing truth from PubFi usage facts;
- implying that a purchase route means a production offer is currently available;
- implying that PubFi automatically procures or pays an upstream supplier; and
- implying that x402 has an anonymous Credits balance or account billing dashboard.

## Agent Guidance

Agents should never receive raw keys inside natural-language prompts. They should call PubFi tools
through a runtime that injects credentials from a secret store.

Accountless x402 is available over the HTTP gateway and MCP `pubfi.route.execute`. It does not
create or consume account Credits. See [Payment And Execution
Modes](/concepts/payment-and-execution-modes).
