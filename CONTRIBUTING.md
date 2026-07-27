# Contributing

This public repository contains PubFi docs and examples maintained alongside `pubfi-mono`.
Contributions should follow a docs-as-code workflow.

## Contribution Scope

Good contributions:

- clarify public docs;
- add public-safe examples;
- fix broken links;
- improve explanations of capability contracts, route planning, MCP setup, or Discovery pages;
- add diagrams or glossary entries that do not expose private data.

Out of scope:

- credentials, API keys, account ids, wallet secrets, billing data, or private customer data;
- production `seo_geo` rows or raw readbacks;
- unreviewed SEO ranking, traffic, or AI citation claims;
- supplier procurement, supplier payment, wallet custody, or private commercial details;
- wallet private keys, x402 payment signatures, payment-response values, or internal settlement
  records.

## Editing Rules

- Prefer short pages with one clear purpose.
- Keep canonical product and runtime links stable.
- Do not duplicate full pages across `pubfi.ai` product surfaces and the canonical docs site. Legacy
  `pubfi.ai/docs/...` paths should stay redirect-only unless the canonical URL decision changes.
- Use examples that can run without upstream provider secrets in the prompt or repository.
- Public x402 documentation can describe standard headers, public network and asset identifiers,
  challenge validation, and exact replay. It must not contain wallet keys, signed authorizations,
  receipt values, internal Quantro routes, or live commercial details.
- Keep generated schemas linked from canonical runtime URLs unless a copied snapshot is explicitly
  versioned.

## Pre-PR Checks

Run:

```sh
find . -path './.git' -prune -o -path './.worktrees' -prune -o -path './node_modules' -prune -o -name '*.md' -print | sort
```

Before opening a PR, also run from the repository root:

```sh
npm run check
npx --yes mint@latest validate
```

These commands apply to manual local contributions. Unattended automation runs `npm ci` and
`npm run check` locally, then requires the GitHub `Docs` workflow to pass Mint validation and
export before it lands a change. It must not download an `@latest` package locally.
