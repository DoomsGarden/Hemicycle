"""Muestras originales de síntesis para revisión; no modifica el juego."""
from pathlib import Path
import base64
import hashlib
import json
import subprocess
import wave
import zipfile
import numpy as np
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'samples'
ASSETS.mkdir(exist_ok=True)
SR = 24000
STYLES = [
    ('a', 'Hemiciclo solemne', 'Madera, campanas suaves y armonías sobrias. La opción más cercana a la estética dorada del juego.', 84),
    ('b', 'Sátira ligera', 'Percusión de madera, pizzicatos y pequeños gestos cómicos. Más desenfadado, sin voces ni caricaturas personales.', 96),
    ('c', 'Duelo moderno', 'Pulsos electrónicos cálidos y señales precisas. Una lectura más competitiva del combate.', 108),
]
EVENTS = [
    ('ui', 'Botones y confirmaciones', 'Un toque breve para seleccionar o confirmar; no se repite al pasar el dedo.'),
    ('error', 'Acción no disponible', 'Aviso suave para una acción inválida, sin gastar la acción del cromo.'),
    ('card', 'Robar o presentar cromo', 'Deslizamiento y pequeño apoyo al colocar la carta.'),
    ('coin', 'Moneda de inicio', 'Giro y caída de la moneda. Misma señal gane quien gane.'),
    ('normal', 'Zasca normal', 'Golpe corto y legible para el ataque normal.'),
    ('strong', 'Zasca fuerte', 'Anticipación breve y golpe más grave que el normal.'),
    ('guard', 'Defensa', 'Escudo que se prepara; se puede reutilizar una versión corta al bloquear.'),
    ('heal', 'Curación', 'Tres notas ascendentes, cálidas y breves.'),
    ('expel', 'Orador al descarte', 'Caída corta para reconocer una expulsión sin dramatizarla demasiado.'),
    ('turn', 'Comienzo del turno propio', 'Dos notas para llamar la atención sin una alarma.'),
    ('timer', 'Últimos segundos', 'Muestra de tres pulsos. En el juego se limitaría a los últimos diez segundos.'),
    ('pack', 'Apertura de sobre', 'Papel, apertura y brillo de revelación. Evitaría sonidos largos en cada cromo.'),
    ('reward', 'Correo y recompensa', 'Señal corta para recoger un sobre o recibir una recompensa.'),
    ('victory', 'Victoria', 'Remate musical corto, reservado al final del combate.'),
    ('defeat', 'Derrota', 'Cierre sobrio, sin burla ni alarma.'),
    ('menu', 'Música del menú', 'Boceto instrumental de ocho compases, pensado para sonar muy bajo.'),
    ('battle', 'Música de combate', 'Boceto con algo más de pulso; deja espacio a los efectos y a la concentración.'),
    ('ambience', 'Ambiente del hemiciclo', 'Textura abstracta de sala, sin conversaciones ni palabras. Alternativa a la música.'),
]

def midi(n):
    return 440 * 2 ** ((n - 69) / 12)

def tone(freq, duration, kind='bell', gain=1, end=None):
    t = np.arange(int(SR * duration)) / SR
    if not len(t):
        return t
    f = freq if end is None else freq + (end - freq) * t / duration
    phase = 2 * np.pi * np.cumsum(np.broadcast_to(f, t.shape)) / SR
    if kind == 'wood':
        y = np.sin(phase) + .28 * np.sin(phase * 2.76) + .15 * np.sin(phase * 4.1)
        env = np.exp(-t * 19 / max(.3, duration))
    elif kind == 'pluck':
        y = np.sin(phase) + .3 * np.sin(2 * phase) + .12 * np.sin(3 * phase)
        env = np.exp(-t * 6 / duration)
    elif kind == 'soft':
        y = np.sin(phase) + .13 * np.sin(2 * phase)
        env = np.exp(-t * 3 / duration)
    elif kind == 'pad':
        y = np.sin(phase) + .18 * np.sin(2 * phase + .06 * np.sin(t * 4)) + .07 * np.sin(3 * phase)
        env = np.sin(np.pi * np.minimum(1, t / duration)) ** .8
    else:
        y = np.sin(phase) + .2 * np.sin(phase * 2.01) * np.exp(-t * 8) + .09 * np.sin(phase * 3.98)
        env = np.exp(-t * 5 / duration)
    attack = np.minimum(1, t / .006)
    release = np.minimum(1, np.maximum(0, duration - t) / .025)
    return gain * y * env * attack * release

