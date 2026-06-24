# Use Case: Agent Wallet Balance

An agent needs a wallet balance for a supported chain.

## User Need

"Read a wallet/account balance without embedding provider-specific endpoint logic or upstream keys
in my agent."

## Recommended PubFi Flow

1. Search for wallet balance capabilities.
2. Plan a route with chain/network and address inputs.
3. Inspect schema for the selected capability.
4. Quote cost posture if needed.
5. Execute the selected callable route with a PubFi API key.
6. Read provenance, freshness, and warnings from the response envelope.

## Capability

```text
wallet.account_balance
```

## Why Not Call Provider Directly?

Direct provider calls make the agent own provider auth, endpoint shape, response normalization,
freshness evidence, and usage accounting. PubFi's capability contract keeps those concerns behind a
stable envelope while still exposing provider provenance.

## Claim Boundary

This use case is valid only when the selected route is currently callable. If the route is
`contract_ready`, `requestable`, or blocked by source freshness or credentials, the agent should
surface the gate readback instead of pretending it has live data.
