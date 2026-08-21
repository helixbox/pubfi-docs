# AGENTS

## Public Docs Maintenance

- Read `maintenance/public-docs-maintenance.md` before changing docs, examples, agent-readable
  assets, `docs.json`, `llms.txt`, or `llms-full.txt`.
- Keep durable content in English and public-safe.
- Prefer checked-in public docs, public runtime schemas, public API reference URLs, and public MCP
  metadata over memory or inferred product behavior.
- Do not publish credentials, account data, billing data, usage rows, production readbacks, private
  customer data, internal SEO/GEO strategy, or unsupported ranking, traffic, or answer-engine
  citation claims.
- For manual local work, run `npm ci`, `npm run check`, and `npx --yes mint@latest validate` before
  opening or landing docs changes. When docs output, navigation, or generated assets change, also
  run `npx --yes mint@latest export --output export.zip` and the existing static assertions.
- Repository-owned pull-request CI and preview workflows are intentionally absent. Main-branch
  release and deployment workflows are the hosted automation authority; do not wait for a
  repository-owned PR Docs/check or preview status.
- An unattended maintenance automation must run `npm ci` and `npm run check`, plus local Mint
  validation and export when the changed surface requires them. It must not depend on a
  pull-request CI or preview workflow. Main-branch release workflows remain separate and
  unchanged.
