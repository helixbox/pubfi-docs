# Project Overview

## Short Description

PubFi is an agent-native crypto data layer. It helps software teams and AI agents find crypto data
sources, understand source fit, plan routes, inspect schemas, and use normalized PubFi capability
contracts instead of binding every workflow directly to a different upstream API.

## Product Layers

| Layer | Role |
| --- | --- |
| Discovery | public open index, source-selection surface, demand engine, and SEO/GEO context |
| Gateway | authenticated PubFi route execution for supported configured provider routes |
| Capability runtime | stable normalized agent-facing data contracts |
| MCP tools | generic route/capability tools for agent runtimes |
| Account and usage | API-key auth, scopes, credits, usage facts, and account state |

## Why Agents Need PubFi

Agent workflows often need crypto data without maintaining many upstream accounts, endpoint docs,
auth schemes, quotas, payment rules, and response formats. PubFi reduces that surface by exposing a
smaller agent-facing interface:

1. search capabilities and sources;
2. plan a route;
3. inspect schemas and pricing posture;
4. execute only supported callable routes through PubFi auth;
5. preserve provenance, freshness, warnings, and usage facts.

## Safe Claims

- PubFi has public Discovery pages and agent-readable exports for source selection and
  answer-engine retrieval.
- PubFi has generic agent tool contracts for search, planning, execution, explanation, schema
  readback, and pricing quote.
- PubFi has a normalized capability response envelope for early crypto data capabilities.
- PubFi keeps provider provenance, source freshness, readiness, and warnings explicit.
- Rust owns backend, account, gateway, capability, MCP, storage, and operations boundaries.

## Non-Claims

- Discovery inclusion is not gateway availability.
- A route plan is not execution authority by itself.
- Contract-ready capability examples are not proof of live upstream execution.
- SEO/GEO readbacks and local automation outputs are diagnostics, not ranking, traffic, or AI
  citation proof.
- PubFi does not publicly promise supplier procurement, wallet custody, live x402 payment
  execution, supplier settlement, or production model-ranked routing from this docs pack.

## Suggested Public README Blurb

```markdown
PubFi is building an agent-native crypto data layer. Discovery exposes a public source-selection
index for crypto data APIs, while PubFi gateway and capability contracts give agents a smaller,
auth-required surface for planning, explaining, and executing supported data routes. The project
keeps source provenance, freshness, readiness, and claim boundaries explicit so agents can decide
when a route is callable, requestable, contract-ready, or research-only.
```

