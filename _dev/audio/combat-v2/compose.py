"""Tres bocetos originales para combate adaptativo. Solo genera material de revisión."""
from pathlib import Path
import base64
import ctypes as C
import ctypes.util
import hashlib
import json
import shutil
import subprocess
import wave
import zipfile
import numpy as np

ROOT = Path(__file__).resolve().parent
SR = 32000
SF = '/usr/share/sounds/sf2/TimGM6mb.sf2'
OUT = ROOT / 'pistas'
OUT.mkdir(exist_ok=True)
lib = C.CDLL(ctypes.util.find_library('fluidsynth'))

def api(name, restype, *args):
    f=getattr(lib,name);f.restype=restype;f.argtypes=list(args);return f

ptr=C.c_void_p;ci=C.c_int;cs=C.c_char_p;cd=C.c_double
new_settings=api('new_fluid_settings',ptr)
setnum=api('fluid_settings_setnum',ci,ptr,cs,cd)
setint=api('fluid_settings_setint',ci,ptr,cs,ci)
new_synth=api('new_fluid_synth',ptr,ptr)
sfload=api('fluid_synth_sfload',ci,ptr,cs,ci)
program=api('fluid_synth_program_change',ci,ptr,ci,ci)
cc=api('fluid_synth_cc',ci,ptr,ci,ci,ci)
on=api('fluid_synth_noteon',ci,ptr,ci,ci,ci)
off=api('fluid_synth_noteoff',ci,ptr,ci,ci)
write=api('fluid_synth_write_float',ci,ptr,ci,ptr,ci,ci,ptr,ci,ci)
delete_synth=api('delete_fluid_synth',None,ptr)
delete_settings=api('delete_fluid_settings',None,ptr)

PIECES=[
 dict(id='a',name='Duelo de tribunas',tempo=112,meter='4/4',beats=4,root=62,
      description='Aventura orquestal: cuerdas rítmicas, tema de oboe y respuesta de trompas. El estado glorioso abre los metales y eleva la melodía.',
      color='Ágil, noble y con tensión',lead=68,ost=48,
      chords=[[0,3,7],[8,12,15],[3,7,10],[10,14,17],[0,3,7],[8,12,15],[5,8,12],[7,11,14]],
      melody=[[0,7,12,15,14,12,10,7],[8,12,15,12,10,8,7,5],[7,10,15,14,10,7,5,3],[10,14,17,14,12,10,7,2],
              [12,7,12,15,19,15,14,12],[15,12,8,12,17,15,12,8],[5,8,12,17,15,12,8,5],[7,11,14,19,14,11,7,11]]),
 dict(id='b',name='La mayoría avanza',tempo=120,meter='4/4',beats=4,root=60,
      description='Marcha cinematográfica: clarinete, violines, caja y bajo marcado. Sobre 50 votos aparece una fanfarria luminosa, con contramelodía de cuerdas.',
      color='Decidida, luminosa y competitiva',lead=71,ost=45,
      chords=[[0,4,7],[5,9,12],[9,12,16],[7,11,14],[0,4,7],[5,9,12],[2,5,9],[7,11,14]],
      melody=[[12,12,7,9,12,16,14,12],[9,12,17,16,14,12,9,5],[9,12,16,19,16,12,11,9],[7,11,14,17,16,14,11,7],
              [12,16,19,16,14,12,7,9],[12,9,5,9,12,17,16,12],[14,17,14,9,5,9,12,14],[11,14,19,17,14,11,7,11]]),
 dict(id='c',name='El pulso de la cámara',tempo=168,meter='6/8',beats=6,root=64,
      description='Impulso en seis por ocho: violonchelo, guitarra de nailon, flauta y timbales. La segunda capa suma trompas, violines y una percusión más amplia.',
      color='Fluida, aventurera y con empuje',lead=73,ost=24,
      chords=[[0,3,7],[10,14,17],[8,12,15],[7,11,14],[0,3,7],[3,7,10],[5,8,12],[7,11,14]],
      melody=[[0,7,12,15,14,12],[10,14,17,14,12,10],[8,12,15,12,10,8],[7,11,14,19,14,11],
              [12,15,19,15,14,12],[10,7,3,7,10,15],[5,8,12,17,15,12],[11,14,19,14,11,7]]),
]

