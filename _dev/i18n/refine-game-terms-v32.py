from pathlib import Path
import json,re,ctranslate2
from argostranslate.tokenizer import SentencePieceTokenizer
root=Path(__file__).resolve().parents[2];p=root/'_dev/i18n/translated-v32.json';data=json.loads(p.read_text());sources={x['source']:x['files'] for x in json.loads((root/'_dev/i18n/sources-v32.json').read_text())};changed=[]
for s,v in data.items():
 if all(f in ['orator-context','orator-quote'] for f in sources.get(s,[])):continue
 en=v[0];old=en
 if re.search(r'orador',s,re.I):en=re.sub(r'\bspeakers?\b',lambda m:'orators' if m.group().lower().endswith('s') else 'orator',en,flags=re.I)
 if re.search(r'cromos?',s,re.I):en=re.sub(r'\b(?:chromes?|chromos?|stickers?)\b',lambda m:'cards' if m.group().lower().endswith('s') else 'card',en,flags=re.I)
 if re.search(r'cartas?',s,re.I):en=re.sub(r'\bletters?\b',lambda m:'cards' if m.group().lower().endswith('s') else 'card',en,flags=re.I)
 if re.search(r'turnos?',s,re.I):en=re.sub(r'\bshifts?\b',lambda m:'turns' if m.group().lower().endswith('s') else 'turn',en,flags=re.I)
 if re.search(r'mazo',s,re.I):en=re.sub(r'\bpits?\b','deck',en,flags=re.I)
 if re.search(r'fuerte',s,re.I):en=re.sub(r'\bforts?\b','strong retort',en,flags=re.I)
 if re.search(r'rareza',s,re.I):en=re.sub(r'\bodors?\b','rarities',en,flags=re.I)
 if re.search(r'Zasca',s,re.I):en=re.sub(r'\bZasca\b','Retort',en,flags=re.I)
 if re.search(r'Aguante',s,re.I):
  en=re.sub(r'\b(?:Aguante|endurance)\b','Stamina',en,flags=re.I)
  if not re.search(r'hueco',s,re.I):en=re.sub(r'\b(?:hole|fan)\b','Stamina',en,flags=re.I)
 if re.search(r'robo|roba|robar',s,re.I) and re.search(r'mazo|mano|turno',s,re.I):
  for a,b in [(r'\bburglary\b','draw'),(r'\bstolen\b','drawn'),(r'\bsteals\b','draws')]:en=re.sub(a,b,en,flags=re.I)
 if en!=old:data[s][0]=en;changed.append(s)
if changed:
 model=Path('/workspace/hemicycle-translation-models/translate-en_fr-1_9');token=SentencePieceTokenizer(model/'sentencepiece.model');engine=ctranslate2.Translator(str(model/'model'),device='cpu',compute_type='int8',inter_threads=1,intra_threads=6)
 for start in range(0,len(changed),24):
  ss=changed[start:start+24];out=engine.translate_batch([token.encode(data[s][0]) for s in ss],beam_size=2,max_decoding_length=768)
  for s,r in zip(ss,out):data[s][1]=token.decode(r.hypotheses[0]).strip()
for s,v in data.items():
 if all(f in ['orator-context','orator-quote'] for f in sources.get(s,[])):continue
 fr=v[1]
 if 'orador' in s.lower():fr=re.sub(r'haut-parleurs?',lambda m:'orateurs' if m.group().endswith('s') else 'orateur',fr,flags=re.I)
 if 'cromo' in s.lower():fr=re.sub(r'\bchromes?\b',lambda m:'cartes' if m.group().lower().endswith('s') else 'carte',fr,flags=re.I)
 if 'carta' in s.lower():fr=re.sub(r'\blettres?\b',lambda m:'cartes' if m.group().endswith('s') else 'carte',fr,flags=re.I)
 if 'aguante' in s.lower():fr=re.sub(r'\b(?:Stamina|Aguante)\b','Endurance',fr,flags=re.I)
 data[s][1]=fr
p.write_text(json.dumps(data,ensure_ascii=False));english=json.loads((root/'_dev/i18n/english-quotes-v32.json').read_text());(root/'js/localization-data.js').write_text('/* Traductions locales ; terminologie complétée par les catalogues révisés. */\nwindow.HemicycleLocaleData='+json.dumps({'rows':[[s,*v] for s,v in data.items() if any(c.isalpha() for c in s)],'englishQuotes':english},ensure_ascii=False,separators=(',',':'))+';\n');print('Glossary corrections',len(changed),flush=True)
