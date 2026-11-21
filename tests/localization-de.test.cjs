'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../js/orator-catalog.js'),A=require('../js/action-cards.js'),German=require('../js/localization-de.js')(),rules=require('../_dev/i18n/de/review-gameplay.cjs');
const oldIds=new Set(require('../_dev/online/frozen-v11/orator-catalog.js').cards.map(c=>c.id));
const additions=C.cards.filter(c=>!oldIds.has(c.id));
function language(locale='de',fixtures=[]){
 const context={localStorage:{getItem:()=>locale},requestAnimationFrame:()=>1,document:{readyState:'loading',addEventListener(){}},HemicycleCatalog:{...C,cards:C.cards.concat(fixtures)},HemicycleActions:A};context.window=context;context.globalThis=context;vm.createContext(context);
 for(const name of ['localization-data','localization','localization-extra','localization-reviewed','localization-gameplay','localization-review321','localization-gb-de','localization-de'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),context);
 return context.HemicycleI18n;
}
test('German persists as a supported locale and all four language controls retain their own names',()=>{
 const I=language();a.equal(I.locale,'de');a.equal(I.tag,'de-DE');const control=I.control();for(const [id,name]of [['es','Español'],['en','English'],['fr','Français'],['de','Deutsch']])a.match(control,new RegExp('value="'+id+'"[^>]*>'+name));a.match(control,/data-no-translate/);a.match(control,/value="de" selected/);
 for(const [source,expected]of [['Hemiciclo','Hemizykel'],['Toma la palabra','Ergreife das Wort'],['Cromos','Karten'],['Logros','Erfolge'],['Desafíos','Herausforderungen'],['Reclamar','Abholen'],['Guardar ahora','Jetzt speichern'],['TdP','RP'],['XP','EP'],['FS','FS'],['Z 7 · A 11','K 7 · A 11'],['Nivel 49','Stufe 49'],['Ronda 5','Runde 5'],['3 sobres raros','3 seltene Booster']])a.equal(I.t(source),expected,source);
 for(const symbol of ['×','‹','›','+','−','/','389'])a.equal(I.t(symbol),symbol);a.equal(I.t('Pedro Sánchez'),'Pedro Sánchez');
 a.equal(I.t('2t'),'2 Z.');
});
test('every collected interface string has German coverage, with reviewed rules for all 92 action cards and 14 basic effects',()=>{
 const I=language(),sources=JSON.parse(fs.readFileSync('_dev/i18n/de/sources.json'));for(const {source}of sources)a.ok(German.translations[source]?.trim(),source);
 for(const card of A.cards){a.equal(I.t(card.n),rules.rows[card.n]);a.equal(I.t(card.text),rules.action(card),card.id);}
 for(const [source,de]of Object.entries(JSON.parse(fs.readFileSync('_dev/i18n/de/help-reviewed.json'))))a.equal(I.t(source),de,source);
 for(const file of ['tutorial-reviewed','tutorial-controls-reviewed','market-reviewed'])for(const [source,de]of Object.entries(require('../_dev/i18n/de/'+file+'.json')))a.equal(I.t(source),de,source);
 for(const [id,d]of Object.entries(require('../js/basic-effects.js').definitions)){a.equal(I.t(d.name),rules.basic[id][0]);a.equal(I.t(d.description),rules.basic[id][1]);}
 a.match(I.t(A.cards.find(c=>c.status==='confused').text),/50 %.*25 %.*25 %/);a.match(I.t(A.cards.find(c=>c.status==='confused').text),/Verteidigung und Heilung nicht/);
});
test('all documented German excerpts stay byte-for-byte original and English quotes remain English',()=>{
 const I=language();let german=0,english=0;
 for(const c of additions)for(let i=0;i<3;i++)if(c.quoteLanguages[i]==='de'){a.equal(I.quote(c.q[i],c.id),c.quoteOriginals[i],c.id+'/'+i);german++;}else{a.equal(I.quote(c.q[i],c.id),c.q[i],c.id+'/'+i);english++;}
 a.equal(german,1284);a.equal(english,1320);a.equal(I.quote('Lo lograremos','angela-merkel'),'Wir schaffen das');a.equal(I.quote('La tolerancia no significa «todo vale»','angela-merkel'),'Tolerance does not mean "anything goes"');a.equal(I.quote("You're fired!",'donald-trump'),"You're fired!");
 // Isolated collision fixtures use two actual different original excerpts;
 // they never enter the catalog or become approved editorial records.
 const pair=additions.filter(c=>c.quoteLanguages[0]==='de').slice(0,2).map((c,i)=>({...c,id:'qa-native-'+i,n:'QA '+i,q:['Texto compartido de prueba',...c.q.slice(1)]}));a.notEqual(pair[0].quoteOriginals[0],pair[1].quoteOriginals[0]);const collision=language('de',pair);for(const c of pair)a.equal(collision.quote(c.q[0],c.id),c.quoteOriginals[0]);
});
test('late three-language registrations preserve German and invalidate the cached translation',()=>{
 const I=language();I.registerLocale('de',{'Prueba tardía':'Später Test'});a.equal(I.t('Prueba tardía'),'Später Test');I.register([['Prueba tardía','Late test','Test tardif']]);a.equal(I.t('Prueba tardía'),'Später Test');I.registerLocale('de',{'Prueba tardía':'Neuer Test'});a.equal(I.t('Prueba tardía'),'Neuer Test');a.throws(()=>I.registerLocale('xx',{}),/Idioma/);a.throws(()=>I.registerLocale('de',{'Vacío':''}),/vacía/);
 for(const locale of ['es','en','fr'])a.equal(language(locale).locale,locale);
});
test('German context and legal copies retain source facts, office names and the Spanish originals',()=>{
 const I=language(),contexts=require('../js/orator-context.js'),reviewed=require('../_dev/i18n/de/context-reviewed.json'),legal=require('../js/legal-documents.js');
 const numbers=s=>[...new Set(s.match(/\d+/g)||[])].sort();
 for(const card of Object.values(contexts)){a.equal(I.t(card.extract),reviewed[card.extract],card.id);a.deepEqual(numbers(I.t(card.extract)),numbers(card.extract),card.id+' dates');}
 a.match(I.t(contexts['angela-merkel'].extract),/17\. Juli 1954/);a.match(I.t(contexts['alfonso-alonso'].extract),/Partido Popular \(PP\)/);a.doesNotMatch(I.t(contexts['alfonso-alonso'].extract),/\bRP\b/);
 for(const document of legal.documents)for(const section of document.sections){a.ok(German.translations[section.text]);a.equal(I.t(section.text),require('../_dev/i18n/de/legal-reviewed.json')[section.text]);}
 for(const [s,de]of [['Rival ·','Gegner ·'],['‹ Anterior','‹ Zurück'],['Siguiente ›','Weiter ›'],['Como Líder (★):','Als Anführer (★):'],['Liga ·','Liga ·']])a.equal(I.t(s),de);
});
test('German PWA and foil assets keep the existing install identity and actual vector lettering',()=>{
 const manifest=JSON.parse(fs.readFileSync('manifest.de.json'));a.equal(manifest.id,JSON.parse(fs.readFileSync('manifest.json')).id);a.equal(manifest.lang,'de');a.equal(manifest.short_name,'Hemizykel');
 for(const kind of ['diario','semanal','comun','raro','legendario','mitico']){const svg=fs.readFileSync('assets/packs/de/'+kind+'.svg','utf8');a.match(svg,/outlined lettering/);a.match(svg,/Hemizykel-Booster/);a.match(svg,/<path/);a.doesNotMatch(svg,/<text/);}
 const html=fs.readFileSync('index.html','utf8'),worker=fs.readFileSync('sw.js','utf8');const script=html.match(/src="(js\/localization-de\.js\?v=[^"]+)"/);a.ok(script,'German locale has a versioned script');a.ok(worker.includes('./'+script[1]),'The same German script is available offline');a.match(worker,/manifest\.de\.json\?v=gb-de-2010-2026/);
});
