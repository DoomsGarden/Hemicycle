"""Verify Spanish press candidates without treating them as checked French originals."""
import argparse
import hashlib
import html
import json
from pathlib import Path
import re
import unicodedata
import urllib.request


def normalize(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value).lower() if c.isalnum())


def article_text(raw):
    decoded = raw.decode('utf-8')
    pieces = [html.unescape(re.sub('<[^>]+>', ' ', decoded))]
    def collect(value):
        if isinstance(value, dict):
            if isinstance(value.get('articleBody'), str):
                pieces.append(value['articleBody'])
            for child in value.values():
                collect(child)
        elif isinstance(value, list):
            for child in value:
                collect(child)
    for script in re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', decoded, re.S):
        try:
            collect(json.loads(script))
        except json.JSONDecodeError:
            pass
    return normalize(' '.join(pieces))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, default=Path('/tmp/hemicycle-france-press-cache'))
    parser.add_argument('--offline', action='store_true')
    args = parser.parse_args()
    base = Path(__file__).parent
    data = json.loads((base / 'frases-candidatas.json').read_text())
    source_index = {s['url']: s for s in json.loads((base / 'fuentes-consultadas.json').read_text())['articles']}
    plan = json.loads((base / 'censo.json').read_text())
    planned = {c['id'] for c in plan['cards']}
    args.cache.mkdir(exist_ok=True, parents=True)
    documents, seen, checked, adaptations = {}, set(), 0, 0
    for card in data['cards']:
        assert card['id'] in planned
        slots = set()
        for quote in card['candidates']:
            assert quote['action'] in ('normal', 'strong', 'support')
            assert quote['action'] not in slots
            slots.add(quote['action'])
            assert quote['originalFR'] is None and quote['originalSpeechLanguage'] is None
            assert quote['ownTranslation'] is False
            assert quote['status'] == 'candidata_en_espanol_original_fr_pendiente'
            assert 0 < len(quote['textES']) <= 47
            assert normalize(quote['textES']) not in seen
            seen.add(normalize(quote['textES']))
            url, digest = quote['source'], quote['htmlSha256']
            assert url.startswith('https://www.europapress.es/')
            assert source_index[url]['htmlSha256'] == digest
            assert quote['published'] <= '2026-11-05'
            if digest not in documents:
                file = args.cache / (digest + '.html')
                if not file.exists():
                    if args.offline:
                        raise FileNotFoundError(file)
                    with urllib.request.urlopen(url, timeout=40) as response:
                        file.write_bytes(response.read())
                raw = file.read_bytes()
                assert hashlib.sha256(raw).hexdigest() == digest, url
                documents[digest] = article_text(raw)
            text = documents[digest]
            assert normalize(quote['publishedES']) in text, quote['textES']
            assert normalize(quote['attributionContextES']) in text, card['id']
            assert normalize(quote['publishedES']) in normalize(quote['attributionContextES'])
            transformed = quote['publishedES']
            for substitution in quote.get('substitutions', []):
                assert substitution['from'] in transformed
                transformed = transformed.replace(substitution['from'], substitution['to'])
                assert normalize(substitution['roleContextES']) in text
                assert substitution['roleEvidence'] == url
                adaptations += 1
            assert normalize(transformed) == normalize(quote['textES']), card['id']
            checked += 1
    assert checked == 54 and len(data['cards']) == 23 and adaptations == 1
    assert all(all(q is None for q in c['phrases'].values()) for c in plan['cards'])
    result = {'checkedSpanishCandidates': checked, 'profiles': len(data['cards']), 'sourceDocuments': len(documents),
              'hashes': True, 'publishedSpanishFragments': True, 'recordedAdaptations': adaptations,
              'savedAttributionContext': True, 'frenchOriginalsVerified': 0, 'finishedCards': 0, 'integratedCards': 0,
              'limits': 'Verifica fragmentos y contexto guardado en las noticias españolas; no sustituye la comprobación del original francés ni valida todos los hechos del artículo.'}
    (base / 'qa/candidate-verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
