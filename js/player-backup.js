/* Identidad local y respaldo portable; la vinculación cloud requiere una cuenta autenticada. */
(function(root,factory){
 var exported=factory();if(typeof module==='object'&&module.exports)module.exports=exported;else root.HemicycleBackup=exported;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var KEY='hemiciclo_player_identity_v1',FORMAT='hemiciclo-backup',MAX_BYTES=8*1024*1024;
function uuid(){if(typeof crypto.randomUUID==='function')return crypto.randomUUID();var b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;var h=Array.from(b,function(v){return v.toString(16).padStart(2,'0');}).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);}
function identity(read,write){
 var existing=read(KEY);if(existing&&/^HC-[0-9a-f-]{36}$/i.test(existing.id))return existing;
 var id='HC-'+uuid(),value={id:id,createdAt:new Date().toISOString()};write(KEY,value);return value;
}
function validate(raw,catalog){
 if(!raw||raw.format!==FORMAT||raw.schemaVersion!==1)throw new Error('El archivo no es un respaldo compatible de Hemiciclo.');
 if(!raw.identity||!/^HC-[0-9a-f-]{36}$/i.test(raw.identity.id))throw new Error('El respaldo no contiene un ID de jugador válido.');
 var p=raw.profile;if(!p||!Array.isArray(p.album)||p.album.length>250000)throw new Error('La colección del respaldo no es válida.');
 var ids=new Set(catalog);if(p.album.some(function(id){return typeof id!=='string'||!ids.has(id);}))throw new Error('El respaldo contiene cromos que no reconoce esta versión.');
 ['fs','elo','w','l','lastDaily','lastWeekly','dtWins'].forEach(function(key){if(!Number.isSafeInteger(p[key])||p[key]<0)throw new Error('El valor de '+key+' no es válido.');});
 if(typeof p.dtGoldUnlocked!=='boolean'||typeof p.dtGoldActive!=='boolean'||p.dtGoldActive&&!p.dtGoldUnlocked)throw new Error('El progreso de aspectos del respaldo no es válido.');
 if(p.battleTheme!==undefined&&!['classic','marble'].includes(p.battleTheme))throw new Error('El aspecto de la bancada no es válido.');
 var mastery;
 if(p.leaderMastery!==undefined){var Mastery=typeof HemicycleMastery!=='undefined'?HemicycleMastery:require('./legendary-mastery.js');mastery=Mastery.validate(p.leaderMastery);if(p.dtGoldActive&&mastery.active.indexOf('donald-trump')>=0)throw new Error('Elige una sola edición de Donald Trump.');if(Object.keys(mastery.wins).some(function(id){return !ids.has(id);}))throw new Error('Un líder de maestría no está en el catálogo.');}
 var objectives;if(p.objectives!==undefined){var Goals=typeof HemicycleObjectives!=='undefined'?HemicycleObjectives:require('./objectives.js');objectives=Goals.validate(p.objectives);}
 var cabinets;
 if(p.cabinets!==undefined){
  var saved=p.cabinets;
  if(!saved||!Number.isInteger(saved.selected)||saved.selected<0||saved.selected>4||!Array.isArray(saved.slots)||saved.slots.length!==5)throw new Error('Los gabinetes favoritos no son válidos.');
  cabinets={selected:saved.selected,slots:saved.slots.map(function(slot){
   if(!slot||!Array.isArray(slot.ids)||![0,5].includes(slot.ids.length)||new Set(slot.ids).size!==slot.ids.length||slot.ids.some(function(id){return typeof id!=='string'||!ids.has(id);})||(slot.ids.length?slot.ids.indexOf(slot.leader)<0:slot.leader!==null))throw new Error('Un gabinete favorito contiene datos incorrectos.');
   return {ids:slot.ids.slice(),leader:slot.leader};
  })};
 }

 var league=raw.league;
 if(league!==null){
  if(!league||![1,2,3].includes(league.div)||!Number.isInteger(league.jor)||league.jor<1||league.jor>13||!Number.isSafeInteger(league.temp)||league.temp<1||!Array.isArray(league.teams)||league.teams.length!==30)throw new Error('La temporada de Liga no es válida.');
  var you=0;league.teams.forEach(function(t){if(!t||typeof t.n!=='string'||!t.n.length||t.n.length>150||typeof t.you!=='boolean')throw new Error('La clasificación de Liga no es válida.');if(t.you)you++;['pts','w','d','l','str'].forEach(function(k){if(!Number.isSafeInteger(t[k])||t[k]<0)throw new Error('La clasificación de Liga contiene valores incorrectos.');});});if(you!==1)throw new Error('La Liga debe contener un único jugador.');
 }
 var receipts;if(p.marketReceipts!==undefined){if(!Array.isArray(p.marketReceipts)||p.marketReceipts.length>100)throw new Error('El historial del mercado no es válido.');receipts=p.marketReceipts.map(function(r){if(!r||typeof r.id!=='string'||r.id.length>100||!ids.has(r.cardId)||!Number.isSafeInteger(r.quantity)||r.quantity<1||!Number.isSafeInteger(r.total)||r.total<0)throw new Error('Una operación del historial del mercado no es válida.');return {id:r.id,cardId:r.cardId,quantity:r.quantity,total:r.total};});}
 var ranked=null;
 if(raw.ranked!==undefined&&raw.ranked!==null){
  var r=raw.ranked;
  if(!Number.isSafeInteger(r.season)||r.season<1||!Number.isInteger(r.highest)||r.highest<0||r.highest>59||!Number.isInteger(r.promotions)||r.promotions<0||r.promotions>59||!Array.isArray(r.rewards)||r.rewards.length>100000)throw new Error('El progreso de clasificatoria no es válido.');
  var seen=new Set(),rewards=r.rewards.map(function(x){if(!x||!Number.isSafeInteger(x.season)||x.season<1||x.season>r.season||!Number.isInteger(x.division)||x.division<1||x.division>59||!['comun','raro','legendario'].includes(x.kind)||typeof x.claimed!=='boolean'||x.id!=='S'+x.season+'-D'+x.division+'-'+x.kind||seen.has(x.id))throw new Error('El registro de sobres de clasificatoria no es válido.');seen.add(x.id);return {id:x.id,season:x.season,kind:x.kind,division:x.division,claimed:x.claimed};});
  ranked={season:r.season,highest:r.highest,promotions:r.promotions,rewards:rewards,lastDemotion:null};
  if(r.lastDemotion&&['from','to','periods'].every(function(k){return Number.isSafeInteger(r.lastDemotion[k])&&r.lastDemotion[k]>=0;}))ranked.lastDemotion={from:r.lastDemotion.from,to:r.lastDemotion.to,periods:r.lastDemotion.periods};
 }
 var tutorials={};['battle','menu'].forEach(function(k){var t=raw.tutorials&&raw.tutorials[k];if(t&&['completed','skipped','in-progress'].includes(t.status))tutorials[k]={status:t.status,version:1,updatedAt:Number.isSafeInteger(t.updatedAt)?t.updatedAt:0};else tutorials[k]=null;});
 // Whitelist fields: importing a file never introduces executable markup or object prototypes.
 return {format:FORMAT,schemaVersion:1,identity:{id:raw.identity.id,createdAt:typeof raw.identity.createdAt==='string'?raw.identity.createdAt:raw.exportedAt},exportedAt:raw.exportedAt,gameVersion:raw.gameVersion,profile:{fs:p.fs,elo:p.elo,w:p.w,l:p.l,album:p.album.slice(),lastDaily:p.lastDaily,lastWeekly:p.lastWeekly,dtWins:p.dtWins,dtGoldUnlocked:p.dtGoldUnlocked,dtGoldActive:p.dtGoldActive,...(receipts?{marketReceipts:receipts}:{}),...(p.battleTheme?{battleTheme:p.battleTheme}:{}),...(cabinets?{cabinets:cabinets}:{}),...(mastery?{leaderMastery:mastery}:{}),...(objectives?{objectives:objectives}:{})},league:league===null?null:JSON.parse(JSON.stringify(league)),tutorials:tutorials,ranked:ranked,catalogEdition:'prelaunch-120'};
}
function build(api){return {format:FORMAT,schemaVersion:1,gameVersion:api.version,exportedAt:new Date().toISOString(),catalogEdition:'prelaunch-120',ranked:api.read('hemiciclo_ranked_seasons_v1'),identity:identity(api.read,api.write),profile:api.profile(),league:api.league(),tutorials:{battle:api.read('hemiciclo_tutorial_v1'),menu:api.read('hemiciclo_menu_tutorial_v1')}};}
function parse(text,catalog){if(typeof text!=='string'||new Blob([text]).size>MAX_BYTES)throw new Error('El respaldo supera el tamaño permitido de 8 MB.');var raw;try{raw=JSON.parse(text.replace(/^\uFEFF/,''));}catch(e){throw new Error('El archivo no contiene un respaldo JSON válido.');}return validate(raw,catalog);}
function storageValues(data){
 var values={'hemiciclo_v21':data.profile,'hemiciclo_liga_v9':data.league,'hemiciclo_tutorial_v1':data.tutorials.battle,'hemiciclo_menu_tutorial_v1':data.tutorials.menu};values[KEY]=data.identity;values['hemiciclo_ranked_seasons_v1']=data.ranked;return values;
}
function restore(storage,data){
 var values=storageValues(data);
 var before={};Object.keys(values).forEach(function(k){before[k]=storage.getItem(k);});
 try{Object.keys(values).forEach(function(k){if(values[k]===null)storage.removeItem(k);else storage.setItem(k,JSON.stringify(values[k]));});}
 catch(error){Object.keys(before).forEach(function(k){try{if(before[k]===null)storage.removeItem(k);else storage.setItem(k,before[k]);}catch(ignore){}});throw new Error('No se ha podido restaurar el respaldo. Comprueba el espacio disponible del navegador.');}
}
return {storageValues:storageValues,restore:restore,key:KEY,identity:identity,build:build,parse:parse,validate:validate,maxBytes:MAX_BYTES};
});
