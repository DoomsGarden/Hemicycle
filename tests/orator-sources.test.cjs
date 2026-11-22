'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs');
const catalog=require('../js/orator-catalog.js'),registry=require('../docs/fuentes-frases-actuales.json'),context=require('../js/orator-context.js'),UI=require('../js/strategy-ui.js');
test('public sources cover only current phrases, distinguish adaptation and disclose limited evidence',()=>{require('../_dev/legal/build-sources.cjs').build(undefined,true);const html=fs.readFileSync('fuentes/index.html','utf8');a.equal((html.match(/class="quote-entry"/g)||[]).length,catalog.cards.length*3);a.equal((html.match(/class="orator-card"/g)||[]).length,catalog.cards.length);a.equal((html.match(/data-kind="translation"/g)||[]).length,registry.cromos.flatMap(c=>c.frases).filter(q=>q.tratamiento==='traduccion_de_fragmento').length);a.equal((html.match(/data-kind="adaptation"/g)||[]).length,3);a.equal((html.match(/data-partial="true"/g)||[]).length,5);a.match(html,/Váyase, señor presidente/);a.match(html,/Váyase, señor González/);a.match(html,/no son fotografías|no fotografías/i);a.match(html,/no necesariamente fuentes primarias/);a.ok(!/<iframe|<table|chatgpt\.com\/share/.test(html));for(const m of html.matchAll(/src="\.\.\/(cards\/[^"?]+)"/g))a.ok(fs.existsSync(m[1]),m[1]);});
test('legal documents expose sources from app and standalone bases, without claiming every phrase was rewritten',()=>{const doc=require('../js/legal-documents.js'),aviso=doc.documents.find(d=>d.id==='aviso').sections;const phrases=aviso.find(s=>s.title==='Frases, humor y contexto').text;a.match(phrases,/no todas las frases han sido modificadas/i);a.match(phrases,/no se presentan como citas literales/);a.match(aviso.find(s=>s.title==='Ilustraciones generadas mediante IA').text,/No se presentan como fotografías reales/);const link=doc.credits.find(c=>c.page).page;a.equal(new URL(link,'https://hemicycle.online/legal/').href,'https://hemicycle.online/fuentes/');});

test('all original and expansion cards use the same framed disclosure and link to a unique archive entry',()=>{
 const html=fs.readFileSync('fuentes/index.html','utf8');
 const anchors=Array.from(html.matchAll(/<details class="orator-card" id="([^"]+)"/g),match=>match[1]);
 const unique=new Set(anchors);
 a.equal(unique.size,anchors.length);
 a.equal(Object.keys(context).length,catalog.cards.length);
 for(const card of catalog.cards){
  a.ok(unique.has(card.id),card.id);
  const panel=UI.context(context[card.id],card.id);
  a.match(panel,/<details class="strategy-panel historical-context"><summary>Contexto y trayectoria<\/summary>/);
  a.ok(panel.includes('href="fuentes/#'+card.id+'" target="_blank" rel="noopener noreferrer"'),card.id);
 }
 a.match(UI.context(context['barack-obama']),/Wikipedia y sus colaboradores.*CC BY-SA 4.0/);
 a.match(UI.context(context['christian-lindner']),/Cargo documentado.*Bundesminister der Finanzen.*Ver la fuente del cargo/);
 a.match(UI.context(undefined,'christian-lindner'),/historical-context.*fuentes\/#christian-lindner/);
});
