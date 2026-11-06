"""Extract literal fragments inside identified turns. Output is unreviewed research."""
from pathlib import Path
from lxml import html
from attribution import speaker_marker,spoken_text,is_editorial_excerpt,is_session_date_heading
import argparse,collections,json,re,unicodedata,hashlib
R=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,required=True);a=p.parse_args();D=a.cache
cards=json.loads((R/'censo.json').read_text())['cards']+json.loads((R/'ampliacion-340/seleccion.json').read_text())['cards']
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower())if c.isalnum())
def clean(s):return ' '.join(s.replace('\x92',"'").split())
byname={norm(c['name']):c for c in cards};first={c['id']for c in json.loads((R/'censo.json').read_text())['cards']}
months=dict(zip(['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'],range(1,13)))
def dateof(t):
 m=re.search(r'\b(\d{1,2})(?:er)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})\b',t,re.I)
 if m:return f'{m[3]}-{months[norm(m[2])]:02}-{int(m[1]):02}'
def who(s):
 name=re.sub(r'^(?:Mme|MM|M)\.?\s+','',s).split(',')[0].split(' (')[0].strip(' .-–—')
 return byname.get(norm(name))
def clauses(t):
 if t.count('«')!=t.count('»')or t.count('“')!=t.count('”')or t.count('"')%2:return []
 quoted=[m.span()for m in re.finditer(r'«[^»]*»|“[^”]*”|"[^"]*"',t)]
 out=[];offset=0
 for raw in re.split(r'(?<=[.!?;:])(?:\s+|(?=[A-ZÀ-ÖØ-Ý]))',t):
  pos=t.find(raw,offset);offset=pos+len(raw)
  if any(pos<b and offset>a for a,b in quoted):continue
  s=raw.strip(' ,;:–—-')
  # Archives sometimes store an entire speech, including its source URL,
  # in one field without <p>. Reject references per sentence, not per document.
  if re.search(r'https?://|comme le (?:dit|disait)|selon |cit(?:e|ait|er)\b',s,re.I):continue
  if not 16<=len(s)<=88 or not 3<=len(s.split())<=15:continue
  if re.search(r'\d',s)or re.search(r'\b(?:M|Mme|MM)\.$',s):continue
  proper=re.findall(r'\b[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ-]+',s)[1:]
  if any(x not in ['France','Europe','État','Etat','République','Sénat','Gouvernement','Parlement','Union','Constitution','Français']for x in proper):continue
  out.append(s)
 return out
out=collections.defaultdict(list);docs={};errors=[]
identity_policy=json.loads((R/'cloture-frases/homonym-source-policy.json').read_text())['people']
def add(card,t,source,paragraph,check,day):
 if not card or not day or not '1986-11-05'<=day<='2026-11-05':return
 if card['id']in identity_policy and not any(d['sourceSha256']==source['sha256']and d['cacheKey']==source['cacheKey']and d['spokenOn']==day for d in identity_policy[card['id']]['approvedDocuments']):return
 for s in clauses(t):
  attack=len(re.findall(r'\b(?:pas|jamais|aucun|faute|échec|mensonge|inacceptable|impossible|erreur|refus|inadmissible|contre|grave|faux|désaccord|raison)\b',s,re.I));support=len(re.findall(r'\b(?:ensemble|confiance|solidarité|protéger|défendre|soutien|liberté|droits|respect|avenir|réussir|aider|protection|espoir|merci|dialogue)\b',s,re.I))
  out[card['id']].append({'originalFR':s,**source,'spokenOn':day,'paragraphIndex':paragraph,'speakerCheck':check,'contextFR':t[max(0,t.find(s)-160):t.find(s)+len(s)+160],'contextIsExcerpt':True,'attackScore':attack,'supportScore':support,'status':'unreviewed_literal_candidate'})
index=json.loads((D/'senate-index.json').read_text())if(D/'senate-index.json').exists()else[]
for item in index:
 for source in item['sources']:
  if 'error'in source or source['sha256']in docs:continue
  docs[source['sha256']]=source
  try:
   raw=(D/'senate'/source['cacheKey']).read_bytes();assert hashlib.sha256(raw).hexdigest()==source['sha256'];root=html.fromstring(raw.decode('utf-8',errors='replace'));day=None;dateLabel=None;owner=None;speaker=None;pi=-1
   meta={k:source[k]for k in ['url','title','cacheKey','sha256']};meta['sourceType']='senat_turn'
   # Session pages date the intervention in their heading/title.
   if source['title'].startswith('SEANCE du'):day=dateof(source['title']);dateLabel=source['title']
   for e in root.xpath('//p|//h1|//h2|//h3|//h4|//h5'):
    t=clean(e.text_content())
    if is_session_date_heading(t):
     d=dateof(t)
     if d:day=d;dateLabel=t
    if e.tag!='p':continue
    pi+=1
    if e.xpath('ancestor::footer|ancestor::nav|ancestor::header'):
     owner=None;continue
    marker=speaker_marker(e)
    if marker:speaker=marker[0];owner=who(speaker);t=t[marker[1]:].lstrip(' .-–—')
    t=spoken_text(e)
    if marker:t=t[marker[1]:].lstrip(' .-–—')
    before=len(out[owner['id']])if owner else 0
    add(owner,t,meta,pi,{'speakerFR':speaker,'dateLabelFR':dateLabel,'method':'named_parliamentary_turn'},day)
    if owner:out[owner['id']][before:]=[q for q in out[owner['id']][before:]if not is_editorial_excerpt(e,q['originalFR'])]
  except Exception as e:errors.append({'source':source['url'],'error':str(e)})
