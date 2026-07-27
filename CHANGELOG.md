# Changelog

## Unreleased

- Replaced the placeholder MCP execution path with the current public Quantro health route.
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
- Synchronized the public MCP stdio bridge and smoke with the current Registry v2 five-tool
  contract, generation identity, endpoint policy, and exact response forwarding.
- Documented the separate API-key allocation, registered purchase and Credits, and accountless x402
  modes, including the current Staging Base Sepolia V2 challenge and exact-replay contract.
- Added semantic public-material gates for retired runtime routes, static provider schemas, the
  retired response envelope, old MCP input fields, and blanket no-x402 claims.
- Aligned the public MCP reference and runnable smoke with the current five-tool surface by removing
  the retired `pubfi.pricing.quote` tool.
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
