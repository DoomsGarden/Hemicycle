const {test}=require('node:test'),assert=require('node:assert/strict'),{loadBattle}=require('./helpers/battle.cjs');
for(const winner of ['p','e'])test('local League '+(winner==='p'?'victory':'defeat')+' keeps the exact cromo in the result',()=>{const c=loadBattle('liga');c.finish(winner);assert.equal(c.SO.mode,'liga');assert.ok(c.SO[winner==='p'?'won':'lost']);const html=c.SCREENS.result();assert.match(html,/result-card-preview/);assert.match(html,new RegExp(winner==='p'?'Cromo conseguido':'Cromo perdido'));assert.ok(html.includes(c.BYID[c.SO[winner==='p'?'won':'lost']].n));});
test('local League season closure keeps the won cromo and advances the season',()=>{const c=loadBattle('liga'),league=c.ligaLoad();league.jor=12;c.lsSet(c.LS2,league);c.finish('p');assert.equal(c.SO.season,true);assert.ok(c.SO.won);assert.match(c.SCREENS.result(),/Cromo conseguido/);assert.equal(c.ligaLoad().temp,league.temp+1);});

const rewards=require('../js/league-rewards.js'),serverLeague=require('../_dev/online/league.cjs');
function standings(league,position){const me=league.teams.find(t=>t.you);me.pts=(30-position)*10+5;me.w=0;league.teams.filter(t=>!t.you).forEach((t,i)=>{t.pts=(29-i)*10;t.w=0;});league.jor=12;return league;}
test('season rewards cover all 30 places with exact limits, integers and a strictly descending scale',()=>{
 const amounts=Array.from({length:30},(_,i)=>rewards.seasonReward(i+1));assert.equal(amounts[0],1100);assert.equal(amounts[29],300);assert.equal(amounts[14],714);assert.equal(amounts[15],686);
 amounts.forEach((n,i)=>{assert.ok(Number.isSafeInteger(n)&&n>=300&&n<=1100);if(i)assert.ok(n<amounts[i-1]);});
 for(const n of [0,31,1.5,NaN,Infinity,'1'])assert.throws(()=>rewards.seasonReward(n));
});
test('local season rewards follow the final place for all 30 positions and completion cannot pay twice',()=>{
 for(let place=1;place<=30;place++){const c=loadBattle('liga'),lg=standings(c.ligaLoad(),place);c.lsSet(c.LS2,lg);c.finish('e');assert.equal(c.SO.leaguePosition,place);assert.equal(c.SO.seasonFS,rewards.seasonReward(place));assert.ok(c.SO.msg.includes('+'+c.SO.seasonFS+' FS'));const fs=c.D().fs,season=c.ligaLoad().temp;c.finish('e');assert.equal(c.D().fs,fs);assert.equal(c.ligaLoad().temp,season);}
});
test('the server uses the same rank rewards in every division, without randomness in the bonus',()=>{
 for(let division=1;division<=3;division++)for(let place=1;place<=30;place++){const lg=standings(serverLeague.create(division,4,()=>.5),place),before=JSON.stringify(lg);
  for(const rng of [()=>0,()=>.9999]){const next=serverLeague.advance(lg,false,rng);assert.equal(next.position,place);assert.equal(next.reward,rewards.seasonReward(place));assert.equal(next.league.temp,5);assert.equal(next.league.div,place<=5?Math.max(1,division-1):place>25?Math.min(3,division+1):division);}
  assert.equal(JSON.stringify(lg),before);
 }
 const lg=serverLeague.create();const next=serverLeague.advance(lg,true,()=>.5);assert.equal(next.reward,0);assert.equal(next.league.jor,2);
});
