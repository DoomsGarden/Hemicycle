const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { test } = require('node:test');
const { loadBattle } = require('./helpers/battle.cjs');

function duel(p, e) {
  const c = loadBattle();
  c.G.n = 2; c.G.side = 'p';
  c.G.votes = {p:10,e:10};
  for (const [side,doctrine] of [['p',p],['e',e]]) {
    c.G.field[side] = [];
    if (!doctrine) continue;
    const leader = c.mk(c.CARDS.find(card => card.pa === doctrine && card.r === 'comun'), true);
    c.G.leader[side] = leader;
    c.G.field[side] = [leader];
  }
  return c;
}
const keys = ['verborrea','guardia','aforado','giro','foco','viperina'];
const counters = {verborrea:'guardia',guardia:'aforado',aforado:'viperina',viperina:'foco',foco:'giro',giro:'verborrea'};

test('six doctrines form one directed cycle with one strength and one weakness each', () => {
  const c = loadBattle();
  assert.deepEqual(Array.from(c.DOCS,d=>d.k), keys);
  assert.equal(new Set(c.DOCS.map(d=>d.beats)).size,6);
  let k='verborrea'; const visited=[];
  do { visited.push(k); k=c.DOCM[k].beats; } while(k!=='verborrea'&&visited.length<=6);
  assert.equal(visited.length,6);
  for(const d of c.DOCS) {
    assert.equal(d.beats,counters[d.k]);
    assert.equal(c.DOCM[d.weak].beats,d.k);
    assert.notEqual(d.weak,d.beats);
  }
});

for(const p of keys) for(const e of keys) {
  test(p+' vs '+e+': only the countered doctrine is suppressed, and removing its counter restores it', () => {
    const c=duel(p,e);
    assert.equal(c.activeDoc('p'),counters[e]===p?null:p);
    assert.equal(c.activeDoc('e'),counters[p]===e?null:e);
    assert.equal(c.doc('p'),p);
    if(counters[e]===p)assert.match(c.battleDoctrine('p'),/neutralizada por/);
    c.G.field.e=[];
    assert.equal(c.activeDoc('p'),p);
    assert.equal(c.activeDoc('e'),null);
    c.G.field.p=[];
    assert.equal(c.activeDoc('p'),null);
  });
}

test('all 120 names, associations and base stats stay unchanged; only 5-cost specials become 4', () => {
  const c=loadBattle(),cards=JSON.parse(JSON.stringify(c.CARDS));
  const invariant=cards.slice().sort((a,b)=>a.id.localeCompare(b.id)).map(({id,n,r,pa,a,h,v})=>({id,n,r,pa,a,h,v}));
  assert.equal(createHash('sha256').update(JSON.stringify(invariant)).digest('hex'),'059caf3e56f3698f9129d7ec6e87a5054df1dc270ddc213289cad9ef6b912d86');
  const oldRanges={comun:[1,3],raro:[2,4],especial:[3,5],legendario:[4,6]};
  for(const doctrine of keys)for(const [tier,names]of Object.entries(c.ROSTER[doctrine])){
    for(let i=0;i<names.length;i++){
      const card=c.BYID[c.slug(names[i])],range=oldRanges[tier];
      const oldCost=range[0]+i%(range[1]-range[0]+1);
      assert.equal(card.c,tier==='especial'?Math.min(4,oldCost):oldCost,card.id);
    }
  }
  assert.equal(cards.filter(card=>card.r==='especial').length,24);
  assert.ok(cards.filter(card=>card.r==='especial').every(card=>card.c<=4));
});

