/* Ediciones de confeti: hitos permanentes por victorias con el político como líder. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleMastery=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 var IDS=Object.freeze(['alberto-nunez-feijoo','angela-merkel','barack-obama','boris-johnson','carles-puigdemont','donald-trump','emmanuel-macron','isabel-diaz-ayuso','mariano-rajoy','pedro-sanchez','vladimir-putin','yolanda-diaz']),FINAL=250;
 function eligible(id){return IDS.indexOf(id)>=0;}
 function validate(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||!raw.wins||typeof raw.wins!=='object'||Array.isArray(raw.wins)||!Array.isArray(raw.unlocked)||!Array.isArray(raw.active))throw new Error('El progreso de maestría no es válido.');
  var wins={};Object.keys(raw.wins).forEach(function(id){var n=raw.wins[id];if(!eligible(id)||!Number.isSafeInteger(n)||n<0)throw new Error('Las victorias de maestría no son válidas.');wins[id]=n;});
  function list(values){if(values.length>IDS.length||new Set(values).size!==values.length||values.some(function(id){return !eligible(id);}))throw new Error('Las ediciones de maestría no son válidas.');return values.slice();}
  var unlocked=list(raw.unlocked),active=list(raw.active);
  if(unlocked.some(function(id){return (wins[id]||0)<FINAL;})||active.some(function(id){return unlocked.indexOf(id)<0;}))throw new Error('La edición de confeti no está desbloqueada.');
  return {wins:wins,unlocked:unlocked,active:active};
 }
 function state(profile){return profile.leaderMastery?validate(profile.leaderMastery):{wins:{},unlocked:[],active:[]};}
 function recordWin(profile,id){var s=state(profile);if(!eligible(id))return s;s.wins[id]=Math.min(Number.MAX_SAFE_INTEGER,(s.wins[id]||0)+1);return s;}
 function claim(profile,id){var s=state(profile);if(!eligible(id)||(s.wins[id]||0)<FINAL)throw new Error('Consigue 250 victorias con este político como líder.');if(s.unlocked.indexOf(id)<0)s.unlocked.push(id);return s;}
 function equip(profile,id,on){var s=state(profile);if(s.unlocked.indexOf(id)<0)throw new Error('Primero reclama esta edición.');s.active=s.active.filter(function(x){return x!==id;});if(on)s.active.push(id);return s;}
 function enabled(profile,id){return eligible(id)&&state(profile).active.indexOf(id)>=0;}
 return Object.freeze({ids:IDS,finalWins:FINAL,eligible:eligible,validate:validate,state:state,recordWin:recordWin,claim:claim,equip:equip,enabled:enabled});
});
