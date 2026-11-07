/* Cinco gabinetes de colección. Las composiciones se guardan separadas del combate. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleCabinets=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function copy(s){return {ids:s.ids.slice(),leader:s.leader,...(s.actions?{actions:s.actions.slice()}: {})};}
function empty(){return {ids:[],leader:null};}
function state(profile){
 if(profile.cabinets){var format=typeof HemicycleFormat!=='undefined'?HemicycleFormat:require('./game-format.js');return {selected:profile.cabinets.selected,slots:profile.cabinets.slots.map(function(slot){return slot.ids.length&&(slot.ids.length!==8||(slot.actions||[]).length!==4)?format.selection(slot,profile.album,profile.actionAlbum):copy(slot);})};}
 var ids=Array.from(new Set(profile.album)).slice(0,8),actions=Array.from(new Set(profile.actionAlbum||[])).slice(0,4),slots=Array.from({length:5},empty);if(ids.length===8)slots[0]={ids:ids,leader:ids[0],actions:actions};return {selected:0,slots:slots};
}
function missing(slot,album){var owned=new Set(album);return slot.ids.filter(function(id){return !owned.has(id);});}
function ready(slot,album,actions){return (slot.actions||[]).length===4&&new Set(slot.actions).size===4&&Array.isArray(actions)&&!slot.actions.some(function(id){return actions.indexOf(id)<0;})&&slot.ids.length===8&&new Set(slot.ids).size===8&&slot.ids.indexOf(slot.leader)>=0&&missing(slot,album).length===0;}
function save(current,index,ids,leader,album,actions,ownedActions){
 if(!Number.isInteger(index)||index<0||index>4)throw new Error('El gabinete no es válido.');
 if(ids.length!==0&&!(ids.length===8&&new Set(ids).size===8&&ids.includes(leader)&&missing({ids:ids},album).length===0))throw new Error('Elige ocho oradores distintos de tu colección y un líder.');
 actions=actions===undefined?[]:actions;if(!Array.isArray(actions)||actions.length!==(ids.length?4:0)||new Set(actions).size!==actions.length||actions.some(function(id){return !(ownedActions||[]).includes(id);}))throw new Error('Elige cuatro acciones distintas de tu colección.');
 var next={selected:index,slots:current.slots.map(copy)};next.slots[index]={ids:ids.slice(),leader:ids.length?leader:null,actions:actions.slice()};return next;
}
return {state:state,missing:missing,ready:ready,save:save};
});
