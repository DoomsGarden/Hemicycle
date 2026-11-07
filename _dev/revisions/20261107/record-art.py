"""Record generated artwork and encode WebP without resizing or repainting."""
import hashlib,json,sys
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[3]
p=Path(__file__).with_name('art-jobs.json');data=json.loads(p.read_text())
for entry in json.loads(sys.argv[1]):
 job=data['jobs'][entry['index']];source=Path(entry['generated']);image=Image.open(source)
 if job.get('generated') and job['generated']!=str(source):job.setdefault('generationHistory',[]).append({'generated':job['generated'],'sha256':job.get('sha256')})
 if abs(image.width/image.height-.75)>.015: raise ValueError('Unexpected atlas aspect ratio')
 target=root/job['target'];target.parent.mkdir(parents=True,exist_ok=True)
 image.save(target,'WEBP',quality=90,method=4)
 job.update(status='generated_pending_visual_review',generated=str(source),sha256=hashlib.sha256(target.read_bytes()).hexdigest(),dimensions=[image.width,image.height],bytes=target.stat().st_size)
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Recorded',len(json.loads(sys.argv[1])),'atlases;',sum(j['status']!='pending' for j in data['jobs']),'/',len(data['jobs']))
