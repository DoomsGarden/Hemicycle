const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadBattle } = require('./helpers/battle.cjs');

const modes = ['normal', 'ranked', 'liga'];
const json = value => JSON.parse(JSON.stringify(value));

for (const mode of modes) {
  for (const [random, first, face] of [[0, 'p', 'cara'], [0.5, 'e', 'cruz'], [0.999999, 'e', 'cruz']]) {
    test(`${mode}: ${face} assigns ${first} the first turn, with no action before confirmation (${random})`, () => {
      const c = loadBattle(mode, random);
      assert.equal(c.G.first, first);
      assert.equal(c.G.side, null);
      assert.equal(c.G.n, 0);
      assert.equal(c.timers.size, 0);
      assert.match(c.elements.coinRoot.innerHTML, /Tú tienes <b>cara<\/b>/);
      assert.match(c.SCREENS.battle(), /battle-wrap/);
      assert.equal(c.elements.content.inert, true);
      assert.match(c.elements.coinRoot.innerHTML, new RegExp('Ha salido ' + face));
      c.playCard('p', c.G.hand.p[0].uid);
      c.endTurn();
      assert.equal(c.G.n, 0);
      c.beginDebate();
      assert.equal(c.G.side, first);
      assert.equal(c.G.n, 1);
      assert.equal(c.G.votes[first], 3);
      assert.equal(c.timers.size, first === 'e' ? 1 : 0);
      c.beginDebate();
      assert.equal(c.G.n, 1, 'double tapping cannot skip a turn');
      assert.equal(c.elements.coinRoot.innerHTML, '');
      assert.equal(c.elements.content.inert, false);
    });
  }

  for (const first of ['p', 'e']) {
    test(`${mode}: no seven- or ten-round cap when ${first} starts; only 100 votes ends play`, () => {
      const c=loadBattle(mode,first==='p'?0.25:0.75);
      for(const side of ['p','e'])c.G.hand[side]=c.G.deck[side]=c.G.pas[side]=[];
      c.beginDebate();
      while(c.G.n<22){if(c.G.side==='p')c.endTurn();else c.tick();}
      assert.equal(c.G.over,false);assert.equal(c.G.n,22);
      let safety=0;while(!c.G.over&&safety++<200){if(c.G.side==='p')c.endTurn();else c.tick();}
      assert.equal(c.SO.who,first);assert.equal(c.G.votes[first],102);assert.equal(c.G.n,67);assert.equal(c.timers.size,0);assert.equal(c.intervals.size,0);
    });
  }

  for (const side of ['p', 'e']) {
    test(`${mode}: passive votes end ${side}'s match immediately at exactly 100`, () => {
      const c = loadBattle(mode);
      c.G.n = 10;
      c.G.votes[side] = 97;
      c.startTurn(side);
      assert.equal(c.G.votes[side], 100);
      assert.equal(c.G.n, 11);
      assert.ok(c.G.done);
      assert.equal(c.SO.who, side);
      assert.equal(c.SCREEN, 'result');
      assert.equal(c.timers.size, 0);
    });

    test(`${mode}: expulsion ends ${side}'s match and cancels pending rival actions`, () => {
      const c = loadBattle(mode), foe = side === 'p' ? 'e' : 'p';
      c.G.side = side; c.G.n = 11;
      const atk = c.mk(c.CARDS[0], false), target = c.mk(c.CARDS[1], false);
      atk.a = 100; target.h = 1;
      c.G.field[side] = [atk]; c.G.field[foe] = [target];
      c.G.votes[side] = 100 - target.v;
      c.AITIMER = c.setTimeout(c.aiStep, 500);
      c.attack(atk, target, side);
      assert.equal(c.G.votes[side], 100);
      assert.equal(c.SO.who, side);
      assert.equal(c.G.field[foe].length, 0);
      assert.equal(c.timers.size, 0);
      const saved = json(c.D()), battle = json(c.G), league = json(c.ligaLoad());
      c.aiStep(); c.endTurn(); c.startTurn(foe); c.finish(foe);
      assert.equal(c.playCard(foe, c.G.hand[foe][0].uid), false);
      c.attack(atk, '__EMPTY', side);
      assert.deepEqual(json(c.D()), saved, 'rewards are paid once');
      assert.deepEqual(json(c.G), battle, 'no cards, votes or turns change after victory');
      assert.deepEqual(json(c.ligaLoad()), league, 'league result is applied once');
    });

    for (const empty of [false, true]) {
      test(`${mode}: Foco Mediático ends ${side}'s match at 100 (${empty ? 'empty bench' : 'card target'})`, () => {
        const c = loadBattle(mode), foe = side === 'p' ? 'e' : 'p';
        const atk = c.mk(c.CARDS.find(card => card.pa === 'foco'), true);
        const target = c.mk(c.CARDS[0], false);
        c.G.side = side; c.G.n = 9; c.G.votes[side] = 99;
        c.G.leader[side] = atk; c.G.field[side] = [atk];
        if (!empty) c.G.field[foe] = [target];
        c.attack(atk, empty ? '__EMPTY' : target, side);
        assert.equal(c.G.votes[side], 100);
        assert.ok(c.G.done);
        assert.equal(c.SO.who, side);
        assert.equal(c.timers.size, 0);
      });
    }
  }

  for (const action of ['startTurn', 'endTurn', 'aiStep', 'playCard', 'attack']) {
    test(`${mode}: ${action} checks an existing majority before allowing another action`, () => {
      const c = loadBattle(mode);
      c.G.n = 12; c.G.side = 'e'; c.G.votes.p = 100;
      const before = json({ n: c.G.n, votes: c.G.votes, hand: c.G.hand, field: c.G.field });
      const actions = {
        startTurn: () => c.startTurn('e'), endTurn: () => c.endTurn(), aiStep: () => c.aiStep(),
        playCard: () => c.playCard('e', c.G.hand.e[0].uid),
        attack: () => c.attack(c.G.hand.e[0], '__EMPTY', 'e')
      };
      actions[action]();
      assert.equal(c.SO.who, 'p');
      assert.deepEqual(json({ n: c.G.n, votes: c.G.votes, hand: c.G.hand, field: c.G.field }), before);
      assert.equal(c.timers.size, 0);
    });
  }
}

