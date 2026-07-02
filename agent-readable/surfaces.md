# Agent-Readable Surfaces

Use this page to understand the public files and endpoints that make PubFi readable by agents,
search systems, documentation tools, and integration clients.

## Public Asset Inventory

| Asset | Canonical purpose | Public URL |
| --- | --- | --- |
| `agents.md` | agent-readable public guide for Discovery, OpenAPI, capabilities, and gateway examples | `https://pubfi.ai/agents.md` |
| `llms.txt` | concise public site and Discovery index | `https://pubfi.ai/llms.txt` |
| `llms-full.txt` | expanded answer-engine retrieval corpus | `https://pubfi.ai/llms-full.txt` |
| Discovery directory Markdown | agent-readable Markdown mirror for the Discovery directory | `https://pubfi.ai/discovery.md` |
| Discovery capability-card JSON | Discovery source capability cards, schemas, provenance, and freshness metadata | `https://pubfi.ai/discovery/agent-capabilities.json` |
| Sitemap | public route inventory for indexable product and Discovery pages | `https://pubfi.ai/sitemap.xml` |
| Robots policy | crawler policy for public, dashboard, API, and AI-search crawler boundaries | `https://pubfi.ai/robots.txt` |
| Agent interface guide | agent integration guidance | `https://docs.pubfi.ai/reference/agent-interface` |
| API Reference | interactive HTTP reference | `https://api.pubfi.ai/reference` |
| OpenAPI | executable HTTP schema | `https://api.pubfi.ai/openapi.json` |
| DeGov OpenAPI | executable provider gateway schema | `https://pubfi.ai/openapi/degov-openapi.json` |
| Subscan OpenAPI | executable provider gateway schema | `https://pubfi.ai/openapi/subscan-openapi.json` |
| MCP manifest | hosted MCP discovery | `https://mcp.pubfi.ai/.well-known/mcp.json` |
| MCP discovery pointer | product-site pointer to hosted MCP discovery | `https://pubfi.ai/.well-known/mcp.json` |
| MCP server card | marketplace-oriented metadata for the hosted MCP endpoint | `https://pubfi.ai/.well-known/mcp/server-card.json` |
| MCP registry auth proof | optional public domain-auth proof route for MCP Registry ownership checks | `https://pubfi.ai/.well-known/mcp-registry-auth` |
| Discovery pages | source-selection and provider context | `https://pubfi.ai/discovery` |
| public docs repository | source provenance and contribution corpus | `https://github.com/helixbox/pubfi-docs` |
| canonical docs site | full long-form docs | `https://docs.pubfi.ai` |

## How To Use Them

- Use `agents.md` as the public machine-readable guide for Discovery, OpenAPI, capability, and
  gateway boundaries.
- Use `llms.txt` as the concise public site index.
- Use `llms-full.txt` for expanded Discovery context.
- Use the Discovery directory Markdown mirror for agent-readable source-selection context.
- Use Discovery capability-card JSON for source-selection capability cards, schemas, provenance, and
  freshness metadata. Use the Runtime OpenAPI for executable `/v1/capabilities` route shapes.
- Use the Agent interface guide for agent integration guidance.
- Use the API Reference for interactive HTTP route exploration.
- Use OpenAPI for executable HTTP route shapes, methods, parameters, and response schemas. Use the
  Auth Boundary notes in these docs for account and key requirements until the public OpenAPI source
  publishes security metadata.
- Use the MCP manifest, product-site discovery pointer, or MCP server card for hosted MCP
  discovery metadata.
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
4. API Reference, OpenAPI, provider OpenAPI, `agents.md`, or MCP links changed;
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