def build(piece, layer=False):
    """Mismas armonía y métrica en ambos estados; la segunda capa no reinicia nada."""
    rng=np.random.default_rng(2012+ord(piece['id'])+(100 if layer else 0))
    beats=piece['beats'];beat=60/piece['tempo'];bar=beats*beat
    root=piece['root'];events=[]
    def note(ch,pitch,pos,duration,velocity=70):
        # Pequeñas variaciones interpretativas; la rejilla de compases sigue fija.
        when=max(0,pos+rng.uniform(-.006,.006))
        velocity=int(np.clip(velocity+rng.integers(-4,5),1,120))
        events.append((when,1,ch,int(pitch),velocity))
        events.append((when+duration,0,ch,int(pitch),0))
    for b in range(16):
        chord=piece['chords'][b%8];melody=piece['melody'][b%8];at=b*bar
        # Segunda frase: contestación y pequeña subida, no un arpegio repetido sin desarrollo.
        variation=12 if b in (10,11,14) else 0
        if not layer:
            for tone in chord:
                note(0,root-12+tone,at,bar*.93,50 if b%4!=3 else 56)
            for step in range(beats*2):
                note(1,root-12+chord[step%3]+(12 if step%4==3 else 0),at+step*.5*beat,beat*.30,52+(step%beats==0)*9)
            for step in ([0,2] if beats==4 else [0,3]):
                note(2,root-24+chord[0],at+step*beat,beat*1.5,73)
            # Melodía con respiraciones al final de frase y duraciones variables.
            for j,p in enumerate(melody):
                if b%4==3 and j==len(melody)-2:
                    continue
                pos=j*beats/len(melody)
                duration=beat*(beats/len(melody))*(1.55 if j==len(melody)-1 else .79)
                note(3,root+p+variation,at+pos*beat,duration,71+(j%4==0)*7)
            # Respuestas graves de cello en la segunda mitad de cada frase.
            if b%4>=2:
                for step,p in [(0,chord[2]),(beats/2,chord[1])]:
                    note(4,root-12+p,at+step*beat,beat*(beats/2-.12),54)
            if b%2==0:
                note(5,root+chord[2],at+beat*.2,bar*.85,40)
            # Percusión ya activa desde el inicio; no tapa el tema.
            for step in ([0,2] if beats==4 else [0,3]):
                note(9,36,at+step*beat,.11,60)
            for step in ([1,3] if beats==4 else [2,5]):
                note(9,38,at+step*beat,.11,43)
            for step in range(beats):
                note(9,42,at+step*beat,.06,29 if step%2 else 37)
        else:
            # Metales con frase propia, apoyos de cuerda y percusión ampliada.
            fanfare=[chord[0]+12,chord[2]+12,chord[1]+12,chord[2]+12]
            for j,p in enumerate(fanfare):
                pos=j*beats/4
                duration=beat*(beats/4)*(.84 if j<3 else 1.05)
                note(6,root+p,at+pos*beat,duration,72 if piece['id']!='b' else 78)
                note(7,root-12+chord[j%3],at+pos*beat,duration*.93,57)
            for j,p in enumerate(melody):
                note(8,root+p+12,at+j*beats/len(melody)*beat,beat*beats/len(melody)*.8,55)
            for tone in chord:
                note(10,root+tone,at,bar*.95,43)
            for step in range(beats*2):
                note(11,root+chord[(step+1)%3],at+step*.5*beat,beat*.29,47)
            for step in ([0,2] if beats==4 else [0,3]):
                note(12,root-24+chord[0],at+step*beat,beat*.8,64)
            for step in range(beats):
                note(9,38,at+step*beat,.08,48 if step%2 else 29)
            if b%4==0:
                note(9,49,at,.8,50)
            if b%4==3:
                for j in range(4):
                    note(9,41+(j%2)*2,at+(beats-1+j*.25)*beat,.12,51+j*3)
    return sorted(events),16*bar

