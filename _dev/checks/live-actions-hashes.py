"""Verify the deployed runtime, including the build hidden by the unchanged version."""
from pathlib import Path
import datetime
import hashlib
import json
import time
import urllib.error
import urllib.request

root = Path(__file__).resolve().parents[2]
base = 'https://doomsgarden.github.io/Hemicycle/'
paths = ['index.html', 'sw.js', 'assets/actions/art-atlas.png']
paths += [path + '?v=31.0.1.3-actions1' for path in [
    'js/action-cards.js', 'css/action-cards.css', 'js/online-ui.js',
    'js/online-combat-ui.js', 'js/player-backup.js', 'js/cabinet-presets.js',
    'js/menu-tutorial.js', 'js/battle-tutorial.js', 'css/online.css',
    'css/tutorial.css', 'js/cloud-ui.js', 'js/changelog.js',
]]
report = {'version': 'v31.0.1.3', 'build': 'actions1', 'runtimeCommit': 'bd92bdc',
          'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'files': []}
for path in paths:
    url = base + path + ('&' if '?' in path else '?') + 'verify=' + str(time.time_ns())
    with urllib.request.urlopen(url, timeout=25) as response:
        data = response.read()
    local = (root / path.split('?')[0]).read_bytes()
    matches = hashlib.sha256(data).digest() == hashlib.sha256(local).digest()
    report['files'].append({'path': path, 'sha256': hashlib.sha256(data).hexdigest(), 'matches': matches})
    print(path, matches, flush=True)
    if not matches:
        raise SystemExit('Pages still serves a different build; do not report deployment verified.')
try:
    urllib.request.urlopen(base + '_dev/supabase/20261024_action_inventory.sql', timeout=15)
except urllib.error.HTTPError as error:
    report['developmentFilesExcluded'] = error.code == 404
assert report.get('developmentFilesExcluded'), 'Development files must stay excluded from Pages.'
(root / '_dev/reports/actions-v31.0.1.3/live-hashes.json').write_text(json.dumps(report, indent=2) + '\n')