index=json.loads((D/'speech-index.json').read_text())if(D/'speech-index.json').exists()else[]
for item in index:
 for source in item['sources']:
  if 'error'in source or source['sha256']in docs:continue
  docs[source['sha256']]=source
  try:
   raw=(D/'speeches'/source['cacheKey']).read_bytes();assert hashlib.sha256(raw).hexdigest()==source['sha256'];root=html.fromstring(raw);nodes=root.xpath('//*[contains(@class,"field--name-field-texte-integral")]')
   if not nodes:continue
   node=nodes[0]
   for tooltip in node.xpath('.//*[@role="tooltip"]|.//script|.//style'):tooltip.drop_tree()
   authors=[clean(x.text_content())for x in root.xpath('//*[contains(@class,"vp-intervenant")]//a')];date=root.xpath('//*[contains(@class,"field--name-field-date-prononciation-discour")]//time/@datetime');day=date[0][:10]if date else None
   owner=who(authors[0])if len(authors)==1 else None
   if not owner:continue
   meta={k:source[k]for k in ['url','title','cacheKey','sha256']};meta['sourceType']='vie_publique_declaration'
   if re.search(r'^Conseil des ministres|^Compte rendu du Conseil|^Communiqué du Conseil',source['title'],re.I):continue
   if re.search(r'interview|entretien',source['title'],re.I)or re.search(r'(?<!\w)Q\s*[.:]?\s*[-–—:]\s*',clean(node.text_content())):
    text=clean(node.text_content());markers=list(re.finditer(r'(?<!\w)(QUESTION|RÉPONSE|REPONSE|LE PRESIDENT|LE PRÉSIDENT|Q|R)\s*[.:]?\s*[-–—:]\s*',text))
    for i,m in enumerate(markers):
     if norm(m[1])not in ['r','reponse','lepresident']:continue
     segment=text[m.end():markers[i+1].start()if i+1<len(markers)else len(text)]
     add(owner,segment,meta,i,{'method':'interview_explicit_answer','authors':authors,'answerMarker':m[0],'answerIndex':i},day)
    continue
   if re.search(r'table ronde|audition',source['title'],re.I):continue
   current=owner;speaker=authors[0];paragraphs=node.xpath('.//p')
   if not paragraphs:paragraphs=[node]
   for pi,e in enumerate(paragraphs):
    text=clean(e.text_content());marker=speaker_marker(e)
    if marker:speaker=marker[0];current=who(speaker);text=text[marker[1]:].lstrip(' .-–—')
    if re.match(r'^(?:QUESTION|Q[. ]|RÉPONSE DU JOURNALISTE)',text):current=None
    add(current,text,meta,pi,{'method':'single_named_declaration_with_turn_boundaries','authors':authors,'speakerFR':speaker},day)

  except Exception as e:errors.append({'source':source['url'],'error':str(e)})

index=json.loads((D/'assembly-records.json').read_text())if(D/'assembly-records.json').exists()else[]
for source in index:
 if 'error'in source:continue
 docs[source['sha256']]=source
 try:
  raw=(D/'assembly'/source['cacheKey']).read_bytes();assert hashlib.sha256(raw).hexdigest()==source['sha256'];root=html.fromstring(raw.decode('utf-8'));day=dateof(source['title'])
  meta={k:source[k]for k in ['url','title','cacheKey','sha256']};meta['sourceType']='assemblee_named_intervention'
  for turn in root.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," crs-inter ")]'):
   speakers=turn.xpath('.//p[@class="orateur"]')
   if len(speakers)!=1:continue
   speaker=clean(speakers[0].text_content());owner=who(speaker)
   if not owner:continue
   for pi,e in enumerate(turn.xpath('./p')):
    if e.get('class')=='orateur':continue
    # Stage directions are not spoken words; exclude their contents.
    for annotation in e.xpath('.//i|.//em'):annotation.drop_tree()
    add(owner,clean(e.text_content()),meta,pi,{'method':'assembly_intervention_id','speakerFR':speaker,'interventionId':turn.get('id'),'titleDate':source['title']},day)
 except Exception as e:errors.append({'source':source['url'],'error':str(e)})
result={}
for id,qs in out.items():
 seen=set();unique=[]
 for q in qs:
  n=norm(q['originalFR'])
  if n not in seen:seen.add(n);unique.append(q)
 result[id]={'total':len(unique),'attack':sorted(unique,key=lambda x:(-x['attackScore'],abs(len(x['originalFR'])-40)))[:10],'support':sorted(unique,key=lambda x:(-x['supportScore'],abs(len(x['originalFR'])-40)))[:8],'all':unique}
(D/'turn-candidates.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'documents':len(docs),'profilesWithLiteralCandidates':len(result),'fragments':sum(x['total']for x in result.values()),'errors':errors},ensure_ascii=False))
