import assert from 'node:assert/strict';
import { appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export function validateSource(source: string) {
  assert.match(source, /^[0-9a-f]{40}$/u, 'a full source commit SHA is required');
  return source;
}
export function validateStagingRun(run: Record<string, unknown>, source: string, id: string) {
  validateSource(source);
  assert.match(id, /^[1-9][0-9]*$/u);
  assert.equal(String(run.id), id);
  assert.equal(run.head_sha, source);
  assert.equal(run.event, 'push');
  assert.equal(run.head_branch, 'main');
  assert.equal(run.path, '.github/workflows/deploy-stg.yml');
  assert.equal(run.status, 'completed');
  assert.equal(run.conclusion, 'success');
  assert.equal((run.repository as { full_name: string }).full_name, 'helixbox/pubfi-docs');
  assert.equal((run.head_repository as { full_name: string }).full_name, 'helixbox/pubfi-docs');
}
export function validateStagingAcceptance(jobs: Array<{ conclusion?: string; steps?: Array<{ name?: string; conclusion?: string }> }>) {
  const matches = jobs.filter(job => job.conclusion === 'success' &&
    job.steps?.some(step => step.name === 'Accept the public deployed revision' && step.conclusion === 'success'));
  assert.equal(matches.length, 1, 'one successful public revision acceptance is required');
}
export async function waitForPublicRevision(
  origin: string,
  expected: { source: string; run: string; target: string },
  fetchFn: typeof fetch = fetch,
  now: () => number = Date.now,
  wait: (milliseconds: number) => Promise<unknown> = delay,
) {
  const deadline = now() + 60_000;
  while (now() < deadline) {
    const response = await fetchFn(`${origin}/release.json?run=${expected.run}`, {
      redirect: 'error', cache: 'no-store',
      signal: AbortSignal.timeout(Math.max(1, Math.min(10_000, deadline - now()))),
    });
    assert.equal(response.status, 200);
    const actual = await response.json();
    if (actual.source === expected.source && actual.run === expected.run && actual.target === expected.target) return;
    if (now() < deadline) await wait(Math.min(2_000, deadline - now()));
  }
  throw new Error('The public docs revision did not converge within 60 seconds');
}

export async function main() {
  const command = process.argv[2];
  const source = validateSource(process.env.DOCS_SOURCE_SHA ?? '');
  const target = process.env.DOCS_TARGET;
  assert.ok(target === 'staging' || target === 'production');
  const origin = target === 'production' ? 'https://docs.pubfi.ai' : 'https://pubfi-docs-stg.vercel.app';
  if (command === 'authorize') {
    assert.equal(process.env.GITHUB_REF, 'refs/heads/main');
    assert.equal(process.env.GITHUB_REPOSITORY, 'helixbox/pubfi-docs');
    execFileSync('git', ['merge-base', '--is-ancestor', source, 'origin/main']);
    if (target === 'production') {
      assert.equal(process.env.GITHUB_EVENT_NAME, 'workflow_dispatch');
      const id = process.env.DOCS_STAGING_RUN_ID ?? '';
      assert.match(id, /^[1-9][0-9]*$/u);
      const run = JSON.parse(execFileSync('gh', ['api', `repos/helixbox/pubfi-docs/actions/runs/${id}`], { encoding: 'utf8' }));
      validateStagingRun(run, source, id);
      const result = JSON.parse(execFileSync('gh', ['api', `repos/helixbox/pubfi-docs/actions/runs/${id}/jobs?filter=latest&per_page=100`], { encoding: 'utf8' }));
      assert.ok(result.total_count <= 100, 'unexpected Staging job count');
      validateStagingAcceptance(result.jobs);
    } else {
      assert.equal(source, process.env.GITHUB_SHA);
    }
    const previous = await fetch(`${origin}/release.json`, {
      redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(15_000),
    });
    let prior = 'unrecorded (first deployment with revision tracking)';
    if (previous.status !== 404) {
      assert.equal(previous.status, 200, 'previous deployment readback failed');
      const revision = await previous.json();
      validateSource(revision.source);
      assert.match(String(revision.run), /^[1-9][0-9]*$/u);
      prior = `${revision.source} (https://github.com/helixbox/pubfi-docs/actions/runs/${revision.run})`;
    }
    appendFileSync(process.env.GITHUB_STEP_SUMMARY ?? '',
      `### Docs ${target}\n- Previous: ${prior}\n- Source: ${source}\n- Staging run: ${process.env.DOCS_STAGING_RUN_ID || 'current run'}\n`);
  } else if (command === 'stamp') {
    writeFileSync('dist/release.json', JSON.stringify({ source, run: process.env.GITHUB_RUN_ID, target }));
  } else if (command === 'accept') {
    await waitForPublicRevision(origin, { source, run: process.env.GITHUB_RUN_ID ?? '', target });
    const home = await fetch(origin, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
    assert.equal(home.status, 200);
    assert.match(home.headers.get('content-type') ?? '', /text\/html/u);
    appendFileSync(process.env.GITHUB_STEP_SUMMARY ?? '',
      `- Deployed: ${process.env.DOCS_DEPLOYMENT_LINKS || origin}\n- Exact public revision and home page: passed\n`);
  } else { throw new Error('expected authorize, stamp, or accept'); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
