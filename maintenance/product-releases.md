# Product Docs Publication

This repository owns version-bound Docs publication. The configured AIP Task
owns Agent responsibilities, daily scheduling, source review and notification
policy. Change those arrangements in AIP.

The trusted caller requests `product-docs-release` through the repository
`POST /repos/{owner}/{repo}/dispatches` endpoint. Its `client_payload` contains:

| Field | Required value |
| --- | --- |
| tag | Stable product version, for example v1.2.3 |
| product_sha | Full accepted product commit SHA |
| product_evidence | Exact accepted product release or workflow URL |
| source_sha | Full compatible Docs main commit SHA |
| staging_run_id | Successful Staging push run for that Docs SHA |
| dry_run | false for publication; true for qualification only |

The caller must establish product acceptance and version compatibility before
requesting publication. Source code alone does not establish production
availability. This workflow verifies its local source ancestry, the exact
successful Staging push run and its public revision acceptance step. It does
not require a private product-source credential in CI.

`Publish product docs` creates or reuses an annotated Docs tag with the product
version and immutable product, Docs and Staging binding. A conflicting binding
fails. It calls the existing deployment implementation in the same workflow
because a tag created with `GITHUB_TOKEN` does not start another push workflow.
The public `release.json` records the binding and exact Docs source.

One native GitHub Actions queue serializes publications. A replay skips an
already-published binding. An older product event cannot replace a newer
publication. A failed deployment leaves the tag fixed; rerun its workflow.
The separate exact-source manual production workflow remains available for an
explicitly authorized correction or rollback. It requires its own successful
Staging run and does not move a version tag.

The manual publication entrypoint defaults to `dry_run=true`. Qualification
checks admission without creating a tag, deploying or notifying the Task.
Do not create test release tags.

## Result events

Configure `HAST_RELEASE_TASK_INVOKE_URL` and `HAST_RELEASE_TASK_API_KEY` as GitHub
Actions secrets. The URL uses `/api/public/v1/agent/tasks/{id}/invoke`; the key
is bound to that Task's coordinating Agent. The callback sends only the fixed
publication binding and published or failed status. Its stable request ID is
unchanged across delivery retries. A changed result has a different identity.
A successful callback acknowledges durable Task intake. The Task owns any
further interpretation or communication.

The main-push Staging workflow, exact-source production deployment and their
existing credentials remain the publication authority. Task intake is separate
from successful Docs deployment and public revision acceptance.
