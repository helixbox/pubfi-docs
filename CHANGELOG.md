# Changelog

## Unreleased

- Changed the public docs route shape from `/docs/*` to root docs-domain routes such as
  `/getting-started/quickstart` and `/reference/api-reference`.
- Added explicit Vercel static SEO assets for `sitemap.xml`, `robots.txt`, and root-route canonical
  metadata.
- Added public-docs v0 structure with `docs.json`, docs navigation, quickstarts, concepts, use
  cases, references, FAQ, glossary, contribution notes, and public-safe examples.
- Added public developer and agent docs for Discovery, capability contracts, route planning,
  account/credit usage, provider readiness, MCP setup, runtime endpoints, public surfaces, and
  agent-readable assets.
- Added runnable public-safe examples for MCP, capability HTTP calls, and Subscan gateway
  inspection.
- Added security/public-data boundaries and asset placement rules for public-safe examples,
  screenshots, diagrams, and generated artifacts.
- Added future public repository issue and PR templates.
- Added a portable `npm run check` command for navigation, local links, text hygiene, secret
  patterns, unsafe SEO/GEO success phrases, internal strategy terms, and example syntax.
- Removed internal SEO/GEO operations from the public docs scope. Query strategy, content
  operations, readback methods, distribution planning, migration notes, coverage matrices, and
  private source maps stay in the private monorepo instead of the future public docs repo.
