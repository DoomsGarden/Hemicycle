"""Apply the explicitly reviewed editorial decisions to the initial 84 profiles."""
from pathlib import Path
import json,copy
R=Path(__file__).resolve().parent.parent;out=R/'cloture-frases/frases-validees.json'
research=json.loads((R/'frases-originales.json').read_text())
existing=json.loads(out.read_text())if out.exists()else{'enabled':False,'date':'2026-11-06','status':'editorial_closure_in_progress','expectedProfiles':440,'actions':{'normal':['attack'],'strong':['strong_attack'],'support':['defense','heal']},'cards':[]}
changes={
 ('nicolas-sarkozy','strong'):("je n'ai trahi aucune des valeurs",'No he traicionado ninguno de esos valores.','Se sustituye la referencia deíctica a una carta por una afirmación propia de compromiso en la misma respuesta; no se atribuyen palabras del entrevistador.'),
 ('gerard-larcher','strong'):("Il faut d'abord tordre le cou à l'idée",'Primero hay que desmontar esa idea.','Contraargumento sobre la organización municipal. La locución francesa se traduce por su sentido idiomático; no alude a violencia contra una persona.'),
 ('agnes-buzyn','strong'):("Ce courage, je l'ai",'Ese valor sí lo tengo.','Afirmación propia posterior a la cita de Churchill; se excluye la cita ajena y se reemplaza una despedida inadecuada como zasca fuerte.')}
by={c['id']:c for c in existing['cards']}
for card in research['cards']:
 c=copy.deepcopy(card)
 for q in c['candidates']:
  key=(c['id'],q['action'])
  if key in changes:
   fr,es,note=changes[key];q['originalFR']=fr;q['textES']=es;q['editorialChangeNote']=note
  q['adaptation']['note']='Fragmento continuo del texto francés publicado; traducción editorial propia. La acción ficticia de juego está revisada. Los nombres personales fuera del fragmento se conservan en la referencia de contexto.'
  q['toneReview']='reviewed';q['reviewedOn']='2026-11-06';q['sourceCollection']='first100_research';q['gameActions']=existing['actions'][q['action']]
  q['editorialReview']={'status':'reviewed','attribution':'Original y turno de palabra cotejados con la captura citada.','translation':'Traducción editorial española revisada; fragmento continuo, sin añadir una afirmación ausente del original.','tone':{'normal':'Réplica, objeción o afirmación de posición en un intercambio de debate ficticio.','strong':'Contrarréplica, denuncia, advertencia o afirmación enfática; la fuerza es escénica y no implica violencia real.','support':'Compromiso, protección, cooperación, perseverancia o confianza; compartida por defensa y curación.'}[q['action']],'thirdParties':'Sin nombres de terceros dentro del fragmento seleccionado.'}
 by[c['id']]=c
existing['cards']=list(by.values());existing['progress']={'profilesReviewed':len(by),'phrasesReviewed':sum(len(c['candidates'])for c in by.values()),'profilesPending':440-len(by),'integratedCards':0};out.write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n');print(existing['progress'])
