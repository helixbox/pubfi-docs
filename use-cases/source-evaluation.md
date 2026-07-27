---
title: "Use Case: Source Evaluation"
description: Evaluate crypto data sources with public evidence, contract fit, readiness, and claim boundaries.
---

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
| What sources exist? | [Discovery](https://pubfi.ai/discovery) |
| Is there a public docs/source link? | Discovery detail page |
| Is the route callable? | [current Registry v2 catalog](https://api.pubfi.ai/v1/capabilities) |
| What does the response look like? | [Runtime OpenAPI](https://api.pubfi.ai/openapi.json) and operation schema |
| What are the warnings? | Discovery evidence and Registry readiness |
| Can an agent use it through MCP? | [generic MCP tools](/reference/agent-interface) |

## Decision Boundary

Source evaluation can recommend review, request, certification, or integration work. It must not
skip credential, policy, source freshness, payment or allocation, or runtime readiness gates.

Continue with [Provider Integration Review](/use-cases/provider-integration-review) when the source
needs a PubFi runtime integration decision.
