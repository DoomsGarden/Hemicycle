"""Import explicit reviewed selections from named interviews, official PDFs and signed posts."""
from pathlib import Path
import argparse, copy, hashlib, json, subprocess
from lxml import html
from legacy_assembly import legacy_turns
from blog_source import signed_post

p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,required=True);p.add_argument('--decisions',type=Path,required=True);a=p.parse_args()
Q=Path(__file__).resolve().parent;data=json.loads((Q/'frases-validees.json').read_text());by={c['id']:c for c in data['cards']}
template=by['louis-mapou']['candidates'][0]
for decision in json.loads(a.decisions.read_text()):
    candidates=[]
    for selection in decision['quotes']:
        action,index,fr,es,*overrides=selection
        assert 1<=len(es)<=47
        q=copy.deepcopy(template)
        for k in ['speechDateEvidence','publishedOn','paragraphIndex']:
            q.pop(k,None)
        q.update({k:v for k,v in decision.items()if k not in ['id','name','quotes','contextSummaryES']})
        q.update(action=action,originalFR=fr,textES=es,gameActions=data['actions'][action])
        q['speakerCheck']=copy.deepcopy(decision['speakerCheck'])
        if overrides:q.update(copy.deepcopy(overrides[0]))
        if q['sourceType']=='official_pdf_speech':
            q['pageIndex']=index;raw=(a.cache/'pdf'/q['cacheKey']).read_bytes()
            text=subprocess.check_output(['pdftotext','-layout',str(a.cache/'pdf'/q['cacheKey']),'-']).decode().split('\f')[index]
        elif q['sourceType']=='signed_blog_post':
            raw=(a.cache/'press'/q['cacheKey']).read_bytes()
            text,published=signed_post(html.fromstring(raw.decode('utf-8')),q['speakerCheck']['postId'],decision['name'])
            assert published==q['publishedOn']
        elif q['sourceType']=='assemblee_legacy_turn':
            q['paragraphIndex']=index;raw=(a.cache/'assembly'/q['cacheKey']).read_bytes()
            turn=next(t for t in legacy_turns(html.fromstring(raw))if t[0]==index)
            from attribution import canonical_name
            assert turn[1]==canonical_name(decision['name']);text=turn[2]
        else:
            assert q['sourceType']=='vie_publique_declaration'and q['speakerCheck']['method']=='interview_named_answer'
            q['paragraphIndex']=index;raw=(a.cache/'speeches'/q['cacheKey']).read_bytes();root=html.fromstring(raw)
            node=root.xpath('//*[contains(@class,"field--name-field-texte-integral")]')[0]
            for e in node.xpath('.//*[@role="tooltip"]|.//script|.//style'):e.drop_tree()
            text=node.xpath('.//p')[index].text_content()
        assert hashlib.sha256(raw).hexdigest()==q['sourceSha256']
        assert fr in ' '.join(text.split()),fr
        q['editorialReview']['tone']='Acción y traducción seleccionadas tras leer el contexto individual.'
        candidates.append(q)
    by[decision['id']]={'id':decision['id'],'name':decision['name'],'contextSummaryES':decision['contextSummaryES'],'candidates':candidates}
data['cards']=list(by.values());data['progress']={'profilesReviewed':len(by),'phrasesReviewed':len(by)*3,'profilesPending':440-len(by),'integratedCards':0}
(Q/'frases-validees.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print(data['progress'])
