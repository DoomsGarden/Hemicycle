/* Preserve earned collection milestones when a later edition grows the catalog. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleCollectionMilestones=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
// Last published catalog before this ledger: 899 orators + 92 actions,
// including 90 legendary orators + 11 legendary actions.
var legacy=Object.freeze({total:991,legendary:101});
function steps(id,counts){var n=id==='collection'?counts.total:counts.legendary;return Array.from(new Set((id==='collection'?[10,25,50,100,Math.ceil(n*.25),Math.ceil(n*.5),Math.ceil(n*.75),n]:[1,3,6,Math.ceil(n*.5),n]).filter(function(step){return step>0&&step<=n;}))).sort(function(a,b){return a-b;});}
function key(entry){return entry.id+'/'+entry.step;}
function capture(state,counts,values){
 var claimed=new Set(state.claimed),entries=(state.earnedCollection||[]).filter(function(e){return !claimed.has(key(e));}),known=new Set(entries.map(key));
 ['collection','legendary'].forEach(function(id){steps(id,counts).forEach(function(step){var k=id+'/'+step;if((values[id]||0)>=step&&!claimed.has(k)&&!known.has(k)){entries.push({id:id,step:step,catalog:{total:counts.total,legendary:counts.legendary}});known.add(k);}});});
 state.earnedCollection=entries;return state;
}
function prepare(state,previouslySaved){var prior=state.collectionCatalog||(previouslySaved?legacy:null);if(prior)capture(state,prior,state.totals);return state;}
function include(id,current,state){return Array.from(new Set(current.concat((state.earnedCollection||[]).filter(function(e){return e.id===id;}).map(function(e){return e.step;})))).sort(function(a,b){return a-b;});}
function earned(state,id,step){return (state.earnedCollection||[]).find(function(e){return e.id===id&&e.step===step;})||null;}
function forget(state,id,step){if(state.earnedCollection)state.earnedCollection=state.earnedCollection.filter(function(e){return e.id!==id||e.step!==step;});}
function validCounts(counts){return counts&&typeof counts==='object'&&!Array.isArray(counts)&&Number.isSafeInteger(counts.total)&&counts.total>=0&&counts.total<=250000&&Number.isSafeInteger(counts.legendary)&&counts.legendary>=0&&counts.legendary<=counts.total;}
function validate(state){
 if(state.collectionCatalog!==undefined&&!validCounts(state.collectionCatalog))throw Error('Catálogo de hitos no válido.');
 if(state.earnedCollection===undefined)return;
 if(!Array.isArray(state.earnedCollection)||state.earnedCollection.length>2000)throw Error('Hitos de colección pendientes no válidos.');
 var seen=new Set();state.earnedCollection.forEach(function(e){if(!e||!['collection','legendary'].includes(e.id)||!Number.isSafeInteger(e.step)||e.step<1||!validCounts(e.catalog)||!steps(e.id,e.catalog).includes(e.step)||(state.totals[e.id]||0)<e.step||state.claimed.includes(key(e))||seen.has(key(e)))throw Error('Hito de colección pendiente no válido.');seen.add(key(e));});
}
return Object.freeze({legacy:legacy,steps:steps,capture:capture,prepare:prepare,include:include,earned:earned,forget:forget,validate:validate});
});
