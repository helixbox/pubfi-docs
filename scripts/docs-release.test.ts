import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSource, validateStagingRun } from './docs-release.ts';
const source = 'a'.repeat(40);
const run = { id: 12, head_sha: source, event: 'push', head_branch: 'main',
  path: '.github/workflows/deploy-stg.yml', status: 'completed', conclusion: 'success',
  repository: { full_name: 'helixbox/pubfi-docs' }, head_repository: { full_name: 'helixbox/pubfi-docs' } };
test('only exact successful same-repository Staging source permits promotion', () => {
  validateStagingRun(run, source, '12');
  for (const patch of [{ head_sha: 'b'.repeat(40) }, { event: 'pull_request' },
    { conclusion: 'failure' }, { path: '.github/workflows/deploy-prd.yml' },
    { head_repository: { full_name: 'other/repo' } }, { head_branch: 'topic' }, { id: 13 }]) {
    assert.throws(() => validateStagingRun({ ...run, ...patch }, source, '12'));
  }
  for (const ref of ['main', 'abc123', '-x', source + '\n']) assert.throws(() => validateSource(ref));
});

test('stamp records the selected commit, not the workflow helper commit', async () => {
  const { mkdtempSync, mkdirSync, readFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join, resolve } = await import('node:path');
  const { execFileSync } = await import('node:child_process');
  const scratch = mkdtempSync(join(tmpdir(), 'docs-release-stamp-'));
  try {
    mkdirSync(join(scratch, 'dist'));
    execFileSync(process.execPath, ['--experimental-strip-types', resolve('scripts/docs-release.ts'), 'stamp'], {
      cwd: scratch, env: { ...process.env, DOCS_SOURCE_SHA: source, DOCS_TARGET: 'production', GITHUB_SHA: 'b'.repeat(40), GITHUB_RUN_ID: '123' },
    });
    assert.deepEqual(JSON.parse(readFileSync(join(scratch, 'dist/release.json'), 'utf8')),
      { source, run: '123', target: 'production' });
  } finally { rmSync(scratch, { recursive: true, force: true }); }
});

test('both environments use the same deploy implementation and serialize by environment', async () => {
  const { readFileSync } = await import('node:fs');
  for (const file of ['deploy-stg.yml', 'deploy-prd.yml']) {
    assert.match(readFileSync(`.github/workflows/${file}`, 'utf8'), /uses: \.\/\.github\/workflows\/deploy-docs\.yml/u);
  }
  const workflow = readFileSync('.github/workflows/deploy-docs.yml', 'utf8');
  assert.match(workflow, /cancel-in-progress: false\n  queue: max/u);
  assert.ok(workflow.indexOf('scripts/docs-release.ts authorize') < workflow.indexOf('vercel_token:'));
  assert.match(workflow, /scripts\/docs-release.ts accept/u);
});
