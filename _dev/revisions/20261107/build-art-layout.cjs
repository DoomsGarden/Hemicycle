'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'../../..'),read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')),geometry=read('portrait-geometry.json'),decisions=new Map(read('tier-review.json').cards.map(r=>[r.id,r]));
function theme(r){
 // Color only. Affiliation must never be inferred from a parliamentary group,
 // and no artificial caption/party label is rendered over the artwork.
 const m=r.metadata||{},party=m.affiliation?.label||'',group=m.affiliation?.referenceGroup||'';
 if(r.country==='ES'){
  if(/SOCIALISTA/i.test(party+' '+group))return {colors:['#491a2a','#a24352']};
  if(/POPULAR/i.test(party+' '+group))return {colors:['#092747','#256ba2']};
  if(/VASCO|EAJ-PNV/i.test(party+' '+group))return {colors:['#103c33','#3b8c65']};
  return {colors:['#281f39','#655075']};
 }
 if(/sénat|senat|sénateur|senateur|sénatrice/i.test(r.evidence||''))return {colors:['#421e2b','#8e4a55']};
 if(/Jefatura|supranacional|internacional|monetaria/.test(r.category))return {colors:['#102647','#42698d']};
 if(/territorial|Alcald|departamental/.test(r.category))return {colors:['#183b38','#5b8874']};
 return {colors:['#342633','#795867']};
}
const data={};for(const row of geometry.cards){if(row.original)continue;const r=decisions.get(row.id);data[row.id]={...row.source,key:row.id,framing:row.framing,context:theme(r)};}
fs.writeFileSync(path.join(root,'js/orator-art.js'),'(function(root,data){if(typeof module==="object"&&module.exports)module.exports=data;else root.HemicycleOratorArt=data;})(typeof globalThis!=="undefined"?globalThis:this,'+JSON.stringify(data)+');\n');console.log('Art layout:',Object.keys(data).length,'atlas portraits; proportional crop and documented group/institution context.');
