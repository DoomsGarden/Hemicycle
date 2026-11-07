'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'../../..'),cards=require('../../online/legacy-v32.cjs').frozenModule('js/action-cards.js').cards;
// Presentation data from the exact frozen engine, not a reconstructed rules table.
const source='/* Datos de presentación de las acciones de partidas anteriores a balance-v4. */\n(function(root,cards){var api={cards:cards,byId:Object.fromEntries(cards.map(function(c){return [c.id,c];}))};if(typeof module==="object"&&module.exports)module.exports=api;else root.HemicycleLegacyActions=api;})(typeof globalThis!=="undefined"?globalThis:this,'+JSON.stringify(cards)+');\n';
const file=path.join(root,'js/action-data-v32.js');if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==source)throw Error('Regenera la presentación histórica de acciones.');}else fs.writeFileSync(file,source);
