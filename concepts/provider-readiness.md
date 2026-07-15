# Provider Readiness

Provider readiness determines when PubFi can safely say a source is callable through the gateway.

## Readiness Layers

| Layer | Question |
| --- | --- |
| Discovery listing | Does the public source-selection record exist? |
| Source freshness | Is public provider evidence current enough? |
| Capability fit | Does the provider support the requested data shape? |
| Adapter certification | Has the route or generic manifest passed required certification checks? |
| Runtime credential | Is the upstream credential configured server-side? |
| Account gate | Does the caller have PubFi auth, scope, fresh active admission, and sufficient allocation? |
| Execution gate | Can the request be validated and attempted safely now? |

## Certification

Adapter certification is evidence, not procurement authority. A provider cannot be presented as
`gateway_available` unless its current adapter, readiness catalog, route cases, auth shape,
environment requirements, smoke evidence, usage facts, and public-claim basis align.

## Generic HTTP/OpenAPI Manifests

Generic manifests can make low-risk routes easier to certify, but they fail closed unless:

- the provider and operation are within PubFi's crypto/Web3/on-chain data scope;
- manifest state is runtime-enabled;
- certification run passed;
- required operation, auth, parameter, timeout, response, usage, and fixture checks passed;
- supplier procurement and payment authority remain disabled unless separately approved.

The public gateway catalog is the current runtime authority for generated generic operations. An
empty certified catalog is a valid fail-closed state when no eligible generic providers are active.
Generic manifest certification requires public-safe terms and relevance evidence bound to the
exact operation, plus any required fixed-network, no-auth-upstream, or static-query-parameter
constraints.

## Public Docs Rule

Discovery pages may show requestable, contract-ready, or candidate states. They must not imply
gateway availability until readiness and certification evidence support that claim.
