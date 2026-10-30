import urllib.request,urllib.parse,json,re,time,concurrent.futures
from html.parser import HTMLParser
from pathlib import Path
class Lead(HTMLParser):
 def __init__(self):super().__init__();self.table=0;self.sup=0;self.par=False;self.buf=[];self.ps=[]
 def handle_starttag(self,t,a):
  if t=='table':self.table+=1
  if t=='sup':self.sup+=1
  if t=='p' and not self.table:self.par=True;self.buf=[]
 def handle_endtag(self,t):
  if t=='table':self.table=max(0,self.table-1)
  if t=='sup':self.sup=max(0,self.sup-1)
  if t=='p' and self.par:
   text=re.sub(r'\s+',' ',''.join(self.buf)).strip()
   if len(text)>100 and not text.startswith(('Este artículo','Para otros','En este artículo')):self.ps.append(text)
   self.par=False
 def handle_data(self,d):
  if self.par and not self.table and not self.sup:self.buf.append(d)
alias={'pablo-iglesias':'Pablo Iglesias Turrión','monica-garcia':'Mónica García Gómez','ana-pastor':'Ana Pastor Julián','andrea-levy':'Andrea Levy Soler','jordi-sanchez':'Jordi Sànchez i Picanyol','pablo-cambronero':'Pablo Cambronero Piqueras','pablo-montesinos':'Pablo Montesinos Carrera','raquel-sanchez':'Raquel Sánchez Jiménez','isabel-cela':'Isabel Celaá','miriam-nogueras':'Míriam Nogueras','vladimir-putin':'Vladímir Putin'}
cards=json.loads(Path('/tmp/hemicycle-orators-v10.json').read_text())
def get(c):
 title=alias.get(c['id'],c['n']);url='https://es.wikipedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_'))
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'HemicicloContextReview/1.0 (educational game source review)'}),timeout=30) as r:
   data=r.read().decode();final=r.url
  p=Lead();p.feed(data)
  if not p.ps:raise ValueError('No se encontró entradilla')
  lead=p.ps[0];sent=re.split(r'(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])',lead)[0]
  if len(sent)>520:sent=sent[:500].rsplit(' ',1)[0]+'…'
  return {'id':c['id'],'name':c['n'],'extract':sent,'source':final,'consulted':'2026-10-30','attribution':'Wikipedia y sus colaboradores','license':'CC BY-SA 4.0','lead':lead,'status':'retrieved'}
 except Exception as e:return {'id':c['id'],'name':c['n'],'source':url,'status':'error','error':str(e)}
existing={r['id']:r for r in json.loads(Path('_dev/reports/v31.0.2.10/context-sources.json').read_text()) if r['status'] in ['retrieved','registry-reference']}
original_get=get
def get(c):return existing.get(c['id']) or original_get(c)
rows=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for i,row in enumerate(pool.map(get,cards)):
  rows.append(row)
  if (i+1)%20==0:print('Consultados',i+1,'/120',flush=True)
Path('_dev/reports/v31.0.2.10/context-sources.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print('Errores:',[(r['id'],r.get('error')) for r in rows if r['status']=='error'],flush=True)
