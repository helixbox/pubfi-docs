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

## Agent-Readable Index Checklist

When a runtime contract or public page changes, check:

1. whether `agents.md`, `llms.txt`, or `llms-full.txt` needs the new public boundary;
2. whether `/v1/capabilities` and Runtime OpenAPI still describe the same installed generation;
3. whether the Agent interface guide matches MCP `tools/list` and tool input schemas;
4. whether HTTP gateway examples use exact current Registry paths and methods;
5. whether x402 docs still match the standard HTTP headers, MCP metadata, Signed Offers &
   Receipts fields, supported network, and lane separation;
6. whether account and purchase docs still match route roles and authorization boundaries;
7. whether README, docs navigation, and agent-readable indexes point to the canonical asset; and
8. whether every example avoids private data and unsupported availability claims.

## Required Checks

For manual local work, run from the repository root:

```sh
npm ci
npm run check
npx --yes mint@latest validate
```

When a change affects docs output, navigation, or generated static assets, also run the local Mint
export and the existing static assertions:

```sh
npx --yes mint@latest export --output export.zip
rm -rf dist
mkdir -p dist
unzip -q export.zip -d dist
npm run build:static-assets
test -f dist/sitemap.xml
test -f dist/robots.txt
grep -q "https://docs.pubfi.ai/reference/api-reference" dist/sitemap.xml
! grep -R "https://docs.pubfi.ai/src/_props" dist --include='*.html'
```

An unattended maintenance automation must run `npm ci` and `npm run check` in the bound docs
worktree, plus the local Mint validation and export checks when the changed surface requires
them. It must not depend on pull-request CI or preview deployment. Main-branch release workflows
remain the hosted deployment authority.

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
- Commit and push only the maintenance branch, then create or update one pull request. A local
  candidate or an open pull request is not a completed maintenance result.
- Re-read the exact pull-request head after every push with
  `gh pr view <url> --json headRefOid,baseRefOid,statusCheckRollup`. Discard any check result
  from an older head. Repository-owned pull-request CI and preview workflows are not acceptance
  requirements. If GitHub schedules an old or externally injected PR check, record its exact name,
  workflow owner, and status without adding it to this repository contract.
- If a local check fails, attempt one focused repair. If the repair still fails, or GitHub reports
  a concurrent update, leave the PR open with the exact evidence.
- Do not wait for human review when a mechanical, public-safe change has passed its local checks.
  Before merging, read the current remote-main OID and validated pull-request head OID. Merge
  through GitHub with an exact head match:

  ```sh
  gh pr merge <url> --merge --match-head-commit <validated-head-oid>
  ```

  Do not use an unbound merge or auto-merge.
- After merging, use `gh pr view <url> --json state,headRefOid,mergeCommit` and `git fetch origin
  main` to re-read the PR and remote `main`. Require `MERGED`, an observed merge commit, and
  `git merge-base --is-ancestor <merge-commit> origin/main` before reporting `completed` or
  `docs_current`.
