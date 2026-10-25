import urllib.request, hashlib, json, concurrent.futures, pathlib
root=pathlib.Path(__file__).resolve().parents[2]
base='https://doomsgarden.github.io/Hemicycle/'
files=['index.html','sw.js','js/changelog.js','js/economy-client.js','js/cloud-save.js','js/cloud-ui.js','js/offline-combat.js','js/offline-rules.js','js/result-transition.js','js/online-combat-ui.js','js/online-ui.js','js/market-ui.js','js/market-rules.js','js/player-profile.js','js/player-backup.js','css/result-transition.css','css/profile.css','assets/results/victory.webp','assets/results/victory-still.webp','assets/results/defeat.webp','assets/results/defeat-still.webp']
def check(file):
 data=urllib.request.urlopen(base+file+'?release=31.0.2.0',timeout=30).read()
 digest=hashlib.sha256(data).hexdigest(); assert digest==hashlib.sha256((root/file).read_bytes()).hexdigest(),file+' does not match'
 return {'file':file,'bytes':len(data),'sha256':digest,'matches':True}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: results=list(pool.map(check,files))
out=root/'_dev/reports/v31.0.2.0-live';out.mkdir(parents=True,exist_ok=True)
(out/'assets.json').write_text(json.dumps({'url':base,'visibleVersion':'v31.0.2.0','httpsVerified':True,'assets':results},indent=2)+'\n')
print('PASS: 21 published assets match the approved runtime, including both animated WebP scenes; normal TLS validation.')
