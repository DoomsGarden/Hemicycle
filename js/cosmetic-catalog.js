/* Primera colección completa disponible; cada categoría se elige por separado. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleCosmetics=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var categories=['menu','mat','back','coin'];
var menus=[['classic','Hemiciclo clásico'],['senate','Senado realista'],['parchment','Papiro parlamentario'],['book','Libro de actas'],['orbital','Tribuna orbital'],['hologram','Archivo holográfico']].map(function(row){return {id:row[0],name:row[1],asset:'assets/cosmetics/frames/'+row[0]+'.webp',available:true};});
var themes=[['classic','Clásico',true],['marble','Mármol azul',true],['imperial','Senado imperial',true],['orbital','Tribuna orbital',true],['garden','Jardín del consenso',false],['cats','Gatitos diplomáticos',false]];
function collection(category){if(category==='menu')return menus;return themes.map(function(t){return {id:t[0],name:t[1],adaptive:t[2],available:true,asset:category==='mat'?'assets/cosmetics/mats/'+t[0]+'.webp':'assets/cosmetics/'+(category==='back'?'backs':'coins')+'/'+t[0]+(category==='coin'?'-cara':'')+'.webp'};});}
function validate(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).length!==4||categories.some(function(k){return !collection(k).some(function(t){return t.id===raw[k];});}))throw Error('Selección visual no válida.');return {menu:raw.menu,mat:raw.mat,back:raw.back,coin:raw.coin};}
function selection(profile){var saved=profile&&profile.cosmetics||{},out={};categories.forEach(function(k){out[k]=collection(k).some(function(t){return t.id===saved[k];})?saved[k]:k==='mat'&&profile&&profile.battleTheme==='marble'?'marble':'classic';});return out;}
function combat(raw){var s=selection(raw&&typeof raw==='object'&&('cosmetics' in raw||'battleTheme' in raw)?raw:{cosmetics:raw});return {mat:s.mat,back:s.back};}
return {combat:combat,categories:categories,collection:collection,selection:selection,validate:validate};
});