def noise(rng, duration, low=160, high=3500, gain=.1):
    n = int(duration * SR)
    y = sosfilt(butter(2, [low, high], btype='bandpass', fs=SR, output='sos'), rng.normal(size=n))
    return y * np.sin(np.pi * np.arange(n) / max(1, n-1)) ** 1.5 * gain

def put(buffer, signal, at=0):
    start = int(at * SR)
    count = min(len(signal), len(buffer)-start)
    if count > 0:
        buffer[start:start+count] += signal[:count]

def make(style, event, bpm):
    rng = np.random.default_rng(int(hashlib.sha256((style+event).encode()).hexdigest()[:8], 16))
    inst = {'a':'bell','b':'pluck','c':'soft'}[style]
    root = {'a':60, 'b':62, 'c':57}[style]
    if event in ('menu', 'battle'):
        beat = 60 / bpm
        duration = beat * 32
        out = np.zeros(int(SR * duration))
        chords = [[0,4,7],[5,9,12],[9,12,16],[7,11,14]] if event == 'menu' else [[0,3,7],[5,8,12],[8,12,15],[7,11,14]]
        melody = [12,7,9,4,7,12,11,7] if style != 'b' else [12,16,14,7,9,12,14,11]
        for bar in range(8):
            chord = chords[(bar//2)%4]
            at = bar * 4 * beat
            for note in chord:
                put(out, tone(midi(root-12+note), beat*3.8, 'pad', .12 if style!='b' else .07), at)
            put(out, tone(midi(root-24+chord[0]), beat*1.5, 'soft', .18), at)
            for step in range(4 if event=='menu' else 8):
                pos = at+step*beat*(1 if event=='menu' else .5)
                note = chord[step%3]+(12 if step%2 else 0)
                put(out, tone(midi(root+note), beat*.75, inst, .095), pos)
                if event=='battle':
                    put(out, noise(rng,.055,250,2100,.065), pos)
            if event=='battle':
                for step in [0,2]:
                    put(out,tone(95,.15,'soft',.16,end=48),at+step*beat)
            if bar%2==0:
                put(out,tone(midi(root+melody[bar]),beat*1.8,inst,.12),at+beat*.5)
        return out, 'music'
    if event == 'ambience':
        duration=10
        out=noise(rng,duration,90,1700,.085)
        out *= .65+.15*np.sin(np.arange(len(out))/SR*.8)
        for at in [.8,3.6,6.5,8.3]:
            put(out,tone(150+rng.uniform(0,70),.12,'wood',.045),at)
        return out,'ambience'
    durations={'ui':.25,'error':.5,'card':.6,'coin':1.5,'normal':.48,'strong':.95,'guard':.85,'heal':1.05,'expel':.8,'turn':.7,'timer':1.65,'pack':1.8,'reward':.9,'victory':2.6,'defeat':2.2}
    out=np.zeros(int(SR*durations[event]))
    def note(offset,at=0,dur=.3,gain=.28,kind=None):
        put(out,tone(midi(root+offset),dur,kind or inst,gain),at)
    if event=='ui':
        note(12,0,.14,.2,'wood' if style=='a' else inst);note(19,.045,.16,.075)
    elif event=='error':
        note(2,0,.2,.18);note(0,.15,.28,.15)
    elif event=='card':
        put(out,noise(rng,.26,600,4000,.22));note(-12,.22,.22,.28,'wood');note(7,.26,.2,.09)
    elif event=='coin':
        for at,g in [(0,.2),(.18,.17),(.34,.15),(.48,.13),(.6,.1),(.7,.08)]:
            note(24,at,.17,g);note(31,at,.12,g*.25)
        note(12,.92,.4,.24,'wood' if style=='b' else inst)
    elif event=='normal':
        put(out,noise(rng,.10,400,4200,.24));note(-12,.035,.26,.5,'wood' if style!='c' else 'soft')
    elif event=='strong':
        put(out,tone(100,.24,'soft',.22,end=360));put(out,noise(rng,.22,140,3600,.35),.21)
        put(out,tone(130,.5,'soft',.65,end=48),.24);note(-12,.24,.4,.2,'wood')
    elif event=='guard':
        for n in [0,7,12]:note(n,.03,.65,.18)
        put(out,noise(rng,.1,1200,4300,.08))
    elif event=='heal':
        for n,at in zip([0,4,9],[0,.16,.32]):note(n+12,at,.65,.23)
    elif event=='expel':
        for n,at in zip([7,2,-5],[0,.14,.28]):note(n,at,.35,.2)
        put(out,noise(rng,.25,350,2100,.14),.34)
    elif event=='turn':
        note(7,0,.3,.2);note(12,.2,.45,.23)
    elif event=='timer':
        for at in [0,.55,1.1]:note(12,at,.12,.17,'wood' if style!='c' else 'soft')
    elif event=='pack':
        put(out,noise(rng,.65,800,5000,.3))
        for i,n in enumerate([0,7,12,16,19]):note(n,.5+i*.11,.6,.19)
    elif event=='reward':
        for i,n in enumerate([7,12,16]):note(n,i*.11,.55,.2)
    elif event=='victory':
        for i,n in enumerate([0,4,7,12]):note(n,i*.19,.55 if i<3 else 1.4,.24)
        for n in [0,4,7]:note(n,.7,1.6,.1)
    elif event=='defeat':
        for i,n in enumerate([7,3,0,-5]):note(n,i*.21,.6 if i<3 else 1.2,.21)
    # Distinct material palette, while keeping the function recognisable.
    if style=='b' and event in ('normal','expel','error'):
        put(out,tone(420,.18,'pluck',.1,end=170),.06)
    if style=='c' and event in ('strong','guard','pack'):
        put(out,tone(370,.25,'soft',.1,end=740),.13)
    return out,'effect'

def master(mono, category):
    mono=mono-np.mean(mono)
    # Mild room reflection; no abrupt starts, clipped peaks or harsh high-end.
    stereo=np.column_stack([mono,mono])
    for channel,delay,gain in [(0,.031,.09),(1,.043,.10),(0,.079,.035),(1,.091,.035)]:
        shift=int(SR*delay)
        stereo[shift:,channel]+=mono[:-shift]*gain
    fade=min(int(SR*.025),len(mono)//4)
    stereo[:fade]*=np.linspace(0,1,fade)[:,None]
    stereo[-fade:]*=np.linspace(1,0,fade)[:,None]
    peak=np.max(np.abs(stereo))
    target={'effect':.48,'music':.24,'ambience':.13}[category]
    stereo*=target/max(peak,1e-9)
    return stereo

def export(path, samples):
    wav=path.with_suffix('.wav')
    with wave.open(str(wav),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes((np.clip(samples,-1,1)*32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','96k',str(path)],check=True)
    wav.unlink()

manifest={'title':'Hemicycle · Muestras de sonido','originalSynthesis':True,'productionIntegration':False,'styles':[],'samples':[]}
raw={}
for key,name,description,bpm in STYLES:
    print('Generando',name,flush=True)
    manifest['styles'].append({'id':key,'name':name,'description':description,'bpm':bpm})
    reel=[];timeline=[];cursor=0
    for event,label,description in EVENTS:
        mono,category=make(key,event,bpm)
        samples=master(mono,category)
        filename=f'{key}-{event}.mp3'
        export(ASSETS/filename,samples)
        rms=float(np.sqrt(np.mean(samples*samples)))
        assert np.isfinite(samples).all() and 0<rms<.3 and np.max(abs(samples))<.8
        manifest['samples'].append({'id':f'{key}-{event}','style':key,'event':event,'label':label,'description':description,'file':'samples/'+filename,'duration':round(len(samples)/SR,3),'peak':round(float(np.max(abs(samples))),4),'rms':round(rms,5)})
        raw[key,event]=samples
        clip=samples[:SR*8] if category=='music' else samples[:SR*3] if category=='ambience' else samples
        # Short listening break between items; the downloadable page lists timecodes.
        timeline.append({'event':label,'start':round(cursor,2)})
        reel.extend([clip,np.zeros((int(SR*.55),2))]);cursor+=len(clip)/SR+.55
    export(ROOT/f'muestra-{key}.mp3',np.concatenate(reel))
    manifest['styles'][-1]['reel']='muestra-'+key+'.mp3'
    manifest['styles'][-1]['timeline']=timeline

(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

# All audio is embedded: the reviewer can download one HTML and use it offline.
data={item['id']:'data:audio/mpeg;base64,'+base64.b64encode((ROOT/item['file']).read_bytes()).decode() for item in manifest['samples']}
template=Path(__file__).with_name('player-template.html').read_text()
html=template.replace('/*MANIFEST*/',json.dumps(manifest,ensure_ascii=False)).replace('/*AUDIO*/',json.dumps(data))
(ROOT/'escuchar.html').write_text(html)
with zipfile.ZipFile(ROOT/'hemicycle-muestras-sonido.zip','w',zipfile.ZIP_DEFLATED) as z:
    for file in [ROOT/'escuchar.html',ROOT/'manifest.json',ROOT/'README.md']+list(ASSETS.glob('*.mp3'))+list(ROOT.glob('muestra-*.mp3')):
        z.write(file,file.relative_to(ROOT))
print('54 muestras y tres resúmenes listos.',flush=True)
