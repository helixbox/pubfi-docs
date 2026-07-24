---
title: Agent-Readable Surfaces
description: Current public files and runtime schemas for PubFi agents and integration clients.
---

# Agent-Readable Surfaces

Use these public files and endpoints to inspect PubFi Discovery context, Registry v2 routes,
Runtime OpenAPI, and MCP metadata.

## Public Asset Inventory

| Asset | Canonical purpose | Public URL |
| --- | --- | --- |
| `agents.md` | Public guide for Discovery, Registry, OpenAPI, MCP, and execution boundaries. | `https://pubfi.ai/agents.md` |
| `llms.txt` | Concise public site and Discovery index. | `https://pubfi.ai/llms.txt` |
| `llms-full.txt` | Expanded public retrieval corpus. | `https://pubfi.ai/llms-full.txt` |
| Discovery Markdown | Agent-readable Discovery directory. | `https://pubfi.ai/discovery.md` |
| Discovery capability-card JSON | Source-selection cards, schemas, provenance, and freshness metadata. | `https://pubfi.ai/discovery/agent-capabilities.json` |
| Sitemap | Public indexable route inventory. | `https://pubfi.ai/sitemap.xml` |
| Robots policy | Crawler policy for public and private route boundaries. | `https://pubfi.ai/robots.txt` |
| IndexNow verification key | Public ownership verification file. | `https://pubfi.ai/50e4aa84-257b-4ff4-a822-5da3d567384c.txt` |
| Agent interface guide | Current MCP tools, fields, auth, and execution boundary. | `https://docs.pubfi.ai/reference/agent-interface` |
| Registry catalog | Complete installed Registry v2 catalog with each entry's readiness state. | `https://api.pubfi.ai/v1/capabilities` |
| API reference | Interactive HTTP reference. | `https://api.pubfi.ai/reference` |
| Runtime OpenAPI | Executable HTTP schema for current `ready` Registry operations and API routes. | `https://api.pubfi.ai/openapi.json` |
| API-host MCP manifest | MCP discovery for clients that start from the API domain. | `https://api.pubfi.ai/.well-known/mcp.json` |
| MCP ownership declaration | Public connector ownership metadata. | `https://api.pubfi.ai/.well-known/glama.json` |
| Hosted MCP manifest | Hosted MCP discovery and current Registry metadata. | `https://mcp.pubfi.ai/.well-known/mcp.json` |
| MCP discovery pointer | Product-site pointer to hosted MCP discovery. | `https://pubfi.ai/.well-known/mcp.json` |
| MCP server card | Marketplace-oriented hosted MCP metadata. | `https://pubfi.ai/.well-known/mcp/server-card.json` |
| MCP registry auth proof | Optional domain-ownership proof. | `https://pubfi.ai/.well-known/mcp-registry-auth` |
| Accountless x402 guide | HTTP x402 V2 challenge, signing, privacy, and replay rules. | `https://docs.pubfi.ai/getting-started/x402` |
| Payment mode guide | Boundary between API-key allowance, registered purchases, Credits, and x402. | `https://docs.pubfi.ai/concepts/payment-and-execution-modes` |
| Public docs repository | Public source and contribution history. | `https://github.com/helixbox/pubfi-docs` |
| Canonical docs site | Full long-form documentation. | `https://docs.pubfi.ai` |

## Authority Order

Use the surfaces in this order for runtime work:

1. Use `/v1/capabilities` to inspect the complete installed Registry generation.
2. Use Runtime OpenAPI to inspect schemas for current `ready` HTTP operations.
3. Use MCP `tools/list` and `pubfi.schema.get` to inspect current MCP schemas and dynamic Registry
   routes.
4. Use Discovery only for source-selection and public evidence context.
5. Use long-form docs for workflow, security, payment, and claim boundaries.

Do not execute a saved path from an older generation. Do not create a provider URL from a naming
convention.

## Execution Boundary

- HTTP gateway execution accepts only exact current `GET` or `POST` Registry operations.
- API-key execution requires `invoke_provider`, active admission, and sufficient allocation.
- An exact eligible HTTP operation can use accountless x402 V2 instead of a PubFi API key.
- MCP `tools/call` always requires a PubFi API key and does not support x402.
- A successful HTTP gateway response is canonical provider JSON. API-key responses identify the
  Registry generation. Settled x402 responses include `PAYMENT-RESPONSE`. Neither lane uses a
  PubFi success envelope.
- Registered purchase APIs require a human dashboard session. Their presence does not prove that a
  current offer exists.

## Public Boundary

These surfaces must not expose:

- PubFi API keys or provider credentials;
- `PAYMENT-SIGNATURE`, decoded signed payment payloads, or `PAYMENT-RESPONSE`;
- wallet secrets or unredacted payment identities;
- account, purchase, checkout, usage, allocation, billing, or dashboard data;
- private procurement or operator notes;
- production database rows;
- internal automation prompts; or
- unsupported ranking, traffic, payment, uptime, or citation claims.

## Change Checklist

When a runtime contract or public page changes, maintainers should check:

1. whether `agents.md`, `llms.txt`, or `llms-full.txt` needs the new public boundary;
2. whether `/v1/capabilities` and Runtime OpenAPI still describe the same installed generation;
3. whether the Agent interface guide matches MCP `tools/list` and tool input schemas;
4. whether HTTP gateway examples use exact current Registry paths and methods;
5. whether x402 docs still match the standard headers, supported network, and lane separation;
6. whether account and purchase docs still match route roles and scopes;
7. whether README, docs navigation, and agent-readable indexes point to the canonical asset; and
8. whether every example avoids private data and unsupported availability claims.

## Reachability Evidence

Record only narrow public-safe observations:

| Observation | Safe status label |
| --- | --- |
| `llms.txt` returns `200` | `llms_index_reachable` |
| `llms-full.txt` returns `200` | `llms_full_reachable` |
| Registry catalog returns the expected schema | `registry_catalog_reachable` |
| Runtime OpenAPI returns JSON with Registry metadata | `runtime_openapi_reachable` |
| API reference returns `200` | `api_reference_reachable` |
| Hosted MCP manifest returns JSON | `mcp_manifest_reachable` |
| `tools/list` returns current tool and route metadata | `mcp_tools_list_observed` |
| An exact eligible unsigned request returns a valid challenge | `x402_challenge_observed` |
| Sitemap contains a canonical public page | `sitemap_member` |

These observations do not prove provider success, purchase-offer availability, payment settlement,
uptime, ranking, traffic, or citations.
