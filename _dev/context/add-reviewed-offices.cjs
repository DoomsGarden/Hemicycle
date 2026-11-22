'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

function assemble(context,catalog,review){
 const cards=new Map(catalog.cards.map(card=>[card.id,card]));
 const records={...context};
 for(const row of review.cards){
  const card=cards.get(row.id);
  const evidence=row.primaryOfficeSource;
  assert.ok(card&&card.n===row.name&&card.country===row.country,row.id);
  assert.equal(row.review.office,'approved',row.id);
  assert.equal(evidence.status,'verified',row.id);
  assert.equal(evidence.evidence.id,row.id);
  assert.equal(evidence.evidence.role,evidence.role,row.id);
  assert.equal(new URL(evidence.url).protocol,'https:',row.id);
  const role=evidence.role.trim();
  assert.ok(role&&!/[<>]/.test(role),row.id);
  const consulted=row.editorialApproval.reviewedOn;
  assert.match(consulted,/^\d{4}-\d{2}-\d{2}$/);
  const date=evidence.evidence.documentDate||evidence.evidence.dateScope?.observedOn;
  const office={id:row.id,role,source:evidence.url,consulted};
  if(typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date))office.date=date;
  if(!records[row.id])records[row.id]=office;
 }
 assert.ok(catalog.cards.every(({id})=>Object.hasOwn(records,id)),'Incomplete context coverage');
 return records;
}

if(require.main===module){
 const review=require(path.resolve(process.argv[2]));
 const root=path.resolve(process.argv[3]||path.join(__dirname,'../..'));
 const contextFile=path.join(root,'js/orator-context.js');
 const contexts=assemble(require(contextFile),require(path.join(root,'js/orator-catalog.js')),review);
 const data=JSON.stringify(contexts).replace(/</g,'\\u003c');
 fs.writeFileSync(contextFile,'(function(root,data){if(typeof module==="object"&&module.exports)module.exports=data;else root.HemicycleOratorContext=data;})(typeof globalThis!=="undefined"?globalThis:this,'+data+');\n');
 console.log(Object.keys(contexts).length+' fichas de contexto');
}

module.exports={assemble};
