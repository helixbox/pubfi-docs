import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRequest, binding, validateTag, validateStage, alreadyPublished, repository } from './product-release.ts';
const request = { tag: 'v1.2.3', product_sha: 'a'.repeat(40), source_sha: 'b'.repeat(40),
  product_evidence: 'https://github.com/helixbox/pubfi-mono/actions/runs/12', staging_run_id: '34', dry_run: true };
const run = { id: 34, head_sha: request.source_sha, head_branch: 'main', event: 'push',
  path: '.github/workflows/deploy-stg.yml', status: 'completed', conclusion: 'success',
  repository: { full_name: repository }, head_repository: { full_name: repository } };
const jobs = [{ conclusion: 'success', steps: [{ name: 'Accept the public deployed revision', conclusion: 'success' }] }];
test('production requires a stable version and fixed source identities', () => {
  validateRequest(request);
  for (const patch of [{ tag: 'v1.2.3-rc.1' }, { source_sha: 'main' }, { product_sha: 'latest' },
    { product_evidence: 'https://github.com/other/repo/actions/runs/12' }, { dry_run: 'false' }, { staging_run_id: '0' }]) {
    assert.throws(() => validateRequest({ ...request, ...patch }));
  }
});
test('only the exact accepted main push qualifies', () => {
  validateStage(run, jobs, request);
  for (const patch of [{ head_sha: 'c'.repeat(40) }, { event: 'workflow_dispatch' }, { conclusion: 'failure' },
    { head_repository: { full_name: 'other/repo' } }, { path: '.github/workflows/deploy-prd.yml' }]) {
    assert.throws(() => validateStage({ ...run, ...patch }, jobs, request));
  }
  assert.throws(() => validateStage(run, [], request));
});
test('a retry reuses the immutable tag and refuses a changed binding', () => {
  const tag = { object: { type: 'commit', sha: request.source_sha }, message: JSON.stringify(binding(request)) };
  validateTag(tag, request);
  assert.throws(() => validateTag(tag, { ...request, source_sha: 'c'.repeat(40) }));
  assert.throws(() => validateTag(tag, { ...request, product_sha: 'c'.repeat(40) }));
});
test('an accepted publication is idempotent and old events cannot roll it back', () => {
  const current = { source: request.source_sha, product_release: binding(request) };
  assert.equal(alreadyPublished(current, request), true);
  assert.equal(alreadyPublished(current, { ...request, tag: 'v1.2.4' }), false);
  assert.throws(() => alreadyPublished(current, { ...request, tag: 'v1.2.2' }));
  assert.throws(() => alreadyPublished(current, { ...request, source_sha: 'c'.repeat(40) }));
});
