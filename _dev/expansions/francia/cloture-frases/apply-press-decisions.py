"""Apply explicit, manually reviewed press selections; never select by keyword."""
from pathlib import Path
from lxml import html
from publication import publication_date
import argparse,json,re
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,required=True);p.add_argument('--decisions',type=Path);a=p.parse_args();R=Path(__file__).resolve().parent.parent;D=a.cache;dest=R/'cloture-frases/frases-validees.json'
index=json.loads((D/'press-reference-index.json').read_text());decisions=json.loads((a.decisions or R/'cloture-frases/decisions-press.json').read_text());result=json.loads(dest.read_text());by={c['id']:c for c in result['cards']};cards=json.loads((R/'censo.json').read_text())['cards']+json.loads((R/'ampliacion-340/seleccion.json').read_text())['cards']
def fold(s):return s.lower().replace('’',"'").replace('\xa0',' ')
for d in decisions:
 source=next(x for x in index if x['id']==d['id']and x.get('cacheKey')==d['sourceKey']);c=next(c for c in cards if c['id']==d['id']);qs=[]
 for decision in d['quotes']:
  action,paragraph,fr,es,*sourceKey=decision
  source=next(x for x in index if x['id']==d['id']and x.get('cacheKey')==(sourceKey[0]if sourceKey else d['sourceKey']))
  published=publication_date(html.fromstring((D/'press'/source['cacheKey']).read_bytes().decode('utf-8')));assert published
  paragraphs=source['paragraphs']
  if d.get('paragraphXPath'):
   root=html.fromstring((D/'press'/source['cacheKey']).read_bytes().decode('utf-8'))
   paragraphs=[' '.join(e.text_content().split())for e in root.xpath(d['paragraphXPath'])]
  text=paragraphs[paragraph];pos=fold(text).find(fold(fr));assert pos>=0,(d['id'],fr);literal=text[pos:pos+len(fr)];assert 1<=len(es)<=47,(d['id'],len(es),es)
  qs.append({'action':action,'originalFR':literal,'textES':es,'source':source['url'],'sourceTitle':source['title'],'spokenOn':None,'publishedOn':published,'dateEvidence':'publication_not_confirmed_speech_date','consulted':'2026-11-06','sourceLanguage':'fr','translationLanguage':'es','ownTranslation':True,'sourceSha256':source['sha256'],'cacheKey':source['cacheKey'],'sourceType':'press_editorially_identified_quote','sourceCollection':'closure_press','speakerCheck':{'method':'editorially_identified_quote','paragraphIndex':paragraph,'review':d['contextSummaryES']},'adaptation':{'type':'translated_fragment','thirdPartySubstitutions':[],'note':'Fragmento continuo y traducción editorial española. La referencia de juego es ficticia; se conserva el sentido y se excluyen nombres personales fuera del fragmento.'},'sourceCheck':'original_y_hablante_revisados','toneReview':'reviewed','reviewedOn':'2026-11-06','gameActions':result['actions'][action],'editorialReview':{'status':'reviewed','attribution':'Atribución contextual individual cotejada; se excluyen citas ajenas.','translation':'Traducción editorial propia revisada.','tone':{'normal':'Réplica o afirmación de posición.','strong':'Contrarréplica, crítica o afirmación enfática.','support':'Protección, compromiso, confianza o perseverancia.'}[action]}})
  qs[-1]['publishedOn']=published
  if d.get('paragraphXPath'):qs[-1]['speakerCheck']['paragraphXPath']=d['paragraphXPath']
  if d.get('speechDateEvidence'):
   evidence=d['speechDateEvidence'];assert evidence['textFR']in paragraphs[evidence['paragraphIndex']]
   qs[-1].update(spokenOn=d['spokenOn'],dateEvidence='explicit_speech_date_in_publisher_context',speechDateEvidence=evidence)
 by[c['id']]={'id':c['id'],'name':c['name'],'contextSummaryES':d['contextSummaryES'],'candidates':qs}
result['cards']=list(by.values());result['progress']={'profilesReviewed':len(by),'phrasesReviewed':sum(len(c['candidates'])for c in by.values()),'profilesPending':440-len(by),'integratedCards':0};dest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(result['progress'])
