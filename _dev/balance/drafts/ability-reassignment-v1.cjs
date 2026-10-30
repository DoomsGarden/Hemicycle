'use strict';
// Propuesta aislada; ningún módulo del juego importa este fichero.
const C=require('../../../js/orator-catalog.js'),B=require('../../../js/basic-effects-v3.js');
const groups={
 comun:{
  surge:['toni-canto','dolors-montserrat','fatima-banez','quim-torra','andrea-levy','oscar-puente'],
  fineprint:['isabel-garcia-tejerina','celia-villalobos','alvaro-nadal','roger-torrent','ana-pastor','reyes-maroto'],
  coffee:['meritxell-batet','esteban-gonzalez-pons'],
  bank:['pablo-cambronero','juan-vicente-herrera','raul-romeva','emiliano-garcia-page'],
  archive:['nacho-alvarez','miguel-arias-canete','jordi-sanchez','pilar-llop'],
  microphone:['inigo-mendez-de-vigo','cuca-gamarra'],
  shield:['marta-lois','alfonso-alonso','carmen-calvo','pere-aragones','marta-rivera-de-la-cruz','patxi-lopez'],
  tongue:['rafael-hernando','javier-maroto','rafael-catala','carme-forcadell','borja-semper','susana-diaz'],
  acta:['antonio-maillo','carlos-floriano','fernando-grande-marlaska','elias-bendodo'],
  paperwork:['jaime-de-olano','jose-luis-abalos','josep-rull','juan-espadas'],
  lane:['teodoro-garcia-egea','toni-comin','pablo-montesinos','raquel-sanchez']
 },
 raro:{
  fineprint:['alberto-garzon','cristina-cifuentes','pablo-casado','oriol-junqueras','ines-arrimadas','isabel-cela'],
  lane:['esperanza-aguirre','laura-borras','edmundo-bal'],
  acta:['jose-luis-rodriguez-zapatero','jorge-fernandez-diaz','miquel-iceta','jose-manuel-garcia-margallo','albert-rivera','adriana-lastra'],
  surge:['pablo-echenique','jordi-turull'],
  paperwork:['irene-montero','anna-gabriel','begona-villacis'],
  coffee:['soraya-saenz-de-santamaria','rocio-monasterio'],
  shield:['luis-de-guindos','maria-jesus-montero'],
  archive:['inigo-errejon','julio-anguita','cristobal-montoro','marta-rovira','cayetana-alvarez-de-toledo','nadia-calvino'],
  summon:['monica-garcia','dolores-de-cospedal','sara-gimenez'],
  fasttrack:['ana-botella','miriam-nogueras','pilar-alegria']
 },
 especial:{
  surge:['gabriel-rufian','marine-le-pen'],
  fineprint:['joe-biden','cristina-fernandez-de-kirchner'],
  microphone:['recep-tayyip-erdogan','kamala-harris'],
  tongue:['nigel-farage','santiago-abascal'],
  paperwork:['felipe-gonzalez','hillary-clinton'],
  lane:['justin-trudeau'],
  acta:['ada-colau'],
  shield:['javier-milei','bernie-sanders','salvador-illa','nicolas-maduro'],
  escort:['giorgia-meloni'],
  coffee:['ursula-von-der-leyen'],
  summon:['pablo-iglesias','jose-maria-aznar','andres-manuel-lopez-obrador'],
  fasttrack:['viktor-orban','matteo-salvini','christine-lagarde']
 },
 legendario:{
  fineprint:['alberto-nunez-feijoo'],surge:['donald-trump'],acta:['barack-obama'],paperwork:['carles-puigdemont'],lane:['mariano-rajoy'],bank:['pedro-sanchez'],
  escort:['angela-merkel','vladimir-putin'],shield:['emmanuel-macron'],coffee:['isabel-diaz-ayuso'],fasttrack:['yolanda-diaz'],microphone:['boris-johnson']
 }
};
const categories={pressure:['surge','fineprint','archive','microphone'],control:['tongue','acta','paperwork','lane'],defense:['coffee','shield','escort'],utility:['bank','summon','fasttrack']};
const assignments={},byId=Object.fromEntries(C.cards.map(c=>[c.id,c]));for(const [rarity,effects]of Object.entries(groups))for(const [effect,ids]of Object.entries(effects))for(const id of ids){if(!byId[id]||byId[id].r!==rarity||assignments[id]||!B.definition(effect))throw Error('Asignación no válida: '+id);assignments[id]=effect;}
if(Object.keys(assignments).length!==C.cards.length)throw Error('Faltan oradores');
module.exports={status:'proposal-only',version:'reassignment-v1',ruleVariant:'One fasttrack and one summon activation per player own turn, each shared by all its carriers. Summon draws the lowest-cost orator without a rarity restriction. Personal cooldowns and other eligibility checks remain unchanged.',groups,categories,assignments};
