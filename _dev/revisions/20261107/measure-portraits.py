"""Geometry-only visual analysis; no portrait pixels are edited or exported."""
from pathlib import Path
from functools import lru_cache
import concurrent.futures,json,threading
import cv2,numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[3];folder=Path(__file__).parent
cards=json.loads((folder/'catalog-before.json').read_text());art=json.loads((folder/'art-before.json').read_text());jobs=json.loads((folder/'art-jobs.json').read_text())['jobs']+json.loads((folder/'gaze-art-jobs.json').read_text())['jobs']
for job in jobs:
 if job['status'].startswith('generated') and (root/job['target']).exists():
  for i,identity in enumerate(job['ids']):art[identity]={'url':job['target'],'position':f'{(i%2)*100}% {(i//2)*100}%'}
cv2.setNumThreads(1);local=threading.local()
@lru_cache(maxsize=32)
def image(file):return np.array(Image.open(root/file).convert('RGB'))
def measure(c):
 if not hasattr(local,'cascade'):local.cascade=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml')
 entry=art.get(c['id']);im=image(entry['url'] if entry else 'cards/'+c['id']+'.webp')
 if entry:
  h,w=im.shape[:2];x=1 if entry['position'].split()[0]=='100%' else 0;y=1 if entry['position'].split()[1]=='100%' else 0;im=im[y*h//2:(y+1)*h//2,x*w//2:(x+1)*w//2]
 h,w=im.shape[:2];g=cv2.cvtColor(im,cv2.COLOR_RGB2GRAY);faces=local.cascade.detectMultiScale(g,scaleFactor=1.06,minNeighbors=5,minSize=(max(30,w//9),max(30,h//9)))
 found=max(faces,key=lambda r:r[2]*r[3],default=None)
 return {'id':c['id'],'original':entry is None,'source':entry or {'url':'cards/'+c['id']+'.webp'},'face':None if found is None else [round(float(v)/([w,h,w,h][i]),5) for i,v in enumerate(found)]}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(measure,cards))
base=[r['face'] for r in rows if r['original'] and r['face']]
target={'width':float(np.median([b[2] for b in base])),'height':float(np.median([b[3] for b in base])),'y':float(np.median([b[1] for b in base]))}
for row in rows:
 b=row['face']
 if row['original']:row['framing']={'scale':1,'x':0,'y':0}
 elif b:
  scale=1.0 if b[3]<=target['height']*1.10 else float(np.clip(target['height']/b[3],.58,1.0));row['framing']={'scale':round(scale,4),'x':0 if scale==1 else round(float(np.clip(.5-(b[0]+b[2]/2)*scale,0,1-scale)),4),'y':0 if scale==1 else round(float(np.clip(target['y']-b[1]*scale,0,.14)),4)}
 else:row['framing']={'scale':.82,'x':.09,'y':.11,'manualReviewRequired':True}
overrides=json.loads((folder/'portrait-framing-overrides.json').read_text())
for row in rows:
 if row['id'] in overrides:row['framing']=overrides[row['id']]
(folder/'portrait-geometry.json').write_text(json.dumps({'reference':'Median detected face of the 120 original portraits; geometry only, not gaze certification.','target':target,'cards':rows},ensure_ascii=False,indent=2)+'\n')
print('Measured',sum(r['face'] is not None for r in rows),'/',len(rows),'target',target)
for id in ['barack-obama','ander-gil-garcia','carlos-cuerpo-caballero','francois-hollande']:
 r=next(r for r in rows if r['id']==id);print(id,r['face'],r['framing'])
