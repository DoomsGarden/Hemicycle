'use strict';
// Format conversion only: preserve the full real browser capture and its dimensions.
const fs=require('node:fs'),a=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const capture=JSON.parse(fs.readFileSync('_dev/marketing/captures.json','utf8')),manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
const sources={'inicio':'01-inicio.png','combate':'02-combate.png','coleccion':'03-coleccion.png','combate-horizontal':'02-combate-wide.png'};
fs.mkdirSync('docs/media/install',{recursive:true});const files=[];
for(const shot of manifest.screenshots){const id=shot.src.split('/').at(-1).replace('.webp',''),source='docs/media/screenshots/'+sources[id];a.ok(fs.existsSync(source),source);execFileSync('magick',[source,'-quality','85',shot.src]);const size=execFileSync('magick',['identify','-format','%wx%h',shot.src],{encoding:'utf8'});a.equal(size,shot.sizes);const data=fs.readFileSync(shot.src);a.ok(data.length<1024*1024);files.push({file:shot.src,source,sizes:size,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});}
fs.writeFileSync('_dev/marketing/install-assets.json',JSON.stringify({gameVersion:capture.gameVersion,date:capture.date,files},null,2)+'\n');
console.log('PASS: four installation screenshots converted without crop or resize.');
