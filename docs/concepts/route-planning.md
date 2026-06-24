# Route Planning

Route planning turns an agent data need into a route decision, candidate list, rejection, abstention,
or procurement preview.

## Default Flow

1. Normalize the request into a route intent.
2. Retrieve source and capability candidates.
3. Apply hard filters before ranking.
4. Score remaining candidates with deterministic evidence.
5. Preserve optional semantic/model scores as diagnostics, not hidden authority.
6. Return an explainable plan.
7. Execute only if the selected route is supported and callable.

## Example Intent

```json
{
  "objective": "Need token balances for a Polkadot wallet.",
  "chains": ["polkadot"],
  "categories": ["on_chain_state"],
  "required_capabilities": ["wallet.token_balances"],
  "expected_calls_per_day": 10,
  "allow_paid": true
}
```

## Hard Filters

Hard filters can include:

- supported capability id;
- required chain or network;
- configured provider credential;
- source freshness;
- caller API-key scope;
- credit entitlement;
- privacy and redaction policy;
- payment/procurement policy;
- route availability.

## Outcomes

| Outcome | Meaning |
| --- | --- |
| callable route | execution may proceed after immediate preflight checks |
| abstention | PubFi should not select a route from available evidence |
| unsupported | request is outside current product boundary |
| procurement preview | demand exists, but supplier/commercial review is required |
| contract-ready | schema shape exists, but live routeability is not promised |

## Non-Goals

Route planning must not silently call suppliers, create payment payloads, grant credentials, or
hide rejected candidates and policy reasons.

