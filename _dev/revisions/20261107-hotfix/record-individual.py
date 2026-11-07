"""Encode a newly generated single portrait; never crop, resize or paint it."""
from pathlib import Path
from PIL import Image
import sys,json,hashlib,fcntl,datetime
root=Path(__file__).resolve().parents[3]
manifest=Path(__file__).with_name('individual-portraits.json')
if len(sys.argv)>1 and sys.argv[1]=='--original':
 sys.argv.pop(1);manifest=Path(__file__).with_name('original-individual-portraits.json')
with open('/tmp/hemicycle-individual-portraits.lock','w') as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 data=json.loads(manifest.read_text())
 if sys.argv[1]=='--reserve':
  control=Path(__file__).with_name('generation-control.json')
  if control.exists() and json.loads(control.read_text()).get('pause'):
   print('[]');sys.exit(0)
  allowed=set(json.loads(Path(sys.argv[3]).read_text())) if len(sys.argv)>3 else None
  jobs=[j for j in data['jobs'] if j['status']=='pending' and (allowed is None or j['source'] in allowed)][:int(sys.argv[2])]
  for job in jobs:job.update(status='generating',startedAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
  manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print(json.dumps([{k:j[k] for k in ['id','name','country','rarity','source','quadrant','target']} for j in jobs],ensure_ascii=False));sys.exit(0)
 if sys.argv[1]=='--failed':
  job=next(j for j in data['jobs'] if j['id']==sys.argv[2]);job.update(status='blocked',error=sys.argv[3]);manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');sys.exit(0)
 if sys.argv[1]=='--unreserve':
  ids=set(json.loads(sys.argv[2]))
  for job in data['jobs']:
   if job['id'] in ids and job['status']=='generating':job['status']='pending'
  manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');sys.exit(0)
 speaker,source,prompt=sys.argv[1:4]
 job=next(j for j in data['jobs'] if j['id']==speaker)
 image=Image.open(source)
 if image.width*4!=image.height*3:raise ValueError('Generated portrait must be exactly 3:4, without cropping or stretching')
 target=root/job['target'];target.parent.mkdir(parents=True,exist_ok=True);image.save(target,quality=91,method=6)
 if job.get('generated') and job['generated']!=source:job.setdefault('generationHistory',[]).append({k:job.get(k) for k in ['generated','prompt','sha256','visualReview','reviewIssue']})
 job.update(status='generated_pending_review',generated=source,prompt=prompt,dimensions=list(image.size),sha256=hashlib.sha256(target.read_bytes()).hexdigest())
 manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 print(speaker,'encoded, exact 3:4, pending visual review')
