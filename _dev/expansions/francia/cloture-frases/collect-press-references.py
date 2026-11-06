"""Follow cited press references through normal public URLs; never bypass paywalls."""
from pathlib import Path
from lxml import html
import argparse,concurrent.futures,hashlib,json,re,urllib.request,urllib.parse
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,required=True);p.add_argument('--ids',type=Path);p.add_argument('--remaining',action='store_true');p.add_argument('--per-profile',type=int,default=8);p.add_argument('--new-only',action='store_true');a=p.parse_args();D=a.cache;R=Path(__file__).resolve().parent.parent;F=Path('/workspace/.hemicycle-tools/state/france-research');S=Path('/workspace/.hemicycle-tools/state/france-selection-work');(D/'press').mkdir(exist_ok=True)
cards=json.loads((R/'censo.json').read_text())['cards']+json.loads((R/'ampliacion-340/seleccion.json').read_text())['cards'];old={c['id']for c in json.loads((R/'frases-originales.json').read_text())['cards']};ids=set(json.loads(a.ids.read_text()))if a.ids else{c['id']for c in cards[:100]if c['id']not in old}
if a.remaining:ids={c['id']for c in cards}-{c['id']for c in json.loads((R/'cloture-frases/frases-validees.json').read_text())['cards']}
previous=json.loads((D/'press-reference-index.json').read_text())if(D/'press-reference-index.json').exists()else[];known={(r['id'],r['url'])for r in previous}
allowed={'rtl.fr','lefigaro.fr','lemonde.fr','liberation.fr','francetvinfo.fr','france3-regions.francetvinfo.fr','humanite.fr','sudouest.fr','lyoncapitale.fr','vie-publique.fr','elysee.fr','assemblee-nationale.fr','senat.fr','rtes.fr','information.tv5monde.com','province-sud.nc','lnc.nc'};targets=[]
for card in cards:
 if card['id']not in ids:continue
 file=(F/'wiki'/f"{card['id']}.html")if card in cards[:100]else(S/'selected-profiles'/f"{card['id']}.html")
 if not file.exists():continue
 root=html.fromstring(file.read_bytes().decode('utf-8'));links=[]
 for anchor in root.xpath('//span[contains(@class,"reference-text")]//a[@href]|//span[contains(@class,"reference-text")]/ancestor::li//a[@href]'):
  u=anchor.get('href');host=urllib.parse.urlparse(u).hostname or'';host=host.removeprefix('www.')
  if host not in allowed:continue
  text=' '.join(anchor.getparent().text_content().split())
  if not u.startswith('http')or u in[x['url']for x in links]:continue
  links.append({'id':card['id'],'name':card['name'],'url':u,'referenceContext':text[:1000]})
 links.sort(key=lambda r:-len(re.findall(r'entretien|interview|portrait|confie|déclare|affirme|raconte|répond|parcours|candidat',r['referenceContext'],re.I)))
 targets.extend(r for r in links[:a.per_profile]if not a.new_only or(r['id'],r['url'])not in known)
def collect(r):
 key=hashlib.sha256(r['url'].encode()).hexdigest()[:20]+'.html';file=D/'press'/key
 try:
  if file.exists():raw=file.read_bytes();final=r['url']
  else:
   with urllib.request.urlopen(urllib.request.Request(r['url'],headers={'User-Agent':'Hemiciclo editorial public-source review'}),timeout=30)as response:raw=response.read();final=response.url
   file.write_bytes(raw)
  root=html.fromstring(raw.decode('utf-8',errors='replace'));articles=root.xpath('//article');node=articles[0]if articles else root
  for e in node.xpath('.//script|.//style|.//nav|.//footer'):e.drop_tree()
  paragraphs=[' '.join(e.text_content().split())for e in node.xpath('.//p')];quotes=[]
  for i,t in enumerate(paragraphs):
   if any(x in t for x in ['«','“','"']):quotes.append({'paragraphIndex':i,'text':t})
  return {**r,'cacheKey':key,'sha256':hashlib.sha256(raw).hexdigest(),'finalUrl':final,'title':' '.join(root.findtext('.//title','').split()),'dateMetadata':root.xpath('//meta[@property="article:published_time"]/@content'),'quotedParagraphs':quotes,'paragraphs':paragraphs,'status':'unreviewed_press_reference'}
 except Exception as e:return {**r,'error':str(e)}
out=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:
 for r in pool.map(collect,targets):
  out.append(r)
  if len(out)%10==0:print('References',len(out),'of',len(targets),flush=True)
dest=D/'press-reference-index.json'
previous=json.loads(dest.read_text())if dest.exists()else[]
merged={(r['id'],r['url']):r for r in previous}
merged.update({(r['id'],r['url']):r for r in out})
dest.write_text(json.dumps(list(merged.values()),ensure_ascii=False,indent=2)+'\n');print('Complete',len(out),'sources',sum('sha256'in r for r in out),flush=True)
