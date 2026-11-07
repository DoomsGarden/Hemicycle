'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),B=require('../js/victory-boost.js');
test('five consecutive reward-bearing wins grant one saved hour, followed by thirty minutes of cooldown',()=>{
 const p={};for(let i=0;i<4;i++)a.equal(B.settle(p,{win:true,fs:100,xp:40},1000+i,()=>0).activated,null);
 const fifth=B.settle(p,{win:true,fs:100,xp:40},2000,()=>0);a.equal(fifth.activated.percent,25);a.equal(fifth.fs,100);a.equal(fifth.xp,40);a.equal(B.view(p,2000).phase,'active');a.equal(B.view(p,2000+B.duration).phase,'cooldown');a.equal(B.view(p,2000+B.duration+B.cooldown).phase,'available');
 const award=B.settle(p,{win:false,fs:100,xp:40},2001,()=>{throw Error('Do not reroll');});a.equal(award.fs,125);a.equal(award.xp,50);a.equal(award.activated,null);a.equal(p.victoryBoost.streak,0);
 for(let i=0;i<8;i++)a.equal(B.settle(p,{win:true,fs:0,xp:0},3000+i,()=>.9).activated,null);
 for(let i=0;i<6;i++)a.equal(B.settle(p,{win:true,fs:0,xp:0},2000+B.duration+i,()=>.9).activated,null);a.equal(p.victoryBoost.streak,0);
 const ready=2000+B.duration+B.cooldown;for(let i=0;i<4;i++)a.equal(B.settle(p,{win:true,fs:0,xp:0},ready+i,()=>.9999).activated,null);a.equal(B.settle(p,{win:true,fs:0,xp:0},ready+4,()=>.9999).activated.percent,50);
});
test('losses reset the qualifying streak; practice/friendly results do not change it and reload never rerolls',()=>{
 let p={};for(let i=0;i<3;i++)B.settle(p,{win:true,fs:0,xp:0},i);const saved=JSON.stringify(p);B.settle(p,{win:false,eligible:false,fs:0,xp:0},4);a.equal(JSON.stringify(p),saved);B.settle(p,{win:false,fs:0,xp:0},5);a.equal(p.victoryBoost.streak,0);
 for(let i=0;i<5;i++)B.settle(p,{win:true,fs:0,xp:0},10+i,()=>.5);p=JSON.parse(JSON.stringify(p));a.equal(B.view(p,15).percent,38);const expires=p.victoryBoost.expiresAt;B.settle(p,{win:true,fs:100,xp:100},expires,()=>{throw Error('No reroll');});a.equal(B.view(p,expires).phase,'cooldown');a.equal(p.victoryBoost.expiresAt,expires);
});
