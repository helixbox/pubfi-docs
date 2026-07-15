# Account, Allowance, Usage, And Billing

PubFi billing accounts group API keys and product usage. Runtime admission protects provider
execution from becoming a free-form public data proxy, while the dashboard presents the allocated
request allowance as credits.

## Concepts

| Concept | Meaning |
| --- | --- |
| API key | caller credential for gateway, capability, and MCP execution |
| scope | permission such as `invoke_provider`, `read_usage`, or `manage_keys` |
| billing account | owner of API keys, membership, admission, and product usage |
| request credit | dashboard presentation of the currently allocated `request_count` allowance |
| admission | current account state and meter-specific raw-unit allocations used to authorize execution |
| usage fact | immutable raw-unit observation about a gateway or capability execution attempt |
| idempotency key | stable key that prevents double debit for the same accepted request |

## Public Claims

Safe:

- PubFi uses API-key auth for gateway and MCP execution.
- PubFi reserves a bounded amount from a fresh active allocation before provider execution, records
  actual raw-unit usage, and releases the unused remainder.
- PubFi records immutable usage evidence; `GET /v1/billing-accounts/{billing_account_id}/billing`
  is the sole authoritative billing read.
- Usage, allowance, and billing data are separate from source-selection pages.

Unsafe:

- exposing raw API keys;
- exposing account balances or usage rows;
- treating the dashboard credit label as pricing, money, or a PubFi-owned financial ledger;
- inferring billing truth from PubFi usage facts;
- implying supplier settlement, invoice, payment, recharge, or pricing mutation APIs are available.

## Agent Guidance

Agents should never receive raw keys inside natural-language prompts. They should call PubFi tools
through a runtime that injects credentials from a secret store.
