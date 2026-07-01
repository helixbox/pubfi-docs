---
title: PubFi Docs
description: Public documentation for PubFi's agent-native crypto data layer.
---

PubFi is building an agent-native crypto data layer. It helps software teams and AI agents discover
crypto data sources, plan routes, inspect schemas, and use normalized capability contracts without
binding every workflow directly to a different upstream API.

## What To Read First

- [Project overview](/project-overview): what PubFi is and what it is not.
- [Quickstart](/getting-started/quickstart): the shortest path through public docs and live
  surfaces.
- [API reference](/reference/api-reference): where to find the interactive HTTP reference and
  OpenAPI schema.
- [API key and runtime](/getting-started/api-key-runtime): how account, credit, and runtime
  boundaries fit together.
- [MCP client setup](/getting-started/mcp-client): connect an agent runtime to PubFi's generic
  MCP tools.
- [Discovery](/concepts/discovery): understand the public source-selection layer.
- [Capability contracts](/concepts/capability-contracts): understand normalized agent-facing
  responses.
- [Agent-readable surfaces](/agent-readable/surfaces): understand `llms.txt`, `llms-full.txt`,
  OpenAPI, MCP, and Discovery links.

## Public Surfaces

| Surface | Purpose |
| --- | --- |
| [Product](https://pubfi.ai) | product, account, Discovery, and agent-readable product entry |
| [Discovery](https://pubfi.ai/discovery) | public crypto data API index and source-selection surface |
| [Discovery directory Markdown](https://pubfi.ai/discovery.md) | Markdown mirror for the Discovery directory |
| [Provider Profile index](https://pubfi.ai/discovery/sources) | paginated public Discovery source index |
| [Agents guide](https://pubfi.ai/agents.md) | machine-readable guide for PubFi agent setup and public boundaries |
| [llms.txt](https://pubfi.ai/llms.txt) | concise site index for LLM and crawler discovery |
| [llms-full.txt](https://pubfi.ai/llms-full.txt) | expanded Discovery export for answer-engine retrieval |
| [Discovery capability-card JSON](https://pubfi.ai/discovery/agent-capabilities.json) | machine-readable Discovery source capability-card catalog |
| [API Reference](https://api.pubfi.ai/reference) | interactive API reference |
| [OpenAPI](https://api.pubfi.ai/openapi.json) | API schema |
| [DeGov OpenAPI](https://pubfi.ai/openapi/degov-openapi.json) | provider gateway schema for DeGov route examples |
| [Subscan OpenAPI](https://pubfi.ai/openapi/subscan-openapi.json) | provider gateway schema for Subscan route examples |
| [MCP manifest](https://mcp.pubfi.ai/.well-known/mcp.json) | MCP discovery manifest |
| [MCP discovery pointer](https://pubfi.ai/.well-known/mcp.json) | product-site pointer to the hosted MCP endpoint |
| [MCP server card](https://pubfi.ai/.well-known/mcp/server-card.json) | metadata card for hosted MCP discovery |
| [Optional MCP registry auth proof](https://pubfi.ai/.well-known/mcp-registry-auth) | optional public proof route for MCP Registry ownership checks |

## Claim Boundary

Discovery inclusion does not mean gateway availability. A route plan does not authorize execution.
Local SEO/GEO evidence does not prove ranking, traffic, or AI citation success. PubFi keeps those
boundaries explicit so agents can choose routes safely.

## Coverage Map

| Area | Start here |
| --- | --- |
| Product positioning | [Project overview](/project-overview) |
| HTTP API details | [API reference](/reference/api-reference) |
| API key, account, and credits | [API key and runtime](/getting-started/api-key-runtime) |
| Agent/MCP interface | [MCP client setup](/getting-started/mcp-client) |
| Discovery and source selection | [Discovery](/concepts/discovery) |
| Provider readiness and certification | [Provider readiness](/concepts/provider-readiness) |
| Agent-readable surfaces | [Agent-readable surfaces](/agent-readable/surfaces) |
| Runtime endpoints | [Runtime endpoints](/reference/runtime-endpoints) |
| Public/security boundary | [Security and public data](/reference/security-and-public-data) |
