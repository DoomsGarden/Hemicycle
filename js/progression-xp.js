/* XP acumulada independiente del Elo. Reglas compartidas por cliente y servicio. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleXP=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var maxLevel=500,thresholds=[0];
function needed(level){if(!Number.isInteger(level)||level<1||level>=maxLevel)return 0;if(level<60)return 60+4*(level-1);var n=level-60;return 300+12*n+Math.floor(n*n/40);}
for(var i=1;i<maxLevel;i++)thresholds.push(thresholds[i-1]+needed(i));
var cap=thresholds[maxLevel-1];
function total(profile){return Number.isSafeInteger(profile&&profile.xp)&&profile.xp>=0?Math.min(cap,profile.xp):0;}
function describe(profile){var xp=total(profile),lo=0,hi=maxLevel-1;while(lo<hi){var mid=Math.ceil((lo+hi)/2);if(thresholds[mid]<=xp)lo=mid;else hi=mid-1;}return {total:xp,level:lo+1,current:lo===maxLevel-1?0:xp-thresholds[lo],next:needed(lo+1),max:lo===maxLevel-1,progress:lo===maxLevel-1?1:(xp-thresholds[lo])/needed(lo+1)};}
function match(mode,win,reason,tutorial){if(tutorial)return 0;var text=String(reason||'').toLowerCase();if(!win&&/rend|inactiv|abandon/.test(text))return 0;var scale={normal:[40,20],rapida:[25,12],ranked:[100,50],liga:[100,50]}[mode];if(!scale)return 0;return win===null?Math.floor((scale[0]+scale[1])/2):scale[win?0:1];}
function add(profile,amount){if(!Number.isSafeInteger(amount)||amount<0)throw Error('Experiencia no válida.');var before=total(profile),after=Math.min(cap,before+amount);profile.xp=after;return after-before;}
function validate(xp){if(!Number.isSafeInteger(xp)||xp<0||xp>cap)throw Error('Experiencia no válida.');return xp;}
return {version:'xp1',maxLevel:maxLevel,cap:cap,thresholds:thresholds,needed:needed,total:total,describe:describe,match:match,add:add,validate:validate};
});
