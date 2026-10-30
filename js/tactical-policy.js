/* La IA valora solo información visible y sus propias cartas. Sin bonificaciones ocultas. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleTacticalPolicy=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function choose(options){var best=null;options.forEach(function(o){var f=o.forecast,score=-Infinity;if(o.type==='attack'&&f&&f.valid){score=f.win?10000:(f.expels?55+o.seats*4:0)+Math.min(f.damage,o.targetHp||f.damage)*2+(f.effect?4:0)-(f.attackerRemaining<=0?35:0)-f.selfCost*.5+(f.empty?-.5:0);}
 else if(o.type==='heal'&&o.amount>0)score=o.threat>=o.hp&&o.hp+o.amount>o.threat&&!o.enemyWinsNext?18+o.amount:0;
 else if(o.type==='guard')score=o.threat>=o.hp&&Math.ceil(o.threat/2)<o.hp&&!o.enemyWinsNext?20+o.seats*2:0;
 if(score>0&&(!best||score>best.score))best={score:score,choice:o};});return best&&best.choice;}
return {choose:choose};});
