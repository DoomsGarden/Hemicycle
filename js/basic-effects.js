/* Estados de ataques básicos: una plaza por orador, reglas compartidas y sin azar. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBasicEffects=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var VERSION='basic1';
var definitions={
 surge:{name:'Se viene arriba',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, gana +1 Zasca para su básico del próximo turno propio. Caduca al terminar ese turno.'},
 coffee:{name:'Café parlamentario',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, recupera 1 Aguante al comenzar su próximo turno propio, sin superar su máximo.'},
 archive:{name:'Hemeroteca insistente',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva pierde 1 Aguante al comienzo de sus dos próximos turnos propios.'},
 tongue:{name:'Lengua de trapo',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el siguiente básico del rival que sobreviva tiene −1 Zasca, con mínimo de 1. Caduca al terminar su siguiente turno.'},
 shield:{name:'Argumentario plastificado',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, absorbe 1 punto del siguiente básico recibido, después de la defensa. Caduca al terminar su siguiente turno.'},
 microphone:{name:'Micrófono indiscreto',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva recibe +1 de daño del próximo básico que lo golpee, antes de la defensa. Caduca al terminar su siguiente turno.'}
};
// Cada asignación responde a coste/función de juego, no es una afirmación sobre la persona.
var groups={
 surge:['toni-canto','dolors-montserrat','fatima-banez','quim-torra','andrea-levy','oscar-puente','pablo-echenique','jordi-turull','gabriel-rufian','marine-le-pen'],
 coffee:['isabel-garcia-tejerina','juan-vicente-herrera','meritxell-batet','roger-torrent','esteban-gonzalez-pons','reyes-maroto','soraya-saenz-de-santamaria','rocio-monasterio','joe-biden','hillary-clinton','vladimir-putin','isabel-diaz-ayuso'],
 archive:['nacho-alvarez','miguel-arias-canete','carmen-calvo','jordi-sanchez','marta-rivera-de-la-cruz','pilar-llop','inigo-errejon','julio-anguita','cristobal-montoro','marta-rovira','cayetana-alvarez-de-toledo','nadia-calvino'],
 tongue:['rafael-hernando','javier-maroto','rafael-catala','carme-forcadell','borja-semper','susana-diaz','monica-garcia','dolores-de-cospedal','miriam-nogueras','pilar-alegria','nigel-farage','recep-tayyip-erdogan'],
 shield:['ana-botella','sara-gimenez','luis-de-guindos','maria-jesus-montero','santiago-abascal','ada-colau','bernie-sanders','matteo-salvini','nicolas-maduro','angela-merkel','emmanuel-macron','yolanda-diaz'],
 microphone:['marta-lois','alfonso-alonso','inigo-mendez-de-vigo','pere-aragones','cuca-gamarra','patxi-lopez','javier-milei','kamala-harris','boris-johnson']
};
var assignments={};Object.keys(groups).forEach(function(id){groups[id].forEach(function(card){if(assignments[card])throw Error('Habilidad repetida: '+card);assignments[card]=id;});});
function ability(id){return Object.hasOwn(assignments,id)?assignments[id]:null;}
function definition(id){return Object.hasOwn(definitions,id)?definitions[id]:null;}
function state(card){var s=card&&card.basicStatus;return s&&definition(s.id)&&Number.isSafeInteger(s.appliedTurn)&&Number.isSafeInteger(s.expires)?s:null;}
function clear(card){delete card.basicStatus;}
function reset(card){clear(card);delete card.basicReadyTurn;}
function grant(card,id,turn,source){if(state(card)||!definition(id))return false;var pulse=id==='archive'?2:id==='coffee'?1:0;card.basicStatus={id:id,appliedTurn:turn,starts:id==='surge'||pulse?turn+1:turn,expires:turn+(pulse||1),source:source,lastTick:turn,...(pulse?{ticksLeft:pulse}:{})};return true;}
function active(card,turn){var s=state(card);return !!s&&turn>=s.starts&&turn<=s.expires;}
function normalZ(card,turn,base){var s=state(card),delta=active(card,turn)?s.id==='surge'?1:s.id==='tongue'?-1:0:0;return Math.max(1,base+delta);}
function consumeAttack(card,turn){var s=state(card);if(active(card,turn)&&['surge','tongue'].includes(s.id))clear(card);}
function beforeDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='microphone'){clear(card);return amount+1;}return amount;}
function afterDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='shield'){clear(card);return Math.max(0,amount-1);}return amount;}
function begin(card,turn){var s=state(card);if(!s)return null;if(turn>s.expires){clear(card);return null;}if(!s.ticksLeft||turn<s.starts||s.lastTick===turn)return null;s.lastTick=turn;s.ticksLeft--;var result={id:s.id,source:s.source,damage:s.id==='archive'?1:0,heal:s.id==='coffee'?1:0};if(!s.ticksLeft)clear(card);return result;}
function end(card,turn){var s=state(card);if(s&&!s.ticksLeft&&turn>=s.expires)clear(card);}
function afterHit(attacker,target,context){var id=attacker.basicAbility,def=definition(id);if(!def||context.ownTurn<(attacker.basicReadyTurn||0)||context.damage<=0||context.attackerHealth<=0)return null;var self=def.target==='self',card=self?attacker:target;if(!card||!self&&context.targetHealth<=0)return null;if(!grant(card,id,self?context.ownTurn:context.rivalTurn,context.source))return null;attacker.basicReadyTurn=context.ownTurn+2;return {id:id,card:card};}
function view(card,turn){var s=state(card);if(!s)return null;var d=definition(s.id),timing=s.ticksLeft?'Quedan '+s.ticksLeft+' pulsos al comenzar sus turnos.':s.id==='surge'&&turn<s.starts?'Se activa en su próximo turno propio.':'Se consume con el básico correspondiente; caduca al terminar '+(turn===s.expires?'este':'su próximo')+' turno propio.';return {id:s.id,name:d.name,polarity:d.polarity,count:s.ticksLeft||1,text:d.name+'. '+d.description+' '+timing+' No admite otro estado básico mientras permanezca activo.'};}
function symbol(id){var paths={surge:'M5 16V9l4 3 4-8 6 5v7ZM5 20h14',coffee:'M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM17 9h2a3 3 0 0 1 0 6h-2M7 2v3m4-3v3',archive:'M4 5h16v15H4ZM8 5V2m8 3V2M7 10h10M7 14h6M7 17h8',tongue:'M4 4h16v12h-6l-5 4v-4H4ZM8 8l8 5m0-5-8 5',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6',microphone:'M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM6 10v2a6 6 0 0 0 12 0v-2M12 18v4M20 3v4m-2-2h4'};return '<svg class="basic-effect-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.shield)+'"/></svg>';}
return {version:VERSION,definitions:definitions,assignments:assignments,ability:ability,definition:definition,state:state,clear:clear,reset:reset,grant:grant,active:active,normalZ:normalZ,consumeAttack:consumeAttack,beforeDefense:beforeDefense,afterDefense:afterDefense,begin:begin,end:end,afterHit:afterHit,view:view,symbol:symbol};
});
