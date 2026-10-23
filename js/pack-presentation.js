/* Reglas de presentación de sobres: no altera rarezas ni probabilidades. */
(function(root){
'use strict';
var quantities=[1,5,10],week=7*86400000,monday=Date.UTC(1970,0,5);
function quantity(value){if(typeof value!=='number'&&typeof value!=='string')return null;var n=Number(value);return quantities.indexOf(n)>=0?n:null;}
function total(price,value){var q=quantity(value);if(q===null||!Number.isSafeInteger(price)||price<0)return null;var amount=price*q;return Number.isSafeInteger(amount)?amount:null;}
function weekIndex(now){return Math.floor((now-monday)/week);}
function cover(cards,kind,now){
 var rarity={diario:'comun',semanal:'raro',comun:'comun',raro:'raro',legendario:'legendario',mitico:'legendario'}[kind];
 var pool=cards.filter(function(c){return c.r===rarity;}).slice().sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0;});
 if(!pool.length)return null;
 var offset={diario:1,semanal:1,comun:0,raro:0,legendario:0,mitico:1}[kind]||0;
 return pool[((weekIndex(now)+offset)%pool.length+pool.length)%pool.length];
}
var api={quantities:quantities,quantity:quantity,total:total,weekIndex:weekIndex,cover:cover};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.HemicyclePacks=api;
})(typeof globalThis!=='undefined'?globalThis:this);
