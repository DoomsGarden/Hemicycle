"""Verify the actual cached source, speaker boundaries and reviewed translations."""
from pathlib import Path
from lxml import html
from attribution import speaker_marker,spoken_text,is_editorial_excerpt,is_session_date_heading
import argparse,collections,hashlib,importlib.util,json,re,subprocess,unicodedata
R=Path(__file__).resolve().parent.parent;P=argparse.ArgumentParser();P.add_argument('--cache',type=Path,required=True);P.add_argument('--initial-cache',type=Path,required=True);P.add_argument('--require-complete',action='store_true');args=P.parse_args();D=args.cache
spec=importlib.util.spec_from_file_location('initial_verifier',R/'verify-originals.py');initial=importlib.util.module_from_spec(spec);spec.loader.exec_module(initial)
def norm(t):return ''.join(c for c in unicodedata.normalize('NFD',t.lower())if c.isalnum())
def clean(t):return ' '.join(t.replace('\x92',"'").replace('\x91',"'").split())
def name(s):return norm(re.sub(r'^(?:Mme|MM|M)\.?\s+','',s).split(',')[0].split(' (')[0].strip(' .-–—'))
TURN=re.compile(r'^((?:Mme|MM|M)\.?\s+.{2,170}?)(?:\.\s*[-–—]\s*|\s+[-–—]\s+)')
ANSWER=re.compile(r'(?<!\w)(QUESTION|RÉPONSE|REPONSE|LE PRESIDENT|LE PRÉSIDENT|Q|R)\s*[.:]?\s*[-–—:]\s*')
months=dict(zip(['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'],range(1,13)))
def dateof(t):
 m=re.search(r'\b(\d{1,2})(?:er)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})\b',t,re.I)
 return f'{m[3]}-{months[norm(m[2])]:02}-{int(m[1]):02}'if m else None
identity_policy=json.loads((R/'cloture-frases/homonym-source-policy.json').read_text())['people']
roster={c['id']:c for c in json.loads((R/'censo.json').read_text())['cards']+json.loads((R/'ampliacion-340/seleccion.json').read_text())['cards']}
rawcache={}
def source(q,folder):
 key=(folder,q['cacheKey'])
 if key not in rawcache:rawcache[key]=(D/folder/q['cacheKey']).read_bytes()
 raw=rawcache[key];assert hashlib.sha256(raw).hexdigest()==q['sourceSha256'],q['source']
 return html.fromstring(raw.decode('utf-8'))if folder in ['senate','assembly','press']else html.fromstring(raw)
