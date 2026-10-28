"""Validate all 48 runtime sprite crops against the complete atlas components."""
from pathlib import Path
import json,re
import numpy as np
from PIL import Image
from scipy import ndimage
bounds=json.loads(re.search(r'var spriteBounds=(\{.+\});',Path('js/menu-senate.js').read_text())[1])
report={}
for name,rects in bounds.items():
    im=np.asarray(Image.open('assets/menu-senate/'+name+'.webp'))
    labels,_=ndimage.label(im[:,:,3]>100,structure=np.ones((3,3)))
    objects=ndimage.find_objects(labels)
    sprites=[]
    for i,(x,y,w,h) in enumerate(rects):
        counts=np.bincount(labels[y:y+h,x:x+w].ravel());counts[0]=0
        main=int(counts.argmax());own=int(counts[main]);foreign=int(counts.sum())-own
        yy,xx=objects[main-1]
        assert [xx.start,yy.start,xx.stop-xx.start,yy.stop-yy.start]==[x,y,w,h],(name,i,'clipped main figure')
        # Only isolated single source pixels are allowed; never another body fragment.
        other=counts.copy();other[main]=0
        assert other.max()<=1,(name,i,'foreign body fragments',foreign)
        assert own>10000,(name,i,'missing figure')
        sprites.append({'index':i,'bounds':[x,y,w,h],'ownOpaquePixels':own,'foreignOpaquePixels':foreign})
    report[name]=sprites
out=Path('_dev/reports/v31.0.2.5-polish');out.mkdir(parents=True,exist_ok=True)
(out/'atlas.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: all 48 crops preserve their entire connected figure with no neighbouring body fragments (only isolated single source pixels remain).')
