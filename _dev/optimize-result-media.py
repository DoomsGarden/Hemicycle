from PIL import Image,ImageSequence
from pathlib import Path
import json,math,io,subprocess,argparse
parser=argparse.ArgumentParser();parser.add_argument("--output",required=True);args=parser.parse_args();Path(args.output).mkdir(parents=True,exist_ok=True)
results=[]
for name in ['victory','defeat']:
 src=Path('assets/results')/(name+'.webp');original=subprocess.check_output(['git','show','1cdfa65:'+str(src)]);im=Image.open(io.BytesIO(original)); frames=[];durations=[]
 for i in range(im.n_frames):
  im.seek(i);im.load();frames.append(im.convert('RGB').resize((480,720),Image.Resampling.LANCZOS));durations.append(im.info.get('duration',67))
 total=sum(durations);ends=[];at=0
 for d in durations:at+=d;ends.append(at)
 chosen=[];i=0
 for t in range(0,total,100):
  while i<len(ends)-1 and ends[i]<=t:i+=1
  chosen.append(frames[i])
 out=Path(args.output)/(name+'.webp');chosen[0].save(out,format='WEBP',save_all=True,append_images=chosen[1:],duration=[min(100,total-t) for t in range(0,total,100)],loop=0,quality=64,method=5)
 chosen[0].save(str(Path(args.output)/(name+'-sample.jpg')),quality=93)
 results.append({'name':name,'before':len(original),'after':out.stat().st_size,'originalFrames':len(frames),'frames':len(chosen),'durationMs':total,'size':[480,720]})
print(json.dumps(results,indent=2))
(Path(args.output)/'media.json').write_text(json.dumps(results,indent=2))
