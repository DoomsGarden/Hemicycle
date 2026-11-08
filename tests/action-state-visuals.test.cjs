'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const V = require('../js/action-state-visuals.js');
const S = require('../js/action-status.js');
test('browser script order exposes action modifiers to status details and attack forecasts', () => {
  const fs = require('node:fs'), vm = require('node:vm');
  const context = vm.createContext({});
  const wanted = new Set(['basic-effects-v1.js', 'basic-effects-v2.js', 'basic-effects-v3.js', 'basic-effects.js', 'action-status.js', 'attack-forecast.js', 'battle-status.js']);
  const scripts = [...fs.readFileSync('index.html', 'utf8').matchAll(/<script src="js\/([^"?]+)(?:\?[^"]*)?"/g)].map(m => m[1]).filter(name => wanted.has(name));
  assert.equal(scripts.length, wanted.size);
  for (const file of scripts) vm.runInContext(fs.readFileSync('js/' + file, 'utf8'), context);
  const attacker = { id: 'attacker', uid: 'a', hp: 20, ready: true }, target = { id: 'target', uid: 'b', hp: 20, votes: 1, guard: false };
  S.grant(target, 'fortress', 2, 2, 3, 0);
  S.grant(attacker, 'precision', 1, 2, 3, 0);
  const query = { attacker, target: 'b', field: [target], ownTurn: 3, rivalTurn: 3, variant: 'normal', power: 6 };
  assert.equal(context.HemicycleAttackForecast.calculate(query).damage, 4);
  assert.ok(context.HemicycleBattleStatus.card({ turns: { p: 3 } }, 'p', target).some(s => s.short === 'Resistencia'));
  S.clear(target);
  target.guard = true;
  assert.equal(context.HemicycleAttackForecast.calculate(query).damage, 4);
});
test('all action states retain their aura until the motor expires or clears them', () => {
  for (const kind of Object.keys(S.definitions)) {
    const card = {};
    S.grant(card, kind, 2, 2, 3, 0);
    const before = JSON.stringify(card);
    assert.deepEqual(V.kinds(card), [kind]);
    V.markup(card, { turn: 3 }, 1200);
    assert.equal(JSON.stringify(card), before, 'Presentation must not alter rules or durations');
    S.end(card, 4);
    assert.deepEqual(V.kinds(card), [kind]);
    S.end(card, 5);
    assert.equal(V.markup(card), '');
  }
});
test('stacking, cleansing and purging leave only the effects actually present', () => {
  const card = { guard: true, visualBuffs: [{ value: 1, until: 3 }] };
  S.grant(card, 'fortress', 2, 2, 3, 0);
  S.grant(card, 'regeneration', 1, 2, 3, 0);
  S.grant(card, 'weakness', 1, 1, 3, 1);
  assert.deepEqual(V.kinds(card, { turn: 3, silenced: true }), ['fortress', 'regeneration', 'weakness', 'guard', 'strength', 'silence']);
  S.clear(card, 'negative');
  S.purge(card);
  assert.deepEqual(V.kinds(card, { turn: 4 }), []);
});
test('aura for legacy attack boosts follows the actual current turn on either client format', () => {
  for (const key of ['buffs', 'actionBuffs', 'visualBuffs']) {
    const card = { [key]: [{ value: 1, until: 3 }, { value: 0, until: 9 }] };
    assert.deepEqual(V.kinds(card, { turn: 3 }), ['strength']);
    assert.deepEqual(V.kinds(card, { turn: 4 }), []);
  }
});
test('empty or unknown state data produces no invented aura', () => {
  assert.equal(V.markup(null), '');
  assert.equal(V.markup({ actionStates: [{ kind: 'invalid', value: 2 }] }), '');
});
test('adding another effect does not restart an existing aura phase', () => {
  const card = {};
  S.grant(card, 'regeneration', 1, 2, 3, 0);
  const phase = html => html.match(/data-statefx="regeneration" style="[^"]*--state-phase:([^";]+)/)[1];
  const before = phase(V.markup(card, {}, 4000));
  card.actionStates.unshift({ kind: 'strength', value: 1, expires: 5 });
  assert.equal(phase(V.markup(card, {}, 4000)), before);
});
