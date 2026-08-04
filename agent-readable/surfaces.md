---
title: Agent-Readable Surfaces
description: Current public files and runtime schemas for PubFi agents and integration clients.
---

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
| MCP client guides | Client-specific hosted HTTP, stdio bridge, credential, verification, and compatibility guidance. | `https://docs.pubfi.ai/getting-started/mcp-clients` |
| Registry catalog | Complete installed Registry v2 catalog with each entry's readiness state. | `https://api.pubfi.ai/v1/capabilities` |
| API reference | Interactive HTTP reference. | `https://api.pubfi.ai/reference` |
| Runtime OpenAPI | Executable HTTP schema for current `ready` Registry operations and API routes. | `https://api.pubfi.ai/openapi.json` |
| API-host MCP manifest | MCP discovery for clients that start from the API domain. | `https://api.pubfi.ai/.well-known/mcp.json` |
| MCP ownership declaration | Public connector ownership metadata. | `https://api.pubfi.ai/.well-known/glama.json` |
| Hosted MCP manifest | Hosted MCP discovery and current Registry metadata. | `https://mcp.pubfi.ai/.well-known/mcp.json` |
| MCP discovery pointer | Product-site pointer to hosted MCP discovery. | `https://pubfi.ai/.well-known/mcp.json` |
| MCP server card | Marketplace-oriented hosted MCP metadata. | `https://pubfi.ai/.well-known/mcp/server-card.json` |
| MCP registry auth proof | Optional domain-ownership proof. | `https://pubfi.ai/.well-known/mcp-registry-auth` |
| Staging guide | Safe login, key, HTTP, MCP, and Base Sepolia test workflow. | `https://docs.pubfi.ai/getting-started/staging` |
| Staging Registry catalog | Complete installed Staging catalog with each entry's readiness state. | `https://api-stg.pubfi.ai/v1/capabilities` |
| Staging API reference | Interactive Staging HTTP reference. | `https://api-stg.pubfi.ai/reference` |
| Staging Runtime OpenAPI | Executable Staging HTTP schema for current `ready` Registry operations and API routes. | `https://api-stg.pubfi.ai/openapi.json` |
| Staging hosted MCP manifest | Hosted Staging MCP discovery and current Registry metadata. | `https://mcp-stg.pubfi.ai/.well-known/mcp.json` |
| Accountless x402 guide | HTTP and MCP x402 V2 challenge, signing, receipt, privacy, and replay rules. | `https://docs.pubfi.ai/getting-started/x402` |
| Staging x402 example | Pinned Base Sepolia HTTP and MCP clients with signed offer, signed receipt, and exact replay validation. | `https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/x402-base-sepolia` |
| Staging x402 acceptance | Source workflow for the 2026-07-27 Staging HTTP and MCP acceptance; repository access is required. | `https://github.com/helixbox/pubfi-mono/actions/runs/30258511212` |
| Production x402 example | Pinned Base mainnet HTTP and MCP clients with signed offer, signed receipt, and exact replay validation. | `https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/x402-base-mainnet` |
| Production x402 acceptance | Source workflow for the 2026-07-27 Production HTTP and MCP acceptance; repository access is required. | `https://github.com/helixbox/pubfi-mono/actions/runs/30259030111` |
| Payment mode guide | Boundary between API-key allowance, registered purchases, Credits, and x402. | `https://docs.pubfi.ai/concepts/payment-and-execution-modes` |
| Public docs repository | Public source and contribution history. | `https://github.com/helixbox/pubfi-docs` |
| Canonical docs site | Full long-form documentation. | `https://docs.pubfi.ai` |

## Staging Boundary

Use the Staging web, API, and MCP origins together. Do not send a Production key to a Staging
origin.

Staging accountless x402 permits Base Sepolia `eip155:84532`. This environment policy does not
prove that a specific route is available. Confirm that the exact route and method are `ready` in
the current Staging catalog. Then require a current unsigned `402` challenge before you sign a
payment authorization.

## x402 Interpretation Boundary

- Staging uses Base Sepolia `eip155:84532`. Production uses Base mainnet `eip155:8453` only for an
  exact enabled route. Use separate dedicated wallets and private keys.
- The historical Production health acceptance on 2026-07-27 used canonical Base USDC and 0.001
  USDC per request. The current catalog and live unsigned challenge remain the route and
  payment-term authorities.
- Accountless x402 creates no PubFi account, API key, invoice, or Credits. Wallet USDC is the
  payment balance. An agent can pay directly through the official MCP metadata flow.
- HTTP and MCP share one x402 `exact` payment, settlement, Signed Receipt, and replay path. The
  challenge contains the Signed Offer. Settled HTTP responses carry `PAYMENT-RESPONSE`; settled MCP
  results carry the decoded response and Signed Receipt at
  `result._meta["x402/payment-response"]`.
- A failed paid retry can return a fresh standard payment requirement. HTTP keeps the
  `PAYMENT-REQUIRED` header. MCP keeps the official fields in `structuredContent` and adds an
  `error` message. Validate every new term before signing again.
- A Signed Receipt is verifiable payment and execution evidence, not an account balance, Credits,
  top-up, or deposit record. Exact replay reuses the settlement and receipt without another charge.
- Quantro is the common accounting-fact authority. A request selects either the API-key and Credits
  lane or the x402 wallet-payment lane. It cannot debit both.

## Authority Order

Use the surfaces in this order for runtime work:

1. Use `/v1/capabilities` to inspect the complete installed Registry generation.
2. Use Runtime OpenAPI to inspect schemas for current `ready` HTTP operations.
3. Use MCP `tools/list` for current MCP schemas. Use `pubfi.capabilities.list` and
   `pubfi.capabilities.get` for the current Registry generation and exact capability detail.
4. Use Discovery only for source-selection and public evidence context.
5. Use long-form docs for workflow, security, payment, and claim boundaries.

Do not execute a saved path from an older generation. Do not create a provider URL from a naming
convention.

## Execution Boundary

- HTTP gateway execution accepts only exact current `GET` or `POST` Registry operations.
- API-key execution requires `invoke_provider`, active admission, and sufficient allocation.
- An exact eligible HTTP or MCP operation can use accountless x402 V2 instead of a PubFi API key.
- MCP `pubfi.route.execute` accepts API-key admission or the mutually exclusive official x402
  metadata flow.
- A successful HTTP gateway response is canonical provider JSON. API-key responses identify the
  Registry generation. Settled x402 HTTP responses include `PAYMENT-RESPONSE`; settled MCP results
  include `x402/payment-response` metadata. Neither lane uses a PubFi success envelope.
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

## Related References

- Use [Public Surfaces](/reference/public-surfaces) for the complete human-facing URL inventory.
- Use the [API Reference](/reference/api-reference) for HTTP schema authority.
- Use the [Agent Interface Reference](/reference/agent-interface) for hosted MCP tool contracts.
- Use [MCP Client Guides](/getting-started/mcp-clients) for client-specific configuration.
