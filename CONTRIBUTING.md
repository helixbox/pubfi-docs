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
- supplier procurement, payment execution, wallet custody, or private commercial details.

## Editing Rules

- Prefer short pages with one clear purpose.
- Keep canonical product and runtime links stable.
- Do not duplicate full pages across `pubfi.ai` product surfaces and the canonical docs site. Legacy
  `pubfi.ai/docs/...` paths should stay redirect-only unless the canonical URL decision changes.
- Use examples that can run without upstream provider secrets in the prompt or repository.
- Keep generated schemas linked from canonical runtime URLs unless a copied snapshot is explicitly
  versioned.

## Pre-PR Checks

Run:

```sh
find docs -name '*.md' -print
```

If this material is still staged inside `pubfi-mono`, also run from the repository root:

```sh
decodex docs check
git diff --check
```
