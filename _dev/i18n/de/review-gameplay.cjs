'use strict';
// German rules are authored from actual card parameters, not inferred from
// their art/name. IDs, targets, potency and durations remain unchanged.
const A=require('../../../js/action-cards.js'),S=require('../../../js/action-status.js'),B=require('../../../js/basic-effects.js'),C=require('../../../js/orator-catalog.js'),names=require('./action-names.json');
const rows={...names},status={
 confused:['Verwirrt','Der nächste normale oder starke Konter trifft zu 50 % das gewählte Ziel, zu 25 % den Angreifer selbst und zu 25 % einen anderen eigenen Redner. Ohne Mitspieler auf der eigenen Rednerbank beträgt die Selbsttrefferchance 50 %. Ein Angriff verbraucht den Zustand; Verteidigung und Heilung nicht.'],
 weakness:['Schwäche','Verringert den Konterwert, mindestens bleibt 1.'],
 strength:['Stärke','Erhöht den Konterwert.'],
 fullness:['Vitalität','Verringert eingehenden Schaden um 1 und verbessert Heilungen.'],
 regeneration:['Regeneration','Stellt zu Beginn der nächsten eigenen Züge Ausdauer wieder her.'],
 attrition:['Zermürbung','Verliert zu Beginn der nächsten eigenen Züge Ausdauer und kann dadurch ausscheiden.'],
 fortress:['Widerstandskraft','Verringert eingehenden Schaden, mindestens bleibt 0.'],
 exposed:['Verwundbar','Erhöht eingehenden Schaden.'],
 relief:['Erholung','Erhöht die wiederhergestellte Ausdauer.'],
 wound:['Erschöpfung','Verringert Heilung, mindestens bleibt 0.'],
 precision:['Präzision','Konter durchdringen die 50-%-Verteidigung.'],
 fatigue:['Entmutigung','Verringert die passiven Stimmen des Redners, mindestens bleiben 0.']
};
for(const [id,d]of Object.entries(S.definitions)){if(!status[id])throw Error('Missing German state: '+id);rows[d.name]=status[id][0];rows[d.text]=status[id][1];}
const target={self:'einem eigenen Redner',rival:'einem gegnerischen Redner','all-self':'allen eigenen Rednern','all-rival':'allen gegnerischen Rednern',all:'allen Rednern beider Seiten'};
const accusative={self:'einen eigenen Redner',rival:'einen gegnerischen Redner','all-self':'alle eigenen Redner','all-rival':'alle gegnerischen Redner',all:'alle Redner beider Seiten'};
function action(c){const n=c.value,who=target[c.target],each=c.target.startsWith('all')?'jeweils ':'';
 if(c.effect==='silence')return 'Der Gegner kann in seinem nächsten Zug keine Aktionen ausführen, zieht aber weiterhin Karten und erhält Stimmen.';
 if(!who)throw Error('Missing German target: '+c.target);
 if(c.effect==='status'){
  const plural=c.target.startsWith('all'),duration=c.duration===1?(plural?'ihres nächsten eigenen Zuges':'seines nächsten eigenen Zuges'):(plural?'ihrer nächsten '+c.duration+' eigenen Züge':'seiner nächsten '+c.duration+' eigenen Züge');
  return 'Verleiht '+who+' '+status[c.status][0]+' (Stärke '+n+') bis zum Ende '+duration+'. '+status[c.status][1];
 }
 if(c.effect==='damage')return 'Fügt '+who+' '+each+n+' Schaden zu.';
 if(c.effect==='heal')return 'Gibt '+who+' '+each+n+' Ausdauer zurück.';
 if(c.effect==='boost')return 'Verleiht '+who+' in diesem Zug '+each+'+'+n+' Konterstärke.';
 if(c.effect==='boost-heal')return 'Verleiht '+who+' in diesem Zug '+each+'+'+n+' Konterstärke und stellt '+each+n+' Ausdauer wieder her.';
 if(c.effect==='guard')return 'Bereitet für '+accusative[c.target]+' eine 50-%-Verteidigung gegen den nächsten Treffer vor.';
 if(c.effect==='guard-heal')return 'Bereitet für '+accusative[c.target]+' eine 50-%-Verteidigung gegen den nächsten Treffer vor und stellt '+each+n+' Ausdauer wieder her.';
 if(['cleanse','cleanse-heal','purge','purge-damage'].includes(c.effect)){
  const positive=c.effect.startsWith('purge'),subject={self:'einem eigenen Redner',rival:'einem gegnerischen Redner','all-self':'jedem eigenen Redner','all-rival':'jedem gegnerischen Redner'}[c.target];
  let text='Entfernt bei '+subject+' bis zu '+n+' '+(positive?'positive':'negative')+' '+(n===1?'Wirkung':'Wirkungen')+'.';
  if(c.effect==='cleanse-heal')text+=' Stellt außerdem '+n+' Ausdauer pro Redner wieder her.';
  if(c.effect==='purge-damage')text+=' Verursacht außerdem '+n+' Schaden pro Redner.';
  return text;
 }
 throw Error('Missing German effect: '+c.effect);
}
for(const c of A.cards){if(!names[c.n])throw Error('Missing German action name: '+c.id);rows[c.text]=action(c);}
const basic={
 surge:['Aufwind','Nach Schaden durch einen normalen Konter gegen einen Redner erhält der nächste normale Konter im nächsten eigenen Zug +1 Konterstärke. Verfällt am Ende dieses Zuges.'],
 coffee:['Parlamentskaffee','Nach Schaden durch einen normalen Konter gegen einen Redner erhält der Träger zu Beginn seines nächsten eigenen Zuges 1 Ausdauer zurück, höchstens bis zum Maximum.'],
 archive:['Beharrliches Archiv','Nach Schaden durch einen normalen Konter verliert der überlebende Gegner zu Beginn seiner nächsten zwei eigenen Züge jeweils 1 Ausdauer.'],
 tongue:['Schwere Zunge','Nach Schaden durch einen normalen Konter verliert der nächste normale Konter des überlebenden Gegners 1 Konterstärke, mindestens bleibt 1. Verfällt am Ende seines nächsten Zuges.'],
 shield:['Laminierte Argumente','Nach Schaden durch einen normalen Konter gegen einen Redner fängt der Träger nach der Verteidigung 1 Schaden des nächsten eingehenden normalen Konters ab. Verfällt am Ende seines nächsten Zuges.'],
 microphone:['Indiskretes Mikrofon','Nach Schaden durch einen normalen Konter erleidet der überlebende Gegner durch den nächsten normalen Konter vor der Verteidigung 1 zusätzlichen Schaden. Verfällt am Ende seines nächsten Zuges.'],
 acta:['Nicht im Protokoll','Nach Schaden durch einen normalen Konter bringt der überlebende Gegner im nächsten eigenen Zug 1 passive Stimme weniger. Seine Sitze beim Ausscheiden und die 3 Grundstimmen bleiben unverändert.'],
 paperwork:['Verlegte Unterlagen','Nach Schaden durch einen normalen Konter kostet die nächste freiwillige Verteidigung oder Heilung des überlebenden Gegners 1 RP. Verfällt am Ende seines nächsten Zuges. Betrifft keine Aktionskarten.'],
 escort:['Ich übernehme','Nach Schaden durch einen normalen Konter gegen einen Redner übernimmt der Träger einmal den nächsten normalen Konter gegen einen Mitspieler auf der eigenen Rednerbank. Verfällt am Ende seines nächsten Zuges. Lenkt keine starken Konter, Aktionen oder Angriffe auf leere Plätze um.'],
 fineprint:['Kleingedrucktes','Nach Schaden durch einen normalen Konter gegen einen Redner gleicht der nächste normale Konter des Trägers 1 Punkt aus, den die 50-%-Verteidigung abziehen würde, höchstens bis zum Schaden ohne Verteidigung. Wird auch ohne Verteidigung verbraucht und verfällt am Ende seines nächsten Zuges.'],
 bank:['Gesparte Sitzungsgelder','Nach Schaden durch einen normalen Konter gegen einen Redner wird am Zugende 1 übrig gebliebener RP reserviert und zu Beginn des nächsten Zuges zurückgegeben. Eine Reserve pro Rednerbank, höchstens 8 RP. Verlässt der Träger die Rednerbank, verfällt die Reserve. Erzeugt keine neuen Ressourcen.'],
 summon:['Ersatzredner','Nach Schaden durch einen normalen Konter gegen einen Redner ziehst du den günstigsten Redner aus deinem Deck, unabhängig von der Seltenheit, wenn du weniger als zwei Redner auf der Hand hast. Bei Gleichstand gilt die Deckreihenfolge. Eine Auslösung pro eigenem Zug und Spieler. Erzeugt keine Kopien und holt keine ausgeschiedenen Redner zurück. Die Kosten zum Ausspielen müssen bezahlt werden.'],
 fasttrack:['Schnellverfahren','Nach Schaden durch einen normalen Konter gegen einen Redner wartet eine Unterstützungsaktion im Deck 1 Zug weniger, sofern noch mindestens 2 Züge verbleiben. Bei zwei geeigneten Aktionen wird zufällig gewählt. Eine gemeinsame Auslösung pro eigenem Zug und Spieler über alle Träger. Beeinflusst die Heilung des Redners nicht.'],
 lane:['Gelenkte Debatte','Nach Schaden durch einen normalen Konter kann der nächste normale Konter des überlebenden Gegners keinen leeren Platz zum Stimmabzug treffen. Angriffe auf Redner, Unterstützung und starke Konter bleiben möglich. Verfällt am Ende seines nächsten Zuges.']
};
for(const [id,d]of Object.entries(B.definitions)){if(!basic[id])throw Error('Missing German basic effect: '+id);rows[d.name]=basic[id][0];rows[d.description]=basic[id][1];}
const doctrine={
 verborrea:'+1 RP beim Einsetzen des Anführers und pro Zug. Durch Ausscheiden werden +2 RP für den nächsten aktiven Zug reserviert. Höchstens 8 RP.',
 guardia:'Deine Redner erhalten am Ende deines Zuges +1 Konterstärke, höchstens +3, solange die Doktrin aktiv ist.',
 aforado:'Jeder Redner kann pro Debatte einmal das Ausscheiden verhindern und mit 3 Ausdauer weitermachen.',
 giro:'Wer einen deiner Redner angreift, erleidet 1 Schaden.',
 foco:'Dein Anführer regeneriert pro Zug 1 Ausdauer; seine Angriffe bringen +1 Stimme.',
 viperina:'Deine Redner verursachen gegen den gegnerischen Anführer +2 Schaden.'
};
for(const d of C.docs)rows[d.d]=doctrine[d.k];
module.exports={rows,action,status,basic,doctrine};