def check(c,q):
 if c['id']in identity_policy:
  import urllib.parse
  rule=identity_policy[c['id']];profile=roster[c['id']].get('profileResearch',{}).get('url',roster[c['id']].get('referenceToCheck',''))
  assert urllib.parse.unquote(profile)==urllib.parse.unquote(rule['expectedProfile'])
  allowed=[d for d in rule['approvedDocuments']if d['sourceSha256']==q['sourceSha256']and d['cacheKey']==q['cacheKey']and d['sourceCollection']==q['sourceCollection']and d['spokenOn']==q.get('spokenOn')]
  assert allowed,(c['id'],'Fuente sin desambiguación del cargo; puede pertenecer a un homónimo.')
  folder=args.initial_cache/'press-fr'if q['sourceCollection']=='first100_research'else D/'senate';raw=(folder/q['cacheKey']).read_bytes();assert hashlib.sha256(raw).hexdigest()==q['sourceSha256'];root=html.fromstring(raw.decode('utf-8'));evidence=root.xpath(allowed[0]['identityEvidenceXPath']);assert evidence and allowed[0]['identityEvidenceFR']in clean(evidence[0].text_content())
 if q['sourceCollection']=='first100_research':return initial.check_source(c,q,args.initial_cache)
 kind=q['sourceType'];expected=norm(c['name'])
 if kind=='senat_turn':
  root=source(q,'senate');speaker=None;pi=-1;day=None
  if q['sourceTitle'].startswith('SEANCE du'):day=dateof(q['sourceTitle'])
  for e in root.xpath('//p|//h1|//h2|//h3|//h4|//h5'):
   text=clean(e.text_content())
   if is_session_date_heading(text):
    if dateof(text):day=dateof(text)
   if e.tag!='p':continue
   pi+=1
   if e.xpath('ancestor::footer|ancestor::nav|ancestor::header'):speaker=None;continue
   marker=speaker_marker(e)
   if marker:speaker=marker[0]
   if pi==q['paragraphIndex']:
    assert name(speaker or'')==expected,(c['id'],speaker)
    assert name(q['speakerCheck']['speakerFR'])==expected;assert day==q['spokenOn'];assert q['originalFR']in text and not is_editorial_excerpt(e,q['originalFR']);return q['source']
  raise AssertionError('Paragraph not found')
 if kind=='assemblee_named_intervention':
  root=source(q,'assembly');turn=root.xpath('//div[@id=$id]',id=q['speakerCheck']['interventionId']);assert len(turn)==1
  speakers=turn[0].xpath('.//p[@class="orateur"]');assert len(speakers)==1 and name(clean(speakers[0].text_content()))==expected
  e=turn[0].xpath('./p')[q['paragraphIndex']]
  for note in e.xpath('.//i|.//em'):note.drop_tree()
  assert q['originalFR']in clean(e.text_content());assert dateof(q['sourceTitle'])==q['spokenOn'];return q['source']
 if kind=='vie_publique_declaration':
  root=source(q,'speeches');node=root.xpath('//*[contains(@class,"field--name-field-texte-integral")]')[0]
  for tooltip in node.xpath('.//*[@role="tooltip"]|.//script|.//style'):tooltip.drop_tree()
  authors=[clean(x.text_content())for x in root.xpath('//*[contains(@class,"vp-intervenant")]//a')];assert len(authors)==1 and norm(authors[0])==expected
  dates=root.xpath('//*[contains(@class,"field--name-field-date-prononciation-discour")]//time/@datetime');assert dates and dates[0][:10]==q['spokenOn']
  assert not re.search(r'^Conseil des ministres|^Compte rendu du Conseil|^Communiqué du Conseil',q['sourceTitle'],re.I)
  if q['speakerCheck']['method']=='interview_explicit_answer':
   text=clean(node.text_content());markers=list(ANSWER.finditer(text));i=q['speakerCheck']['answerIndex'];m=markers[i];assert norm(m[1])in ['r','reponse','lepresident'];segment=text[m.end():markers[i+1].start()if i+1<len(markers)else len(text)];assert q['originalFR']in segment;return q['source']
  paragraphs=node.xpath('.//p')or[node];speaker=authors[0]
  for i,e in enumerate(paragraphs):
   text=clean(e.text_content());marker=speaker_marker(e)
   if marker:speaker=marker[0]
   if re.match(r'^(?:QUESTION|Q[. ]|RÉPONSE DU JOURNALISTE)',text):speaker=''
   if i==q['paragraphIndex']:
    assert name(speaker)==expected,(c['id'],speaker);assert q['originalFR']in text;return q['source']
  raise AssertionError('Speech paragraph not found')
 if kind=='press_editorially_identified_quote':
  root=source(q,'press');articles=root.xpath('//article');node=articles[0]if articles else root
  for e in node.xpath('.//script|.//style|.//nav|.//footer'):e.drop_tree()
  paragraphs=[clean(e.text_content())for e in node.xpath('.//p')];text=paragraphs[q['speakerCheck']['paragraphIndex']]
  assert q['originalFR']in text,(c['id'],q['originalFR']);assert q['speakerCheck']['review']
  # Attribution is an explicit individual editorial decision, not name proximity.
  assert q['spokenOn']is None and q['dateEvidence']=='publication_not_confirmed_speech_date'
  if q['speakerCheck'].get('method')=='rtes_explicit_interview_answer':
   from urllib.parse import urlparse
   assert urlparse(q['source']).hostname=='www.rtes.fr' and c['id']=='jeanne-barseghian'
   # The page explicitly distinguishes J.B (Jeanne) from J-B.G (Gernet).
   assert text.startswith('J.B :')
   answer=re.split(r'J-B\.\s*G\s*:',text,1)[0]
   assert q['originalFR']in answer
   dates=root.xpath('//article/div[@class="article-header"]/div[@class="date"]')
   assert len(dates)==1 and dateof(clean(dates[0].text_content()))==q['publishedOn']
  else:
   dates=root.xpath('//meta[@property="article:published_time"]/@content');assert dates and dates[0][:10]==q['publishedOn']
  return q['source']
 raise AssertionError(kind)
