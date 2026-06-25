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
- Run `npm run check` and `npx --yes mint@latest validate` before opening or landing docs changes.
