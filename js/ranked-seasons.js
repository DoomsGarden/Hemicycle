/* Clasificatoria local: divisiones, periodos civiles y premios únicos por temporada. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleRanked=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var KEY='hemiciclo_ranked_seasons_v1',NAMES=['Aprendiz de pasillo','Concejal','Diputado','Portavoz','Ministro','Presidente'],ROMAN=['X','IX','VIII','VII','VI','V','IV','III','II','I'];
var DAY=86400000,ANCHOR=Date.UTC(2026,9,21)/DAY;
function position(elo){var value=Math.max(0,Math.floor(Number(elo)||0)),index=Math.min(59,Math.floor(value/250)),rank=Math.floor(index/10),step=index%10;return {index:index,rank:rank,division:10-step,roman:ROMAN[step],name:NAMES[rank],label:NAMES[rank]+' '+ROMAN[step],start:index*250,next:index===59?null:(index+1)*250,progress:value%250};}
function madridDay(now){var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now)),v={};parts.forEach(function(p){v[p.type]=p.value;});return Date.UTC(Number(v.year),Number(v.month)-1,Number(v.day))/DAY;}
function midnight(day){var utc=day*DAY,parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(utc)),v={};parts.forEach(function(p){v[p.type]=p.value;});var local=Date.UTC(Number(v.year),Number(v.month)-1,Number(v.day),Number(v.hour),Number(v.minute));return utc-(local-utc);}
function season(now){var number=Math.max(1,Math.floor((madridDay(now)-ANCHOR)/30)+1),start=ANCHOR+(number-1)*30;return {id:number,start:midnight(start),end:midnight(start+30)};}
function demote(elo,count){var p=position(elo);return Math.max(0,p.rank-count)*2500+(10-p.division)*250+p.progress;}
function sync(saved,elo,now){
 var current=season(now),p=position(elo),state=saved?JSON.parse(JSON.stringify(saved)):null;
 if(!state||!Number.isInteger(state.season)||!Array.isArray(state.rewards))state={season:current.id,highest:p.index,promotions:0,rewards:[],lastDemotion:null};
 if(state.season<current.id){var before=elo;elo=demote(elo,current.id-state.season);state.lastDemotion={from:before,to:elo,periods:current.id-state.season};state.season=current.id;state.highest=position(elo).index;state.promotions=0;}
 return {state:state,elo:elo,period:current};
}
function advance(saved,previousElo,nextElo,now){
 var result=sync(saved,previousElo,now),state=result.state,step=position(nextElo).index;
 if(step>state.highest){for(var i=state.highest+1;i<=step;i++){
  state.promotions++;
  var id='S'+state.season+'-D'+i;
  state.rewards.push({id:id+'-comun',season:state.season,kind:'comun',division:i,claimed:false});
  if(state.promotions%5===0)state.rewards.push({id:id+'-raro',season:state.season,kind:'raro',division:i,claimed:false});
  if(i%10===0)state.rewards.push({id:id+'-legendario',season:state.season,kind:'legendario',division:i,claimed:false});
 }state.highest=step;}
 return state;
}
function claim(saved,id){var state=JSON.parse(JSON.stringify(saved)),reward=state.rewards.find(function(r){return r.id===id;});if(!reward||reward.claimed)throw new Error('Este sobre ya se ha reclamado o no está disponible.');reward.claimed=true;return {state:state,reward:reward};}
return {key:KEY,names:NAMES,position:position,season:season,demote:demote,sync:sync,advance:advance,claim:claim};
});