for(const side of ['p','e']){
  const foe=side==='p'?'e':'p';
  test(side+': Verborrea gives an immediate entry bonus with the same 8-TdP ceiling',()=>{
    const c=loadBattle();
    const leader=c.mk(c.CARDS.find(card=>card.pa==='verborrea'&&card.r==='comun'),true);
    c.G.n=3;c.G.side=side;c.G.field={p:[],e:[]};c.G.hand[side]=[leader];c.G.leader[side]=leader;
    c.G.tdp[side]=8;
    assert.equal(c.playCard(side,leader.uid),true);
    assert.equal(c.G.tdp[side],Math.min(8,8-leader.c+1));
    assert.ok(c.G.tdp[side]<=8);
  });

  test(side+': Verborrea banks at most 2 TdP, consumes the bank once, and never starts over 8',()=>{
    const c=duel(side==='p'?'verborrea':null,side==='e'?'verborrea':null);
    c.G.side=foe;c.G.tdp[side]=1;c.G.tdpMax[side]=6;
    for(let i=0;i<2;i++){
      const victim=c.mk(c.CARDS.find(card=>card.r==='comun'),false);
      c.G.field[side].push(victim);victim.h=0;
      c.expel(foe,victim,{uid:'attacker'});
      assert.equal(c.G.refund[side],2);
      assert.equal(c.G.tdp[side],1,'rival-turn rewards are saved rather than added to obsolete resources');
    }
    c.startTurn(side);
    assert.equal(c.G.tdp[side],8);
    assert.equal(c.G.refund[side],0);
    c.startTurn(side);
    assert.equal(c.G.tdp[side],7,'refund is not repeatedly applied');
    c.G.refund[side]=100;
    c.startTurn(side);
    assert.equal(c.G.tdp[side],8);
  });

  test(side+': countered Verborrea grants neither resources nor retained refunds',()=>{
    const c=duel(side==='p'?'verborrea':'giro',side==='e'?'verborrea':'giro');
    c.G.tdpMax[side]=6;c.G.refund[side]=2;
    c.startTurn(side);
    assert.equal(c.G.tdp[side],6);
    assert.equal(c.G.refund[side],0);
    c.G.field[foe]=[];
    c.startTurn(side);
    assert.equal(c.G.tdp[side],7);
  });
}

test('Guardia bonuses apply on entry, cap at +3, pause under a counter and reset on expulsion',()=>{
  const c=duel('guardia',null),base=c.CARDS.find(card=>card.r==='comun');
  const card=c.mk(base,false);
  c.G.hand.p=[card];c.G.tdp.p=8;
  c.playCard('p',card.uid);
  assert.equal(card.buff,1);
  for(let i=0;i<5;i++)c.applyGuardia('p');
  assert.equal(card.buff,3);
  assert.equal(card.a,base.a,'base stats are not permanently increased');
  assert.equal(c.battleZasca('p',card),base.a+3);
  const enemy=c.mk(c.CARDS.find(card=>card.pa==='verborrea'),true);
  c.G.leader.e=enemy;c.G.field.e=[enemy];
  assert.equal(c.battleZasca('p',card),base.a);
  c.applyGuardia('p');
  assert.equal(card.buff,3);
  c.G.field.e=[];
  assert.equal(c.battleZasca('p',card),base.a+3);
  c.expel('e',card,{uid:'attacker'});
  assert.equal(card.buff,0);
  assert.equal(card.a,base.a);
});

test('an active Verborrea can play two real 4-TdP specials after starting with 8',()=>{
  const c=duel('verborrea',null);
  c.G.tdpMax.p=6;c.G.refund.p=2;c.G.deck.p=[];c.G.pas.p=[];
  c.G.hand.p=Array.from(c.CARDS).filter(card=>card.r==='especial'&&card.c===4).slice(0,2).map(card=>c.mk(card,false));
  const ids=c.G.hand.p.map(card=>card.uid);
  c.startTurn('p');
  assert.equal(c.G.tdp.p,8);
  for(const uid of ids)assert.equal(c.playCard('p',uid),true);
  assert.equal(c.G.tdp.p,0);
  assert.equal(c.G.field.p.length,3);
});

