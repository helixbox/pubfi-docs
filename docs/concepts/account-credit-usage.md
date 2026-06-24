# Account, Credit, And Usage

PubFi account and usage systems protect runtime execution from becoming a free-form public data
proxy.

## Concepts

| Concept | Meaning |
| --- | --- |
| API key | caller credential for machine, gateway, capability, MCP, or account routes |
| scope | permission such as `invoke_provider`, `read_usage`, or `manage_keys` |
| credit | entitlement unit used by accepted execution attempts |
| ledger | append-only record of grants, debits, refunds, and adjustments |
| usage fact | immutable observation about a gateway or capability execution attempt |
| idempotency key | stable key that prevents double debit for the same accepted request |

## Public Claims

Safe:

- PubFi uses API-key auth for gateway and MCP execution.
- PubFi records usage and credits through Rust-owned account services.
- Usage and credit facts are separate from source-selection pages.

Unsafe:

- exposing raw API keys;
- exposing account balances or usage rows;
- presenting credits as final public pricing;
- implying supplier settlement or billing-provider export is publicly available by default.

## Agent Guidance

Agents should never receive raw keys inside natural-language prompts. They should call PubFi tools
through a runtime that injects credentials from a secret store.

