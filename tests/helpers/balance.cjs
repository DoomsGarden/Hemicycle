const { loadBattle } = require('./battle.cjs');
const recipes = {
  inicial: [['raro',0],['comun',0],['comun',1],['raro',1],['comun',2]],
  mixto: [['especial',0],['comun',0],['raro',1],['especial',2],['comun',1]],
  avanzado: [['legendario',0],['especial',0],['especial',1],['raro',0],['comun',1]]
};
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
function createSimulator() {
  const c = loadBattle();
  function team(doctrine, recipe) {
    return recipes[recipe].map(([tier,index]) => c.slug(c.ROSTER[doctrine][tier][index]));
  }
  function play({p, e, recipe, seed, first, policy = 'lider'}) {
    c.Math.random = seededRandom(seed);
    const player = team(p, recipe), enemy = team(e, recipe);
    c.BUILD = { ids: player, leader: player[0] };
    c.buildEnemyTeam = () => enemy;
    c.newBattle('normal');
    c.G.first = first;
    c.beginDebate();
    let steps = 0;
    while (!c.G.over && steps++ < 200) {
      c.clearAI();
      const side = c.G.side;
      let action = c.chooseBattleAction(side);
      if (policy === 'tempo' && action.type === 'play') {
        const playable = Array.from(c.G.hand[side]).filter(card => card.c <= c.G.tdp[side]);
        playable.sort((a,b) => a.c-b.c || b.v-a.v);
        action = { type: 'play', card: playable[0] };
      }
      if (action.type === 'play') c.playCard(side, action.card.uid);
      else if (action.type === 'attack') c.attack(action.card, action.target, side, action.variant);
      else if(action.type==='heal'||action.type==='guard') c.useSupport(action.card,action.type,side);
      else c.completeTurn(side);
    }
    if (!c.G.done) throw new Error('Battle failed to finish: ' + JSON.stringify({p,e,recipe,seed,first,policy}));
    if (c.timers.size) throw new Error('AI timer left after victory');
    return { winner:c.SO.who, pVotes:c.G.votes.p, eVotes:c.G.votes.e, turns:c.G.n };
  }
  return { play, doctrines:Array.from(c.DOCS, d => d.k), counters:Object.fromEntries(c.DOCS.map(d=>[d.k,d.beats])) };
}
function balanceReport(seeds = 8) {
  const simulator = createSimulator(), keys = simulator.doctrines;
  const matrix = Object.fromEntries(keys.map(p => [p,Object.fromEntries(keys.map(e => [e,{wins:0,draws:0,games:0}]))]));
  let total = 0;
  for (const p of keys) for (const e of keys) {
    const cell = matrix[p][e];
    for (const recipe of Object.keys(recipes)) for (const policy of ['lider','tempo']) {
      for (let seed=1; seed<=seeds; seed++) for (const first of ['p','e']) {
        const result = simulator.play({p,e,recipe,seed,first,policy});
        cell.games++; total++;
        if (result.winner === 'p') cell.wins++;
        else if (result.winner === 'd') cell.draws++;
      }
    }
    cell.seatScore = (cell.wins+cell.draws/2)/cell.games;
  }
  // Pair each fixture with the reversed player/rival seats to remove draw-order bias.
  for (const p of keys) for (const e of keys) matrix[p][e].score = (matrix[p][e].seatScore+1-matrix[e][p].seatScore)/2;
  const scores = Object.fromEntries(keys.map(p => [p,keys.filter(e=>e!==p).reduce((sum,e)=>sum+matrix[p][e].score,0)/(keys.length-1)]));
  return { total,seeds,recipes:Object.keys(recipes),policies:['lider','tempo'],counters:simulator.counters,scores,matrix };
}
module.exports = { recipes, seededRandom, createSimulator, balanceReport };