test('Aforado saves a card only once per debate; its counter bypasses the save',()=>{
  const c=duel('aforado',null),card=c.G.leader.p;
  card.h=0;c.expel('e',card,{uid:'attacker'});
  assert.equal(card.h,1);
  assert.equal(c.G.field.p.length,1);
  card.h=0;c.expel('e',card,{uid:'attacker'});
  assert.equal(c.G.field.p.length,0);
  c.G.field.p=[card];card.h=0;
  c.expel('e',card,{uid:'attacker'});
  assert.equal(c.G.field.p.length,0,'re-entry does not reset the save');
  const counter=duel('aforado','guardia'),victim=counter.G.leader.p;
  victim.h=0;counter.expel('e',victim,{uid:'attacker'});
  assert.equal(counter.G.field.p.length,0);
  assert.equal(counter.G.saved[victim.uid],undefined);
});

test('Giro retaliation is resolved from the attack snapshot even if its leader is expelled',()=>{
  const c=duel('viperina','giro'),atk=c.G.leader.p,target=c.G.leader.e;
  atk.a=20;atk.h=1;target.h=1;
  c.attack(atk,target,'p');
  assert.equal(c.G.field.p.length,0);
  assert.equal(c.G.field.e.length,0);
  assert.equal(c.G.pas.p.length,1);
  assert.equal(c.G.pas.e.length,1);
});

test('Foco heals 2 up to full health and awards a vote; Viperina suppresses both effects',()=>{
  for(const countered of [false,true]){
    const c=duel('foco',countered?'viperina':null),leader=c.G.leader.p;
    leader.h=leader.hm-3;
    c.startTurn('p');
    assert.equal(leader.h,leader.hm-(countered?3:1));
    const before=c.G.votes.p;
    c.attack(leader,'__EMPTY','p');
    assert.equal(c.G.votes.p,before+(countered?0:1));
  }
});

test('Viperina bonus targets only the rival leader and is disabled by Aforado',()=>{
  for(const countered of [false,true]){
    const c=duel('viperina',countered?'aforado':'guardia'),atk=c.G.leader.p;
    assert.equal(c.attackDamage('p',atk,c.G.leader.e),atk.a+(countered?0:2));
    const other=c.mk(c.CARDS[0],false);
    assert.equal(c.attackDamage('p',atk,other),atk.a);
  }
});

test('AI prioritizes the countering leader when no expulsion is available',()=>{
  const c=duel('verborrea','giro');
  c.G.hand.p=[];c.G.leader.e.h=30;c.G.leader.p.h=c.G.leader.p.hm=100;
  const other=c.mk(c.CARDS[0],false);other.h=30;other.v=8;
  c.G.field.e.push(other);
  const action=c.chooseBattleAction('p');
  assert.equal(action.type,'attack');
  assert.equal(action.target.uid,c.G.leader.e.uid);
});

test('AI recognizes that an unused Aforado save prevents a lethal attack',()=>{
  const c=duel('foco','aforado');
  c.G.hand.p=[];c.G.leader.p.a=4;c.G.leader.e.h=1;c.G.leader.e.v=8;
  const other=c.mk(c.CARDS[0],false);other.h=3;other.v=2;
  c.G.saved[other.uid]=true;c.G.field.e.push(other);
  assert.equal(c.chooseBattleAction('p').target.uid,other.uid);
});

test('golden Trump is rendered only for an eligible player, never for the AI',()=>{
  for(const unlocked of [false,true])for(const active of [false,true]){
    const c=loadBattle(),profile=c.D();
    profile.dtGoldUnlocked=unlocked;profile.dtGoldActive=active;c.saveD(profile);
    c.ART_BASE='cards/';c.GOLD_LOOP={state:'ready',posterUrl:''};
    const card=c.mk(c.BYID['donald-trump'],true,'p');
    assert.equal(c.cromoBattle(card,'p').includes('gold-slot'),unlocked&&active);
    const enemy=c.cromoBattle(card,'e');
    assert.equal(enemy.includes('gold-slot'),false);
    assert.match(enemy,/src="cards\/donald-trump\.webp"/);
    assert.equal(c.cromoHTML(c.BYID['donald-trump']).includes('gold-slot'),unlocked&&active);
  }
});

