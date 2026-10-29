const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
const source = new vm.Script(
  html.slice(html.indexOf('var UID='), html.indexOf("var ART_BASE=")) +
  "\nvar ART_BASE='';\n" +
  html.slice(html.indexOf('var DOCS='), html.indexOf('\n/* === SISTEMA DE VENTANA EMERGENTE')) +
  html.slice(html.indexOf('function syncCoinToss('), html.indexOf('\n/* === SISTEMA DE ZOOM')) +
  html.slice(html.indexOf('var RANKS='), html.indexOf('\nfunction saveColScroll(')) +
  '\nvar SCREENS={};function paint(){syncCoinToss();}function go(s,o){SCREEN=s;SO=o||{};paint();}function showAchievement(){}\n' +
  html.slice(html.indexOf('function mk('), html.indexOf('\nSCREENS.liga=function')),
  { filename: 'hemicycle-battle-rules.js' }
);
function loadBattle(mode = 'normal', random = 0.25) {
  const storage = new Map(), timers = new Map(), elements = {};
  let timerId = 0, now=1000000;
  const intervals=new Map();
  for (const id of ['coinRoot', 'content']) elements[id] = {
    innerHTML: '', inert: false,
    get firstChild() { return this.innerHTML ? {} : null; },
    querySelector() { return { focus() {} }; }
  };
  const math = Object.create(Math);
  math.random = typeof random === 'function' ? random : () => random;
  const context = vm.createContext({
    HemicycleBattleRules: require('../../js/battle-rules.js'),
    HemicycleLeagueRewards: require('../../js/league-rewards.js'),
    HemicycleCatalog: require('../../js/orator-catalog.js'),
    HemicycleActions: require('../../js/action-cards.js'),
    HemicycleBattleStatus: require('../../js/battle-status.js'),
    HemicycleCoinToss: {...require('../../js/coin-toss.js'),show(){},schedule(){},cancel(){}},
    HemicycleObjectives: require('../../js/objectives.js'),
    HemicycleCabinets: require('../../js/cabinet-presets.js'),
    Math: math,
    Date: class extends Date { static now(){return now;} },
    setInterval: fn=>{intervals.set(++timerId,fn);return timerId;},
    clearInterval:id=>intervals.delete(id),
    document: { getElementById: id => elements[id] || null },
    localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
    clearTimeout: id => timers.delete(id)
  });
  source.runInContext(context);
  vm.runInContext(
    "var profile=D();profile.album=CARDS.map(function(c){return c.id;});profile.elo=300;saveD(profile);" +
    "var ids=CARDS.filter(function(c){return c.r==='comun';}).slice(0,5).map(function(c){return c.id;});" +
    "BUILD={ids:ids,leader:ids[0]};lsSet(LS2,ligaNew(3));",
    context
  );
  context.newBattle(mode);
  context.advanceTime=ms=>{now+=ms;for(const fn of Array.from(intervals.values()))fn();};
  context.intervals=intervals;
  context.timers = timers;
  context.elements = elements;
  context.tick = () => {
    const next = timers.entries().next().value;
    if (!next) throw new Error('Expected a pending AI action');
    timers.delete(next[0]);
    next[1]();
  };
  return context;
}
module.exports = { loadBattle };
