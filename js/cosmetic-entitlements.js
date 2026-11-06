/* Propiedad visual y rutas de hitos; lógica pura compartida con el servicio. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleAppearance=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var cutoff=Date.parse('2026-12-01T00:00:00+01:00');
var ids={menu:['classic','senate','parchment','book','orbital','hologram','garden','cats'],mat:['classic','marble','imperial','orbital','garden','cats','hologram'],back:['classic','marble','imperial','orbital','garden','cats','hologram'],coin:['classic','marble','imperial','orbital','garden','cats','hologram'],font:['auto','clear','classic','editorial','orbital','cats','hologram','garden']};
var initial=['menu/classic','mat/classic','back/classic','coin/classic','font/auto'];
var all=Object.keys(ids).flatMap(function(k){return ids[k].map(function(id){return k+'/'+id;});});
var milestones=[1000,2500,5000,7500,10000],kinds=['font','menu','mat','back','coin'];
var routes={wins:['clear','senate','marble','marble','marble'],ranked:['classic','parchment','imperial','imperial','imperial'],liga:['orbital','orbital','orbital','orbital','orbital'],'market-sales':['hologram','hologram','hologram','hologram','hologram'],'market-purchases':['garden','garden','garden','garden','garden'],'market-trades':['cats','cats','cats','cats','cats']};
function validKey(key){var parts=typeof key==='string'?key.split('/'):[];return parts.length===2&&ids[parts[0]]&&ids[parts[0]].indexOf(parts[1])>=0;}
function fresh(now,firstSeen){now=now===undefined?Date.now():now;var first=Date.parse(firstSeen);if(!Number.isFinite(first))first=now;first=Math.min(first,now);var legacy=first<cutoff;return {version:1,firstSeenAt:new Date(first).toISOString(),grandfathered:legacy,owned:(legacy?all:initial).slice()};}
function validate(raw){if(!raw||raw.version!==1||!Number.isFinite(Date.parse(raw.firstSeenAt))||typeof raw.grandfathered!=='boolean'||raw.grandfathered!==(Date.parse(raw.firstSeenAt)<cutoff)||!Array.isArray(raw.owned)||new Set(raw.owned).size!==raw.owned.length||raw.owned.some(function(k){return !validKey(k);})||initial.some(function(k){return raw.owned.indexOf(k)<0;}))throw Error('Propiedad visual no válida.');return {version:1,firstSeenAt:raw.firstSeenAt,grandfathered:raw.grandfathered,owned:raw.owned.slice()};}
function state(profile,now,firstSeen){return profile&&profile.appearance?validate(profile.appearance):fresh(now,firstSeen||profile&&profile.firstSeenAt);}
function initialize(profile,now,firstSeen){if(!profile.appearance)profile.appearance=fresh(now,firstSeen);else profile.appearance=validate(profile.appearance);return profile.appearance;}
function owns(profile,kind,id,now){return state(profile,now).owned.indexOf(kind+'/'+id)>=0;}
function grant(profile,rewards,now){var s=state(profile,now),added=[];(rewards||[]).forEach(function(r){var key=r.kind+'/'+r.id;if(!validKey(key))throw Error('Recompensa visual desconocida.');if(s.owned.indexOf(key)<0){s.owned.push(key);added.push({kind:r.kind,id:r.id});}});profile.appearance=s;return added;}
function reward(id,step,cards){var route=routes[id],index=milestones.indexOf(step);if(route&&index>=0)return [{kind:kinds[index],id:route[index]}];var total=cards.length,legends=cards.filter(function(c){return c.r==='legendario';}).length;
 if(id==='collection'){if(step===Math.ceil(total*.25))return [{kind:'font',id:'editorial'}];if(step===Math.ceil(total*.5))return [{kind:'menu',id:'book'}];if(step===total)return [{kind:'mat',id:'imperial'}];}
 if(id==='legendary'){if(step===Math.ceil(legends*.5))return [{kind:'back',id:'imperial'}];if(step===legends)return [{kind:'coin',id:'imperial'}];}return [];
}
function goldWins(profile,now){return (now===undefined?Date.now():now)<cutoff?10:1000;}
return Object.freeze({cutoff:cutoff,ids:ids,milestones:milestones,routes:routes,fresh:fresh,validate:validate,state:state,initialize:initialize,owns:owns,grant:grant,reward:reward,goldWins:goldWins});
});
