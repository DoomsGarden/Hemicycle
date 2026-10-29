/* Fórmulas puras del combate local. Sin guardados, azar, premios ni estado global. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBattleRules=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function incoming(card,damage){return card.guard?Math.ceil(damage/2):damage;}
function healing(card){var missing=Math.max(0,card.hm-card.h);return Math.min(missing,Math.max(3,Math.ceil(missing/2)));}
function healWait(card,turn){return card.lastHealTurn==null?0:Math.max(0,card.lastHealTurn+2-turn);}
function strongWait(card,turn){if(card.strongUsedTurn===turn)return 3;if(card.enteredTurn==null||turn<card.enteredTurn)return 2;return 2-(turn-card.enteredTurn)%3;}
function canStrong(card,turn){return card.h>=2&&card.strongUsedTurn!==turn&&strongWait(card,turn)===0;}
return {incoming:incoming,healing:healing,healWait:healWait,strongWait:strongWait,canStrong:canStrong};});
