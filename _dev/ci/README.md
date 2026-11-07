# Pages publication

`pages.yml` is dispatched manually on `main`. It builds the site once, uploads
the Pages artifact including `.well-known/assetlinks.json`, then deploys that
exact artifact with the job's short-lived GitHub token and OIDC identity.

`publish-pages.cjs` follows the REST protocol in `actions/deploy-pages@v5.0.1`.
We use a local driver because that action silently clamps `timeout` to 600000ms
and cancels a deployment still in `syncing_files`. Run 42416874511 reproduced
that limit with the v32.0.0.2 portrait correction. The local driver allows
20 minutes within the 25-minute job. It creates only one deployment, polls the
same ID, and cancels only its own pending deployment on timeout/interruption.
Historical runs and the published site are not deleted. Tokens are masked and
not logged. A successful run must still be followed by public file and browser
verification before calling the release published.

Test: `node --test tests/pages-publish.test.cjs`.
