"""Remates originales de victoria/derrota para revisar junto a Duelo de tribunas."""
from pathlib import Path
import base64
import ctypes as C
import ctypes.util
import json
import subprocess
import wave
import numpy as np

ROOT=Path(__file__).resolve().parent
ROOT.mkdir(parents=True,exist_ok=True)
SR=32000
lib=C.CDLL(ctypes.util.find_library('fluidsynth'))
def api(name,result,*args):
    f=getattr(lib,name);f.restype=result;f.argtypes=list(args);return f
ptr=C.c_void_p;ci=C.c_int;cs=C.c_char_p
settings_new=api('new_fluid_settings',ptr)
setnum=api('fluid_settings_setnum',ci,ptr,cs,C.c_double)
setint=api('fluid_settings_setint',ci,ptr,cs,ci)
synth_new=api('new_fluid_synth',ptr,ptr)
load=api('fluid_synth_sfload',ci,ptr,cs,ci)
program=api('fluid_synth_program_change',ci,ptr,ci,ci)
control=api('fluid_synth_cc',ci,ptr,ci,ci,ci)
on=api('fluid_synth_noteon',ci,ptr,ci,ci,ci)
off=api('fluid_synth_noteoff',ci,ptr,ci,ci)
write=api('fluid_synth_write_float',ci,ptr,ci,ptr,ci,ci,ptr,ci,ci)
delete_synth=api('delete_fluid_synth',None,ptr)
delete_settings=api('delete_fluid_settings',None,ptr)

def compose(victory):
    beat=60/112
    events=[]
    def note(channel,pitch,at,duration,velocity):
        events.extend([(round(at*SR),1,channel,pitch,velocity),(round((at+duration)*SR),0,channel,pitch,0)])
    # Misma raíz (re) y pulso que la pieza de combate. Cadencias distintas según resultado.
    if victory:
        chords=[(0,[50,57,62,66,69]),(2,[43,55,59,62,67]),(3,[45,57,61,64,67]),(4,[38,50,57,62,66,69])]
        melody=[(0,74,.42,82),(.5,69,.42,76),(1,74,.42,86),(1.5,78,.85,89),(2.5,76,.42,81),(3,73,.8,83),(4,74,2.2,86)]
        duration=5.3
    else:
        chords=[(0,[50,57,62,65]),(2,[46,53,58,62]),(3,[45,55,61,64]),(4,[38,50,57,62,65])]
        melody=[(0,69,.85,64),(1,65,.8,60),(2,64,.8,57),(3,61,.8,54),(4,62,1.9,52)]
        duration=5.1
    for i,(pos,chord) in enumerate(chords):
        hold=(chords[i+1][0]-pos)*beat*.93 if i+1<len(chords) else 1.5
        for pitch in chord:
            note(0,pitch,pos*beat,hold,57 if victory else 43)
        note(2,chord[0],pos*beat,hold,64 if victory else 45)
        if victory:
            for pitch in chord[-3:]:note(3,pitch,pos*beat,hold*.9,50)
    for pos,pitch,length,velocity in melody:
        note(1,pitch,pos*beat,length*beat,velocity)
        if victory and pos in [1,4]:note(4,pitch+12,pos*beat,length*beat,.65*velocity)
    if victory:
        for pos in [0,1,1.5,3,3.5,3.75]:note(9,38,pos*beat,.10,45 if pos<3 else 54)
        note(9,49,4*beat,.5,49)
        note(5,38,4*beat,.55,67)
    settings=settings_new();setnum(settings,b'synth.sample-rate',SR);setnum(settings,b'synth.gain',.38)
    setint(settings,b'synth.chorus.active',0);setnum(settings,b'synth.reverb.room-size',.66)
    setnum(settings,b'synth.reverb.damp',.5);setnum(settings,b'synth.reverb.level',.23)
    synth=synth_new(settings)
    assert load(synth,b'/usr/share/sounds/sf2/TimGM6mb.sf2',1)>=0
    for channel,preset in {0:48,1:56 if victory else 69,2:42,3:60,4:40,5:47}.items():
        program(synth,channel,preset);control(synth,channel,7,90);control(synth,channel,10,{0:42,1:65,2:51,3:84,4:78,5:64}[channel])
    out=np.zeros((round(SR*duration),2),np.float32)
    def render(start,end):
        while start<end:
            n=min(8192,end-start);buf=np.empty((n,2),np.float32)
            assert write(synth,n,buf.ctypes.data,0,2,buf.ctypes.data,1,2)==0
            out[start:start+n]=buf;start+=n
    cursor=0
    try:
        for at,kind,ch,pitch,velocity in sorted(events):
            render(cursor,at);cursor=at
            if kind:on(synth,ch,pitch,int(velocity))
            else:off(synth,ch,pitch)
        render(cursor,len(out))
    finally:
        delete_synth(synth);delete_settings(settings)
    # Preservar la diferencia de dinámica entre victoria y derrota sin saltos de nivel.
    out=out.astype(np.float64)
    out-=np.mean(out,axis=0)
    out*= (.62 if victory else .42)/np.max(abs(out))
    attack=int(.008*SR);tail=int(1.25*SR)
    out[:attack]*=np.linspace(0,1,attack)[:,None]
    out[-tail:]*=(np.linspace(1,0,tail)**1.4)[:,None]
    return out

