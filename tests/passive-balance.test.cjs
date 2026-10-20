const assert = require('node:assert/strict');
const { test } = require('node:test');
const { balanceReport } = require('./helpers/balance.cjs');

test('six doctrines retain strengths and weaknesses in 3456 paired simulations', { timeout: 60000 }, () => {
  const report = balanceReport(8);
  assert.equal(report.total, 3456);
  for (const [doctrine, score] of Object.entries(report.scores)) {
    assert.ok(score >= 0.43 && score <= 0.57, doctrine + ': aggregate score ' + score);
    const prey = report.counters[doctrine];
    const counter = Object.keys(report.counters).find(key => report.counters[key] === doctrine);
    assert.ok(report.matrix[doctrine][prey].score > 0.53, doctrine + ': favorable matchup');
    assert.ok(report.matrix[doctrine][counter].score < 0.47, doctrine + ': unfavorable matchup');
    assert.equal(report.matrix[doctrine][doctrine].score, 0.5);
  }
});
