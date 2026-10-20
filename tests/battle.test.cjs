const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
// Execute the production rules, persistence and AI with a deterministic clock.
// Only rendering/navigation are replaced; finish() and league rewards remain real.
function loadBattle(mode = 'normal', random = 0.25) {
  const storage = new Map(), timers = new Map();
  let timerId = 0;
  const math = Object.create(Math);
  math.random = () => random;
  const context = vm.createContext({
    Math: math,
    localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
    clearTimeout: id => timers.delete(id)
  });
  vm.runInContext(
    html.slice(html.indexOf('var UID='), html.indexOf("var ART_BASE=")) +
    html.slice(html.indexOf('var DOCS='), html.indexOf('\nfunction gem(')) +
    html.slice(html.indexOf('var RANKS='), html.indexOf('\nfunction saveColScroll(')) +
    '\nvar SCREENS={};function paint(){};function go(s,o){SCREEN=s;SO=o||{};}function showAchievement(){}\n' +
    html.slice(html.indexOf('function mk('), html.indexOf('\nfunction cromoBattle(')) +
    html.slice(html.indexOf('SCREENS.battle=function'), html.indexOf('\nSCREENS.liga=function')),
    context
  );
  vm.runInContext(`
    var profile=D();profile.album=CARDS.map(function(c){return c.id;});profile.elo=300;saveD(profile);
    var ids=CARDS.filter(function(c){return c.r==='comun';}).slice(0,5).map(function(c){return c.id;});
    BUILD={ids:ids,leader:ids[0]};
    lsSet(LS2,ligaNew(3));
  `, context);
  context.newBattle(mode);
  context.timers = timers;
  context.tick = () => {
    const next = timers.entries().next().value;
    assert.ok(next, 'expected a pending AI action');
    timers.delete(next[0]);
    next[1]();
  };
  return context;
}

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
      assert.match(c.SCREENS.battle(), /Tú tienes <b>cara<\/b>/);
      assert.match(c.SCREENS.battle(), new RegExp('Ha salido ' + face));
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
    });
  }

  for (const first of ['p', 'e']) {
    test(`${mode}: both players receive seven turns when ${first} starts`, () => {
      const c = loadBattle(mode, first === 'p' ? 0.25 : 0.75);
      // Empty cabinets isolate the round limit from the 100-vote win condition.
      for (const s of ['p', 'e']) c.G.hand[s] = c.G.deck[s] = c.G.pas[s] = [];
      c.beginDebate();
      const turns = { p: 0, e: 0 };
      let seen = 0, steps = 0;
      while (!c.G.over && steps++ < 50) {
        if (c.G.n !== seen) { seen = c.G.n; turns[c.G.side]++; }
        if (c.G.side === 'p') c.endTurn();
        else c.tick();
      }
      assert.ok(c.G.done);
      assert.deepEqual(turns, { p: 7, e: 7 });
      assert.equal(c.G.n, 14);
      assert.equal(c.SO.who, 'd');
      assert.deepEqual(json(c.G.votes), { p: 21, e: 21 });
      assert.equal(c.timers.size, 0);
      assert.equal(c.D().elo, 300, 'a draw never changes Elo');
      if (mode === 'liga') {
        assert.equal(c.ligaLoad().jor, 2);
        assert.equal(c.ligaLoad().teams.find(team => team.you).pts, 1);
      }
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
