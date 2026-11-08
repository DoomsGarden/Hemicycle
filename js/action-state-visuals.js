/* Auras decorativas continuas. Su vida la decide el motor, nunca la animación. */
(function(root,factory){var api=factory(typeof module==='object'&&module.exports?require('./action-status.js'):root.HemicycleActionStatus);if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleActionStateVisuals=api;})(typeof globalThis!=='undefined'?globalThis:this,function(States){'use strict';
var palettes={confused:'#d690ff',weakness:'#a38aff',strength:'#ffbe48',fullness:'#dcf58b',regeneration:'#59f3a8',attrition:'#e68b52',fortress:'#58bfff',exposed:'#ff705b',relief:'#71efdd',wound:'#f57dae',precision:'#adf6ff',fatigue:'#9ba9d6',guard:'#a2e5ff',silence:'#c8cce4'};
// Curvas de energía, no contornos de iconos. Cada estado tiene silueta y flujo propios.
var forms={
 confused:{accent:'#ff8ddd',flow:'swirl',paths:['M8 58C-8 24 49 44 32 12C20-8 6 19 27 27C68 44 97-8 98 34C99 61 69 66 75 42','M96 88C117 62 55 44 75 19C88 1 110 28 80 37C42 50 7 16 5 44C3 60 23 73 16 94']},
 weakness:{accent:'#d4b6ef',flow:'sink',paths:['M8 0C29 23-1 31 13 52S3 80 18 110','M94-8C73 12 106 38 88 57S102 84 82 112','M25 6C2 36 38 47 18 80']},
 strength:{accent:'#fff0ae',flow:'rise',paths:['M4 112C-7 77 25 85 9 51C-2 30 27 32 18-6','M96 112C112 75 75 81 94 47C107 26 75 23 86-6','M17 115C41 85 11 71 29 50M82 113C62 89 91 69 74 44']},
 fullness:{accent:'#fff3bb',flow:'bloom',paths:['M8 95C-9 63 27 60 10 28C4 11 19 0 30-4','M92 95C110 63 73 60 90 28C97 11 81 0 70-4','M8 78C28 106 73 106 92 78M12 15C31-2 71-2 88 15']},
 regeneration:{accent:'#cbffda',flow:'rise',paths:['M12 110C33 89-2 66 15 42S5 13 20-6','M86 110C66 88 103 63 86 40S99 14 82-6','M4 91C21 70 13 64 29 54M96 92C77 68 88 65 72 51']},
 attrition:{accent:'#ffcb83',flow:'drain',paths:['M4-4C31 25-6 42 11 64C25 83-4 95 21 116','M97-5C70 26 110 46 91 67C75 86 107 99 77 115','M27 21C9 39 26 64 12 76M77 30C99 49 80 68 91 84']},
 fortress:{accent:'#d2f4ff',flow:'shelter',paths:['M4 98C-9 47 5 6 50 1C94 6 110 47 96 98','M12 101C-1 52 15 16 50 11C85 17 101 53 87 101','M2 72C15 107 84 107 98 72']},
 exposed:{accent:'#ffca96',flow:'fracture',paths:['M4 103C27 81-5 69 16 45C-2 30 20 15 8-2','M96 103C73 80 105 65 84 43C102 25 79 14 92-2','M7 73C22 57 8 45 27 32M94 77C78 57 94 49 75 27']},
 relief:{accent:'#d7fff1',flow:'tide',paths:['M-5 70C19 30 1 13 21-2','M105 70C79 30 99 13 79-2','M-5 82C10 60 25 58 34 69M105 82C90 60 75 58 66 69','M1 93C20 68 21 94 35 86M99 93C80 68 79 94 65 86']},
 wound:{accent:'#ffb2cb',flow:'bind',paths:['M8-5C28 10-8 36 12 48C-3 67 26 83 5 104','M92-5C72 10 108 36 88 48C103 67 74 83 95 104','M-4 80C17 63 11 86 29 77M104 80C83 63 89 86 71 77']},
 precision:{accent:'#ffffff',flow:'focus',paths:['M4 104C-2 72 16 49 7 13C5 5 9-2 17-7','M96 104C102 72 84 49 93 13C95 5 91-2 83-7','M7 25C12 3 32-2 43-1M93 25C88 3 68-2 57-1']},
 fatigue:{accent:'#c5cbe2',flow:'sink',paths:['M8 20C-13 51 29 60 9 88C-3 103 12 111 27 113','M92 20C113 51 71 60 91 88C103 103 88 111 73 113','M-5 88C14 62 25 96 35 88M105 88C86 62 75 96 65 88']},
 guard:{accent:'#effbff',flow:'shelter',paths:['M6 96C-5 49 5 11 50 4C95 11 105 49 94 96','M7 70C8 96 37 105 50 108C63 105 92 96 93 70']},
 silence:{accent:'#f4dbff',flow:'hush',paths:['M5 9C-8 38 22 56 7 84C2 93 9 105 23 111','M95 9C108 38 78 56 93 84C98 93 91 105 77 111','M6 78C23 63 10 50 22 37M94 78C77 63 90 50 78 37']}
};
function kinds(card,extra){card=card||{};var list=States.states(card).map(function(s){return s.kind;});if(card.guard)list.push('guard');if(([].concat(card.buffs||[],card.actionBuffs||[],card.visualBuffs||[])).some(function(b){return b.value>0&&(!extra||extra.turn===undefined||b.until===undefined||b.until>=extra.turn);}))list.push('strength');if(extra&&extra.silenced)list.push('silence');return Array.from(new Set(list)).filter(function(k){return Object.hasOwn(palettes,k);});}
function markup(card,extra,now){var list=kinds(card,extra);if(!list.length)return '';now=now===undefined?Date.now():now;return '<div class="action-state-loops" data-aura-count="'+list.length+'" aria-hidden="true">'+list.map(function(kind){var form=forms[kind],paths=form.paths.map(function(d){return '<path d="'+d+'" pathLength="160"/>';}).join('');return '<span class="state-loop state-loop-'+kind+' aura-flow-'+form.flow+'" data-statefx="'+kind+'" style="--state-color:'+palettes[kind]+';--state-accent:'+form.accent+';--state-phase:-'+((now/1000+Object.keys(palettes).indexOf(kind)*.73)%86400).toFixed(3)+'s">'
 +'<i class="state-aura-bloom"></i><svg class="state-aura-streams" viewBox="0 0 100 110" preserveAspectRatio="none" fill="none" aria-hidden="true"><g class="state-aura-haze">'+paths+'</g><g class="state-aura-thread">'+paths+'</g></svg>'
 +'<span class="state-aura-motes">'+[0,1,2,3,4,5].map(function(n){return '<i style="--mote:'+n+';--drift:'+(n%2?'-':'')+(4+n%3*3)+'px"></i>';}).join('')+'</span></span>';}).join('')+'</div>';}
return Object.freeze({kinds:kinds,markup:markup,palettes:palettes});
});
