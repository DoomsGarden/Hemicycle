/* Las instancias de partidas anteriores conservan su coste emitido. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleActionCosts=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 var previousSeven=new Set(['renovacion-del-consenso','mocion-de-escrutinio']);
 function forInstance(card,instance){
  if(!card||!instance||!previousSeven.has(card.id)||card.cost!==6)return card;
  var saved=instance.cost===undefined?instance.c:instance.cost;
  if(saved!==7)return card;
  return Object.assign({},card,{cost:7,c:7,ruleLines:(card.ruleLines||[]).map(function(line){return line==='Coste: 6 TdP.'?'Coste: 7 TdP.':line;})});
 }
 return {forInstance:forInstance};
});
