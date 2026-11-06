"""Cache official transcripts for editorial review. Never finalizes quotations."""
from pathlib import Path
import argparse, concurrent.futures, hashlib, json, re, time, urllib.parse, urllib.request
from lxml import html
R=Path(__file__).resolve().parent.parent
P=argparse.ArgumentParser();P.add_argument('--cache',type=Path,required=True);P.add_argument('--limit',type=int,default=0);P.add_argument('--remaining',action='store_true');P.add_argument('--sources-per-kind',type=int,default=4);a=P.parse_args();D=a.cache
for x in ['search','senate']:(D/x).mkdir(parents=True,exist_ok=True)
cards=json.loads((R/'censo.json').read_text())['cards']+json.loads((R/'ampliacion-340/seleccion.json').read_text())['cards']
reviewed={c['id']for c in json.loads((R/'frases-originales.json').read_text())['cards']}
if a.remaining:reviewed={c['id']for c in json.loads((R/'cloture-frases/frases-validees.json').read_text())['cards']}
targets=[c for c in cards if c['id']not in reviewed]
if a.limit:targets=targets[:a.limit]
def fetch(url,p):
 if p.exists():return p.read_bytes()
 req=urllib.request.Request(url,headers={'User-Agent':'Hemiciclo editorial source review (public parliamentary transcripts)'})
 with urllib.request.urlopen(req,timeout=35)as response:raw=response.read()
 if len(raw)<1000:raise ValueError('Source response incomplete')
 p.write_bytes(raw);return raw
def collect(c):
 result={'id':c['id'],'name':c['name'],'sources':[]}
 try:
  url='https://www.senat.fr/basile/rechercheGlobale.do?'+urllib.parse.urlencode({'rch':'gs','radio':'dp','dp':'20 ans','unk':'"'+c['name']+'"','cr':'1'})
  p=D/'search'/(c['id']+'.html');raw=fetch(url,p);root=html.fromstring(raw.decode('utf-8',errors='replace'));result['search']={'url':url,'sha256':hashlib.sha256(raw).hexdigest()}
  links=[]
  for link in root.xpath('//a[@href]'):
   href=urllib.parse.urljoin(url,link.get('href'));title=' '.join(link.text_content().split())
   if '/basile/visio.do?'not in href:continue
   if not(title.startswith('Compte rendu du')or title.startswith('SEANCE du')):continue
   # Stable document URLs retain the whole speaking turn, without a search query.
   ident=urllib.parse.parse_qs(urllib.parse.urlparse(href).query).get('id',[''])[0]
   if ident.startswith('c/'):href='https://www.senat.fr/'+ident[2:]
   if href not in [x['url']for x in links]:links.append({'url':href,'title':title})
  commission=[x for x in links if x['title'].startswith('Compte rendu du')][:a.sources_per_kind];plenary=[x for x in links if x['title'].startswith('SEANCE du')][:a.sources_per_kind]
  for link in commission+plenary:
   key=hashlib.sha256(link['url'].encode()).hexdigest()[:20]+'.html';p=D/'senate'/key
   try:
    raw=fetch(link['url'],p);result['sources'].append({**link,'cacheKey':key,'sha256':hashlib.sha256(raw).hexdigest()})
   except Exception as e:result['sources'].append({**link,'error':str(e)})
 except Exception as e:result['error']=str(e)
 return result
out=[];dest=D/'senate-index.json';prior=json.loads(dest.read_text())if dest.exists()else[]
def persist():
 merged={x['id']:x for x in prior}
 for row in out:
  existing=merged.get(row['id'],{}).get('sources',[]);sources={s['url']:s for s in existing}
  for s in row['sources']:
   if 'error'not in s or s['url']not in sources:sources[s['url']]=s
  merged[row['id']]={**row,'sources':list(sources.values())}
 dest.write_text(json.dumps(list(merged.values()),ensure_ascii=False,indent=2)+'\n')
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:
 for r in pool.map(collect,targets):
  out.append(r)
  if len(out)%10==0:
   persist();print(json.dumps({'processed':len(out),'total':len(targets),'sources':sum(len(x['sources'])for x in out),'withSources':sum(bool(x['sources'])for x in out)}),flush=True)
persist();print('Complete',len(out),flush=True)
