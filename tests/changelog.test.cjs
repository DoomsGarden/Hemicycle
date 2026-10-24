const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {test}=require('node:test');
const entries=require('../js/changelog.js');

test('version notes cover every recorded playable version and the first repository entry',()=>{
 const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const current=html.match(/var VERSION='([^']+)'/)[1];
 const sources=JSON.parse(fs.readFileSync(path.join(root,'_dev/changelog/fuentes.json'),'utf8')).registros;
 const expected=new Set(sources.map(item=>item.version==='?'?'Inicio':item.version));expected.add(current);
 assert.equal(new Set(entries.map(e=>e.version)).size,entries.length);
 assert.deepEqual(new Set(entries.map(e=>e.version)),expected);
 assert.equal(entries[0].version,current);
 assert.equal(entries.at(-1).version,'Inicio');
 const dates=new Map();
 for(const source of sources)dates.set(source.version==='?'?'Inicio':source.version,source.date_madrid);
 for(let i=0;i<entries.length;i++){
  const entry=entries[i];
  assert.match(entry.date,/^\d{4}-\d{2}-\d{2}$/);
  if(i)assert.ok(entry.date<=entries[i-1].date);
  if(entry.version!==current)assert.equal(entry.date,dates.get(entry.version));
  assert.ok(entry.title&&entry.sections.length);
  for(const section of entry.sections){
   assert.ok(section.title&&section.items.length);
   for(const item of section.items){assert.ok(item.length>10);assert.doesNotMatch(item,/<\/?(?:script|iframe|img)\b/i)}
  }
 }
});

test('development tools are excluded from Pages and never linked or precached by the game',()=>{
 const root=path.resolve(__dirname,'..');
 assert.match(fs.readFileSync(path.join(root,'_config.yml'),'utf8'),/exclude:\s*\n\s*-\s*_dev/);
 for(const file of ['index.html','sw.js','manifest.json']){
  assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),/_dev\//,file);
 }
 const preview=fs.readFileSync(path.join(root,'_dev/confetti/index.html'),'utf8');
 assert.match(preview,/src="\.\.\/\.\.\/js\/card-confetti.js"/);
 assert.doesNotMatch(preview,/venice\.ai|esm\.sh|localStorage|sessionStorage|postMessage|fetch\(/);
});

test('public version notes never reveal the hidden achievement or its reward',()=>{
 const publicText=JSON.stringify(entries);
 assert.doesNotMatch(publicText,/trump|aspecto (?:especial|dorad)|sonrisa|Zasca base|Aguante base/i);
});

test('same-version corrections retain all published notes from v31.0.1.1 onwards',()=>{
 const baseline=require('../_dev/changelog/published-v31.0.1.x.json').baseline;
 for(const release of baseline){const entry=entries.find(e=>e.version===release.version);assert.ok(entry,release.version);const items=entry.sections.flatMap(s=>s.items);for(const original of release.sections.flatMap(s=>s.items))assert.ok(items.some(item=>item.includes(original)),release.version+' must retain the published note from '+release.ref+': '+original);}
});
