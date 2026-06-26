# Capability Contracts

PubFi capabilities are stable agent-facing data contracts. Agents should use a capability such as
`wallet.account_balance` instead of binding directly to an upstream provider path when a capability
exists.

## Initial Vocabulary

| Capability | Meaning | Current posture |
| --- | --- | --- |
| `wallet.token_balances` | normalized token balance rows for one wallet on one chain or network | `contract_ready`/`not_callable` |
| `wallet.account_balance` | native account balance for one wallet/account on one chain or network | `gateway_available`/`callable` |
| `market.token_price` | normalized token/reference price in a quote currency | `contract_ready` |
| `governance.proposals` | normalized governance proposal rows for a chain, network, DAO, or referendum system | `contract_ready` |

## Response Envelope

Every v1 capability response uses:

```json
{
  "capability_id": "wallet.account_balance",
  "schema_version": "pubfi.capability.response.v1",
  "data": {},
  "meta": {
    "request_id": "capability_request_...",
    "mode": "normalized",
    "readiness": "gateway_available",
    "route_decision_id": "route_decision_...",
    "provenance": {},
    "source_freshness": {},
    "upstream": null,
    "warnings": [],
    "raw_debug": null
  }
}
```

## Why The Envelope Matters

The envelope lets agents inspect:

- selected capability id;
- readiness posture;
- selected provider or resource provenance;
- source freshness evidence;
- upstream metadata when observed;
- warnings and fail-closed states.

Normalized output does not hide provider identity. PubFi keeps provenance visible so agents can
reason about source quality and route suitability.

## Execution Boundary

A valid capability schema does not make a route callable. Execution still depends on current
gateway/provider readiness, API-key auth, credits, upstream credentials, source freshness, and
supported route mapping.