test('ranked Elo has reachable extremes, rewards close defeats, and uses the same margin on both sides', () => {
  const c = loadBattle('ranked');
  for (const [winner, loser, win, loss] of [[100, 99, 10, -5], [100, 75, 15, -8], [100, 50, 20, -11], [100, 25, 25, -14], [40, 10, 25, -14], [100, 0, 25, -18]]) {
    assert.equal(c.calcRankedEloDelta('p', winner, loser, false), win);
    assert.equal(c.calcRankedEloDelta('e', loser, winner, false), loss);
  }
  assert.equal(c.calcRankedEloDelta('d', 80, 80, false), 0);
  assert.equal(c.calcRankedEloDelta('e', 99, 100, true), -18);
  const wins = new Set(), losses = new Set();
  for (let loser = 99; loser >= 0; loser--) {
    const win = c.calcRankedEloDelta('p', 100, loser, false);
    const loss = c.calcRankedEloDelta('e', loser, 100, false);
    assert.ok(win >= 10 && win <= 25);
    assert.ok(loss >= -18 && loss <= -5);
    if (loser > 0) assert.ok(loss > -18, 'maximum loss is reserved for finishing without votes');
    if (loser < 99) {
      assert.ok(win >= c.calcRankedEloDelta('p', 100, loser + 1, false));
      assert.ok(loss <= c.calcRankedEloDelta('e', loser + 1, 100, false));
    }
    wins.add(win); losses.add(loss);
  }
  assert.equal(wins.size, 16, 'every award from +10 through +25 is attainable');
  assert.equal(losses.size, 14, 'every penalty from -5 through -18 is attainable');
});

