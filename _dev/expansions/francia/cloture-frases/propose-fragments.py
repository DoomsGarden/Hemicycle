"""Prepare a non-final editorial worklist. Scores never approve attribution/tone."""
from pathlib import Path
import json,re,unicodedata,argparse,collections
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,required=True);a=p.parse_args();D=a.cache;R=Path(__file__).resolve().parent.parent
cards=json.loads((R/'censo.json').read_text())['cards']+json.loads((R/'ampliacion-340/seleccion.json').read_text())['cards'];old=json.loads((R/'cloture-frases/frases-validees.json').read_text());pool=json.loads((D/'turn-candidates.json').read_text())
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower())if c.isalnum())
seen={norm(q['originalFR'])for c in old['cards']for q in c['candidates']};done={c['id']for c in old['cards']};out=[]
for c in cards:
 if c['id']in done:continue
 qs=pool.get(c['id'],{}).get('all',[]);chosen=[]
 for action in ['strong','support','normal']:
  options=[q for q in qs if q['originalFR'][:1].isupper() and q['originalFR'][-1:] in '.!?' and norm(q['originalFR'])not in seen and 20<=len(q['originalFR'])<=65 and not re.match(r'^(?:Et |Mais |Or |Donc |Que |Qui |Par exemple|En effet|Cependant|Toutefois|Ainsi|À cet égard|Concernant|Surtout|Car |Parce que|De plus|Par ailleurs|Enfin|Ceux|Celles|Celle-ci|Celui-ci|Elle |Ils |Elles |Monsieur|Madame|Certes|Tous droits|Les droits de douane|Il en)',q['originalFR'])]
  def score(q):
   s=q['originalFR'];a=q['attackScore'];b=q['supportScore'];b+=len(re.findall(r'confiance|solidarit|protég|défend|soutien|liberté|droits|respect|réussir|aider|protection|espoir|dialogue|avanç|avancer|renforc|consolid|garant|soutenir|bâtir|construire|soign|merci|remercie|félicite|heureux|réjouis',s,re.I));length=abs(len(s)-37)/20
   fit=(a*2-b*.5 if action=='strong'else b*3-a*.7 if action=='support'else a*1.4)
   if action=='support'and not b:return -100
   if action!='support'and not a:fit-=1
   return fit-length
  if action=='support':
   options=[q for q in options if __import__('re').search(r'confiance|solidarit|protég|défend|soutien|liberté|droits|respect|réussir|aider|protection|espoir|dialogue|avanç|avancer|renforc|consolid|garant|soutenir|bâtir|construire|soign|merci|remercie|félicite|heureux|réjouis',q['originalFR'],__import__('re').I)and not __import__('re').search(r'droits de douane|droits réservés|pas de confiance|pas confiance|pas.*respect|avenir.*sacrifi|confiance.*perdu',q['originalFR'],__import__('re').I)]
  options.sort(key=score,reverse=True)
  if not options or score(options[0])< -50:continue
  q=dict(options[0]);q['action']=action;chosen.append(q);seen.add(norm(q['originalFR']))
 if len(chosen)==3:out.append({'id':c['id'],'name':c['name'],'candidates':sorted(chosen,key=lambda q:['normal','strong','support'].index(q['action']))})
(D/'proposed-fragments.json').write_text(json.dumps({'status':'unreviewed','cards':out},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'profilesWithThreeProposals':len(out),'stillWithoutThreeProposals':440-len(done)-len(out)}))
for c in out[:30]:print(c['id']+' | '+' | '.join(q['originalFR']for q in c['candidates']))
