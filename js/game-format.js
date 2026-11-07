/* Formato compartido: selección, migración y protección de colecciones. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleFormat=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var ORATORS=8,ACTIONS=4,STARTER_ACTIONS=['turno-de-palabra','replica','receso','carpeta-protectora'];
function unique(list){return Array.from(new Set(list||[]));}
function canLose(profile,id,action){var list=(action?profile.actionAlbum:profile.album)||[];return list.includes(id)&&(list.filter(function(x){return x===id;}).length>1||unique(list).length>(action?ACTIONS:ORATORS));}
function ensureCollection(profile,orators,actions){
 var added={orators:[],actions:[]};if(!Array.isArray(profile.actionAlbum))profile.actionAlbum=[];
 var choices=orators.filter(function(c){return c.r==='comun';}).slice().sort(function(a,b){return a.id.localeCompare(b.id);});
 for(var c of choices){if(unique(profile.album).length>=ORATORS)break;if(!profile.album.includes(c.id)){profile.album.push(c.id);added.orators.push(c.id);}}
 var known=new Set(actions.map(function(c){return c.id;})),ids=STARTER_ACTIONS.concat(actions.filter(function(c){return c.r==='comun';}).map(function(c){return c.id;}));
 for(var id of ids){if(unique(profile.actionAlbum).length>=ACTIONS)break;if(known.has(id)&&!profile.actionAlbum.includes(id)){profile.actionAlbum.push(id);added.actions.push(id);}}
 return added;
}
function selection(slot,album,actions){
 var owned=new Set(album||[]),support=new Set(actions||[]),ids=unique(slot.ids).filter(function(id){return owned.has(id);}).slice(0,ORATORS),cards=unique(slot.actions).filter(function(id){return support.has(id);}).slice(0,ACTIONS);
 for(var id of unique(album)){if(ids.length>=ORATORS)break;if(!ids.includes(id))ids.push(id);}
 for(var id of unique(actions)){if(cards.length>=ACTIONS)break;if(!cards.includes(id))cards.push(id);}
 return {ids:ids,leader:ids.includes(slot.leader)?slot.leader:ids[0]||null,actions:cards};
}
return Object.freeze({id:'cabinet8-actions4-v1',orators:ORATORS,actions:ACTIONS,starterActions:STARTER_ACTIONS,unique:unique,canLose:canLose,ensureCollection:ensureCollection,selection:selection});
});
