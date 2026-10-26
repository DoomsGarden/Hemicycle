"""Rebuild outlined lettering from the bundled OFL Anton font; no runtime fonts."""
from pathlib import Path
import re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
root=Path(__file__).resolve().parents[1]
font=TTFont(root/'fonts/Anton-Regular.ttf');glyphs=font.getGlyphSet();cmap=font.getBestCmap();units=font['head'].unitsPerEm
labels={'diario':'DIARIO','semanal':'SEMANAL','comun':'COMÚN','raro':'RARO','legendario':'LEGENDARIO','mitico':'MÍTICO'}
for kind,label in labels.items():
 def line(text,baseline,size,width):
  pen=SVGPathPen(glyphs);x=0
  for char in text:
   name=cmap[ord(char)];glyphs[name].draw(TransformPen(pen,(1,0,0,1,x,0)));x+=font['hmtx'][name][0]
  scale=min(size/units,width/x)
  return f'<path transform="translate({110-x*scale/2:.3f} {baseline}) scale({scale:.6f} {-scale:.6f})" d="{pen.getCommands()}"/>'
 ink={'mitico':'#f4d0ff','legendario':'#ffe8a4','raro':'#c4eaff','semanal':'#c4eaff'}.get(kind,'#e4e8ef')
 art=root/f'assets/packs/{kind}.svg';svg=art.read_text();svg=re.sub(r'\n?<!-- outlined lettering -->.*?<!-- /outlined lettering -->','',svg,flags=re.S)
 block=f'<!-- outlined lettering --><g aria-hidden="true"><rect x="26" y="207" width="168" height="26" rx="3" fill="#08101b" opacity=".85"/><g fill="{ink}">'+line('HEMICICLO',228,26,164)+line(label,249,19,142)+'</g></g><!-- /outlined lettering -->'
 art.write_text(svg.replace('</svg>',block+'\n</svg>'))
