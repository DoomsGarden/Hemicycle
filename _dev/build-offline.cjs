'use strict';
// Reproducible bundle: both environments execute the same sources, no remote dependency.
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..'),{cards}=require('./market/catalog.cjs');
const entry='_dev/online/offline-rules.cjs',sources={};
// A new format must never silently rewrite any previously issued replay engine.
const crypto=require('node:crypto');
for(const row of JSON.parse(fs.readFileSync(path.join(root,'_dev/revisions/20261107/legacy-engines.json'),'utf8')).concat(JSON.parse(fs.readFileSync(path.join(root,'_dev/revisions/20261108-auras-a/legacy-engines.json'),'utf8')))){
 const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,row.file))).digest('hex');
 if(actual!==row.sha256)throw Error('Motor histórico alterado: '+row.file);
}

function visit(id){if(sources[id])return;if(id==='node:crypto'){sources[id]='module.exports={randomInt:function(){throw Error("Azar sin semilla no permitido en una partida descargada");}};';return;}
 if(id==='_dev/online/legacy-v32.cjs'||id==='_dev/online/legacy-actions1.cjs'){sources[id]=fs.readFileSync(path.join(root,id),'utf8');return;}
 // Presentation-only country metadata must not change existing downloaded rules bundles.
 if(id==='_dev/market/catalog-v2.cjs'){sources[id]='module.exports='+JSON.stringify({cards:require('../js/orator-catalog-v2.js').cards.map(function(card){const {country,...rules}=card;return rules;})})+';';return;}
 if(id==='_dev/market/catalog.cjs'){sources[id]='module.exports='+JSON.stringify({cards:cards.map(function(card){const {country,...rules}=card;return rules;})})+';';return;}
 const frozen={};
 const source=fs.readFileSync(path.join(root,frozen[id]||id),'utf8');sources[id]=source;for(const match of source.matchAll(/require\(['"]([^'"]+)['"]\)/g)){const target=match[1].startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(id),match[1])):match[1];visit(target);}}
visit(entry);const output="/* Generado por node _dev/build-offline.cjs; no editar a mano. */\n(function(root){'use strict';var modules={\n"+Object.entries(sources).map(([id,source])=>JSON.stringify(id)+':function(require,module,exports){\n'+source+'\n}').join(',\n')+"},cache={};function load(id){if(cache[id])return cache[id].exports;var m=cache[id]={exports:{}};modules[id](function(name){if(name[0]!=='.')return load(name);var parts=id.split('/');parts.pop();name.split('/').forEach(function(p){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);});return load(parts.join('/'));},m,m.exports);return m.exports;}root.HemicycleOfflineRules=load("+JSON.stringify(entry)+");})(globalThis);\n";
const serverOutput=output.replace('root.HemicycleOfflineRules=load(', 'module.exports=load(');
for(const [file,content]of [['js/offline-rules-v11.js',output],['_dev/online/offline-v11.cjs',serverOutput]]){if(process.argv.includes('--check')){if(fs.readFileSync(path.join(root,file),'utf8')!==content)throw Error(file+' no coincide con las reglas verificadas. Mantén la versión anterior para partidas pendientes.');}else fs.writeFileSync(path.join(root,file),content);}
