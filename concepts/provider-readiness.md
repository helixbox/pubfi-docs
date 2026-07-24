# Provider Readiness

Provider readiness determines when PubFi can safely say a source is callable through the gateway.

## Readiness Layers

| Layer | Question |
| --- | --- |
| Discovery listing | Does the public source-selection record exist? |
| Source freshness | Is public provider evidence current enough? |
| Registry operation | Does the current signed generation contain the exact path and method? |
| Operation readiness | Is that exact operation `ready` rather than `blocked`? |
| Runtime credential | Is the upstream credential configured server-side? |
| Caller gate | Does the caller have API-key admission, or is this exact HTTP route eligible for x402? |
| Execution gate | Can the request be validated and attempted safely now? |

## Certification

Adapter certification is evidence, not procurement authority. An operation cannot be presented as
`ready` unless its current Registry identities, route cases, auth shape, environment requirements,
health evidence, usage contract, and public-claim basis align.

## Generic HTTP/OpenAPI Manifests

Generic manifests can make low-risk routes easier to certify, but they fail closed unless:

- the provider and operation are within PubFi's crypto/Web3/on-chain data scope;
- manifest state is runtime-enabled;
- certification run passed;
- required operation, auth, parameter, timeout, response, usage, and fixture checks passed;
- supplier procurement and payment authority remain disabled unless separately approved.

The public Registry v2 catalog is the current runtime authority for generated operations. An empty
catalog is a valid fail-closed state when no operations are active.
Generic manifest certification requires public-safe terms and relevance evidence bound to the
exact operation, plus any required fixed-network, no-auth-upstream, or static-query-parameter
constraints.

## Public Docs Rule

Discovery pages may show requestable, contract-ready, or candidate states. Those are editorial
states. They must not imply runtime execution until the current Registry contains a matching
`ready` operation.
