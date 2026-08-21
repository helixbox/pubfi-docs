# Changelog

## Unreleased

- Documented endpoint-specific MCP `tools/list` security, output, annotation, and OAuth-linking
  metadata for the authenticated and accountless x402 endpoints.
- Documented the Status `operation_pricing_status` field and the separation between pricing
  availability and independent provider or PubFi proxy evidence.
- Documented API-key auth-context self-inspection and the returned execution-principal and
  billing-account binding.
- Added the public PubFi status page and API families, including fail-closed `unknown` semantics,
  and documented the focused authenticated Credit-balance and free-quota reads.
- Documented the MCP bearer contract: the authenticated root accepts PubFi API keys or OAuth
  access tokens, while accountless payment uses the separate Bearer-free `/x402` endpoint. Updated
  the public x402 MCP examples to connect to that endpoint.
- Reclassified the pinned Production x402 example as historical acceptance evidence and documented
  the fresh standard challenge returned after a rejected paid retry over HTTP or MCP.
- Added source-backed PubFi MCP setup, credential handling, verification prompts, troubleshooting,
  and explicit compatibility boundaries for major desktop, IDE, CLI, local-model, and hosted web
  agent clients.
- Replaced the retired five-tool MCP documentation and smoke contract with the current public
  `pubfi.capabilities.list`, `pubfi.capabilities.get`, and `pubfi.route.execute` surface.
- Aligned the x402 guides, examples, FAQ, and agent-readable indexes on environment-isolated
  wallets, direct MCP payment, single-lane accounting, receipt meaning, no-charge exact replay, and
  the Staging and Production acceptance results.
- Added signed-offer and signed-receipt verification to the Staging HTTP x402 example.
- Made both runnable signed-artifact verifiers authenticate JWS payload bytes before parsing them
  and reject noncanonical payload JSON.
- Replaced the placeholder MCP execution path with the current public Quantro health route.
- Added pinned Production Base mainnet HTTP and MCP x402 examples. They validate the exact route,
  canonical USDC asset, 0.001 USDC amount, payee, signed offer, signed receipt, and exact replay.
- Published the successful Production HTTP and MCP Base transaction evidence without exposing
  buyer keys or full payment payloads.
- Reorganized the docs into task-oriented Start Here, Integrate, Concepts, Use Cases, Reference,
  and Resources paths; removed duplicate rendered H1 headings; and added explicit reader
  transitions between evaluation, API-key, MCP, and x402 workflows.
- Added a Staging guide for the separate web, API, and MCP roots, email OTP and API-key setup,
  catalog and OpenAPI inspection, authenticated HTTP and MCP smoke tests, Base Sepolia x402 test
  boundaries, troubleshooting, and Production transition.
- Added the PubFi product favicon to the docs configuration and documented its source snapshot.
- Added pinned, bounded public HTTP and MCP x402 paid examples with signed offer, signed receipt,
  and exact replay verification.
- Added accountless x402 to MCP `pubfi.route.execute` with the official payment metadata flow,
  shared HTTP/MCP execution authority, and Ed25519 `did:web` Signed Offers & Receipts guidance.
- Replaced the retired fixed-capability and static provider examples with the signed Registry v2
  catalog, dynamic Runtime OpenAPI, and exact path-and-method execution contract.
- Synchronized the public MCP stdio bridge and smoke with the current Registry v2 three-tool
  contract, generation identity, endpoint policy, and exact response forwarding.
- Documented the separate API-key allocation, registered purchase and Credits, and accountless x402
  modes, including the current Staging Base Sepolia V2 challenge and exact-replay contract.
- Added semantic public-material gates for retired runtime routes, static provider schemas, the
  retired response envelope, old MCP input fields, and blanket no-x402 claims.
- Aligned the public MCP reference and runnable smoke with the current fixed-tool surface by
  removing the retired `pubfi.pricing.quote` tool.
- Replaced stale non-crypto generic gateway readiness claims with the crypto/Web3/on-chain scope and
  current public catalog authority.
- Updated account docs and runtime endpoint inventory to the billing-account-scoped admission,
  raw-unit usage, authoritative billing-read, and API-key contracts published by the current
  runtime.
- Changed the public docs route shape from `/docs/*` to root docs-domain routes such as
  `/getting-started/quickstart` and `/reference/api-reference`.
- Added explicit Vercel static SEO assets for `sitemap.xml`, `robots.txt`, and root-route canonical
  metadata.
- Added public-docs v0 structure with `docs.json`, docs navigation, quickstarts, concepts, use
  cases, references, FAQ, glossary, contribution notes, and public-safe examples.
- Added public developer and agent docs for Discovery, capability contracts, route planning,
  account/credit usage, provider readiness, MCP setup, runtime endpoints, public surfaces, and
  agent-readable assets.
- Added runnable public-safe examples for MCP, Registry catalog inspection, and x402 challenge
  inspection.
- Added security/public-data boundaries and asset placement rules for public-safe examples,
  screenshots, diagrams, and generated artifacts.
- Added future public repository issue and PR templates.
- Added a portable `npm run check` command for navigation, local links, text hygiene, secret
  patterns, unsafe SEO/GEO success phrases, internal strategy terms, and example syntax.
- Removed internal SEO/GEO operations from the public docs scope. Query strategy, content
  operations, readback methods, distribution planning, migration notes, coverage matrices, and
  private source maps stay in the private monorepo instead of the future public docs repo.
