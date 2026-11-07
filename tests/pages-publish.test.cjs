'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { config, publish } = require('../_dev/ci/publish-pages.cjs');
const env = { GITHUB_REPOSITORY: 'DoomsGarden/Hemicycle', GITHUB_SHA: 'a'.repeat(40),
  PAGES_ARTIFACT_ID: '123', GITHUB_TOKEN: 'github-secret', ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'oidc-secret',
  ACTIONS_ID_TOKEN_REQUEST_URL: 'https://oidc.example.test/token' };
function fixture(statusAt, advance = 15000) {
  let time = 0;
  const calls = [], logs = [], masks = [], output = [];
  const cfg = config(env);
  const io = { now: () => time, sleep: async ms => { time += Math.max(ms, advance); }, cancelled: () => false,
    log: value => logs.push(value), mask: value => masks.push(value), output: (...value) => output.push(value),
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      const value = url.includes('oidc.example') ? { value: 'jwt-secret' } :
        options.method === 'POST' && !url.endsWith('/cancel') ? { id: 'own-id', page_url: 'https://hemicycle.online/' } :
          url.endsWith('/cancel') ? {} : statusAt(time);
      if (value instanceof Error) throw value;
      return { ok: !value.http || value.http < 400, status: value.http || 200, json: async () => value };
    } };
  return { cfg, io, calls, logs, masks, output };
}
test('sync lasting 11 minutes succeeds without recreating or cancelling deployment', async () => {
  const f = fixture(time => ({ status: time < 660000 ? 'syncing_files' : 'succeed' }));
  assert.equal((await publish(f.cfg, f.io)).deploymentId, 'own-id');
  assert.equal(f.calls.filter(call => call.method === 'POST').length, 1);
  assert.deepEqual(f.output, [['page_url', 'https://hemicycle.online/']]);
  assert.deepEqual(f.masks, ['jwt-secret']);
  for (const secret of ['github-secret', 'oidc-secret', 'jwt-secret']) assert.ok(!f.logs.join('').includes(secret));
});
test('20-minute deadline cancels only own deployment and never creates another', async () => {
  const f = fixture(() => ({ status: 'syncing_files' }));
  await assert.rejects(publish(f.cfg, f.io), /20-minute/);
  assert.equal(f.calls.filter(call => call.url.endsWith('/cancel')).length, 1);
  assert.ok(f.calls.at(-1).url.endsWith('/own-id/cancel'));
  assert.equal(f.calls.filter(call => call.method === 'POST').length, 2);
});
test('terminal Pages failure is reported without retry or unnecessary cancellation', async () => {
  const f = fixture(() => ({ status: 'deployment_failed' }));
  await assert.rejects(publish(f.cfg, f.io), /deployment_failed/);
  assert.equal(f.calls.filter(call => call.method === 'POST').length, 1);
});
test('transient network and HTTP errors recover while polling the same deployment', async () => {
  const f = fixture(time => time === 0 ? new Error('network') : time === 15000 ? { http: 503 } : { status: 'succeed' });
  await publish(f.cfg, f.io);
  assert.equal(f.calls.filter(call => call.method === 'POST').length, 1);
});
test('persistent status errors fail boundedly and cancel own pending deployment', async () => {
  const f = fixture(() => ({ http: 503 }));
  await assert.rejects(publish(f.cfg, f.io), /HTTP 503/);
  assert.equal(f.calls.filter(call => call.url.endsWith('/cancel')).length, 1);
});
test('interruption after creation cancels own deployment', async () => {
  const f = fixture(() => ({ status: 'syncing_files' }));
  f.io.cancelled = () => f.calls.some(call => call.method === 'POST');
  await assert.rejects(publish(f.cfg, f.io), /interrupted/);
  assert.ok(f.calls.at(-1).url.endsWith('/own-id/cancel'));
});
test('ambiguous create response is not retried, to avoid duplicate deployments', async () => {
  const f = fixture(() => ({ status: 'succeed' }));
  const fetch = f.io.fetch;
  f.io.fetch = async (url, options) => {
    if (options.method === 'POST') { f.calls.push({ url, ...options }); throw new Error('ambiguous'); }
    return fetch(url, options);
  };
  await assert.rejects(publish(f.cfg, f.io), /network request/);
  assert.equal(f.calls.filter(call => call.method === 'POST').length, 1);
});
test('invalid configuration fails before API calls', () => {
  for (const change of [{ PAGES_ARTIFACT_ID: 'NaN' }, { GITHUB_SHA: 'main' }, { PAGES_TIMEOUT_MS: 'Infinity' },
    { PAGES_TIMEOUT_MS: '1200001' }, { GITHUB_TOKEN: '' }, { ACTIONS_ID_TOKEN_REQUEST_URL: 'http://example.test' }]) {
    assert.throws(() => config({ ...env, ...change }));
  }
});
test('workflow retains mobile assetlinks and wires artifact to bounded manual deployment', () => {
  const workflow = readFileSync('.github/workflows/pages.yml', 'utf8');
  assert.match(workflow, /include-hidden-files: true/);
  assert.match(workflow, /artifact_id: \$\{\{ steps.artifact.outputs.artifact_id \}\}/);
  assert.match(workflow, /PAGES_ARTIFACT_ID: \$\{\{ needs.build.outputs.artifact_id \}\}/);
  assert.match(workflow, /PAGES_TIMEOUT_MS: '1200000'/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.ok(!/^  push:/m.test(workflow));
  assert.ok(readFileSync('.well-known/assetlinks.json', 'utf8').includes('sha256_cert_fingerprints'));
});