test('golden Trump gains +2 base Zasca and Aguante only for an eligible player in either role',()=>{
  for(const unlocked of [false,true])for(const active of [false,true])for(const leader of [false,true]){
    const c=loadBattle(),profile=c.D(),base=c.BYID['donald-trump'];
    profile.dtGoldUnlocked=unlocked;profile.dtGoldActive=active;c.saveD(profile);
    const bonus=unlocked&&active?2:0;
    const own=c.mk(base,leader,'p'),enemy=c.mk(base,leader,'e');
    assert.equal(own.a,base.a+bonus+(leader?1:0));
    assert.equal(own.h,base.h+bonus+(leader?3:0));
    assert.equal(own.hm,own.h);
    assert.equal(own.gold,unlocked&&active);
    assert.equal(enemy.a,base.a+(leader?1:0));
    assert.equal(enemy.hm,base.h+(leader?3:0));
    assert.equal(enemy.gold,false);
    assert.equal(own.c,base.c);assert.equal(own.v,base.v);
    assert.equal(c.cardStats(base).a,base.a+bonus);
    assert.equal(c.cardStats(base).h,base.h+bonus);
    assert.match(c.cromoHTML(base),new RegExp('Z'+(base.a+bonus)+' &middot; A'+(base.h+bonus)));
  }
});

test('newBattle applies the golden bonus once, with no stacking when Trump is recycled',()=>{
  for(const asLeader of [false,true]){
    const c=loadBattle(),profile=c.D(),base=c.BYID['donald-trump'];
    profile.dtGoldUnlocked=true;profile.dtGoldActive=true;c.saveD(profile);
    const other=c.CARDS.filter(card=>card.r==='comun').slice(0,4).map(card=>card.id);
    c.BUILD={ids:[base.id,...other],leader:asLeader?base.id:other[0]};
    c.buildEnemyTeam=()=>[base.id,...other];c.newBattle('normal');
    const own=[...c.G.hand.p,...c.G.deck.p].find(card=>card.k===base.id);
    const enemy=[...c.G.hand.e,...c.G.deck.e].find(card=>card.k===base.id);
    const a=base.a+2+(asLeader?1:0),h=base.h+2+(asLeader?3:0);
    assert.equal(own.a,a);assert.equal(own.hm,h);assert.equal(enemy.gold,false);
    c.G.n=2;c.G.side='e';c.G.leader.p=null;c.G.field.p=[own];c.G.hand.p=[];c.G.deck.p=[];
    own.h=0;c.expel('e',own,{uid:'rival'});c.draw('p');assert.equal(c.G.hand.p.length,0);c.G.turns.p++;c.draw('p');assert.equal(c.G.hand.p.length,0);c.G.turns.p++;c.draw('p');
    assert.ok(c.G.hand.p.some(card=>card.uid===own.uid));
    assert.equal(own.a,a);assert.equal(own.hm,h);assert.equal(own.h,h);
    c.newBattle('normal');
    const fresh=[...c.G.hand.p,...c.G.deck.p].find(card=>card.k===base.id);
    assert.equal(fresh.a,a);assert.equal(fresh.hm,h);assert.equal(base.a,a-2-(asLeader?1:0));
  }
});

for(const side of ['p','e'])test(side+': Verborrea reserved draw fills at most two cards, only while active',()=>{
 for(const countered of [false,true]){
 const c=duel(side==='p'?'verborrea':countered?'giro':null,side==='e'?'verborrea':countered?'giro':null);
 c.G.refund[side]=2;c.G.hand[side]=[];c.G.deck[side]=Array.from(c.CARDS).slice(0,3).map(card=>c.mk(card,false));
 c.startTurn(side);assert.equal(c.G.hand[side].length,countered?1:2);
 assert.equal(c.G.deck[side].length,countered?2:1);
 c.startTurn(side);assert.ok(c.G.hand[side].length<=2);
 }
});
