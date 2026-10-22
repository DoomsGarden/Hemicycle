const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const context = vm.createContext({});
const slug = html.match(/function slug\(s\)\{[^\n]+/)[0];
vm.runInContext(slug + '\n' + html.slice(html.indexOf('var DOCS='), html.indexOf("var LS='")), context);
const { CARDS: cards, QBESP: bespoke } = JSON.parse(
  vm.runInContext('JSON.stringify({CARDS:CARDS,QBESP:QBESP})', context)
);
const normalize = quote => quote.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '');

test('all 120 cards use three own quotes and all 360 lines are distinct', () => {
  assert.equal(cards.length, 120);
  assert.equal(Object.keys(bespoke).length, 120);
  const seen = new Set();
  for (const [id, quotes] of Object.entries(bespoke)) {
    const card = cards.find(c => c.id === id);
    assert.ok(card, id);
    assert.equal(quotes.length, 3, id);
    assert.deepEqual(card.q, quotes, id);
    for (const quote of quotes) {
      const key = normalize(quote);
      assert.ok(key, id);
      assert.ok(!seen.has(key), `${id}: repeated own quote`);
      seen.add(key);
    }
  }
  assert.equal(seen.size, 360);
});

test('the 84 formerly generic cards have sources and three proposed future uses', () => {
  const sources = JSON.parse(fs.readFileSync(path.join(root, 'docs/fuentes-cromos-restantes.json'), 'utf8'));
  const expected = cards.filter(c => c.r === 'comun' || c.r === 'raro');
  assert.equal(sources.cromos.length, 84);
  assert.deepEqual(sources.cromos.map(c => c.id).sort(), expected.map(c => c.id).sort());
  for (const source of sources.cromos) {
    const card = cards.find(c => c.id === source.id);
    assert.equal(source.nombre, card.n, source.id);
    assert.deepEqual(source.frases.map(q => q.tipo), ['ataque_normal', 'ataque_fuerte', 'defensa_curacion'], source.id);
    assert.deepEqual(source.frases.map(q => q.frase), card.q, source.id);
    for (const quote of source.frases) {
      assert.equal(new URL(quote.fuente).protocol, 'https:', source.id);
    }
  }
});

test('each of the 22 additions has a documented web source matching the game', () => {
  const sources = JSON.parse(fs.readFileSync(path.join(root, 'docs/fuentes-frases.json'), 'utf8'));
  assert.equal(sources.frases.length, 22);
  assert.equal(new Set(sources.frases.map(s => s.id)).size, 22);
  for (const source of sources.frases) {
    assert.ok(bespoke[source.id], source.id);
    assert.equal(bespoke[source.id][2], source.frase, source.id);
    assert.equal(new URL(source.fuente).protocol, 'https:', source.id);
    assert.ok(source.original && source.nota, source.id);
  }
});

test('every current phrase matches the approved complete sourced catalog in action order',()=>{
 const registry=JSON.parse(fs.readFileSync(path.join(root,'docs/fuentes-frases-actuales.json'),'utf8'));
 assert.equal(registry.cromos.length,120);
 for(const item of registry.cromos){
  const card=cards.find(c=>c.id===item.id);assert.ok(card,item.id);assert.deepEqual(item.frases.map(q=>q.frase),card.q,item.id);assert.deepEqual(item.frases.map(q=>q.tipo),['ataque_normal','ataque_fuerte','defensa_curacion']);
  for(const quote of item.frases){assert.equal(new URL(quote.fuente).protocol,'https:');assert.ok(quote.original&&quote.tratamiento&&quote.comprobado_en);assert.ok(quote.frase.length<=47);}
 }
});
