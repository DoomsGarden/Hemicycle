"""Apply the shared reading factor to absolute font sizes, preserving inheritance."""
from pathlib import Path
import re,sys
root=Path(__file__).resolve().parents[1]
def scale(css):
 def size(m):
  value=m[2]
  if '--ui-text-scale' in value or '--nav-label' in value or not re.search(r'(?:px|vw|vh|cqi|dvh)\b',value):return m[0]
  suffix=' !important' if '!important' in value else ''
  return m[1]+'calc('+value.replace('!important','').strip()+' * var(--ui-text-scale,1))'+suffix
 css=re.sub(r'(font-size\s*:\s*)([^;{}]+)',size,css)
 def shorthand(m):
  value=m[2]
  if '--ui-text-scale' in value:return m[0]
  token=re.search(r'(?:clamp|calc|min|max)\(|\d+(?:\.\d+)?(?:px|vw|vh|cqi|dvh)\b',value)
  if not token:return m[0]
  end=token.end()
  if value[end-1]=='(':
   depth=1
   while end<len(value) and depth:
    depth+=(value[end]=='(')-(value[end]==')');end+=1
  base=value[token.start():end]
  return m[1]+value[:token.start()]+'calc('+base+' * var(--ui-text-scale,1))'+value[end:]
 return re.sub(r'(\bfont\s*:\s*)([^;{}]+)',shorthand,css)
changed=[]
for path in [*sorted((root/'css').glob('*.css')),root/'index.html']:
 before=path.read_text();after=re.sub(r'(<style>)(.*?)(</style>)',lambda m:m[1]+scale(m[2])+m[3],before,flags=re.S) if path.name=='index.html' else scale(before)
 if before!=after:
  changed.append(str(path.relative_to(root)))
  if '--check' not in sys.argv:path.write_text(after)
if '--check' in sys.argv and changed:raise SystemExit('Unscaled font declarations: '+', '.join(changed))
print('Reading scale:',len(changed),'files updated' if '--check' not in sys.argv else 'unscaled files')
