/* Presentación de la habilidad antes de elegir un objetivo. No ejecuta reglas. */
(function(root,factory){var api=factory(typeof module==='object'&&module.exports?require('./basic-effects.js'):root.HemicycleBasicEffects);if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBasicAbilityPreview=api;})(typeof globalThis!=='undefined'?globalThis:this,function(B){'use strict';
var summaries={surge:'Propio: +1 Z en el básico del próximo turno.',coffee:'Propio: recupera 1 A en el próximo turno.',archive:'Rival: −1 A al inicio de sus próximos 2 turnos.',tongue:'Rival: −1 Z en su siguiente básico.',shield:'Propio: absorbe 1 del siguiente básico recibido.',microphone:'Rival: +1 de daño en el siguiente básico recibido.',acta:'Rival: −1 voto pasivo en su próximo turno.',paperwork:'Rival: su próximo apoyo voluntario cuesta 1 TdP.',escort:'Propio: recibe un básico dirigido a un compañero.',fineprint:'Propio: recupera 1 de daño frente a defensa en su próximo básico.',bank:'Propio: reserva 1 TdP sobrante para el próximo turno.',summon:'Propio: roba un común de tu mazo si hay hueco en mano.',fasttrack:'Propio: adelanta 1 turno una acción de apoyo al azar, una vez por partida.',lane:'Rival: no puede usar su próximo básico contra huecos.'};
function describe(game,side,card){
 var rules=B.forVersion(game.effectsVersion),id=card.basicAbility,def=rules&&rules.definition(id),assigned=B.ability(card.k||card.id);
 if(game.tutorial)return {id:null,name:'Práctica sin habilidades adicionales',summary:'',availability:'',state:'none'};
 if(!rules)return {id:null,name:assigned?'Partida con reglas anteriores':'Sin habilidad adicional',summary:assigned?'Las habilidades se aplican en partidas nuevas.':'',availability:'',state:'none'};
 if(!def)return {id:null,name:'Sin habilidad adicional',summary:'',availability:'',state:'none'};
 var turn=game.turns[side]||0,foe=side==='p'?'e':'p',rivals=game.field[foe]||[],recovery=Math.max(0,(card.basicReadyTurn||0)-turn),copy=Object.assign({},card,{basicStatus:card.basicStatus&&Object.assign({},card.basicStatus)}),reason='',state='ready';
 rules.consumeAttack(copy,turn);
 if(recovery){reason='En recuperación: '+recovery+(recovery===1?' turno propio.':' turnos propios.');state='recovery';}
 else if(!rivals.length){reason='Requiere golpear a un orador; no se activa en huecos.';state='conditional';}
 else if(def.target==='self'&&B.state(copy)){reason='Bloqueada por el estado activo de este orador.';state='blocked';}
 else if(def.target==='rival'&&!rivals.some(function(c){var s=B.state(c);return !s||['shield','microphone'].includes(s.id);})){reason='Los rivales tienen un estado activo que no se sustituye.';state='blocked';}
 else if(def.instant&&B.state(copy)){reason='Bloqueada por el estado activo de este orador.';state='blocked';}
 else if(id==='fasttrack'&&game.fasttrackUsed&&game.fasttrackUsed[side]){reason='Ventanilla rápida ya se ha usado en esta partida.';state='blocked';}
 else if(id==='summon'&&(game.hand&&game.hand[side]||[]).filter(function(c){return !c.action;}).length>=2){reason='Necesita un hueco de orador en mano.';state='conditional';}
 else if(id==='fasttrack'){reason='Requiere una carta de acción de apoyo en el mazo con al menos 2 turnos de espera; no adelanta la curación de la tercera frase.';state='conditional';}
 else reason=def.target==='rival'?'Si el objetivo sobrevive y queda su plaza libre.':'Si causas daño y tu orador permanece en mesa.';
 return {id:id,name:def.name,summary:summaries[id],availability:reason,state:state};
}
function detail(id){var d=B.definition(id);if(!d)return '';var text=d.description.replace(/^Tras causar daño con un básico(?: a un orador)?, /,'');return text.charAt(0).toUpperCase()+text.slice(1);}
function stateText(view){return view.text.replace(' No admite otro estado básico mientras permanezca activo.','');}
return {describe:describe,detail:detail,stateText:stateText};});
