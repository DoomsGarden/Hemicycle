/* Cinco gabinetes de colección. Las composiciones se guardan separadas del combate. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleCabinets=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function copy(s){return {ids:s.ids.slice(),leader:s.leader,...(s.actions?{actions:s.actions.slice()}: {})};}
function empty(){return {ids:[],leader:null};}
function state(profile){
 if(profile.cabinets)return {selected:profile.cabinets.selected,slots:profile.cabinets.slots.map(copy)};
 var ids=Array.from(new Set(profile.album)).slice(0,5),slots=Array.from({length:5},empty);if(ids.length===5)slots[0]={ids:ids,leader:ids[0]};return {selected:0,slots:slots};
}
function missing(slot,album){var owned=new Set(album);return slot.ids.filter(function(id){return !owned.has(id);});}
function ready(slot,album,actions){return (!actions||!(slot.actions||[]).some(function(id){return actions.indexOf(id)<0;}))&&slot.ids.length===5&&new Set(slot.ids).size===5&&slot.ids.indexOf(slot.leader)>=0&&missing(slot,album).length===0;}
function save(current,index,ids,leader,album,actions,ownedActions){
 if(!Number.isInteger(index)||index<0||index>4)throw new Error('El gabinete no es válido.');
 if(ids.length!==0&&!ready({ids:ids,leader:leader},album))throw new Error('Elige cinco cromos distintos de tu colección y un líder.');
 var next={selected:index,slots:current.slots.map(copy)};next.slots[index]={ids:ids.slice(),leader:ids.length?leader:null};if(actions!==undefined){if(!Array.isArray(actions)||actions.length>2||new Set(actions).size!==actions.length||actions.some(function(id){return !(ownedActions||[]).includes(id);}))throw new Error('Elige hasta dos acciones distintas de tu colección.');next.slots[index].actions=ids.length?actions.slice():[];}return next;
}
return {state:state,missing:missing,ready:ready,save:save};
});
