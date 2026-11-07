/* Ventaja por racha: solo premios de partidas, con reloj y estado persistentes. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleVictoryBoost=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var DURATION=3600000,COOLDOWN=1800000,GOAL=5;
function fresh(){return {version:1,streak:0,percent:0,startedAt:0,expiresAt:0,cooldownUntil:0,activation:0,lastMatchAt:0};}
function validate(raw){if(!raw||raw.version!==1||['streak','percent','startedAt','expiresAt','cooldownUntil','activation','lastMatchAt'].some(function(k){return !Number.isSafeInteger(raw[k])||raw[k]<0;})||raw.streak>=GOAL||raw.activation===0&&(raw.percent!==0||raw.startedAt!==0||raw.expiresAt!==0||raw.cooldownUntil!==0)||raw.activation>0&&(raw.percent<25||raw.percent>50||raw.expiresAt!==raw.startedAt+DURATION||raw.cooldownUntil!==raw.expiresAt+COOLDOWN))throw Error('La ventaja por racha no es válida.');return Object.assign({},raw);}
function state(profile){return profile&&profile.victoryBoost?validate(profile.victoryBoost):fresh();}
function view(profile,now){var s=state(profile),at=now===undefined?Date.now():now,active=s.activation>0&&at>=s.startedAt&&at<s.expiresAt,cooling=s.activation>0&&at>=s.expiresAt&&at<s.cooldownUntil;return {phase:active?'active':cooling?'cooldown':'available',percent:active?s.percent:0,streak:s.streak,activation:s.activation,remainingMs:Math.max(0,(active?s.expiresAt:cooling?s.cooldownUntil:at)-at),expiresAt:s.expiresAt,cooldownUntil:s.cooldownUntil};}
function settle(profile,result,now,random){
 var baseFS=result.fs||0,baseXP=result.xp||0;if(!Number.isSafeInteger(baseFS)||baseFS<0||!Number.isSafeInteger(baseXP)||baseXP<0)throw Error('Premio base no válido.');
 var output={fs:baseFS,xp:baseXP,baseFS:baseFS,baseXP:baseXP,bonusFS:0,bonusXP:0,appliedPercent:0,activated:null};if(result.eligible===false)return output;
 if(typeof result.win!=='boolean'||!Number.isSafeInteger(now)||now<0)throw Error('Resultado de racha no válido.');var s=state(profile),at=Math.max(now,s.lastMatchAt),before=view({victoryBoost:s},at);s.lastMatchAt=at;
 if(before.phase==='active'){output.appliedPercent=s.percent;output.bonusFS=Math.floor(baseFS*s.percent/100);output.bonusXP=Math.floor(baseXP*s.percent/100);output.fs+=output.bonusFS;output.xp+=output.bonusXP;}
 if(before.phase==='available'){
  s.streak=result.win?s.streak+1:0;
  if(s.streak===GOAL){var roll=(random||Math.random)();if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('Azar de ventaja no válido.');s.percent=25+Math.floor(roll*26);s.startedAt=at;s.expiresAt=at+DURATION;s.cooldownUntil=s.expiresAt+COOLDOWN;s.activation++;s.streak=0;output.activated={activation:s.activation,percent:s.percent,startedAt:s.startedAt,expiresAt:s.expiresAt,cooldownUntil:s.cooldownUntil};}
 }else s.streak=0;
 profile.victoryBoost=validate(s);return output;
}
return Object.freeze({duration:DURATION,cooldown:COOLDOWN,goal:GOAL,fresh:fresh,validate:validate,state:state,view:view,settle:settle});
});
