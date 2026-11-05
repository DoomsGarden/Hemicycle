"""Validate the reviewed bilingual candidates, optionally against captured source DOMs.

Full transcripts stay outside the repository. This checks attribution markers and
literal fragments; editorial suitability for each combat action remains pending.
"""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]


def norm(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value).lower() if c.isalnum())


def clean(value):
    return ' '.join(value.replace('\x92', "'").replace('\x91', "'").split())


def check_source(card, quote, cache):
    from lxml import html
    source = cache / 'speeches' / quote['cacheKey']
    raw = source.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == quote['sourceSha256'], source
    root = html.fromstring(raw)
    node = root.xpath('//*[contains(@class,"field--name-field-texte-integral")]')[0]
    # Drupal glossary expansions are site explanations, not the speaker's words.
    for tooltip in node.xpath('.//*[@role="tooltip"]|.//script|.//style'):
        tooltip.drop_tree()
    for paragraph in node.xpath('.//p'):
        paragraph.tail = '\n' + (paragraph.tail or '')
    for br in node.xpath('.//br'):
        br.tail = '\n' + (br.tail or '')
    text = clean(node.text_content())
    pos = text.index(quote['originalFR'])
    date = root.xpath('//*[contains(@class,"field--name-field-date-prononciation-discour")]//time/@datetime')
    assert date and date[0][:10] == quote['spokenOn']
    authors = root.xpath('//*[contains(@class,"vp-intervenant")]//a')
    assert norm(card['name']) in {norm(a.text_content()) for a in authors}
    check = quote['speakerCheck']
    method = check['method']
    if method == 'signed_section':
        assert pos > text.rindex(check['anchorFR'])
    elif method == 'interview_speaker':
        markers = list(re.finditer(r'FRANÇOIS BAYROU|THOMAS SOTTO|MARC-OLIVIER FOGIEL', text[:pos]))
        assert markers and markers[-1][0] == check['anchorFR']
    elif method == 'dated_interview_answer':
        start = text.index(check['anchorFR'])
        end = text.index('Le Monde : 17 juin 1994', start)
        assert start < pos < end and check['sectionDate'] == quote['spokenOn']
        markers = list(re.finditer(r'(?<!\w)([QR])\.\s*:', text[start:pos]))
        assert markers and markers[-1][1] == 'R'
    elif method == 'parliamentary_turn':
        turns = list(re.finditer(r'(?:Mme|M\.)\s+[^.]{2,180}\.\s*-\s*', text[:pos]))
        assert turns and norm(card['name']) in norm(turns[-1][0])
    elif method == 'interview_answer':
        if card['id'] == 'valerie-pecresse':
            markers = list(re.finditer(r'\b([QR])\s*-\s*', text[:pos]))
            assert markers and markers[-1][1] == 'R'
        else:
            paragraphs = [clean(p) for p in node.text_content().split('\n')]
            owner_paragraphs = [p for p in paragraphs if quote['originalFR'] in p]
            assert owner_paragraphs and all(not p.startswith('- ') for p in owner_paragraphs)
    else:
        assert method == 'own_declaration' and len(authors) == 1
    return quote['source']


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache', type=Path, help='Research directory containing speeches/*.html')
    args = parser.parse_args()
    data = json.loads((ROOT / 'frases-originales.json').read_text())
    plan = json.loads((ROOT / 'censo.json').read_text())
    cards = {c['id']: c for c in plan['cards']}
    assert data['enabled'] is False and plan['enabled'] is False
    # Compare with both the public catalogue and the complete Spanish reserve.
    js = "const c=require('./js/orator-catalog.js'),r=require('./_dev/expansions/reserva-espana/prepare.cjs');process.stdout.write(JSON.stringify([...c.cards,...r.sourceCards].flatMap(c=>c.q)));"
    old = {norm(q) for q in json.loads(subprocess.check_output(['node', '-e', js], cwd=REPO))}
    seen, people, sources, checked_sources = set(), set(), set(), set()
    per_source_words = collections.Counter()
    for card in data['cards']:
        assert card['id'] in cards and card['id'] not in people
        assert card['name'] == cards[card['id']]['name']
        people.add(card['id'])
        assert {q['action'] for q in card['candidates']} == {'normal', 'strong', 'support'}
        assert len(card['candidates']) == 3
        for quote in card['candidates']:
            text = quote['textES']
            assert 1 <= len(text) <= 47, (card['id'], len(text))
            assert norm(text) not in old | seen, (card['id'], text)
            seen.add(norm(text))
            assert '1986-11-05' <= quote['spokenOn'] <= '2026-11-05'
            assert quote['ownTranslation'] is True and quote['sourceLanguage'] == 'fr'
            assert quote['source'].startswith('https://www.vie-publique.fr/discours/')
            assert re.fullmatch('[a-f0-9]{64}', quote['sourceSha256'])
            assert quote['sourceCheck'] == 'original_y_hablante_revisados'
            assert quote['toneReview'] == 'pending'
            assert quote['adaptation']['thirdPartySubstitutions'] == []
            sources.add(quote['source'])
            per_source_words[quote['source']] += len(quote['originalFR'].split()) + len(text.split())
            if args.cache:
                checked_sources.add(check_source(card, quote, args.cache))
    assert all(n <= 90 for n in per_source_words.values()), per_source_words
    result = {'profiles': len(people), 'bilingualCandidates': len(seen), 'distinctSources': len(sources),
              'sourceCacheChecked': bool(args.cache), 'sourcesRechecked': len(checked_sources),
              'noExistingPhraseDuplicates': True, 'maxSpanishLength': 47,
              'toneReviewPending': len(seen), 'integratedIntoGame': False}
    (ROOT / 'qa/originals-verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
