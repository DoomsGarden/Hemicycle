/* Presentación de la habilidad antes de elegir un objetivo. No ejecuta reglas. */
(function(root,factory){var api=factory(typeof module==='object'&&module.exports?require('./basic-effects.js'):root.HemicycleBasicEffects);if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBasicAbilityPreview=api;})(typeof globalThis!=='undefined'?globalThis:this,function(B){'use strict';
var summaries={surge:'Propio: +1 Z en el básico del próximo turno.',coffee:'Propio: recupera 1 A en el próximo turno.',archive:'Rival: −1 A al inicio de sus próximos 2 turnos.',tongue:'Rival: −1 Z en su siguiente básico.',shield:'Propio: absorbe 1 del siguiente básico recibido.',microphone:'Rival: +1 de daño en el siguiente básico recibido.',acta:'Rival: −1 voto pasivo en su próximo turno.',paperwork:'Rival: su próximo apoyo voluntario cuesta 1 TdP.',escort:'Propio: recibe un básico dirigido a un compañero.',fineprint:'Propio: el próximo básico atraviesa 1 punto de la defensa del 50 %.',bank:'Propio: reserva 1 TdP sobrante para el próximo turno.',summon:'Roba el orador más barato del mazo, si hay hueco en mano.',fasttrack:'Adelanta 1 turno una acción de apoyo al azar.',lane:'Rival: no puede usar su próximo básico contra huecos.'};
var examples={
 surge:'Un orador de 2 Z causa 2 con este básico. En su próximo turno propio, su básico puede causar 3. Si ese turno defiende, cura o solo usa el fuerte, el aumento caduca sin aprovecharse.',
 coffee:'Ataca con 3 de 4 A. Si sigue en mesa y conserva el efecto, al comenzar su próximo turno recupera 1 y queda en 4 de 4. No cura inmediatamente ni supera su máximo; si lo expulsan antes, no llega a curarse.',
 archive:'El rival sobrevive al golpe y pierde 1 A al comienzo de cada uno de sus dos próximos turnos. Son 2 A en total, antes de sus votos pasivos. El desgaste continúa aunque el atacante haya salido de la mesa.',
 tongue:'Un rival de 4 Z hará 3 en su siguiente básico. No reduce su fuerte y nunca deja el básico por debajo de 1 Z. Si no usa el básico, el estado caduca al terminar su siguiente turno.',
 shield:'Un básico rival de 4 hace 3 tras absorber 1. Con una defensa del 50 % ya preparada, el golpe baja primero a 2 y la absorción lo deja en 1. Se consume una vez; no aumenta el Aguante máximo ni absorbe fuertes o cartas de acción.',
 microphone:'Un básico de 4 pasa a 5 al golpear al afectado. Si este tiene defensa del 50 %, recibe 3 al redondear hacia arriba. La vulnerabilidad se consume con ese golpe; no amplifica fuertes ni acciones.',
 acta:'Un raro aporta 2 votos en su próximo turno en vez de 3. Los 3 votos base de su jugador y los 3 escaños que concede al ser expulsado no cambian. Después desaparece el estado.',
 paperwork:'El afectado quiere defender o curarse con su tercera frase: debe pagar 1 TdP y gastar su intervención habitual. Atacar sigue siendo gratuito. No encarece cartas de acción y desaparece tras pagar ese apoyo o al caducar.',
 escort:'Si un básico iba dirigido a otro compañero, lo recibe este orador y se consume el desvío. No reduce el daño. Si tiene 7 A y recibe 7, puede ser expulsado. No desvía fuertes, acciones ni ataques a huecos; un golpe dirigido directamente al protector no gasta por sí solo el desvío.',
 fineprint:'Tras preparar el efecto: con 2 Z, un básico contra defensa pasa de 1 a 2; con 4 Z, de 2 a 3; con 7 Z, de 4 a 5. Sin defensa, un básico de 4 sigue haciendo 4 y consume igualmente la preparación. No recupera Aguante ni atraviesa Argumentario plastificado.',
 bank:'Acabas el turno con 2 TdP: reserva 1 y quedan 1. Si el próximo turno te correspondían 4, tendrás 5 al sumar la reserva, con máximo de 8. Solo se guarda uno por bancada; salir de mesa o perder el beneficio hace perder la reserva pendiente.',
 summon:'Tienes un orador en mano y quedan uno de coste 3 y otro de coste 5 en el mazo: robas el de coste 3, aunque no sea común. No lo presenta gratis. Con dos oradores en mano o sin oradores en el mazo, no se gasta. Solo un robo de esta habilidad por turno propio y jugador. La mano se renueva en tu siguiente turno: aprovecha ahora esa opción.',
 fasttrack:'Receso tiene 3 turnos de espera y Escudo parlamentario 2: elige uno al azar y le resta un turno. Una acción a la que solo le queda 1 no es elegible. La acción sigue en el mazo: no se roba ni se lanza automáticamente. Solo una activación por turno propio y jugador, aunque haya varios portadores. Cada portador descansa un turno propio completo entre activaciones. No acorta la curación del orador.',
 lane:'El afectado puede usar su básico contra un orador, pero no contra un hueco para retirar votos. Puede defender, curar o usar un fuerte contra un hueco si tiene el fuerte disponible. El estado se consume con su siguiente básico o caduca al terminar su siguiente turno.'
};
function example(id){return examples[id]||'';}
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
 else if(def.target==='rival'&&!rivals.some(function(c){var s=B.state(c);return (rules.canGrant?rules.canGrant(c,id):!s)||['shield','microphone'].includes(s&&s.id);})){reason=rules.canGrant?'Los rivales tienen un estado negativo que sigue activo; no se sustituye ni renueva.':'Los rivales tienen un estado activo que no se sustituye.';state='blocked';}
 else if(def.instant&&B.state(copy)){reason='Bloqueada por el estado activo de este orador.';state='blocked';}
 else if(rules.version==='basic4'&&['fasttrack','summon'].includes(id)&&game[id==='fasttrack'?'fasttrackUsedTurn':'summonUsedTurn']&&game[id==='fasttrack'?'fasttrackUsedTurn':'summonUsedTurn'][side]===turn){reason=def.name+' ya se ha usado en este turno propio.';state='blocked';}
 else if(rules.version!=='basic4'&&id==='fasttrack'&&game.fasttrackUsed&&game.fasttrackUsed[side]){reason='Ventanilla rápida ya se ha usado en esta partida.';state='blocked';}
 else if(id==='summon'&&(game.hand&&game.hand[side]||[]).filter(function(c){return !c.action;}).length>=2){reason='Necesita un hueco de orador en mano.';state='conditional';}
 else if(id==='summon'&&(game.authoritative?game.basicUtilityReady&&game.basicUtilityReady.summon===false:!rules.utilityCandidates(id,{hand:game.hand&&game.hand[side]||[],deck:game.deck&&game.deck[side]||[],turn:turn},null).length)){reason=rules.version==='basic4'?'No quedan oradores en el mazo para robar.':'No quedan comunes en el mazo para robar.';state='conditional';}
 else if(id==='fasttrack'&&game.authoritative&&game.basicUtilityReady&&game.basicUtilityReady.fasttrack===false){reason='No hay una acción de apoyo elegible en recuperación en el mazo.';state='conditional';}
 else if(id==='fasttrack'){reason='Requiere una carta de acción de apoyo en el mazo con al menos 2 turnos de espera; no adelanta la curación de la tercera frase.';state='conditional';}
 else reason=def.target==='rival'?(rules.canGrant?'Si el objetivo sobrevive: sustituye un positivo; no renueva un negativo que siga activo.':'Si el objetivo sobrevive y queda su plaza libre.'):'Si causas daño y tu orador permanece en mesa.';
 return {id:id,name:def.name,summary:rules.version!=='basic4'&&['summon','fasttrack'].includes(id)?def.description:summaries[id],availability:reason,state:state};
}
var simple={
 surge:'Tu próximo turno: +1 Zasca en un ataque básico. Si no lo usas ese turno, se pierde.',
 coffee:'Al empezar tu próximo turno, recupera 1 Aguante. No supera su máximo.',
 archive:'El rival pierde 1 Aguante al empezar cada uno de sus dos próximos turnos. Continúa aunque salga el atacante.',
 tongue:'El siguiente básico del rival pierde 1 Zasca, con mínimo de 1. No reduce el fuerte.',
 shield:'Absorbe 1 de daño del próximo básico recibido, después de la defensa. No protege de fuertes ni acciones.',
 microphone:'El próximo básico que reciba el rival causa 1 de daño adicional, antes de la defensa.',
 acta:'El rival aporta 1 voto menos en su próximo turno. No cambia los votos base ni los de expulsión.',
 paperwork:'La próxima defensa o curación del rival cuesta 1 Tiempo de Palabra (TdP). No encarece cartas de acción.',
 escort:'Recibe en su lugar el próximo básico dirigido a un compañero. No reduce el daño ni desvía fuertes o acciones.',
 fineprint:'Su siguiente básico atraviesa 1 punto de la reducción de una defensa del 50 %. Con 4 Zasca, causa 3 en vez de 2. Sin defensa no añade daño, pero se consume. No cura ni mejora el fuerte.',
 bank:'Guarda 1 TdP que sobre al cerrar tu turno y lo devuelve al empezar el siguiente. Una reserva por bancada, máximo 8 TdP. Se pierde si el portador sale o pierde el estado.',
 summon:'Roba el orador de menor coste de tu mazo, de cualquier rareza. En empates sigue el orden del mazo. Máximo dos oradores en mano y un robo de esta habilidad por turno propio y jugador. Debes pagar su coste para presentarlo. La mano se renueva en tu próximo turno.',
 fasttrack:'Reduce en 1 turno la espera de una acción de apoyo del mazo, elegida al azar entre las que esperan al menos 2 turnos. Una activación por turno propio y jugador; cada portador descansa un turno propio completo. No adelanta la curación del orador ni roba la acción.',
 lane:'El siguiente básico del rival debe dirigirse a un orador, sin retirar votos de huecos. Puede usar defensas, curaciones y fuertes.'
};
function detail(id,version){if(version&&version!==B.version){var rules=B.forVersion(version),def=rules&&rules.definition(id);return def?def.description:'';}return simple[id]||'';}
function stateText(view){return view.text.replace(' No admite otro estado básico mientras permanezca activo.','');}
return {describe:describe,detail:detail,stateText:stateText,example:example};});
