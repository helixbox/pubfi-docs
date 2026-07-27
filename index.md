---
title: PubFi Docs
description: Public documentation for PubFi's agent-native crypto data layer.
---

PubFi is building an agent-native crypto data layer. It helps software teams and AI agents discover
crypto data sources, plan exact Registry routes, inspect schemas, and use validated provider
responses without binding every workflow directly to a different upstream API.

## Start Here

1. Read the [Project Overview](/project-overview) to understand PubFi's product boundary.
2. Use the [Quickstart](/getting-started/quickstart) to choose an interface and execution lane.
3. Use the [Staging Guide](/getting-started/staging) before you test an integration.

## Choose Your Path

| Goal | Start | Continue |
| --- | --- | --- |
| Evaluate PubFi or compare data sources | [Source Evaluation](/use-cases/source-evaluation) | [Discovery](https://pubfi.ai/discovery) |
| Call a Registry route with an API key | [API Key And Runtime](/getting-started/api-key-runtime) | [Registry Gateway Examples](/reference/provider-gateway-examples) |
| Connect an agent or MCP client | [MCP Client Setup](/getting-started/mcp-client) | [Agent Interface Reference](/reference/agent-interface) |
| Test accountless x402 on Base Sepolia | [Staging Guide](/getting-started/staging#base-sepolia-test-boundary) | [Accountless x402](/getting-started/x402) |

Explore concrete journeys through [Crypto API Discovery](/use-cases/crypto-api-discovery), [Source
Evaluation](/use-cases/source-evaluation), [Provider Integration
Review](/use-cases/provider-integration-review), [Agent And Answer-Engine
Discovery](/use-cases/answer-engine-discovery), and [Agent Wallet
Balance](/use-cases/agent-wallet-balance).

## Contract Authority

Use current runtime surfaces instead of saved routes or inferred provider URLs:

| Contract | Purpose |
| --- | --- |
| [Registry catalog](https://api.pubfi.ai/v1/capabilities) | all installed operations and their current readiness |
| [Runtime OpenAPI](https://api.pubfi.ai/openapi.json) | executable HTTP schema for current `ready` operations |
| [MCP manifest](https://mcp.pubfi.ai/.well-known/mcp.json) | hosted MCP discovery and tool metadata |

Use [Public Surfaces](/reference/public-surfaces) for the complete human-facing URL inventory. Use
[Agent-Readable Surfaces](/agent-readable/surfaces) for machine-consumable indexes and authority
order.

## Core Boundary

Discovery inclusion does not mean gateway availability. A route plan does not authorize execution.
The installed Registry and request-time gates determine whether a route can run.

Staging permits Base Sepolia `eip155:84532` for eligible x402 tests. Production permits Base
mainnet `eip155:8453` only when x402 is enabled for the exact route. Environment policy does not
prove current route or offer availability.
