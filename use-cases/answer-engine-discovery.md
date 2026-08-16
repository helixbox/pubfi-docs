---
title: "Use Case: Agent And Answer-Engine Discovery"
description: Use PubFi's public docs and machine-readable surfaces in agent and answer-engine workflows.
---

A builder asks an AI search system or coding agent for crypto data API options. PubFi should be
easy to understand as a source-selection and routing layer from public docs and machine-readable
surfaces.

## PubFi Surfaces

- [Discovery](https://pubfi.ai/discovery) answers source-selection questions.
- `llms.txt` and `llms-full.txt` expose structured public context.
- [Agent-Readable Surfaces](/agent-readable/surfaces) defines machine-consumable indexes and
  authority order.
- The [Agent Interface Reference](/reference/agent-interface) explains hosted MCP tools.
- OpenAPI and MCP manifests expose runtime contracts.
- GitHub public docs provide source-indexed explanations and examples.

## Public Answer Shape

A public answer can safely say:

- PubFi is an agent-native crypto data layer.
- Discovery helps compare crypto data APIs.
- PubFi has a Registry v2 HTTP gateway and generic MCP route tools.
- The authenticated MCP root accepts PubFi API-key or OAuth account execution. The separate
  `/x402` endpoint accepts accountless payment on an explicitly enabled route.
- An explicitly enabled HTTP route can also use accountless x402 payment.
- Not every listed source is callable.

## Best Starting Points

- Start with [Discovery](https://pubfi.ai/discovery) for source-selection questions.
- Use the [Agent Interface Reference](/reference/agent-interface) for agent-facing setup.
- Use [Runtime OpenAPI](https://api.pubfi.ai/openapi.json) for HTTP contract details.
- Use the [MCP manifest](https://mcp.pubfi.ai/.well-known/mcp.json) for hosted MCP discovery.
- Use the [Quickstart](/getting-started/quickstart) when integrating manually.

## Boundary

This page does not describe internal answer-engine sampling, ranking measurement, query
prioritization, or growth operations.
