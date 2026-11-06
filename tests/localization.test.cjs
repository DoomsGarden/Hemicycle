'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function language(locale){const context={localStorage:{getItem:()=>locale},requestAnimationFrame:()=>1,document:{readyState:'loading',addEventListener(){}},HemicycleCatalog:require('../js/orator-catalog.js'),HemicycleActions:require('../js/action-cards.js')};context.window=context;context.globalThis=context;vm.createContext(context);for(const f of ['localization-data','localization','localization-extra','localization-reviewed','localization-gameplay'])vm.runInContext(fs.readFileSync('js/'+f+'.js','utf8'),context);return context.HemicycleI18n;}
for(const locale of ['en','fr'])test(locale+' preserves symbols, original English quotes and names while localizing the complete rule text',()=>{
 const I=language(locale);for(const symbol of ['×','‹','›','+','−','/','389','49'])a.equal(I.t(symbol),symbol);
 a.equal(I.t('Clasificatoria · Temporada 1'),locale==='en'?'Ranked · Season 1':'Classé · Saison 1');a.equal(I.t('Elo'),'Elo');
 a.equal(I.t('Cromos'),locale==='en'?'Cards':'Cartes');a.equal(I.t('TdP'),locale==='en'?'STP':'PP');a.equal(I.t('V / D'),locale==='en'?'W / L':'V / D');a.equal(I.quote("You're fired!"),"You're fired!");a.equal(I.t('Pedro Sánchez'),'Pedro Sánchez');a.notEqual(I.quote('No voy a ceder'),'No voy a ceder');
 for(const row of JSON.parse(fs.readFileSync('_dev/i18n/help-reviewed-v32.json','utf8')))a.equal(I.t(row[0]),row[locale==='en'?1:2]);
 a.equal(I.t('Vence con distintas doctrinas'),locale==='en'?'Win with different doctrines':'Gagnez avec différentes doctrines');
});
