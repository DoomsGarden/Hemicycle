/* Consejos breves, contextuales y descartables. No interrumpen la partida. */
(function(root){'use strict';var key='hemicycle_battle_tips_v1',seen={};try{seen=JSON.parse(localStorage.getItem(key))||{};}catch(ignore){}
var messages={action:'Las acciones se juegan desde la mano sin ocupar Tribuna. Consulta su objetivo y coste antes de activarlas.',heal:'Tu orador está herido: su tercera frase permite curar o defender. La curación tendrá recuperación.',strong:'El fuerte está listo este turno: causa el 150 % del Zasca y cuesta 1 de Aguante.'};
function html(state){if(!state.ownTurn||state.tutorial)return '';var id=['action','heal','strong'].find(function(k){return state[k]&&!seen[k];});return id?'<aside class="battle-tip" role="note"><span>'+messages[id]+'</span><button type="button" class="mini" data-act="dismiss-battle-tip" data-tip="'+id+'" aria-label="Ocultar consejo">×</button></aside>':'';}
function dismiss(id){if(!messages[id])return;seen[id]=true;try{localStorage.setItem(key,JSON.stringify(seen));}catch(ignore){}}
root.HemicycleBattleTips={html:html,dismiss:dismiss};})(window);
