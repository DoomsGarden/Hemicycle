'use strict';
// Build the requested animated WebP plates from the generated environment art.
const path=require('node:path'),fs=require('node:fs'),{execFileSync}=require('node:child_process'),root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'assets/results'),{recursive:true});
for(const name of ['victory','defeat']){
 const input=path.join(root,'_dev/art/result-scenes',name+'.png'),output=path.join(root,'assets/results',name);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-vf','scale=640:960','-frames:v','1','-c:v','libwebp','-quality','80',output+'-still.webp']);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-vf',"scale=1152:1728,zoompan=z='1.012-0.012*cos(2*PI*on/72)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=72:s=576x864:fps=15,eq=brightness='0.004*sin(2*PI*t/4.8)':eval=frame",'-frames:v','72','-an','-c:v','libwebp_anim','-quality','60','-compression_level','4','-loop','0',output+'.webp']);
 console.log(name+': '+Math.round(fs.statSync(output+'.webp').size/1024)+' KiB, 72 frames / 4.8 s');
}