test('a seventh-round ranked victory awards +25 regardless of initiative', () => {
  for (const first of ['p', 'e']) {
    const c = loadBattle('ranked', first === 'p' ? 0.25 : 0.75);
    c.G.n = first === 'p' ? 12 : 13;
    c.G.votes = { p: 97, e: 25 };
    c.startTurn('p');
    assert.equal(c.D().elo, 325);
    assert.equal(c.SO.eloDelta, 25);
    assert.match(c.SO.msg, /\+25 Elo/);
  }
});

test('ranked loss reports the actual Elo deducted when the balance reaches zero', () => {
  const c = loadBattle('ranked');
  const d = c.D(); d.elo = 3; c.saveD(d);
  c.G.votes = { p: 25, e: 97 };
  c.startTurn('e');
  assert.equal(c.D().elo, 0);
  assert.equal(c.SO.eloDelta, -3);
  assert.match(c.SO.msg, /\(-3 Elo\)/);
});

for(const mode of ['normal','ranked','liga'])for(const side of ['p','e'])test(mode+': '+side+' has 60 absolute seconds, then loses for inactivity once',()=>{
 const c=loadBattle(mode,side==='p'?0.25:0.75);c.beginDebate();const initial=c.D(),deadline=c.G.turnDeadline;c.advanceTime(59999);assert.equal(c.G.over,false);assert.equal(c.G.turnDeadline,deadline);c.advanceTime(1);assert.equal(c.G.done,true);assert.equal(c.G.inactivity,side);assert.equal(c.SO.who,side==='p'?'e':'p');assert.match(c.SO.msg,/inactividad/);assert.equal(c.intervals.size,0);assert.equal(c.timers.size,0);const saved=json(c.D());c.advanceTime(60000);c.syncBattleClock();assert.deepEqual(json(c.D()),saved);assert.equal(saved.w-initial.w,side==='p'?0:1);assert.equal(saved.l-initial.l,side==='p'?1:0);if(mode==='ranked'&&side==='p')assert.equal(saved.elo,initial.elo-18);
});
test('passing in time gives the next side a fresh 60 seconds; actions do not reset the current deadline',()=>{const c=loadBattle();c.beginDebate();const first=c.G.turnDeadline;c.advanceTime(30000);c.playCard('p',c.G.hand.p[0].uid);assert.equal(c.G.turnDeadline,first);c.endTurn();assert.equal(c.G.turnDeadline,first+30000);});
test('practice remains untimed while the player reads',()=>{const c=loadBattle();c.newBattle('normal',null,true);c.beginDebate();c.advanceTime(600000);assert.equal(c.G.over,false);assert.equal(c.G.turnDeadline,null);});
test('hands never exceed two; expelled cards skip the next own turn before mixing back into the deck',()=>{const c=loadBattle();c.beginDebate();assert.equal(c.G.hand.p.length,2);const target=c.G.hand.p.shift();c.G.field.p=[target];c.G.side='e';c.expel('e',target,{uid:'attacker'});assert.equal(target.h,0);assert.equal(c.G.pas.p.includes(target),true);c.startTurn('p');assert.equal(c.G.pas.p.includes(target),true);assert.ok(c.G.hand.p.length<=2);c.G.hand.p=[];c.startTurn('p');assert.equal(c.G.pas.p.includes(target),false);assert.ok(c.G.deck.p.includes(target)||c.G.hand.p.includes(target));assert.ok(c.G.hand.p.length<=2);});

test('ranked rival progression follows the new 2500-Elo rank boundaries without inflated card statistics',()=>{
 const c=loadBattle();
 const expected=[['comun','comun','comun','raro','raro'],['comun','comun','raro','raro','especial'],['comun','raro','raro','especial','legendario'],['raro','raro','especial','especial','legendario']];
 for(let rank=0;rank<4;rank++)for(const elo of [rank*2500,rank*2500+2499])assert.deepEqual(Array.from(c.buildEnemyTeam('ranked',elo,3),id=>c.BYID[id].r),expected[rank]);
});
