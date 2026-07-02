# Public Docs Maintenance Guide

This guide is the public-safe operating contract for maintaining PubFi Docs. It is intended for
human maintainers and automated coding agents.

## Goal

Keep `docs.pubfi.ai`, GitHub-indexed docs, examples, agent-readable files, and public API links
accurate without exposing private implementation data or turning internal search strategy into
public content.

## Authority Order

Use the first available source in this order:

1. Checked-in files in this repository.
2. Public runtime surfaces: `https://api.pubfi.ai/reference`, `https://api.pubfi.ai/openapi.json`,
   and `https://mcp.pubfi.ai/.well-known/mcp.json`.
3. Public product surfaces: `https://pubfi.ai`, `https://pubfi.ai/discovery`, `llms.txt`, and
   `llms-full.txt`.
4. Public-safe implementation context from the private mono repo when available to the maintainer.

Do not use private database rows, raw readbacks, account records, billing records, wallet data,
provider credentials, or internal planning artifacts as public documentation sources.

## Allowed Automatic Changes

Automated docs maintenance may change:

- broken or stale links, redirects, canonical links, sitemap references, and Mintlify navigation;
- `llms.txt`, `llms-full.txt`, and agent-readable public surface inventories;
- API reference, OpenAPI, MCP endpoint, provider gateway, and route-shape documentation when the
  change is sourced from public runtime surfaces or checked-in public-safe files;
- examples that use placeholders, local environment variables, or public endpoints without secrets;
- wording that removes unsupported claims, duplicate pages, or ambiguous public positioning;
- README, contributing notes, and maintenance guidance when they clarify public-safe workflows.

## Forbidden Content

Do not publish:

- credentials, API keys, secret names with values, account ids, billing data, usage rows, wallet
  secrets, raw customer responses, or production readbacks;
- provider credential seeding operations, private upstream tokens, or private account setup steps;
- internal SEO/GEO query strategy, Query Graph operations, content operations, private source maps,
  answer-engine readback workflows, or measurement strategy;
- ranking, traffic, answer-engine citation, demand-growth, or conversion claims without a current
  public-safe evidence source that supports the exact claim;
- broad product-positioning rewrites that are not deterministic corrections from public authority.

## Change Workflow

1. Classify the change as link repair, navigation repair, reference sync, example sync, wording
   cleanup, or new public-safe material.
2. Search before editing so duplicate pages or examples are not created.
3. Prefer small, focused diffs. Avoid mixing docs maintenance with product strategy changes.
4. Keep examples runnable with placeholders and environment variables. Never commit real keys or
   real account payloads.
5. Update related agent-readable surfaces when reference pages, MCP behavior, or public route
   shapes change.
6. Leave ambiguous product claims as `needs_evidence` in the automation run artifact instead of
   landing speculative wording.

## Required Checks

Run from the repository root:

```sh
npm run check
npx --yes mint@latest validate
```

For changes that also depend on `pubfi-mono` public web surfaces, run the mono smoke checks from the
mono repo:

```sh
npm run smoke:llms --workspace apps/web
npm run smoke:discovery-routes --workspace apps/web
```

When docs changes touch MCP discovery, server-card metadata, registry proof routes, or hosted MCP
endpoint behavior, also run:

```sh
npm run smoke:mcp-e2e --workspace apps/web
```

## PR And Landing Rules

- Use one focused branch per maintenance pass.
- Include the source of truth for claim or route changes in the PR body.
- Wait for local checks and remote checks before landing.
- Do not wait for human review when an automation change is mechanical, public-safe, and all checks
  pass.
- If checks fail, attempt one focused repair. If they still fail, leave the PR open with evidence
  instead of landing.
