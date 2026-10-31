'use strict';
// El arte activo son ilustraciones: este control impide reemplazarlo por iconos planos.
const fs=require('node:fs'),a=require('node:assert/strict'),crypto=require('node:crypto'),C=require('../js/cosmetic-catalog.js');
const manifest=JSON.parse(fs.readFileSync('_dev/design/cosmetic-illustrations.json','utf8'));
a.equal(manifest.assets.length,18);
for(const theme of C.collection('back'))for(const path of [theme.asset,...['cara','cruz'].map(face=>'assets/cosmetics/coins/'+theme.id+'-'+face+'.webp')]){
 const record=manifest.assets.find(r=>r.asset===path);a.ok(record,path+' missing from art manifest');const bytes=fs.readFileSync(path);a.ok(bytes.length>15000,path+' unexpectedly small');a.equal(bytes.toString('ascii',0,4),'RIFF');a.equal(bytes.toString('ascii',8,12),'WEBP');a.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256,path+' art changed');
}
console.log('Verified six illustrated backs and twelve coin faces against the approved art manifest.');
