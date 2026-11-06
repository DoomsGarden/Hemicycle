/* Presentación recuperable de premios ya abonados. Nunca concede cromos ni FS. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicyclePackJournal=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function normalize(raw){
 if(!raw||typeof raw.id!=='string'||!raw.id||raw.id.length>160||!Array.isArray(raw.packs)||!raw.packs.length||raw.packs.length>100||raw.packs.some(function(p){return !Array.isArray(p)||!p.length||p.length>50||p.some(function(id){return typeof id!=='string'||id.length>100;});}))throw Error('El recibo de apertura no es válido.');
 return {id:raw.id,k:raw.k||raw.kind||'comun',country:raw.country||'',from:raw.from||'buzon',created:Number.isSafeInteger(raw.created)?raw.created:Date.now(),packs:raw.packs.map(function(p){return p.slice();}),opened:raw.packs.map(function(_,i){return !!(raw.opened&&raw.opened[i]);}),legacy:raw.legacy===true,free:raw.free!==false};
}
function merge(saved,receipt){var list=(saved||[]).map(normalize),next=normalize(receipt),old=list.find(function(r){return r.id===next.id;});if(old){if(JSON.stringify(old.packs)!==JSON.stringify(next.packs))throw Error('El contenido guardado del sobre no coincide.');old.opened=old.opened.map(function(v,i){return v||next.opened[i];});}else list.push(next);return list;}
function seen(saved,id,index){var list=(saved||[]).map(normalize),r=list.find(function(x){return x.id===id;});if(!r||!Number.isInteger(index)||index<0||index>=r.packs.length)throw Error('Sobre pendiente no válido.');r.opened[index]=true;return list;}
function pending(saved){return (saved||[]).map(normalize).filter(function(r){return !r.legacy&&r.opened.some(function(v){return !v;});});}
function presentation(receipt,index){var r=normalize(receipt);if(!Number.isInteger(index)||index<0||index>=r.packs.length){index=r.opened.indexOf(false);if(index<0)index=r.packs.length-1;}return {receiptId:r.id,k:r.k,country:r.country,from:r.from,free:r.free,quantity:r.packs.length,packs:r.packs,opened:r.opened,packIndex:index,cards:r.packs[index],revealed:r.opened[index]};}
return {normalize:normalize,merge:merge,seen:seen,pending:pending,presentation:presentation};
});
