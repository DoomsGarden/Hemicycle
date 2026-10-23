/* Cinco gabinetes de colección. Las composiciones se guardan separadas del combate. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleCabinets=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function empty(){return {ids:[],leader:null};}
function state(profile){
 if(profile.cabinets)return {selected:profile.cabinets.selected,slots:profile.cabinets.slots.map(function(s){return {ids:s.ids.slice(),leader:s.leader};})};
 var ids=Array.from(new Set(profile.album)).slice(0,5),slots=Array.from({length:5},empty);if(ids.length===5)slots[0]={ids:ids,leader:ids[0]};return {selected:0,slots:slots};
}
function missing(slot,album){var owned=new Set(album);return slot.ids.filter(function(id){return !owned.has(id);});}
function ready(slot,album){return slot.ids.length===5&&new Set(slot.ids).size===5&&slot.ids.indexOf(slot.leader)>=0&&missing(slot,album).length===0;}
function save(current,index,ids,leader,album){
 if(!Number.isInteger(index)||index<0||index>4)throw new Error('El gabinete no es válido.');
 if(ids.length!==0&&!ready({ids:ids,leader:leader},album))throw new Error('Elige cinco cromos distintos de tu colección y un líder.');
 var next={selected:index,slots:current.slots.map(function(s){return {ids:s.ids.slice(),leader:s.leader};})};next.slots[index]={ids:ids.slice(),leader:ids.length?leader:null};return next;
}
return {state:state,missing:missing,ready:ready,save:save};
});