manifest={'integratedInGame':False,'combatPiece':'Duelo de tribunas','tempo':112,'samples':[]}
sources={}
for victory in [True,False]:
    key='victoria' if victory else 'derrota';data=compose(victory)
    wav=ROOT/(key+'.wav')
    with wave.open(str(wav),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes((data*32767).astype('<i2').tobytes())
    for ext,codec in [('mp3',['-c:a','libmp3lame','-b:a','160k']),('ogg',['-c:a','libvorbis','-q:a','5'])]:
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),*codec,str(ROOT/(key+'.'+ext))],check=True)
    wav.unlink()
    sources[key]='data:audio/mpeg;base64,'+base64.b64encode((ROOT/(key+'.mp3')).read_bytes()).decode()
    manifest['samples'].append({'id':key,'seconds':len(data)/SR,'peak':float(np.max(abs(data))),'rms':float(np.sqrt(np.mean(data*data))),'file':key+'.mp3','description':'Fanfarria ascendente y resolución en re mayor.' if victory else 'Motivo descendente de corno inglés y cuerdas; resolución en re menor.'})
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
html='''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hemicycle · Victoria y derrota</title><style>:root{font-family:system-ui,sans-serif;color-scheme:dark;background:#111923;color:#e9e4db}body{max-width:700px;margin:auto;padding:32px 18px}h1,h2{font-family:Georgia,serif;color:#ebcb91}h1{font-size:34px;font-weight:normal}p{line-height:1.65;color:#bdc9d4}article{border:1px solid #667080;border-radius:14px;background:#1d2a38;padding:18px;margin:20px 0}audio{width:100%;margin-top:12px}small{color:#bbc4cd}button{padding:12px 18px;min-height:44px;color:#f4dfbb;background:#334359;border:1px solid #947a51;border-radius:8px;font:inherit;cursor:pointer}button:focus-visible{outline:3px solid #edc77e}</style></head><body><h1>El cierre del combate</h1><p>Dos remates breves de «Duelo de tribunas», con su misma raíz musical y pulso. No se repiten en bucle. Son pruebas para la pantalla de resultados; aún no están incorporadas al juego.</p><article><h2>Victoria · 5,3 segundos</h2><p>Fanfarria de metales, cuerda alta y un cierre luminoso. Retoma el gesto ascendente del tema.</p><audio controls preload="none" aria-label="Escuchar victoria" src="VICTORY"></audio></article><article><h2>Derrota · 5,1 segundos</h2><p>Respuesta descendente de corno inglés y violonchelo, contenida y con una caída suave, sin alarma ni burla.</p><audio controls preload="none" aria-label="Escuchar derrota" src="DEFEAT"></audio></article><button id="stop" type="button">■ Detener</button><p><small>Funciona sin conexión. Solo suena una muestra a la vez; se detiene al salir de la pestaña. Instrumentos sampleados interpretando composiciones originales.</small></p><script>const players=[...document.querySelectorAll('audio')];for(const p of players){p.volume=.4;p.addEventListener('play',()=>{for(const other of players)if(other!==p){other.pause();other.currentTime=0;}});}function stop(){for(const p of players){p.pause();p.currentTime=0;}}document.getElementById('stop').onclick=stop;document.addEventListener('keydown',e=>{if(e.key==='Escape')stop();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});</script></body></html>'''
(ROOT/'escuchar.html').write_text(html.replace('VICTORY',sources['victoria']).replace('DEFEAT',sources['derrota']))
print(json.dumps(manifest,ensure_ascii=False))
