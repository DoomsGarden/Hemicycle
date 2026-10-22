const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadBattle}=require('./helpers/battle.cjs');
function duel(side='p'){
 const c=loadBattle();c.G.side=side;c.G.n=1;c.G.turnDeadline=null;c.G.leader={p:{uid:'absent-p'},e:{uid:'absent-e'}};
 const actor=c.mk(c.CARDS[0],false),target=c.mk(c.CARDS[1],false);
 Object.assign(actor,{a:5,h:10,hm:10,q:['Primera frase','Segunda frase','Tercera frase']});Object.assign(target,{a:5,h:100,hm:100});
 actor.enteredTurn=1;actor.strongReadyOn=0;c.G.turns[side]=3;c.G.field[side]=[actor];c.G.field[side==='p'?'e':'p']=[target];c.G.hand={p:[],e:[]};c.G.deck={p:[],e:[]};return {c,actor,target};
}
for(const side of ['p','e'])for(const [zasca,normal,strong]of [[1,1,2],[2,2,3],[3,3,5],[5,5,8],[8,8,12]])for(const [variant,damage,quote,other]of [['normal',normal,'Primera frase','Segunda frase'],['strong',strong,'Segunda frase','Primera frase']])test(`${side}: ${variant}, Z=${zasca}, damage=${damage}, exact corresponding phrase`,()=>{
 const {c,actor,target}=duel(side);actor.a=zasca;const tdp=c.G.tdp[side];assert.equal(c.attack(actor,target,side,variant),true);assert.equal(target.h,100-damage);assert.equal(actor.ready,false);assert.equal(c.G.tdp[side],tdp);assert.match(c.G.log.join(''),new RegExp(quote));assert.doesNotMatch(c.G.log.join(''),new RegExp(other+'|Tercera frase'));assert.equal(c.attack(actor,target,side,'strong'),false);assert.equal(c.useSupport(actor,'heal',side),false);
});
for(const side of ['p','e'])for(const [missing,recovered]of [[20,10],[19,10],[7,4],[6,3],[5,3],[3,3],[1,1]])test(`${side}: healing missing ${missing} restores ${recovered} without exceeding maximum`,()=>{
 const {c,actor}=duel(side);actor.hm=30;actor.h=30-missing;assert.equal(c.useSupport(actor,'heal',side),true);assert.equal(actor.h,30-missing+recovered);assert.equal(actor.ready,false);assert.match(c.G.log[0],/Tercera frase/);assert.doesNotMatch(c.G.log[0],/Primera frase|Segunda frase/);
});
test('healing full health and an already prepared defence do not waste an action',()=>{
 const {c,actor}=duel();assert.equal(c.useSupport(actor,'heal','p'),false);assert.equal(actor.ready,true);actor.guard=true;assert.equal(c.useSupport(actor,'guard','p'),false);assert.equal(actor.ready,true);
});
for(const damage of [1,4,5,8])test(`defence halves only the next hit (${damage}), rounding received damage upwards`,()=>{
 const {c,actor,target}=duel();assert.equal(c.useSupport(actor,'guard','p'),true);assert.match(c.G.log[0],/Tercera frase/);assert.equal(actor.guard,true);assert.equal(actor.ready,false);c.startTurn('e');target.a=damage;c.attack(target,actor,'e','normal');assert.equal(actor.h,10-Math.ceil(damage/2));assert.equal(actor.guard,false);const next=c.mk(c.CARDS[2],false);next.a=1;c.G.field.e.push(next);c.attack(next,actor,'e','normal');assert.equal(actor.h,9-Math.ceil(damage/2));
});
test('defence survives turn boundaries until hit and disappears on expulsion/recycling',()=>{
 const {c,actor,target}=duel();c.useSupport(actor,'guard','p');c.startTurn('e');c.startTurn('p');assert.equal(actor.guard,true);assert.equal(actor.ready,true);c.G.side='e';c.expel('e',actor,target);assert.equal(actor.guard,false);assert.equal(c.useSupport(actor,'heal','p'),false);
});
test('invalid target, full enemy bench, invalid attack or support, and wrong side cannot spend the action',()=>{
 const {c,actor,target}=duel();assert.equal(c.attack(actor,{...target},'p','strong'),false);assert.equal(c.attack(actor,target,'p','unknown'),false);assert.equal(c.useSupport(actor,'unknown','p'),false);assert.equal(c.attack(actor,target,'e','normal'),false);c.G.field.e.push(c.mk(c.CARDS[2]),c.mk(c.CARDS[3]));assert.equal(c.attack(actor,'__EMPTY','p','normal'),false);assert.equal(actor.ready,true);assert.equal(target.h,100);
});
test('normal and strong attacks use their own damage against an empty bench',()=>{
 for(const [variant,remaining]of [['normal',15],['strong',12]]){const {c,actor}=duel();c.G.field.e=[];c.G.votes.e=20;c.attack(actor,'__EMPTY','p',variant);assert.equal(c.G.votes.e,remaining);assert.match(c.G.log[0],new RegExp(variant==='normal'?'Primera frase':'Segunda frase'));}
});
test('strong attack uses active Zasca bonuses before multiplying, and target doctrine damage remains additive',()=>{
 const {c,actor,target}=duel();actor.a=3;actor.buff=2;actor.pa='guardia';c.G.leader.p=actor;c.attack(actor,target,'p','strong');assert.equal(target.h,92);
 const d=duel();d.actor.pa='viperina';d.c.G.leader.p=d.actor;d.c.G.leader.e=d.target;d.c.attack(d.actor,d.target,'p','strong');assert.equal(d.target.h,90);
});
test('AI considers strong damage, healing and a survivable defence, using the same one-action rules',()=>{
 {const {c,actor,target}=duel('e');target.h=3;assert.equal(c.chooseBattleAction('e').variant,'normal');target.h=7;assert.equal(c.chooseBattleAction('e').variant,'strong');}
 {const {c,actor}=duel('e');actor.h=2;assert.equal(c.chooseBattleAction('e').type,'heal');c.aiStep();assert.equal(actor.h,6);assert.equal(actor.ready,false);}
 {const {c,actor,target}=duel('e');target.a=5;actor.h=actor.hm=5;assert.equal(c.chooseBattleAction('e').type,'guard');c.aiStep();assert.equal(actor.guard,true);assert.equal(actor.ready,false);}
});
test('support cannot run after a victory and pays no extra rewards',()=>{
 const {c,actor}=duel();actor.h=1;c.G.votes.p=100;const before=c.D().w;assert.equal(c.useSupport(actor,'heal','p'),false);assert.equal(actor.h,1);assert.equal(c.D().w,before+1);assert.equal(c.useSupport(actor,'guard','p'),false);assert.equal(c.D().w,before+1);
});
for(const side of ['p','e'])test(side+': strong cooldown starts at that card\'s actual entry, then waits two own turns after each use',()=>{
 const {c,target}=duel(side),foe=side==='p'?'e':'p';c.G.turns[side]=7;const card=c.mk(c.CARDS[0],false);card.c=1;c.G.tdp[side]=8;c.G.field[side]=[];c.G.hand[side]=[card];assert.equal(c.playCard(side,card.uid),true);assert.equal(card.enteredTurn,7);assert.equal(c.strongWait(side,card),1);assert.equal(c.attack(card,target,side,'strong'),false);assert.equal(card.ready,true);assert.equal(c.attack(card,target,side,'normal'),true);
 c.startTurn(foe);assert.equal(c.strongWait(side,card),1,'opponent turn does not advance the cooldown');c.startTurn(side);assert.equal(c.G.turns[side],8);assert.equal(c.canStrongAttack(side,card),true);assert.equal(c.attack(card,target,side,'strong'),true);assert.equal(c.strongWait(side,card),2);c.startTurn(foe);c.startTurn(side);assert.equal(c.strongWait(side,card),1);assert.equal(c.attack(card,target,side,'strong'),false);assert.equal(card.ready,true);c.startTurn(foe);c.startTurn(side);assert.equal(c.strongWait(side,card),0);assert.equal(c.attack(card,target,side,'strong'),true);
});
test('two cards entering in different turns have independent strong timers; reentry starts over',()=>{
 const {c,actor,target}=duel();c.G.turns.p=10;actor.strongReadyOn=10;const newcomer=c.mk(c.CARDS[2],false);newcomer.c=1;c.G.hand.p=[newcomer];c.G.tdp.p=8;c.playCard('p',newcomer.uid);assert.equal(c.strongWait('p',actor),0);assert.equal(c.strongWait('p',newcomer),1);c.attack(actor,target,'p','strong');assert.equal(c.strongWait('p',actor),2);assert.equal(c.strongWait('p',newcomer),1);c.G.side='e';c.expel('e',actor,target);c.G.side='p';c.G.hand.p=[actor];c.G.pas.p=[];c.G.tdp.p=8;assert.equal(c.playCard('p',actor.uid),true);assert.equal(c.strongWait('p',actor),1);assert.equal(c.attack(actor,target,'p','strong'),false);
});
