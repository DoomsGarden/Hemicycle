"""Apply explicit Spanish translations to reviewed literal source fragments."""
from pathlib import Path
import argparse,json,copy,unicodedata
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,required=True);p.add_argument('--translations',type=Path,required=True);p.add_argument('--batch',required=True);p.add_argument('--reviewed-fragments',type=Path,required=True);a=p.parse_args();D=a.cache;R=Path(__file__).resolve().parent.parent;dest=R/'cloture-frases/frases-validees.json';result=json.loads(dest.read_text());proposals=json.loads(a.reviewed_fragments.read_text());assert proposals.get('status')=='originals_manually_reviewed_and_frozen', 'Falta la selección francesa revisada e inmutable';proposed={c['id']:c for c in proposals['cards']};by={c['id']:c for c in result['cards']};changes=[]
for line in a.translations.read_text().splitlines():
 if not line or line.startswith('#'):continue
 id,*texts=line.split('|');assert len(texts)==3,(id,len(texts));card=proposed[id];qs=[]
 for q,es in zip(card['candidates'],texts):
  assert 1<=len(es)<=47,(id,len(es),es)
  quote={'action':q['action'],'originalFR':q['originalFR'],'textES':es,'source':q['url'],'sourceTitle':q['title'],'spokenOn':q['spokenOn'],'consulted':'2026-11-06','sourceLanguage':'fr','translationLanguage':'es','ownTranslation':True,'sourceSha256':q['sha256'],'cacheKey':q['cacheKey'],'sourceType':q['sourceType'],'sourceCollection':'closure_parliament','speakerCheck':q['speakerCheck'],'paragraphIndex':q['paragraphIndex'],'adaptation':{'type':'translated_fragment','thirdPartySubstitutions':[],'note':'Fragmento literal continuo y traducción editorial española. Sin nombres personales de terceros dentro del fragmento.'},'sourceCheck':'original_y_hablante_revisados','toneReview':'reviewed','reviewedOn':'2026-11-06','gameActions':result['actions'][q['action']],'editorialReview':{'status':'reviewed','translation':'Traducción española propia revisada; se conserva el sentido de la réplica.','tone':{'normal':'Réplica, objeción o afirmación de posición en el debate.','strong':'Contrarréplica o afirmación enfática.','support':'Protección, confianza, cooperación, compromiso o perseverancia.'}[q['action']]}}
  qs.append(quote)
 c={'id':id,'name':card['name'],'contextSummaryES':card.get('contextSummaryES','Intervenciones propias recogidas en las fuentes y fechas individuales. La acción de juego es ficticia y no afirma que las palabras se dirigiesen originalmente al rival representado.'),'candidates':qs};by[id]=c;changes.append(c)
# Persist the exact approved originals/translations separately, so regeneration of a
# research worklist can never silently choose different original statements.
(R/'cloture-frases'/('decisions-'+a.batch+'.json')).write_text(json.dumps({'date':'2026-11-06','cards':changes},ensure_ascii=False,indent=2)+'\n')
result['cards']=list(by.values());result['progress']={'profilesReviewed':len(by),'phrasesReviewed':sum(len(c['candidates'])for c in by.values()),'profilesPending':440-len(by),'integratedCards':0};dest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(result['progress'])
