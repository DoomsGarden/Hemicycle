'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),manifest=path.join(__dirname,'individual-portraits.json');
function apply(data,options={}){
 const jobs=JSON.parse(fs.readFileSync(manifest,'utf8')).jobs,expected=require('../20261107/tier-review.json').cards.filter(c=>!c.original).map(c=>c.id);
 assert.equal(jobs.length,779);assert.equal(new Set(jobs.map(j=>j.id)).size,779);assert.deepEqual(jobs.map(j=>j.id).sort(),expected.sort());
 const ready=jobs.filter(j=>j.status==='approved'||options.preview&&j.status==='generated_pending_review');
 if(!options.preview)assert.equal(ready.length,779,'No publicar una sustitución parcial: faltan ilustraciones individuales aprobadas.');
 const originals=JSON.parse(fs.readFileSync(path.join(__dirname,'original-individual-portraits.json'),'utf8')).jobs;
 assert.deepEqual(originals.map(j=>j.id).sort(),['javier-maroto','jordi-turull','patxi-lopez','teodoro-garcia-egea']);
 const originalReady=originals.filter(j=>j.status==='approved'||options.preview&&j.status==='generated_pending_review');
 if(!options.preview)assert.equal(originalReady.length,4,'Faltan los cuatro retratos originales que compartían lámina.');
 ready.push(...originalReady);
 for(const j of ready){
  assert.equal(j.target,'assets/orators/individuals-20261107/'+j.id+'.webp');assert.equal(j.dimensions[0]*4,j.dimensions[1]*3,j.id+': AR');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,j.target))).digest('hex'),j.sha256,j.id+': hash');
  data[j.id]={url:j.target+'?v='+j.sha256.slice(0,12),key:j.id,columns:1,rows:1,aspect:[3,4],framing:{scale:1,x:0,y:0}};
 }
 return data;
}
if(require.main===module){
 const preview=process.argv.includes('--preview'),data=apply(JSON.parse(fs.readFileSync(path.join(__dirname,'art-before.json'),'utf8')),{preview});
 if(preview){fs.mkdirSync(path.join(__dirname,'qa'),{recursive:true});fs.writeFileSync(path.join(__dirname,'qa/preview-art.json'),JSON.stringify(data));console.log('Preview only; application unchanged.');}
 else{const target=path.join(root,'js/orator-art.js'),text='(function(root,data){if(typeof module==="object"&&module.exports)module.exports=data;else root.HemicycleOratorArt=data;})(typeof globalThis!=="undefined"?globalThis:this,'+JSON.stringify(data)+');\n';if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),text);else fs.writeFileSync(target,text);console.log('779 independent 3:4 portraits, full-bleed, approved.');}
}
module.exports={apply};