def render(piece,layer=False):
    settings=new_settings();setnum(settings,b'synth.sample-rate',SR)
    setnum(settings,b'synth.gain',.45);setint(settings,b'synth.polyphony',256)
    setint(settings,b'synth.chorus.active',0);setint(settings,b'synth.reverb.active',1)
    setnum(settings,b'synth.reverb.room-size',.64);setnum(settings,b'synth.reverb.damp',.45)
    setnum(settings,b'synth.reverb.level',.19);setnum(settings,b'synth.reverb.width',.8)
    synth=new_synth(settings)
    assert sfload(synth,SF.encode(),1)>=0
    programs={0:48,1:piece['ost'],2:43 if piece['id']=='a' else 32,3:piece['lead'],4:42,5:60,6:56 if piece['id']=='b' else 60,7:57,8:40,10:48,11:45,12:47}
    pans={0:42,1:83,2:63,3:68,4:36,5:88,6:52,7:80,8:42,10:85,11:37,12:64,9:64}
    for ch,p in programs.items():program(synth,ch,p)
    for ch,pan in pans.items():
        cc(synth,ch,10,pan);cc(synth,ch,7,92);cc(synth,ch,11,105)
    events,duration=build(piece,layer)
    size=round(duration*SR)
    # Tres vueltas iguales: extraemos la central, con colas de notas y sala ya asentadas.
    repeated=[]
    for cycle in range(3):
        for at,kind,ch,pitch,vel in events:
            repeated.append((max(0,round(at*SR))+cycle*size,kind,ch,pitch,vel))
    repeated.sort();result=np.zeros((size*3+SR*3,2),dtype=np.float32)
    def block(start,end):
        while start<end:
            n=min(8192,end-start)
            buf=np.empty((n,2),dtype=np.float32)
            assert write(synth,n,buf.ctypes.data,0,2,buf.ctypes.data,1,2)==0
            result[start:start+n]=buf;start+=n
    cursor=0
    try:
        for frame,kind,ch,pitch,vel in repeated:
            block(cursor,frame);cursor=frame
            (on(synth,ch,pitch,vel) if kind else off(synth,ch,pitch))
        block(cursor,len(result))
    finally:
        delete_synth(synth);delete_settings(settings)
    return result[size:size*2].astype(np.float64),duration

def export(name,data,fmt='mp3'):
    temp=ROOT/'render.wav'
    with wave.open(str(temp),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes((np.clip(data,-.999,.999)*32767).astype('<i2').tobytes())
    path=OUT/(name+'.'+fmt)
    codec=['-c:a','libmp3lame','-b:a','160k'] if fmt=='mp3' else ['-c:a','libvorbis','-q:a','5']
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(temp),*codec,str(path)],check=True)
    temp.unlink();return str(path.relative_to(ROOT))

def ending(piece,seconds=4):
    # Coda independiente: tónica y tercera mayor como resolución final del boceto.
    settings=new_settings();setnum(settings,b'synth.sample-rate',SR);setnum(settings,b'synth.gain',.3)
    synth=new_synth(settings);sfload(synth,SF.encode(),1);program(synth,0,48);program(synth,1,60)
    n=int(seconds*SR);out=np.zeros((n,2),np.float32)
    root=piece['root']
    for p in [root-12,root,root+4,root+7]:on(synth,0,p,65)
    for p in [root,root+7,root+12]:on(synth,1,p,68)
    write(synth,n,out.ctypes.data,0,2,out.ctypes.data,1,2)
    delete_synth(synth);delete_settings(settings)
    fade=np.linspace(1,0,int(SR*1.8))**1.3;out[-len(fade):]*=fade[:,None]
    return out.astype(np.float64)

