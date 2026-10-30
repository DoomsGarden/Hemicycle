/* Previsión pura: reglas compartidas, sin azar, guardados ni acceso a la red. */
(function(root,factory){var api=factory(typeof module==='object'&&module.exports?require('./basic-effects.js'):root.HemicycleBasicEffects);if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleAttackForecast=api;})(typeof globalThis!=='undefined'?globalThis:this,function(B){'use strict';
function copy(c){return c?Object.assign({},c,{basicStatus:c.basicStatus&&Object.assign({},c.basicStatus)}):null;}
function calculate(x){
 var a=copy(x.attacker),rules=B.forVersion(x.version),strong=x.variant==='strong',field=(x.field||[]).map(copy),target=x.target&&field.find(function(c){return c.uid===x.target;});
 function invalid(reason){return {valid:false,damage:0,reason:reason,effect:null};}
 if(!a)return invalid('Orador no disponible.');if(!x.hypothetical&&a.ready===false)return invalid('Este orador ya ha intervenido.');if(strong&&a.hp<2)return invalid('El fuerte necesita al menos 2 de Aguante.');
 if(!target&&x.target!=='empty')return invalid('El objetivo ya no está disponible.');
 if(!target&&field.length>=3)return invalid('No hay huecos rivales.');
 if(!target&&(x.emptyLeft||0)<=0)return invalid('Ya has retirado los 3 votos de este turno.');
 if(!target&&!strong&&rules&&rules.canEmpty&&!rules.canEmpty(a,x.ownTurn))return invalid('Debate encarrilado: elige un orador.');
 var requested=target&&target.uid;if(target&&!strong&&rules&&rules.redirect)target=rules.redirect(field,target,x.rivalTurn);
 var amount=strong?Math.ceil(x.power*1.5):rules?rules.normalZ(a,x.ownTurn,x.power):x.power,pierce=!strong&&rules&&rules.pierces&&rules.pierces(a,x.ownTurn);
 if(!strong&&rules)rules.consumeAttack(a,x.ownTurn);
 if(target&&x.ownDoc==='viperina'&&target.id===x.enemyLeader)amount+=2;
 var reflection=0,selfCost=strong?1:0,expels=false,saved=false,targetHp=null,attackerHp=a.hp-selfCost;
 if(!target)amount=Math.max(0,Math.min(amount,x.enemyVotes||0,x.emptyLeft||0));else{
  if(!strong&&rules)amount=rules.beforeDefense(target,x.rivalTurn,amount);
  amount=B.guardedDamage(amount,!!target.guard,!!pierce);
  if(!strong&&rules)amount=rules.afterDefense(target,x.rivalTurn,amount);
  targetHp=target.hp-amount;
  if(x.enemyDoc==='giro'){reflection=a.guard?1:1;attackerHp-=reflection;}
  saved=targetHp<=0&&x.enemyDoc==='aforado'&&!target.aforadoSpent;
  if(saved)targetHp=3;else expels=targetHp<=0;
 }
 var focusVote=x.ownDoc==='foco'&&a.id===x.ownLeader?1:0,win=(x.votes||0)+focusVote+(expels?target.votes:0)>=100;
 if(attackerHp<=0&&x.ownDoc==='aforado'&&!a.aforadoSpent)attackerHp=3;
 if(target)target.hp=targetHp;
 var id=a.basicAbility,def=rules&&rules.definition(id),effect=null,reason='';
 if(strong)reason='El fuerte no activa la habilidad básica.';
 else if(!target)reason='Los huecos no activan habilidades.';
 else if(!def)reason='Sin habilidad adicional en estas reglas.';
 else if(amount<=0)reason='Sin daño: no se activa la habilidad.';
 else if(win)reason='El debate termina antes de aplicar otro estado.';
 else if(attackerHp<=0)reason='El atacante sale antes de activar la habilidad.';
 else if(x.ownTurn<(a.basicReadyTurn||0))reason='Habilidad en recuperación.';
 else if(def.target==='rival'&&targetHp<=0)reason='El objetivo sale: no recibe otro estado.';
 else {var affected=def.target==='self'?a:target,can=rules.canGrant?rules.canGrant(affected,id):!rules.state(affected);
  if(!can)reason=def.target==='self'?'Conserva su estado activo.':'El objetivo conserva un negativo activo.';
  else if(def.instant){var ready=x.utilityReady&&x.utilityReady[id];if(ready===undefined&&x.team)ready=rules.utilityCandidates(id,x.team,x.actions).length>0;if(ready){effect=id;reason=def.name+': hay candidato; se aplica al golpear.';}else reason=id==='summon'?'Sin robo: mano llena, límite del turno o mazo sin oradores.':'Sin adelanto: límite del turno o sin apoyo elegible.';}
  else {effect=id;reason=def.name+(def.target==='self'?' para el atacante.':' sobre el rival.');}
 }
 return {valid:true,damage:amount,target:target&&target.uid,redirected:!!target&&requested!==target.uid,expels:expels,saved:saved,remaining:targetHp,reflection:reflection,selfCost:selfCost,attackerRemaining:attackerHp,effect:effect,reason:reason,win:win,empty:!target};
}
function summary(f){if(!f.valid)return f.reason;return (f.empty?f.damage+' votos retirados':f.damage+' de daño')+(f.redirected?' · desvío':'')+(f.saved?' · Aforado conserva 3 A':f.expels?' · expulsión':'')+(f.reflection?' · rebote '+f.reflection:'')+'. '+f.reason;}
return {calculate:calculate,summary:summary};});
