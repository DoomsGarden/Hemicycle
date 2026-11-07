"""Record manual visual review of an exact, hashed browser snapshot."""
import json,sys,fcntl,hashlib,datetime
from pathlib import Path
base=Path(__file__).resolve().parent
root=base.parents[2]
report_path=base/'qa'/sys.argv[1]
report=json.loads(report_path.read_text())
held=set(json.loads(sys.argv[2])) if len(sys.argv)>2 else set()
seen={x['id'] for x in report['portraits']}
assert held <= seen, 'Hold IDs must belong to the reviewed report'
assert report['neighbourLeakFailures']==0 and not report['errors']
assert all((base/'qa'/s['file']).exists() for s in report['sheets'])
with open('/tmp/hemicycle-individual-portraits.lock','w') as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 files=[base/'individual-portraits.json',base/'original-individual-portraits.json']
 docs=[json.loads(f.read_text()) for f in files]
 by={j['id']:j for d in docs for j in d['jobs']}
 approved=[];changed=[]
 for item in report['portraits']:
  j=by[item['id']]
  if j['sha256']!=item['sha256']:changed.append(j['id']);continue
  assert hashlib.sha256((root/j['target']).read_bytes()).hexdigest()==j['sha256']
  if j['id'] in held:
   j.update(status='needs_regeneration',reviewIssue='Manual visual review: gaze or composition requires correction.')
  else:
   j['status']='approved';j.pop('reviewIssue',None)
   j['visualReview']={'report':'qa/'+report_path.name,'allSheetsSeen':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'criteria':['original120 framing','continuous background','isolated individual portrait','natural off-camera gaze']}
   approved.append(j['id'])
 for f,d in zip(files,docs):f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'approved':len(approved),'held':list(held),'changedSinceReview':changed},ensure_ascii=False))
