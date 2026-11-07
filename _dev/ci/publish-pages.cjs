'use strict';

// Uses the same Pages REST + OIDC protocol as actions/deploy-pages@v5.0.1.
// That action clamps its timeout to 600000ms, then cancels syncing_files.
// Allow this site's larger asset set 20 minutes, within the 25-minute job.
const { appendFileSync } = require('node:fs');
const { setTimeout: delay } = require('node:timers/promises');

function config(env) {
  const repo = env.GITHUB_REPOSITORY || '';
  const sha = env.GITHUB_SHA || '';
  const artifact = env.PAGES_ARTIFACT_ID || '';
  const timeout = Number(env.PAGES_TIMEOUT_MS || 1200000);
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !/^[a-f\d]{40}$/i.test(sha) ||
      !/^\d+$/.test(artifact) || !Number.isSafeInteger(Number(artifact)) || Number(artifact) < 1 ||
      !Number.isFinite(timeout) || timeout < 60000 || timeout > 1200000 ||
      !env.GITHUB_TOKEN || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || !env.ACTIONS_ID_TOKEN_REQUEST_URL) {
    throw new Error('Missing or invalid Pages deployment configuration');
  }
  const oidcUrl = new URL(env.ACTIONS_ID_TOKEN_REQUEST_URL);
  if (oidcUrl.protocol !== 'https:') throw new Error('OIDC requires HTTPS');
  return { repo, sha, artifact: Number(artifact), timeout, token: env.GITHUB_TOKEN,
    oidcUrl: oidcUrl.href, oidcToken: env.ACTIONS_ID_TOKEN_REQUEST_TOKEN };
}

async function publish(cfg, io) {
  const base = `https://api.github.com/repos/${cfg.repo}/pages/deployments`;
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${cfg.token}`,
    'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' };
  const started = io.now();
  let deploymentId;
  let terminal = false;
  const deadline = started + cfg.timeout;
  async function request(url, options) {
    try { return await io.fetch(url, { ...options, signal: AbortSignal.timeout(30000) }); }
    catch { throw new Error('Pages network request failed'); }
  }
  async function json(response) {
    try { return await response.json(); }
    catch { throw new Error('Invalid JSON from deployment service'); }
  }
  try {
    const oidcResponse = await request(cfg.oidcUrl, { headers: { Authorization: `Bearer ${cfg.oidcToken}` } });
    if (!oidcResponse.ok) throw new Error(`OIDC request failed (HTTP ${oidcResponse.status})`);
    const jwt = (await json(oidcResponse)).value;
    if (typeof jwt !== 'string' || !jwt) throw new Error('OIDC token missing');
    io.mask(jwt);
    if (io.cancelled()) throw new Error('Deployment interrupted');
    // Never retry POST: an ambiguous response must not create a second deployment.
    const created = await request(base, { method: 'POST', headers,
      body: JSON.stringify({ artifact_id: cfg.artifact, pages_build_version: cfg.sha, oidc_token: jwt }) });
    if (!created.ok) throw new Error(`Pages deployment creation failed (HTTP ${created.status})`);
    const deployment = await json(created);
    const id = String(deployment.id || cfg.sha);
    if (!/^[\w-]+$/.test(id)) throw new Error('Invalid Pages deployment identifier');
    deploymentId = id;
    let errors = 0;
    let previous;
    for (;;) {
      if (io.cancelled()) throw new Error('Deployment interrupted');
      if (io.now() >= deadline) throw new Error('Pages deployment exceeded 20-minute time limit');
      let response;
      try { response = await request(`${base}/${deploymentId}`, { headers }); }
      catch (error) {
        if (++errors > 10) throw error;
        io.log('Temporary network error; waiting for the same Pages deployment');
      }
      if (response) {
        if (response.status >= 500 || response.status === 429 || response.status === 404) {
          if (++errors > 10) throw new Error(`Pages status unavailable (HTTP ${response.status})`);
          io.log(`Temporary Pages status error (HTTP ${response.status})`);
        } else {
          if (!response.ok) throw new Error(`Pages status failed (HTTP ${response.status})`);
          errors = 0;
          const status = (await json(response)).status;
          if (status !== previous) {
            // Only log known status codes; never untrusted response text or tokens.
            const known = ['succeed', 'deployment_queued', 'syncing_files', 'unknown_status', 'not_found',
              'deployment_attempt_error', 'deployment_failed', 'deployment_content_failed',
              'deployment_cancelled', 'deployment_lost'];
            io.log(`Pages: ${known.includes(status) ? status : 'pending'} (${Math.floor((io.now() - started) / 1000)}s)`);
            previous = status;
          }
          if (status === 'succeed') {
            terminal = true;
            const url = new URL(deployment.page_url || 'https://hemicycle.online/');
            if (url.protocol !== 'https:') throw new Error('Invalid published URL');
            io.output('page_url', url.href);
            return { deploymentId, pageUrl: url.href };
          }
          if (['deployment_failed', 'deployment_content_failed', 'deployment_cancelled', 'deployment_lost'].includes(status)) {
            terminal = true;
            throw new Error(`Pages ended with ${status}`);
          }
        }
      }
      await io.sleep(Math.min(15000, Math.max(0, deadline - io.now())));
    }
  } finally {
    if (deploymentId && !terminal) {
      // Cancel only the deployment created by this job, never historical runs.
      try {
        const result = await request(`${base}/${deploymentId}/cancel`, { method: 'POST', headers });
        io.log(`Own pending Pages deployment cancellation: HTTP ${result.status}`);
      } catch { io.log('Could not confirm cancellation of own pending deployment'); }
    }
  }
}

if (require.main === module) {
  let cancelled = false;
  process.on('SIGINT', () => { cancelled = true; });
  process.on('SIGTERM', () => { cancelled = true; });
  Promise.resolve().then(() => publish(config(process.env), {
    fetch, now: Date.now, sleep: delay, cancelled: () => cancelled,
    mask: value => console.log(`::add-mask::${value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`),
    log: message => console.log(message),
    output: (key, value) => appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`)
  })).catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { config, publish };
