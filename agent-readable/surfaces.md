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
| Operation-pricing inventory | Complete no-store producer projection for approved operations; it contains no selected price and is not execution authority. | `https://api.pubfi.ai/v1/operation-pricing-inventory` |
| Product status | Public component, Gateway, provider, and operation status presentation. Missing or stale evidence remains Unknown. | `https://pubfi.ai/status` |
| Status API | No-store public-safe PubFi and Gateway status schemas. It does not replace Registry route authority. | `https://api.pubfi.ai/v1/status` |
| API reference | Interactive HTTP reference. | `https://api.pubfi.ai/reference` |
| Runtime OpenAPI | Executable HTTP schema for current `ready` Registry operations and API routes. | `https://api.pubfi.ai/openapi.json` |
| API-host MCP manifest | MCP discovery for clients that start from the API domain. | `https://api.pubfi.ai/.well-known/mcp.json` |
| MCP ownership declaration | Public connector ownership metadata. | `https://api.pubfi.ai/.well-known/glama.json` |
| Hosted MCP manifest | Hosted MCP discovery and current Registry metadata. | `https://mcp.pubfi.ai/.well-known/mcp.json` |
| MCP OAuth protected resource | OAuth resource metadata for the authenticated MCP root. | `https://mcp.pubfi.ai/.well-known/oauth-protected-resource` |
| Accountless MCP x402 endpoint | Bearer-free MCP payment lane. | `https://mcp.pubfi.ai/x402` |
| MCP discovery pointer | Product-site pointer to hosted MCP discovery. | `https://pubfi.ai/.well-known/mcp.json` |
| MCP server card | Marketplace-oriented hosted MCP metadata. | `https://pubfi.ai/.well-known/mcp/server-card.json` |
| MCP registry auth proof | Optional domain-ownership proof. | `https://pubfi.ai/.well-known/mcp-registry-auth` |
| Staging guide | Safe login, key, HTTP, MCP, and Base Sepolia test workflow. | `https://docs.pubfi.ai/getting-started/staging` |
| Staging Registry catalog | Complete installed Staging catalog with each entry's readiness state. | `https://api-stg.pubfi.ai/v1/capabilities` |
| Staging operation-pricing inventory | Complete no-store Staging producer projection for approved operations. | `https://api-stg.pubfi.ai/v1/operation-pricing-inventory` |
| Staging API reference | Interactive Staging HTTP reference. | `https://api-stg.pubfi.ai/reference` |
| Staging Runtime OpenAPI | Executable Staging HTTP schema for current `ready` Registry operations and API routes. | `https://api-stg.pubfi.ai/openapi.json` |
| Staging hosted MCP manifest | Hosted Staging MCP discovery and current Registry metadata. | `https://mcp-stg.pubfi.ai/.well-known/mcp.json` |
| Staging accountless MCP x402 endpoint | Bearer-free Staging MCP payment lane. | `https://mcp-stg.pubfi.ai/x402` |
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
origin. Each runtime assigns API-key environment at creation and accepts only its matching keys;
clients cannot select the environment or request per-key scopes.

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
  payment balance. An agent can pay directly through the official MCP metadata flow on the
  explicit `/x402` endpoint.
- HTTP and MCP share one x402 `exact` payment, settlement, Signed Receipt, and replay path. The
  challenge contains the Signed Offer. Settled HTTP responses carry `PAYMENT-RESPONSE`; settled MCP
  results carry the decoded response and Signed Receipt at
  `result._meta["x402/payment-response"]`.
- A failed paid retry can return a fresh standard payment requirement. HTTP keeps the
  `PAYMENT-REQUIRED` header. MCP keeps the official fields in `structuredContent` and adds an
  `error` message. Validate every new term before signing again.
- A Signed Receipt is verifiable payment and execution evidence, not an account balance, Credits,
  top-up, or deposit record. Exact replay reuses the settlement and receipt without another charge.
- Quantro is the common accounting-fact authority. A request selects either the authenticated
  account and Credits lane or the x402 wallet-payment lane. It cannot debit both.

## Authority Order

