# Use Case: Source Evaluation

A team needs to decide whether a crypto data source is trustworthy enough to integrate or feature.

## Evaluation Dimensions

- public docs availability;
- source freshness;
- API contract clarity;
- auth and pricing posture;
- chain and category coverage;
- provenance quality;
- normalized capability fit;
- current PubFi routeability;
- claim-safe public status.

## PubFi Surfaces

| Question | Surface |
| --- | --- |
| What sources exist? | Discovery |
| Is there a public docs/source link? | Discovery detail page |
| Is the route callable? | capability or gateway readiness |
| What does the response look like? | capability schema and examples |
| What are the warnings? | capability response envelope |
| Can an agent use it through MCP? | generic MCP tools |

## Decision Boundary

Source evaluation can recommend review, request, certification, or integration work. It must not
skip credential, policy, source freshness, billing, or runtime readiness gates.

