from pathlib import Path
import json,re,time
import ctranslate2,langid
from argostranslate.tokenizer import BPETokenizer,SentencePieceTokenizer
root=Path(__file__).resolve().parents[2];model=Path('/workspace/hemicycle-translation-models');data=json.loads((root/'_dev/i18n/sources-v32.json').read_text());quotes=json.loads((root/'_dev/i18n/quotes-v32.json').read_text());langid.set_languages(['es','en','fr','de','pt','it'])
english=set()
for q in quotes:
 text=q['q'];language,score=langid.classify(text)
 if (language=='en' or text in ['Fake news!',"You're fired!",'Never, ever give up','Yes we can','Yes, we can']) and text not in ['Confrontar ideas','Es absolutamente falso','Es rotundamente falso','La libertad individual','No soy profeta','No tergiverse usted','No voy a ceder','Nunca me he arredrado','Por asalto','Pues no','Rigurosamente falso','Soy Giorgia','Ya chole']:
  english.add(text)
(root/'_dev/i18n/english-quotes-v32.json').write_text(json.dumps(sorted(english),ensure_ascii=False,indent=2))
a=BPETokenizer(model/'translate-es_en-1_9/bpe.model','es','en');b=SentencePieceTokenizer(model/'translate-en_fr-1_9/sentencepiece.model')
trans1=ctranslate2.Translator(str(model/'translate-es_en-1_9/model'),device='cpu',compute_type='int8',inter_threads=1,intra_threads=6)
trans2=ctranslate2.Translator(str(model/'translate-en_fr-1_9/model'),device='cpu',compute_type='int8',inter_threads=1,intra_threads=6)
checkpoint=root/'_dev/i18n/translated-v32.json';done=json.loads(checkpoint.read_text()) if checkpoint.exists() else {}
texts=[x['source'] for x in data if x['source'] not in done and x['source'] not in english]
def cleanup(s,language):
 s=s.strip()
 if language=='en':
  s=re.sub(r'\b(?:sachets?|envelopes?)\b',lambda m:'packs' if m.group().lower().endswith('s') else 'pack',s,flags=re.I)
  s=re.sub(r'\bchromos?\b','cards',s,flags=re.I)
 else:s=re.sub(r'\bsachets?\b',lambda m:'paquets' if m.group().endswith('s') else 'paquet',s,flags=re.I)
 return s
for start in range(0,len(texts),24):
 batch=texts[start:start+24]
 en_result=trans1.translate_batch([a.encode(t) for t in batch],beam_size=2,max_decoding_length=768,max_batch_size=24)
 en=[cleanup(a.decode(t.hypotheses[0]),'en') for t in en_result]
 # Preserve English UI text for the English locale. Original English orator
 # quotes are excluded from both translation dictionaries altogether.
 for i,t in enumerate(batch):
  if len(t)>18 and langid.classify(t)[0]=='en':en[i]=t
 fr_result=trans2.translate_batch([b.encode(t) for t in en],beam_size=2,max_decoding_length=768,max_batch_size=24)
 for source,e,f in zip(batch,en,fr_result):done[source]=[e,cleanup(b.decode(f.hypotheses[0]),'fr')]
 checkpoint.write_text(json.dumps(done,ensure_ascii=False))
 if start%240==0:print('Translated',len(done),'/',len(data),'original English quotes',len(english),flush=True)
rows=[[s,*v] for s,v in done.items() if any(c.isalpha() for c in s)]
out='/* Traducciones locales de interfaz y frases. Glosario revisado en localization-reviewed.js. */\nwindow.HemicycleLocaleData='+json.dumps({'rows':rows,'englishQuotes':sorted(english)},ensure_ascii=False,separators=(',',':'))+';\n'
(root/'js/localization-data.js').write_text(out);print('DONE',len(rows),len(out),flush=True)
