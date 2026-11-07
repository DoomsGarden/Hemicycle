"""Encode generated artwork unchanged; keep original PNG and source attribution."""
from pathlib import Path
from PIL import Image
import sys,json,hashlib
root=Path(__file__).resolve().parents[3];manifest=Path(__file__).with_name('gaze-art-jobs.json');data=json.loads(manifest.read_text())
for arg in sys.argv[1:]:
 index,source=arg.split(':',1);job=data['jobs'][int(index)];src=Path(source);dest=root/job['target'];im=Image.open(src);
 if job.get('generated') and job['generated']!=str(src):job.setdefault('generationHistory',[]).append({'generated':job['generated'],'sha256':job.get('sha256'),'brandStatus':job.get('brandStatus')})
 im.save(dest,quality=92,method=6);job.update(status='generated_pending_visual_review',generated=str(src),dimensions=list(im.size),sha256=hashlib.sha256(dest.read_bytes()).hexdigest())
manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
