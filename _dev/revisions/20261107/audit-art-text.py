"""OCR analysis only; no game illustration is edited."""
import json,subprocess,concurrent.futures,os
from pathlib import Path
root=Path(__file__).resolve().parents[3];folder=Path(__file__).parent
old=json.loads((folder/'art-before.json').read_text());files=sorted(set(x['url'] for x in old.values()));env={**os.environ,'OMP_THREAD_LIMIT':'1'}
def read(file):
 run=subprocess.run(['tesseract',str(root/file),'stdout','--psm','11'],env=env,capture_output=True,text=True)
 return {'file':file,'text':run.stdout,'error':run.stderr if run.returncode else None}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(read,files))
(folder/'qa/atlas-text-audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print('Analysed',len(rows),'atlases;',sum(bool(r['error']) for r in rows),'OCR errors')
