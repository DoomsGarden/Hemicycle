/* Presentación de la habilidad antes de elegir un objetivo. No ejecuta reglas. */
(function(root,factory){var api=factory(typeof module==='object'&&module.exports?require('./basic-effects.js'):root.HemicycleBasicEffects);if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBasicAbilityPreview=api;})(typeof globalThis!=='undefined'?globalThis:this,function(B){'use strict';
var summaries={surge:'Propio: +1 Z en el básico del próximo turno.',coffee:'Propio: recupera 1 A en el próximo turno.',archive:'Rival: −1 A al inicio de sus próximos 2 turnos.',tongue:'Rival: −1 Z en su siguiente básico.',shield:'Propio: absorbe 1 del siguiente básico recibido.',microphone:'Rival: +1 de daño en el siguiente básico recibido.'};
function describe(game,side,card){
 var id=card.basicAbility,def=B.definition(id),assigned=B.ability(card.k||card.id);
 if(game.tutorial)return {id:null,name:'Práctica sin habilidades adicionales',summary:'',availability:'',state:'none'};
 if(game.effectsVersion!==B.version)return {id:null,name:assigned?'Partida con reglas anteriores':'Sin habilidad adicional',summary:assigned?'Las habilidades se aplican en partidas nuevas.':'',availability:'',state:'none'};
 if(!def)return {id:null,name:'Sin habilidad adicional',summary:'',availability:'',state:'none'};
 var turn=game.turns[side]||0,foe=side==='p'?'e':'p',rivals=game.field[foe]||[],recovery=Math.max(0,(card.basicReadyTurn||0)-turn),copy=Object.assign({},card,{basicStatus:card.basicStatus&&Object.assign({},card.basicStatus)}),reason='',state='ready';
 B.consumeAttack(copy,turn);
 if(recovery){reason='En recuperación: '+recovery+(recovery===1?' turno propio.':' turnos propios.');state='recovery';}
 else if(!rivals.length){reason='Requiere golpear a un orador; no se activa en huecos.';state='conditional';}
 else if(def.target==='self'&&B.state(copy)){reason='Bloqueada por el estado activo de este orador.';state='blocked';}
 else if(def.target==='rival'&&!rivals.some(function(c){var s=B.state(c);return !s||['shield','microphone'].includes(s.id);})){reason='Los rivales tienen un estado activo que no se sustituye.';state='blocked';}
 else reason=def.target==='rival'?'Si el objetivo sobrevive y queda su plaza libre.':'Si causas daño y tu orador permanece en mesa.';
 return {id:id,name:def.name,summary:summaries[id],availability:reason,state:state};
}
function detail(id){var d=B.definition(id);if(!d)return '';var text=d.description.replace(/^Tras causar daño con un básico(?: a un orador)?, /,'');return text.charAt(0).toUpperCase()+text.slice(1);}
function stateText(view){return view.text.replace(' No admite otro estado básico mientras permanezca activo.','');}
return {describe:describe,detail:detail,stateText:stateText};});
