# Agent-Readable Surfaces

Use this page to understand the public files and endpoints that make PubFi readable by agents,
search systems, documentation tools, and integration clients.

## Public Asset Inventory

| Asset | Canonical purpose | Public URL |
| --- | --- | --- |
| `llms.txt` | concise public site and Discovery index | `https://pubfi.ai/llms.txt` |
| `llms-full.txt` | expanded answer-engine retrieval corpus | `https://pubfi.ai/llms-full.txt` |
| Agent interface guide | agent integration guidance | `https://docs.pubfi.ai/docs/reference/agent-interface` |
| API Reference | interactive HTTP reference | `https://api.pubfi.ai/reference` |
| OpenAPI | executable HTTP schema | `https://api.pubfi.ai/openapi.json` |
| MCP manifest | hosted MCP discovery | `https://mcp.pubfi.ai/.well-known/mcp.json` |
| Discovery pages | source-selection and provider context | `https://pubfi.ai/discovery` |
| public docs repository | source provenance and contribution corpus | future `pubfi-docs` repository |
| canonical docs site | full long-form docs | future `docs.pubfi.ai` site |

## How To Use Them

- Use `llms.txt` as the concise public site index.
- Use `llms-full.txt` for expanded Discovery context.
- Use the Agent interface guide for agent integration guidance.
- Use the API Reference for interactive HTTP route exploration.
- Use OpenAPI for executable HTTP route shapes, methods, auth headers, parameters, and response
  schemas.
- Use the MCP manifest for hosted MCP discovery.
- Use the public docs site for long-form explanations and examples.

## Public Boundary

These surfaces must not expose:

- production `seo_geo` rows;
- keyword-growth queues;
- issue-outbox drafts;
- raw answer-engine samples;
- account, billing, usage, or dashboard data;
- PubFi API keys or upstream provider keys;
- private procurement notes;
- internal automation prompts.

## Change Checklist

When a public docs page, Discovery page, or example changes, maintainers should check whether:

1. `llms.txt` needs a new concise link;
2. `llms-full.txt` needs expanded plain-text context;
3. the Agent interface guide needs a new agent-readable note;
4. API Reference, OpenAPI, or MCP links changed;
5. README and GitHub navigation should point to the new asset;
6. the page avoids implying ranking, traffic, AI citation, or runtime availability success.

## Reachability Checks

For public launch and maintenance, record only public-safe reachability status:

| Check | Safe status |
| --- | --- |
| `llms.txt` returns 200 | `llms_index_reachable` |
| `llms-full.txt` returns 200 | `llms_full_reachable` |
| API Reference returns 200 | `api_reference_reachable` |
| OpenAPI returns JSON | `openapi_reachable` |
| MCP manifest returns JSON | `mcp_manifest_reachable` |
| sitemap includes canonical docs page | `sitemap_member` |
| crawler fetched page | `crawler_fetch_observed` |

These labels are reachability evidence. They are not ranking, traffic, or citation proof.
