'use strict';
// Combines both reviewed reserves atomically. Original atlases and audit evidence
// remain in _dev; only compressed illustrations and attributed text are public.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),base=path.join(__dirname,'baseline'),root=path.resolve(__dirname,'../../..');
const read=n=>fs.readFileSync(path.join(base,n),'utf8'),baseline=require('./baseline/orator-catalog.js');
if(require('../../../js/orator-catalog.js').cards.length!==120)throw Error('Use the preserved baseline before rebuilding activation. Never append twice.');
const reserves=[require('../reserva-espana/prepare.cjs'),require('../francia/prepare.cjs')],compiled=reserves.map(r=>r.compile()),entries=compiled.flatMap(c=>c.cards),source=reserves.flatMap(r=>r.sourceCards);
assert.equal(entries.length,779);assert.equal(new Set([...baseline.cards,...entries].map(c=>c.id)).size,899);assert.ok(source.every(c=>c.art.status!=='pending'));
const add=JSON.stringify(entries)+'.forEach(function(c){CARDS.push(c);BYID[c.id]=c;ROSTER[c.pa][c.r].push(c.n);QBESP[c.id]=c.q.slice();CARD_COUNTRIES[c.id]=c.country;COUNTRY_ROSTER[c.country].push(c.id);});\n';
const catalog=read('orator-catalog.js').replace('CARDS.sort(',add+'CARDS.sort(');
const effects=read('basic-effects.js').replace('var assignments={};',JSON.stringify(source.map(c=>({id:c.id,ability:c.ability})))+'.forEach(function(c){groups[c.ability].push(c.id);});\nvar assignments={};');
const mastery=read('legendary-mastery.js').replace(']),FINAL=250;','].concat('+JSON.stringify(entries.filter(c=>c.r==='legendario').map(c=>c.id))+')),FINAL=250;');
const evaluate=code=>{const sandbox={module:{exports:{}},require:id=>require(path.join(root,'js',id))};vm.runInNewContext(code,sandbox);return sandbox.module.exports;};
assert.equal(evaluate(catalog).cards.length,899);assert.equal(evaluate(mastery).ids.length,89);
for(const c of entries)assert.ok(evaluate(effects).ability(c.id));
const context=Object.assign({},...compiled.map(c=>evaluate(c.files['js/orator-context.js'])));
const registries=compiled.map(c=>JSON.parse(c.files['docs/fuentes-frases-actuales.json'])),registry={...registries[0],consultado:'2026-11-06',alcance:'Catálogo público de 899 oradores. Fragmentos atribuidos y adaptaciones sin nombres de terceros; las traducciones francesas al español se identifican individualmente.',cromos:[...new Map(registries.flatMap(r=>r.cromos).map(c=>[c.id,c])).values()]};delete registry.reservaConsultado;assert.equal(registry.cromos.length,899);
const art={},assets={};for(const r of reserves){Object.assign(assets,r.artAssets);for(const c of r.sourceCards)art[c.id]={url:'assets/orators/'+(c.bundleId||r.policy.id)+'-'+path.basename(c.art.sheet).replace(/\.[^.]+$/,'.webp'),position:c.art.position};}
const files={'js/orator-catalog.js':catalog,'js/basic-effects.js':effects,'js/legendary-mastery.js':mastery,'js/orator-context.js':'(function(root,data){if(typeof module==="object"&&module.exports)module.exports=data;else root.HemicycleOratorContext=data;})(typeof globalThis!=="undefined"?globalThis:this,'+JSON.stringify(context)+');\n','js/orator-art.js':'(function(root,data){if(typeof module==="object"&&module.exports)module.exports=data;else root.HemicycleOratorArt=data;})(typeof globalThis!=="undefined"?globalThis:this,'+JSON.stringify(art)+');\n','docs/fuentes-frases-actuales.json':JSON.stringify(registry,null,2)+'\n'};
for(const [name,data] of Object.entries(files))fs.writeFileSync(path.join(root,name),data);
fs.writeFileSync(path.join(__dirname,'atlas-conversion.json'),JSON.stringify(Object.entries(assets).map(([name,source])=>({source:path.relative(root,source),target:path.join('assets/orators',name.replace(/\.[^.]+$/,'.webp'))})),null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'activated.json'),JSON.stringify({date:'2026-11-06',orators:899,existing:120,spain:339,france:440,atlases:Object.keys(assets).length,legends:evaluate(mastery).ids.length},null,2)+'\n');
console.log('Activated 899 unique orators; '+Object.keys(assets).length+' atlases ready for WebP conversion.');
