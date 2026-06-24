# Architecture Map

## Product Boundary

PubFi Platform is a crypto-data-specific agent layer:

- catalog and source-selection evidence;
- route and capability contracts;
- account, credit, usage, and auth boundaries;
- gateway execution for configured providers;
- MCP and OpenAPI surfaces for agents;
- operational checks that fail closed instead of overstating readiness.

## Runtime Boundary

| Surface | Role |
| --- | --- |
| `pubfi.ai` | public web presentation, Discovery, docs entry, account/dashboard UI |
| `api.pubfi.ai` | Rust API backend for health, OpenAPI, capabilities, gateway, API keys, account, and usage routes |
| `mcp.pubfi.ai` | Rust Streamable HTTP MCP endpoint for generic PubFi route/capability tools |
| `pubfi.ai/.well-known/mcp.json` | public discovery pointer for the lane-specific MCP endpoint |

## Repository Layout

| Path | Public explanation |
| --- | --- |
| `apps/pubfi-api-server/` | Rust API and MCP backend entrypoint |
| `apps/pubfi-cli/` | local operator CLI for catalog, source freshness, demand, reporting, and credential workflows |
| `apps/web/` | Next.js public site, Discovery, dashboard presentation, LLM exports, and manifest routes |
| `apps/web/src/data/discovery-static/` | checked-in public-safe curated Discovery data |
| `packages/rust/account-service/` | API-key auth, scope checks, credits, usage facts, and account repository contracts |
| `packages/rust/capability-service/` | normalized capability catalog and execution pipeline |
| `packages/rust/gateway-service/` | provider route decisions, credential injection, request preparation, and normalization |
| `packages/rust/mcp-service/` | generic PubFi MCP JSON-RPC service |
| `packages/rust/storage/` | SQLx/Postgres storage implementation |
| `packages/rust/discovery-contracts/` | Discovery catalog and capability-routing models |
| `examples/agents/` | runnable agent examples |

## Implementation Defaults

- Rust owns backend, catalog, routing, account, gateway, capability, MCP, storage, and operations.
- Next.js owns public presentation, Discovery rendering, account/dashboard presentation, text
  exports, and static discovery manifests.
- Public Discovery and LLM routes use checked-in public-safe curated data.
- Provider credentials stay server-side and must not appear in public docs or examples.

