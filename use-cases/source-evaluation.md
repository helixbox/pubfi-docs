# Use Case: Source Evaluation

A team needs to decide whether a crypto data source is trustworthy enough to integrate or feature.

## Evaluation Dimensions

- public docs availability;
- source freshness;
- API contract clarity;
- auth and pricing posture;
- chain and category coverage;
- provenance quality;
- operation and response-schema fit;
- current PubFi routeability;
- claim-safe public status.

## PubFi Surfaces

| Question | Surface |
| --- | --- |
| What sources exist? | Discovery |
| Is there a public docs/source link? | Discovery detail page |
| Is the route callable? | current Registry v2 catalog |
| What does the response look like? | Runtime OpenAPI and operation schema |
| What are the warnings? | Discovery evidence and Registry readiness |
| Can an agent use it through MCP? | generic MCP tools |

## Decision Boundary

Source evaluation can recommend review, request, certification, or integration work. It must not
skip credential, policy, source freshness, payment or allocation, or runtime readiness gates.
