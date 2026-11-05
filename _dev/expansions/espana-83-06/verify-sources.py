"""Verify 249 fragments against PDF pages or attributed HTML statements and recorded hashes."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import unicodedata
import urllib.request


def normalize(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text).lower() if c.isalnum())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, default=Path('/tmp/hemicycle-quote-pdfs'))
    parser.add_argument('--offline', action='store_true')
    args = parser.parse_args()
    registry = json.loads(Path(__file__).with_name('frases.json').read_text())
    args.cache.mkdir(parents=True, exist_ok=True)
    documents = {}
    checked = 0
    html_documents = {}
    html_checked = 0
    for card in registry['cromos']:
        for quote in card['frases']:
            if quote.get('sourceFormat') == 'html':
                import html
                import re
                digest = quote['htmlSha256']
                url = quote['fuente']
                if not url.startswith('https://www.europapress.es/'):
                    raise ValueError('Unexpected HTML source: ' + url)
                if digest not in html_documents:
                    file = args.cache / (digest + '.html')
                    if not file.exists():
                        if args.offline:
                            raise FileNotFoundError(file)
                        with urllib.request.urlopen(url, timeout=45) as response:
                            file.write_bytes(response.read())
                    raw = file.read_bytes()
                    if hashlib.sha256(raw).hexdigest() != digest:
                        raise ValueError('HTML bytes changed; review the source and update evidence: ' + url)
                    decoded = raw.decode('utf-8')
                    bodies = []
                    for script in re.findall(r'<script[^>]*type=[\"\']application/ld\+json[\"\'][^>]*>(.*?)</script>', decoded, re.S):
                        try:
                            value = json.loads(script)
                            def collect(v):
                                if isinstance(v, dict):
                                    if isinstance(v.get('articleBody'), str): bodies.append(v['articleBody'])
                                    for child in v.values(): collect(child)
                                elif isinstance(v, list):
                                    for child in v: collect(child)
                            collect(value)
                        except json.JSONDecodeError:
                            pass
                    html_documents[digest] = html.unescape(re.sub('<[^>]+>', ' ', decoded)) + ' ' + ' '.join(bodies)
                source = normalize(html_documents[digest])
                if normalize(quote['original']) not in source or normalize(quote['contexto']) not in source:
                    raise ValueError('Fragment/context absent from article: ' + card['id'])
                if normalize(quote['frase']) != normalize(quote['original']):
                    raise ValueError('Nonliteral HTML fragment: ' + card['id'])
                html_checked += 1
                continue
            digest = quote['pdfSha256']
            url = quote['fuente'].split('#')[0]
            if not url.startswith(('https://www.senado.es/', 'https://www.congreso.es/')):
                raise ValueError('Unexpected source: ' + url)
            if digest not in documents:
                pdf = args.cache / (digest + '.pdf')
                if not pdf.exists():
                    if args.offline:
                        raise FileNotFoundError(pdf)
                    request = urllib.request.Request(url, headers={'User-Agent': 'Hemiciclo-documentation/1.0'})
                    with urllib.request.urlopen(request, timeout=45) as response:
                        pdf.write_bytes(response.read())
                if hashlib.sha256(pdf.read_bytes()).hexdigest() != digest:
                    raise ValueError('The cited PDF has changed: ' + url)
                text = subprocess.check_output(['pdftotext', '-raw', str(pdf), '-'], text=True)
                documents[digest] = text.split('\f')
            pages = documents[digest]
            index = quote['paginaPDF'] - 1
            page_text = pages[index]
            fragment = normalize(quote['original'])
            if fragment not in normalize(page_text):
                # A short quotation can begin at the foot of the cited page and finish on the next.
                if index + 1 >= len(pages) or fragment not in normalize(page_text + pages[index + 1]):
                    raise ValueError('Fragment not found on the cited page: ' + card['id'] + ' / ' + quote['frase'])
            if normalize(quote['frase']) != fragment:
                raise ValueError('The game text differs from the documented literal fragment: ' + card['id'])
            checked += 1
    print(json.dumps({'checkedQuotes': checked + html_checked, 'checkedPdfQuotes': checked, 'checkedHtmlQuotes': html_checked, 'checkedHtmlDocuments': len(html_documents), 'checkedPdfs': len(documents), 'hashes': True, 'physicalPages': True, 'literalFragments': True}, ensure_ascii=False))


if __name__ == '__main__':
    main()
