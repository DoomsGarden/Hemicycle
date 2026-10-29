'use strict';
// Exploratory AI-vs-AI sample, not evidence of human balance or retention.
const fs=require('node:fs'),a=require('node:assert/strict'),E=require('../online/combat.cjs'),AI=require('../online/ai.cjs');
function random(seed){let x=seed>>>0;return()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);}
const doctrines=[...new Set(E.cards.map(c=>c.pa))],recipes={initial:['comun','comun','raro','raro','especial'],advanced:['raro','especial','especial','legendario','legendario']};
function cabinet(doc,recipe,count){const used=new Set(),orators=recipe.map(tier=>{const c=E.cards.find(c=>!used.has(c.id)&&c.pa===doc&&c.r===tier)||E.cards.find(c=>!used.has(c.id)&&c.r===tier);a.ok(c);used.add(c.id);return c.id;});return {orators,leader:orators[0],actions:['turno-de-palabra','receso'].slice(0,count)};}
function game(c1,c2,seed,first,mode='normal',profile,opponentProfile){const rng=random(seed);let s=E.apply(E.initial(mode),0,{type:'ready',cabinet:c1},0,rng,profile);let n=0;s=E.apply(s,1,{type:'ready',cabinet:c2},0,()=>n++===5+c2.actions.length?(first===0?.25:.75):rng(),opponentProfile);a.equal(s.first,first);let moves=0;while(s.status==='active'&&moves++<1000){const side=s.side,command=AI.choose(s,side,0);s=E.apply(s,side,command,0,rng);}return {finished:s.status==='finished',winner:s.winner,turns:s.players.map(p=>p.turn),actions:s.players.map(p=>p.usedActions?.length||0),votes:s.players.map(p=>p.votes),first};}
const groups=[],rows=[];for(const [name,recipe]of Object.entries(recipes))for(const doc of doctrines)for(let own=0;own<3;own++)for(let foe=0;foe<3;foe++){const c1=cabinet(doc,recipe,own),c2=cabinet(doc,recipe,foe),r={recipe:name,doctrine:doc,ownSlots:own,opponentSlots:foe,games:0,wins:0,firstGames:0,firstWins:0,unfinished:0,turns:0};for(let seed=1;seed<=4;seed++)for(const first of [0,1]){const g=game(c1,c2,seed,first);r.games++;if(g.winner===0)r.wins++;if(first===0){r.firstGames++;if(g.winner===0)r.firstWins++;}if(!g.finished)r.unfinished++;r.turns+=Math.max(...g.turns);rows.push(g);}groups.push(r);}
const additional=[];
for(const mode of ['normal','rapida','ranked','liga'])for(const cost of ['low','high'])for(let own=0;own<3;own++)for(let foe=0;foe<3;foe++){
 const sorted=E.cards.slice().sort((a,b)=>(cost==='low'?1:-1)*(a.c-b.c)||a.id.localeCompare(b.id)),ids=sorted.slice(0,5).map(c=>c.id),cab=count=>({orators:ids,leader:ids[0],actions:['turno-de-palabra','receso'].slice(0,count)}),games=[];
 for(let seed=11;seed<=12;seed++)for(const first of [0,1])games.push(game(cab(own),cab(foe),seed,first,mode));
 additional.push({mode,cost,ownSlots:own,opponentSlots:foe,orators:ids,games});
}
for(const mode of ['normal','rapida','ranked','liga'])for(const gold of [false,true]){
 const ids=['donald-trump',...E.cards.filter(c=>c.id!=='donald-trump').slice(0,4).map(c=>c.id)],cab={orators:ids,leader:ids[0],actions:['turno-de-palabra','receso']},games=[];
 for(let seed=21;seed<=22;seed++)for(const first of [0,1])games.push(game(cab,cab,seed,first,mode,{dtGoldUnlocked:gold,dtGoldActive:gold},{dtGoldUnlocked:false,dtGoldActive:false}));
 additional.push({mode,gold,orators:ids,games});
}
const extraGames=additional.flatMap(x=>x.games);a.ok(extraGames.every(g=>g.finished));
const report={additional,additionalGames:extraGames.length,totalGames:rows.length+extraGames.length,scope:'Simulación exploratoria con la misma política de IA en ambos bandos. No mide PvP humano, retención o liquidez. No se ajustan reglas ni Elo.',games:rows.length,finished:rows.filter(r=>r.finished).length,doctrines,recipes,groups};fs.writeFileSync('_dev/reports/v31.0.2.6/balance-sample.json',JSON.stringify(report,null,2));a.equal(report.finished,report.games);console.log('PASS: '+report.games+' paired AI simulations, 0/1/2 actions, six doctrines, two rarity recipes and both starting seats. No rules adjusted. Additional '+extraGames.length+' games cover mode labels, low/high costs, action-slot combinations and golden/normal leaders; no human PvP or season progression is simulated.');
