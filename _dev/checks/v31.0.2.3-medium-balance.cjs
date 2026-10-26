'use strict';
const E=require('../online/combat.cjs'),AI=require('../online/ai.cjs'),fs=require('node:fs'),assert=require('node:assert/strict');
const rows=[];
for(const rarity of ['comun','raro','especial','legendario'])for(const doctrine of ['guardia','verborrea','viperina','giro','foco','aforado'])for(const pattern of [[0,0],[2,0],[0,2],[2,2]])for(let seed=1;seed<=12;seed++){
 const pool=E.cards.filter(c=>c.pa===doctrine&&c.r===rarity),fallback=E.cards.filter(c=>c.r===rarity&&!pool.includes(c)),ids=pool.concat(fallback).slice(0,5).map(c=>c.id);let x=seed*7919;const rng=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};let s=E.initial();for(let side=0;side<2;side++)s=E.apply(s,side,{type:'ready',cabinet:{orators:ids,leader:ids[0],actions:pattern[side]?['replica','receso']:[]}},1000,rng);let steps=0;
 while(s.status==='active'&&steps++<1200)s=E.apply(s,s.side,AI.choose(s,s.side,1000),1000,rng);
 assert.equal(s.status,'finished');rows.push({rarity,doctrine,actions:pattern,first:s.first,winner:s.winner,steps,turns:s.players.map(p=>p.turn)});
}
const groups={};for(const r of rows){const key=r.rarity+':'+r.actions.join('/'),g=groups[key]||(groups[key]={games:0,firstWins:0,side0Wins:0,turns:0});g.games++;g.firstWins+=r.winner===r.first?1:0;g.side0Wins+=r.winner===0?1:0;g.turns+=(r.turns[0]+r.turns[1])/2;}
const report={scope:'Simulaciones de IA, mismos gabinetes por enfrentamiento; las acciones cambian la secuencia RNG. No son datos humanos ni prueba causal aislada.',games:rows.length,finished:rows.length,groups,details:rows};fs.mkdirSync('_dev/reports/v31.0.2.3-medium',{recursive:true});fs.writeFileSync('_dev/reports/v31.0.2.3-medium/balance.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,details:undefined},null,2));
