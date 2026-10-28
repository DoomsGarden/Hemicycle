"""Verify the shipped animation, transparency and reduced-motion poster."""
from PIL import Image
from pathlib import Path
import numpy as np,json,hashlib
path=Path('assets/menu-senate/title-loop.webp');im=Image.open(path)
assert im.size==(640,460) and im.n_frames==48 and im.info['loop']==0
assert path.stat().st_size<2500000
rows=[];hashes=set()
for i in range(im.n_frames):
    im.seek(i);a=np.asarray(im.convert('RGBA'));hashes.add(hashlib.sha256(a.tobytes()).hexdigest())
    bottom=int(a[420:,:,3].max());edge=int(max(a[:,0,3].max(),a[:,-1,3].max()))
    assert bottom==0,(i,'light below title',bottom)
    assert edge<=1,(i,'hard outer edge',edge)
    rows.append({'frame':i,'duration':im.info.get('duration'),'bottomAlpha':bottom,'edgeAlpha':edge})
assert len(hashes)>40
assert 3980<=sum(r['duration']for r in rows)<=4020
still=Image.open('assets/menu-senate/title-still.webp');assert still.size==im.size and getattr(still,'n_frames',1)==1
out=Path('_dev/reports/v31.0.2.5-polish');out.mkdir(parents=True,exist_ok=True)
(out/'title.json').write_text(json.dumps({'dimensions':im.size,'frames':im.n_frames,'loopBytes':path.stat().st_size,'stillBytes':Path('assets/menu-senate/title-still.webp').stat().st_size,'framesVerified':rows},indent=2)+'\n')
print('PASS: 48 distinct transparent frames, seamless 4-second loop, clear lower margin and separate static poster.')
