"""Validate the PNG headers and package exports; does not edit image pixels."""
import json,struct,pathlib,hashlib,zipfile
root=pathlib.Path(__file__).resolve().parents[2]
paths=sorted(root.glob('press/google-play/es-ES/*.png'))
assert len(paths)==7
files=[]
for p in paths:
    data=p.read_bytes()
    assert data[:8]==b'\x89PNG\r\n\x1a\n'
    width,height,depth,colour=struct.unpack('>IIBB',data[16:26])
    assert (width,height,depth,colour)==(1080,1920,8,2),p
    assert len(data)<8*1024*1024,p
    files.append({'file':str(p.relative_to(root/'press')),'width':width,'height':height,'format':'PNG RGB 24-bit sin transparencia','bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
manifest={'game':'Hemiciclo','gameVersion':'v31.0.2.6','language':'es-ES','date':'2026-10-29','scope':'Pantallas reales del juego con progreso local de demostración y diseño promocional exterior. Sin datos de cuentas reales.','files':files}
(root/'press/capturas-es.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
notes='HEMICICLO — 7 CAPTURAS PROMOCIONALES\n\nEspañol · 1080 × 1920 · PNG RGB 24-bit sin transparencia.\nOrden: Inicio, Combate, Colección, Gabinete, Sobres, Liga y Mercado.\nInterfaz real con estado de demostración; diseño promocional exterior.\nJuego: https://hemicycle.online/\nPara subir a la tienda, utiliza estos PNG y conserva sus dimensiones.\nLas vistas pequeñas de GitHub son solo previsualizaciones.\n'
with zipfile.ZipFile(root/'press/hemiciclo-capturas-es.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in paths:z.write(p,p.name)
    z.writestr('LEEME.txt',notes)
    z.write(root/'press/capturas-es.json','capturas-es.json')
with zipfile.ZipFile(root/'press/hemiciclo-capturas-es.zip') as z:
    assert z.testzip() is None
    assert len(z.namelist())==9
print('PASS: seven RGB PNGs, 1080×1920, no alpha, each below 8 MiB; ZIP verified.')
