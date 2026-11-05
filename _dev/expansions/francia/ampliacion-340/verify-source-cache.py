"""Recheck retained period evidence against the consulted, non-distributed HTML.

Usage: python verify-source-cache.py --cache /path/to/france-selection-work
Requires lxml. Articles and reference photographs are not copied into the repo.
"""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import re
from lxml import html

parser = argparse.ArgumentParser()
parser.add_argument('--cache', type=Path, required=True)
args = parser.parse_args()
base = Path(__file__).resolve().parent
selection = json.loads((base / 'seleccion.json').read_text())
files = {}
for file in args.cache.rglob('*.html'):
    files[hashlib.sha256(file.read_bytes()).hexdigest()] = file
documents = {}
methods = collections.Counter()
def document(digest):
    assert digest in files, 'Source absent or changed: ' + digest
    if digest not in documents:
        root = html.fromstring(files[digest].read_bytes())
        documents[digest] = (root, re.sub(r'\s+', '', root.text_content()))
    return documents[digest]

for card in selection['cards']:
    document(card['profileResearch']['htmlSha256'])
    assert card['recentPeriodEvidence'], card['name']
    for evidence in card['recentPeriodEvidence']:
        root, text = document(evidence['sourceSha256'])
        if evidence['method'] == 'dated_municipal_election_table_within_period':
            city = evidence['roleFR'].split('·')[-1].strip()
            year = re.search(r'20(?:14|20|26)', evidence['roleFR']).group()
            assert re.sub(r'\s+', '', city) in text and year in text, (card['name'], city, year)
        elif evidence['method'] == 'european_parliament_2024_2029_term_table':
            assert '2024' in text and '2029' in text, card['name']
            assert re.sub(r'\s+', '', card['name']) in text, card['name']
        else:
            assert re.sub(r'\s+', '', evidence['roleFR']) in text, (card['name'], evidence['roleFR'])
        if evidence['method'] == 'dated_biography_office_interval':
            dates = root.xpath('//time/@datetime')
            assert any(d.startswith(evidence['start']) for d in dates), card['name']
            assert evidence['end'] == selection['period']['to'] or any(d.startswith(evidence['end']) for d in dates), card['name']
            assert evidence['start'] <= selection['period']['to'] and evidence['end'] >= selection['period']['from'], card['name']
        methods[evidence['method']] += 1

report = {'profilesChecked': len(selection['cards']), 'sourceHashesMatched': len(documents), 'period': selection['period'], 'roleTextFoundInSources': True, 'evidenceMethods': dict(methods), 'scope': 'Contraste de las capturas consultadas; no certifica que el cargo siga vigente ni sustituye la revisión editorial individual.'}
(base / 'qa/source-cache-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False))