def main():
 data=json.loads((R/'cloture-frases/frases-validees.json').read_text());allcards=json.loads((R/'censo.json').read_text())['cards']+json.loads((R/'ampliacion-340/seleccion.json').read_text())['cards'];cards={c['id']:c for c in allcards};seen=set();originals=set();ids=set();sources=set();words=collections.Counter()
 js="const c=require('./js/orator-catalog.js'),r=require('./_dev/expansions/reserva-espana/prepare.cjs');process.stdout.write(JSON.stringify([...c.cards,...r.sourceCards].flatMap(c=>c.q)));";old={norm(q)for q in json.loads(subprocess.check_output(['node','-e',js],cwd=R.parents[2]))}
 for c in data['cards']:
  assert c['id']in cards and c['id']not in ids;assert c['name']==cards[c['id']]['name'];ids.add(c['id']);assert len(c['candidates'])==3
  assert [q['action']for q in c['candidates']]==['normal','strong','support']
  for q in c['candidates']:
   assert norm(q['originalFR'])not in originals,(c['id'],q['originalFR'],'duplicate French fragment');originals.add(norm(q['originalFR']))
   assert 1<=len(q['textES'])<=47,(c['id'],len(q['textES']));assert norm(q['textES'])not in seen|old,(c['id'],q['textES'],'duplicate');seen.add(norm(q['textES']))
   assert q['toneReview']=='reviewed'and q['sourceCheck']=='original_y_hablante_revisados';assert q['ownTranslation']and q['sourceLanguage']=='fr';assert q['gameActions']==data['actions'][q['action']]
   assert q['adaptation']['thirdPartySubstitutions']==[];assert '1986-11-05'<=(q.get('spokenOn')or q.get('publishedOn'))<='2026-11-05'
   sources.add(check(c,q));doc=q.get('physicalDocument',q['source']);words[doc]+=len(q['originalFR'].split())+len(q['textES'].split())
 missing=[{'id':c['id'],'name':c['name']}for c in allcards if c['id']not in ids]
 assert data['enabled']is False
 report={'status':'passed','registrySha256':hashlib.sha256((R/'cloture-frases/frases-validees.json').read_bytes()).hexdigest(),'validatorSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'attributionParserSha256':hashlib.sha256((R/'cloture-frases/attribution.py').read_bytes()).hexdigest(),'homonymSourcePolicySha256':hashlib.sha256((R/'cloture-frases/homonym-source-policy.json').read_bytes()).hexdigest(),'homonymOfficeEvidenceChecked':True,'profilesReviewed':len(ids),'phrasesReviewed':len(seen),'profilesPending':len(missing),'distinctSourcesChecked':len(sources),'allSourceHashesAndSpeakingTurnsChecked':True,'maxSpanishLength':47,'duplicatesWithPublicOrSpanishReserve':False,'enabled':False,'integratedCards':0,'missing':missing};(R/'cloture-frases/qa').mkdir(exist_ok=True);(R/'cloture-frases/qa/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items()if k!='missing'},ensure_ascii=False))
 if args.require_complete:assert not missing, f'{len(missing)} perfiles todavía sin cierre editorial; no se puede marcar Francia como terminada.'
if __name__=='__main__':main()
