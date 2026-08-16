---
title: Project Overview
description: Understand PubFi's product layers, agent value, supported claims, and explicit non-claims.
---

## Short Description

PubFi is an agent-native crypto data layer. It helps software teams and AI agents find crypto data
sources, understand source fit, plan exact Registry routes, inspect schemas, and use validated
provider responses instead of binding every workflow directly to a different upstream API.

## Product Layers

| Layer | Role |
| --- | --- |
| Discovery | public open index, source-selection surface, demand engine, and agent-readable retrieval context |
| Gateway Registry v2 | signed, generation-bound catalog and exact route execution for currently ready operations |
| MCP tools | generic route/capability tools for agent runtimes |
| Account and usage | billing-account membership, API-key auth, admission, raw-unit usage facts, registered purchases, and authoritative billing reads |
| Accountless x402 | route-specific pay-per-response execution without a PubFi account, API key, or Credits |

## Why Agents Need PubFi

Agent workflows often need crypto data without maintaining many upstream accounts, endpoint docs,
auth schemes, quotas, payment rules, and response formats. PubFi reduces that surface by exposing a
smaller agent-facing interface:

1. search capabilities and sources;
2. inspect the active Registry generation and ready route matchers;
3. plan an exact path and method;
4. execute only a supported current route through API-key or MCP OAuth account admission, or an
   eligible x402 challenge;
5. preserve provider provenance, Registry identity, and request identity.

Use the [Staging guide](/getting-started/staging) to keep test endpoints and credentials separate
from Production.

## Safe Claims

- PubFi has public Discovery pages and agent-readable exports for source selection and
  answer-engine retrieval.
- PubFi has generic agent tool contracts for search, planning, execution, explanation, and schema
  readback.
- PubFi publishes a signed Registry v2 catalog and dynamically generated runtime OpenAPI for
  currently ready routes.
- PubFi keeps provider identity, exact matchers, Registry generation, readiness, and request
  identity explicit.
- PubFi enforces environment-matched x402 networks. Staging permits Base Sepolia `eip155:84532`.
  Production permits Base mainnet `eip155:8453` only when x402 is enabled for the exact route.
- Rust owns backend, account, gateway, capability, MCP, storage, and operations boundaries.

## Non-Claims

- Discovery inclusion is not gateway availability.
- A route plan is not execution authority by itself.
- Contract-ready capability examples are not proof of live upstream execution.
- SEO/GEO readbacks and local automation outputs are diagnostics, not ranking, traffic, or AI
  citation proof.
- PubFi does not promise supplier procurement, supplier payment, wallet custody, or production
  model-ranked routing.
- PubFi does not promise that every route is x402-eligible.
- An environment policy does not prove that a specific x402 route or offer is currently available.

## Choose A Next Step

- Evaluate source fit with [Crypto API Discovery](/use-cases/crypto-api-discovery) and [Source
  Evaluation](/use-cases/source-evaluation).
- Choose an integration lane in the [Quickstart](/getting-started/quickstart).
- Test HTTP, MCP, or accountless x402 in the [Staging Guide](/getting-started/staging).