manifest={'title':'Hemicycle · Combate musical adaptativo','threshold':50,'condition':'max(votosPropios, votosRival) > 50','transitionSeconds':1.5,'integratedInGame':False,'pieces':[]}
sources={}
for piece in PIECES:
    print('Componiendo y renderizando:',piece['name'],flush=True)
    base,duration=render(piece);layer,_=render(piece,True)
    peak=float(np.max(np.abs(base+layer)));scale=.69/max(peak,1e-8)
    base*=scale;layer*=scale;intense=base+layer
    assert np.sqrt(np.mean(intense**2))>np.sqrt(np.mean(base**2))*1.10
    key=piece['id'];normalFile=export(key+'-combate',base);intenseFile=export(key+'-gloriosa',intense)
    baseFile=export(key+'-base-capa',base,'ogg');layerFile=export(key+'-refuerzo-capa',layer,'ogg')
    sources[key]={'base':'data:audio/ogg;base64,'+base64.b64encode((ROOT/baseFile).read_bytes()).decode(),'layer':'data:audio/ogg;base64,'+base64.b64encode((ROOT/layerFile).read_bytes()).decode()}
    # Recorrido: base 8 compases, glorioso 8, base 4, glorioso 4 y cierre.
    demo=np.tile(base,(2,1));gain=np.zeros(len(demo));bar=duration/16
    demo=demo[:round(bar*24*SR)];gain=gain[:len(demo)]
    transitions=[(8*bar,1),(16*bar,0),(20*bar,1)]
    for seconds,target in transitions:
        start=round(seconds*SR);end=min(len(gain),start+round(1.5*SR))
        old=gain[start-1] if start else 0
        gain[start:end]=np.linspace(old,target,end-start);gain[end:]=target
    demo+=np.tile(layer,(2,1))[:len(demo)]*gain[:,None]
    intro=int(SR*.015);demo[:intro]*=np.linspace(0,1,intro)[:,None]
    tail=ending(piece)*min(1,scale*1.4);join=int(.16*SR)
    demo[-join:]*=np.linspace(1,0,join)[:,None];tail[:join]*=np.linspace(0,1,join)[:,None]
    demo=np.concatenate([demo,tail]);demo*=min(1,.75/max(np.max(abs(demo)),1e-9))
    demoFile=export(key+'-demostracion',demo)
    entry={k:v for k,v in piece.items() if k in ['id','name','tempo','meter','description','color']}
    entry.update(duration=round(duration,4),normal=normalFile,intense=intenseFile,demo=demoFile,baseStem=baseFile,layerStem=layerFile,normalRms=round(float(np.sqrt(np.mean(base**2))),5),intenseRms=round(float(np.sqrt(np.mean(intense**2))),5),peak=round(float(np.max(abs(intense))),5),timeline=[{'time':0,'label':'Combate activo · nadie supera 50 votos'},{'time':round(8*bar,2),'label':'Un jugador llega a 51 · entra el estado glorioso'},{'time':round(16*bar,2),'label':'Vuelve a 50 · regresa el estado normal'},{'time':round(20*bar,2),'label':'El rival supera 50 · regresa el estado glorioso'},{'time':round(24*bar,2),'label':'Final de combate · resolución musical'}])
    manifest['pieces'].append(entry)
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
template=(ROOT/'player-template.html').read_text()
(ROOT/'escuchar.html').write_text(template.replace('/*MANIFEST*/',json.dumps(manifest,ensure_ascii=False)).replace('/*SOURCES*/',json.dumps(sources)))
guide=['# Guía de escucha','', 'Los resúmenes muestran el paso de combate normal a glorioso, la vuelta al normal y la entrada gloriosa cuando el rival supera el umbral.','']
for p in manifest['pieces']:
    guide.extend(['## '+p['id'].upper()+' · '+p['name'],'',p['description'],''])
    for cue in p['timeline']:
        t=cue['time'];guide.append(f'- {int(t)//60}:{int(t)%60:02d}: {cue["label"]}.')
    guide.append('')
(ROOT/'GUIA.md').write_text('\n'.join(guide))
with zipfile.ZipFile(ROOT/'hemicycle-combate-musical-v2.zip','w',zipfile.ZIP_DEFLATED) as z:
    for path in [ROOT/'escuchar.html',ROOT/'README.md',ROOT/'GUIA.md',ROOT/'manifest.json',ROOT/'NOTICES.md']+list(OUT.glob('*')):
        z.write(path,path.relative_to(ROOT))
print('Tres piezas, seis estados y tres demostraciones terminados.',flush=True)
