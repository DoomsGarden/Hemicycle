"""Capture official Assembly records selected by named participant links."""
from pathlib import Path
from lxml import html
import argparse,collections,concurrent.futures,hashlib,json,re,urllib.request,urllib.parse,unicodedata
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,required=True);a=p.parse_args();D=a.cache;R=Path(__file__).resolve().parent.parent
(D/'assembly').mkdir(exist_ok=True);(D/'assembly-indexes').mkdir(exist_ok=True)
cards=json.loads((R/'censo.json').read_text())['cards']+json.loads((R/'ampliacion-340/seleccion.json').read_text())['cards'];reviewed={c['id']for c in json.loads((R/'frases-originales.json').read_text())['cards']}
def norm(t):return ''.join(c for c in unicodedata.normalize('NFD',t.lower())if c.isalnum())
byname={norm(c['name']):c for c in cards if c['id']not in reviewed}
def fetch(u,p):
 if p.exists():return p.read_bytes()
 with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Hemiciclo public parliamentary source review'}),timeout=35)as r:b=r.read()
 if len(b)<1000:raise ValueError('incomplete source')
 p.write_bytes(b);return b
urls=collections.defaultdict(set);names={};indexes=[]
for leg in [17,16,15,14,13]:
 u=f'https://www.assemblee-nationale.fr/dyn/{leg}/comptes-rendus/seance';f=D/'assembly-indexes'/f'{leg}.html'
 try:
  raw=fetch(u,f);r=html.fromstring(raw.decode('utf-8'));indexes.append({'url':u,'sha256':hashlib.sha256(raw).hexdigest(),'cacheKey':f.name})
  for a in r.xpath('//a[@href]'):
   href=a.get('href');t=' '.join(a.text_content().split());name=re.sub(r'^(?:Mme|MM|M)\.?\s+','',t).split(',')[0].split(' (')[0].strip(' .-–—');card=byname.get(norm(name))
   if not card or f'/dyn/{leg}/comptes-rendus/seance/'not in href or href.endswith('.pdf'):continue
   url=urllib.parse.urljoin(u,href).split('#')[0];urls[card['id']].add(url);names[card['id']]=card['name']
  print('Index',leg,'identified profiles',len(urls),flush=True)
 except Exception as e:indexes.append({'url':u,'error':str(e)});print('Index error',leg,str(e),flush=True)
# Pick up to four dated records per participant; shared records are downloaded once.
targets=collections.defaultdict(list)
for id,choices in urls.items():
 for url in sorted(choices,reverse=True)[:4]:targets[url].append(id)
(D/'assembly-search-index.json').write_text(json.dumps({'indexes':indexes,'profiles':{id:{'name':names[id],'records':sorted(v)}for id,v in urls.items()}},ensure_ascii=False,indent=2)+'\n')
def collect(item):
 url,ids=item;key=hashlib.sha256(url.encode()).hexdigest()[:20]+'.html'
 try:
  raw=fetch(url,D/'assembly'/key);r=html.fromstring(raw.decode('utf-8'));return {'url':url,'ids':ids,'cacheKey':key,'sha256':hashlib.sha256(raw).hexdigest(),'title':' '.join(r.findtext('.//title','').split())}
 except Exception as e:return {'url':url,'ids':ids,'error':str(e)}
out=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:
 for item in pool.map(collect,targets.items()):
  out.append(item)
  if len(out)%10==0:(D/'assembly-records.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Records',len(out),'of',len(targets),flush=True)
(D/'assembly-records.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Complete',len(out),flush=True)