Use the surfaces in this order for runtime work:

1. Use `/v1/capabilities` to inspect the complete installed Registry generation.
2. Match the selected method to schema v5 `operations[].billing`, then use Runtime OpenAPI to
   inspect schemas for current `ready` HTTP operations. A `quantro_priced` operation supplies its
   positive API-key `credit_cost` and independent x402 terms. Runtime OpenAPI repeats those terms
   in `x-pubfi-credit-cost`, `x-pubfi-price-policy-key`, `x-pubfi-price-version`, and
   `x-pubfi-x402`; it omits these four fields for non-priced operations. Exact `free_health` is
   public. An optional capability-level `free_rate_limit` and OpenAPI `x-pubfi-free-variant`
   advertise the same API-key-authenticated, zero-Credit `:free` variant.
   The current checked-in pricing target sets `credit_cost: 1` and x402
   `atomic_amount: "1000"` (0.001 USDC) for every priced Subscan and DeGov operation. Confirm the
   installed values in the selected environment before execution.
3. Use `/v1/operation-pricing-inventory` only to inspect the complete producer-authorized pricing
   projection. It contains no selected price, is not execution authority, and fails with `503`
   instead of returning a partial projection.
4. Use `/v1/status` and `/v1/status/gateway` for public-safe operational evidence. Treat
   `unknown` as missing, stale, or incoherent evidence, not health or route availability.
5. Use MCP `tools/list` for current MCP schemas. Use `pubfi.capabilities.list` and
   `pubfi.capabilities.get` for the current Registry generation and exact capability detail.
6. Use Discovery only for source-selection and public evidence context.
7. Use long-form docs for workflow, security, payment, and claim boundaries.

Do not execute a saved path from an older generation. Do not create a provider URL from a naming
convention.

## Execution Boundary

- HTTP gateway execution accepts only exact current `GET` or `POST` Registry operations.
- Every bounded provider HTTP `2xx`, `4xx`, or `5xx` response keeps its status and exact body.
  PubFi reduces a valid content type to its parameter-free media type and uses
  `application/octet-stream` when it is missing or malformed. These are provider responses, not
  PubFi error envelopes. Transport failure, redirects, oversized data, and unsupported final
  status classes remain gateway failures.
- API-key execution requires a key for the endpoint environment, active admission, and sufficient
  allocation. All keys use one fixed product-access model.
- An API-key client can call `GET /v1/auth/context` to get its stable execution `principal_id` and
  bound `billing_account_id`. The private, no-store response has a nullable `actor_subject_id` and
  creates no account or billing state.
- An advertised exact `GET` or `POST` can append `:free` to its final path segment. It keeps the API
  key, account identity, and exact operation input, uses the published limiter, and charges zero
  Credits. The checked-in Subscan policy shares its allowance across eligible default and bounded
  `{network}` routes for one billing account, including XCM, multi-chain, Pro, and `net_assets`
  operations. Policy presence does not prove route readiness; require the current catalog or
  OpenAPI advertisement before execution.
- An exact eligible HTTP operation or MCP `/x402` operation can use accountless x402 V2 instead of
  authenticated account execution.
- The authenticated MCP root accepts a PubFi API key or OAuth access token for
  `pubfi.route.execute`, including an advertised `:free` suffix. It rejects payment metadata and
  never falls back. The `/x402` endpoint rejects Bearer credentials and does not accept the
  suffix.
- A successful HTTP gateway response is the exact bounded provider body. API-key responses
  identify the Registry generation. MCP exposes valid JSON as a JSON value, valid `text/*` as a
  string, other bytes as base64 data, and an empty body as `null`. Settled x402 HTTP responses
  include `PAYMENT-RESPONSE`; settled MCP results include `x402/payment-response` metadata.
  Neither lane uses a PubFi success envelope.
- Registered purchase APIs require a human dashboard session. Their presence does not prove that a
  current offer exists.
- Purchase creation submits the current offer key, exact catalog release hash, amount, and exact
  accepted terms version and hash. The checked-in pricing target uses a $1/1,000-Credit base, but
  the current offer response remains availability authority.

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
