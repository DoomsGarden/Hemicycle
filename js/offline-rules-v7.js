/* Generado por node _dev/build-offline.cjs; no editar a mano. */
(function(root){'use strict';var modules={
"_dev/online/offline-rules.cjs":function(require,module,exports){
'use strict';
const E=require('./combat.cjs'),AI=require('./ai.cjs');
const VERSION='offline7';
function random(seed){let state=seed>>>0;return ()=>{state=(state+0x6D2B79F5)|0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function start(ticket,cabinet,mode){
 if(ticket.rules!==VERSION||!['normal','rapida','ranked','liga'].includes(mode))throw Error('Partida descargada incompatible. Conecta para actualizarla.');
 const profile=ticket.profile,owned=new Set([...(profile.album||[]),...(profile.actionAlbum||[])]);
 if([...cabinet.orators,...cabinet.actions].some(id=>!owned.has(id)))throw Error('El gabinete contiene cromos no incluidos en esta partida descargada.');
 const rng=random(ticket.seed);let state=E.apply(E.initial(mode),0,{type:'ready',cabinet},0,rng,profile);
 const leagueRecipe=profile.leagueDiv===1?['raro','raro','especial','especial','legendario']:profile.leagueDiv===2?['comun','raro','raro','especial','especial']:['comun','comun','comun','raro','raro'];
 const rival=AI.cabinet(cabinet,mode==='ranked'?profile.elo:0,rng,mode==='liga'?leagueRecipe:mode==='ranked'?undefined:cabinet.orators.map(id=>E.catalog[id].r));state=E.apply(state,1,{type:'ready',cabinet:rival},0,rng);state=AI.advance(state,0,rng);
 return {state,rng};
}
function move(state,command,at,rng){return AI.advance(E.apply(state,0,command,at,rng),at,rng);}
function replay(ticket,record){
 if(!record||!Array.isArray(record.commands)||record.commands.length>3000)throw Error('Registro de partida no válido.');
 let {state,rng}=start(ticket,record.cabinet,record.mode),previous=0;
 for(const item of record.commands){if(!Number.isSafeInteger(item.at)||item.at<previous||item.at>7*86400000)throw Error('Reloj de partida no válido.');if(state.status==='finished')throw Error('Hay jugadas después del resultado.');previous=item.at;state=move(state,item.command,item.at,rng);}
 if(state.status!=='finished')throw Error('La partida todavía no ha terminado.');return state;
}
module.exports={version:VERSION,start,move,replay,project:E.project};

},
"_dev/online/combat.cjs":function(require,module,exports){
'use strict';
const crypto=require('node:crypto'),A=require('./actions.cjs'),{cards}=require('../market/catalog.cjs'),Balance=require('../../js/orator-catalog.js'),Legacy=require('./catalog-legacy-stats.cjs'),B=require('../../js/basic-effects.js');
const catalog=Object.fromEntries(cards.map(c=>[c.id,c])),beats={verborrea:'guardia',guardia:'aforado',aforado:'viperina',viperina:'foco',foco:'giro',giro:'verborrea'};
const random=()=>crypto.randomInt(0,0x100000000)/0x100000000,check=(v,m)=>{if(!v)throw Error(m);};
function initial(mode='normal'){return {schema:1,catalogVersion:Balance.balanceVersion,effectsVersion:B.version,ruleset:'actions2',emptyVoteLimit:3,mode,status:'preparing',players:[null,null],side:null,first:null,deadline:null,winner:null,events:[]};}
function log(s,text){s.events.push(text);s.events=s.events.slice(-40);}
function visual(s,kind,data){s.visualSequence=(s.visualSequence||0)+1;s.visualEvents=(s.visualEvents||[]).concat({sequence:s.visualSequence,kind,...data}).slice(-60);}
function doctrine(s,i){const p=s.players[i],l=p.field.find(c=>c.id===p.leader);return l?l.doctrine:null;}
function active(s,i){const own=doctrine(s,i),other=doctrine(s,1-i);return own&&beats[other]!==own?own:null;}
function power(s,i,c){return c.z+(active(s,i)==='guardia'?c.buff:0)+c.buffs.reduce((n,b)=>n+b.value,0);}
function normalPower(s,i,c){const rules=B.forVersion(s.effectsVersion);return rules?rules.normalZ(c,s.players[i].turn,power(s,i,c)):power(s,i,c);}
function strong(p,c){return c.hp>=2&&c.enteredTurn!==null&&(p.turn-c.enteredTurn)%3===2&&c.strongUsedTurn!==p.turn;}
function finish(s,winner,reason){s.status='finished';s.winner=winner;s.reason=reason;s.deadline=null;log(s,(winner===0?'Anfitrión':'Invitado')+' gana: '+reason+'.');}
function victory(s){for(let i=0;i<2;i++)if(s.players[i].votes>=100){finish(s,i,'100 votos');return true;}return false;}
function timeout(s,now){if(s.status==='active'&&now>=s.deadline){finish(s,1-s.side,'inactividad');return true;}return false;}
function expel(s,victim,c,attacker,doc=active(s,victim)){
 const p=s.players[victim];if(doc==='aforado'&&!p.saved.includes(c.uid)){p.saved.push(c.uid);c.hp=['actions1','actions2'].includes(s.ruleset)?3:1;log(s,c.name+' conserva el escaño.');return;}
 visual(s,'expel',{uid:c.uid,side:victim});p.field=p.field.filter(x=>x.uid!==c.uid);B.reset(c);Object.assign(c,{hp:0,ready:false,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null,availableTurn:p.turn+2});p.rest.push(c);
 if(attacker!==null){s.players[attacker].votes+=c.votes;log(s,c.name+' al pasillo: +'+c.votes+' votos.');}
 if(doc==='verborrea')p.refund=2;victory(s);
}
function damage(c,n,s,normal=false,turn=0,piercing=false){if(normal&&s.effectsVersion===B.version)n=B.beforeDefense(c,turn,n);const guarded=!!c.guard;let amount=B.guardedDamage(n,guarded,piercing);if(normal&&s.effectsVersion===B.version)amount=B.afterDefense(c,turn,amount);if(n>0)c.guard=false;c.hp-=amount;if(s)visual(s,'damage',{uid:c.uid,value:amount,guarded});return amount;}
function basicBegin(s,i){if(s.effectsVersion!==B.version)return;const p=s.players[i],doc=active(s,i);for(const c of p.field.slice()){const pulse=B.begin(c,p.turn);if(!pulse)continue;if(pulse.damage){c.hp-=pulse.damage;visual(s,'damage',{uid:c.uid,value:pulse.damage,periodic:true});log(s,c.name+': '+B.definition(pulse.id).name+', −1 Aguante.');if(c.hp<=0)expel(s,i,c,pulse.source,doc);}else if(pulse.heal){const amount=Math.min(pulse.heal,c.maxHp-c.hp);c.hp+=amount;visual(s,'heal',{uid:c.uid,value:amount});log(s,c.name+': Café parlamentario, +'+amount+' Aguante.');}if(s.status!=='active')return;}}
function begin(s,i,now,rng){s.side=i;const p=s.players[i];p.turn++;const banked=s.effectsVersion===B.version?B.collect(p.field,p.turn):0;p.emptyVotesTaken=0;p.silenced=!!p.pendingSilence;p.pendingSilence=false;if(p.silenced)p.silenceImmuneThrough=p.turn+2;
 for(const c of p.field){c.ready=true;c.guard=false;c.buffs=c.buffs.filter(b=>b.until>=p.turn);}
 basicBegin(s,i);if(s.status!=='active')return;
 const recycled=A.recycle(p.rest,p.deck,p.turn,rng);p.rest=recycled.rest;
 if(p.turn===1){p.deck=recycled.deck;if(s.ruleset==='actions2'){const action=p.deck.find(c=>c.action);if(action){p.hand.push(action);p.deck=p.deck.filter(c=>c!==action);}}}else{const next=s.ruleset==='actions2'?A.renewBalanced(p.hand,recycled.deck,p.turn,rng):A.renew(p.hand,recycled.deck,rng);p.hand=next.hand;p.deck=next.deck;}
 p.tdpMax=Math.min(6,p.tdpMax+1);const d=active(s,i);p.tdp=Math.min(8,p.tdpMax+(d==='verborrea'?1+p.refund:0)+(s.ruleset==='actions2'&&p.turn===1&&i!==s.first?1:0)+banked);p.refund=0;if(s.ruleset==='actions2'&&p.turn===1&&i!==s.first)log(s,'Compensación de iniciativa: +1 TdP en el primer turno del segundo jugador.');
 if(d==='foco'){const l=p.field.find(c=>c.id===p.leader);l.hp=Math.min(l.maxHp,l.hp+(['actions1','actions2'].includes(s.ruleset)?1:2));}
 const gain=3+p.field.reduce((n,c)=>n+(s.effectsVersion===B.version?B.passive(c,p.turn,c.votes):c.votes),0);p.votes+=gain;visual(s,'turn',{side:i,value:gain});s.deadline=now+(s.mode==='rapida'?60000:90000);log(s,(i===0?'Anfitrión':'Invitado')+': turno '+p.turn+', +'+gain+' votos.');if(victory(s))return;
 if(p.silenced){log(s,'Moción de censura: turno sin acciones; conserva robo y votos.');end(s,i,now,rng);}
}
function end(s,i,now,rng){if(s.effectsVersion===B.version){const p=s.players[i];p.tdp=B.bank(p.field,p.turn,p.tdp);p.field.forEach(c=>B.end(c,p.turn));}if(active(s,i)==='guardia')s.players[i].field.forEach(c=>c.buff=Math.min(3,c.buff+1));begin(s,1-i,now,rng);}
function ready(s,i,choice,now,rng,profile){check(s.status==='preparing','La partida ya ha comenzado');check(!s.players[i],'Ya estás listo');const valid=A.validateCabinet(choice,[...cards.map(c=>c.id),...A.cards.map(c=>c.id)],cards.map(c=>c.id));
 const revision=s.catalogVersion||Legacy.version;if(![Balance.balanceVersion,Legacy.version].includes(revision))throw Error('Versión de catálogo no compatible.');
 const all=valid.orators.map((id,j)=>{const c=revision===Legacy.version?{...catalog[id],...Legacy.cards[id]}:catalog[id],leader=id===valid.leader,edition=require('./progression.cjs').appearance(profile,id);return {uid:i+'-o'+j,...(s.effectsVersion===B.version?{basicAbility:B.ability(id)}:{}),id,name:c.n,rarity:c.r,doctrine:c.pa,cost:c.c,...edition,z:c.a+(leader?1:0)+(edition.gold?2:0),hp:c.h+(leader?3:0)+(edition.gold?2:0),maxHp:c.h+(leader?3:0)+(edition.gold?2:0),votes:c.v,q:c.q,ready:true,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null};});
 const leader=all.find(c=>c.id===valid.leader),others=A.shuffle(all.filter(c=>c!==leader),rng),actions=valid.actions.map((id,j)=>({uid:i+'-a'+j,id,action:true}));
 s.players[i]={cabinetIds:valid.orators.slice(),cabinetActions:valid.actions.slice(),leader:valid.leader,turn:0,tdp:0,tdpMax:2,votes:0,hand:[leader,others.shift()],deck:A.shuffle([...others,...actions],rng),field:[],rest:[],actionDiscard:[],saved:[],refund:0,usedActions:[],silenced:false};log(s,(i===0?'Anfitrión':'Invitado')+' está listo.');
 if(s.players.every(Boolean)){s.status='active';s.first=rng()<.5?0:1;log(s,'Sorteo: '+(s.first===0?'cara, empieza el anfitrión.':'cruz, empieza el invitado.'));begin(s,s.first,now,rng);}
}
function actionCard(s,i,id,target){const p=s.players[i],foe=s.players[1-i],a=A.byId[id],c=p.hand.find(c=>c.action&&c.id===id);check(a&&c,'Acción fuera de la mano');check((c.availableTurn||0)<=p.turn,'La acción sigue en recuperación');check(p.tdp>=a.cost,'TdP insuficiente');check(p.actionUsedTurn!==p.turn,'Solo una acción por turno');check(!a.oncePerBattle||!p.usedActions.includes(id),'Acción agotada');
 const owners=a.target==='all'?[i,1-i]:[a.target.includes('rival')?1-i:i];let affected=owners.flatMap(owner=>s.players[owner].field.map(c=>({owner,c,doc:active(s,owner)})));if(!a.target.startsWith('all'))affected=affected.filter(x=>x.c.uid===target);
 check(a.effect==='silence'||affected.length,'Objetivo no válido');if(a.effect==='heal')check(affected.some(x=>x.c.hp<x.c.maxHp),'No falta Aguante');if(a.effect==='guard')check(affected.some(x=>!x.c.guard),'Defensa ya activa');
 if(a.effect==='silence'){check(p.field.length===3&&p.field.every(c=>c.ready),'Necesitas tres oradores listos');check(p.votes<foe.votes,'Debes tener menos votos');check(!foe.pendingSilence&&foe.turn>(foe.silenceImmuneThrough??-1),'Rival protegido');foe.pendingSilence=true;p.field.forEach(c=>c.ready=false);}
 const before=affected.map(x=>x.c.hp);visual(s,'action',{side:i,id,discard:!!a.oncePerBattle});
 p.tdp-=a.cost;p.actionUsedTurn=p.turn;p.usedActions.push(id);p.hand=p.hand.filter(x=>x!==c);if(a.oncePerBattle)p.actionDiscard.push(c);else{if(s.ruleset==='actions2')c.availableTurn=p.turn+3;p.deck.push(c);}
 for(const x of affected){if(a.effect==='damage')damage(x.c,a.value,s);if(a.effect==='heal')x.c.hp=Math.min(x.c.maxHp,x.c.hp+a.value);if(a.effect==='guard')x.c.guard=true;if(a.effect==='boost')x.c.buffs.push({value:a.value,until:s.players[x.owner].turn+(x.owner===i?0:1)});}
 affected.forEach((x,j)=>{if(a.effect==='heal')visual(s,'heal',{uid:x.c.uid,value:x.c.hp-before[j]});if(a.effect==='guard')visual(s,'guard',{uid:x.c.uid});});
 const teams=['equipo anfitrión','equipo invitado'],scope=a.effect==='silence'?teams[1-i]:a.target==='all'?'Todos los oradores de ambos equipos':a.target.startsWith('all')?'Todos los oradores del '+teams[owners[0]]:'Orador '+(a.target==='self'?'propio':'rival');
 log(s,require('../../js/action-cards.js').describeAction(a,i===0?'El anfitrión':'El invitado',scope,affected.map((x,j)=>({name:x.c.name,team:teams[x.owner],amount:a.effect==='heal'?x.c.hp-before[j]:before[j]-x.c.hp}))));s.lastAction={side:i,id,discard:!!a.oncePerBattle,turn:p.turn};
 for(const x of affected)if(x.c.hp<=0&&s.status==='active')expel(s,x.owner,x.c,x.owner===i?null:i,x.doc);
}
function apply(original,i,command,now=Date.now(),rng=random,profile){check(i===0||i===1,'Jugador no válido');check(command&&typeof command.type==='string','Acción no válida');if(original.effectsVersion==='basic3')return require('./combat-basic3.cjs').apply(original,i,command,now,rng,profile);if(original.effectsVersion==='basic2')return require('./combat-basic2.cjs').apply(original,i,command,now,rng,profile);if(original.effectsVersion==='basic1')return require('./combat-basic1.cjs').apply(original,i,command,now,rng,profile);const s=structuredClone(original);if(timeout(s,now))return s;
 if(command.type==='ready'){ready(s,i,command.cabinet,now,rng,profile);return s;}
 check(s.status==='active','No hay una partida activa');if(command.type==='resign'){finish(s,1-i,'rendición');return s;}check(s.side===i,'No es tu turno');const p=s.players[i],foe=s.players[1-i];check(!p.silenced,'Turno silenciado');
 if(command.type==='end'){end(s,i,now,rng);return s;}
 if(command.type==='action'){actionCard(s,i,command.id,command.target);return s;}
 if(command.type==='play'){const c=p.hand.find(c=>c.uid===command.uid&&!c.action);check(c,'Cromo fuera de la mano');check(p.field.length<3,'La tribuna está llena');check(c.cost<=p.tdp,'TdP insuficiente');p.hand=p.hand.filter(x=>x!==c);p.field.push(c);B.reset(c);p.tdp-=c.cost;Object.assign(c,{hp:c.maxHp,enteredTurn:p.turn,ready:true,guard:false,buff:0,buffs:[],lastHealTurn:null,strongUsedTurn:null});if(active(s,i)==='guardia'&&s.ruleset!=='actions2')c.buff=1;if(c.id===p.leader&&active(s,i)==='verborrea')p.tdp=Math.min(8,p.tdp+1);visual(s,'card',{uid:c.uid,side:i});log(s,c.name+' entra en la tribuna.');return s;}
 const c=p.field.find(c=>c.uid===command.uid);check(c&&c.ready,'Orador no disponible');
 const supportCost=s.effectsVersion===B.version?B.supportCost(c,p.turn):0;
 if(command.type==='guard'){check(!c.guard,'Defensa ya activa');check(p.tdp>=supportCost,'Necesitas 1 TdP por Papeles traspapelados');p.tdp-=supportCost;B.consumeSupport(c,p.turn);c.guard=true;c.ready=false;visual(s,'guard',{uid:c.uid});log(s,c.name+' se defiende.');return s;}
 if(command.type==='heal'){check(c.hp<c.maxHp&&(c.lastHealTurn===null||p.turn>=c.lastHealTurn+2),'Curación no disponible');check(p.tdp>=supportCost,'Necesitas 1 TdP por Papeles traspapelados');p.tdp-=supportCost;B.consumeSupport(c,p.turn);const amount=Math.min(c.maxHp-c.hp,Math.max(3,Math.ceil((c.maxHp-c.hp)/2)));c.hp+=amount;c.lastHealTurn=p.turn;c.ready=false;visual(s,'heal',{uid:c.uid,value:amount});log(s,c.name+' recupera '+amount+' de Aguante.');return s;}
 check(command.type==='attack','Acción desconocida');check(command.variant==='normal'||command.variant==='strong','Ataque no válido');const powerful=command.variant==='strong';check(!powerful||strong(p,c),'Ataque fuerte no disponible');let target=foe.field.find(c=>c.uid===command.target);const empty=command.target==='empty';check(empty?foe.field.length<3:!!target,'Objetivo no válido');check(!empty||s.emptyVoteLimit==null||(p.emptyVotesTaken||0)<s.emptyVoteLimit,'Límite de resta de votos alcanzado este turno');check(!empty||powerful||s.effectsVersion!==B.version||B.canEmpty(c,p.turn),'Debate encarrilado: elige un orador para el básico');if(target&&!powerful&&s.effectsVersion===B.version){const original=target;target=B.redirect(foe.field,target,foe.turn);if(target!==original){visual(s,'basic-state',{uid:target.uid,effect:'escort'});log(s,target.name+': Yo respondo, desvía el básico.');}}const piercing=!powerful&&s.effectsVersion===B.version&&B.pierces(c,p.turn);const ownDoc=active(s,i),enemyDoc=active(s,1-i);visual(s,'attack',{uid:c.uid,target:target?.uid||null,side:i,strong:powerful});c.ready=false;if(powerful){c.hp--;visual(s,'damage',{uid:c.uid,value:1});c.strongUsedTurn=p.turn;}let amount=powerful?Math.ceil(power(s,i,c)*1.5):normalPower(s,i,c);if(!powerful&&s.effectsVersion===B.version)B.consumeAttack(c,p.turn);if(target&&ownDoc==='viperina'&&target.id===foe.leader)amount+=2;
 if(empty){amount=Math.min(foe.votes,amount,s.emptyVoteLimit==null?Infinity:Math.max(0,s.emptyVoteLimit-(p.emptyVotesTaken||0)));p.emptyVotesTaken=(p.emptyVotesTaken||0)+amount;foe.votes-=amount;visual(s,'votes',{side:1-i,value:-amount});}else{amount=damage(target,amount,s,!powerful,foe.turn,piercing);if(enemyDoc==='giro')damage(c,1,s);}

 if(ownDoc==='foco'&&c.id===p.leader)p.votes++;log(s,c.name+': «'+c.q[powerful?1:0]+'» · '+amount+(empty?' votos retirados.':' de daño.'));if(victory(s))return s;if(target&&target.hp<=0)expel(s,1-i,target,i,enemyDoc);if(s.status==='active'&&c.hp<=0)expel(s,i,c,null,ownDoc);if(s.status==='active'){if(!empty&&!powerful&&s.effectsVersion===B.version){const result=B.afterHit(c,target,{damage:amount,attackerHealth:c.hp,targetHealth:target.hp,ownTurn:p.turn,rivalTurn:foe.turn,source:i,team:p,actions:A.byId,random:rng});if(result){visual(s,'basic-state',{uid:result.card.uid,effect:result.id});log(s,result.card.name+': '+B.definition(result.id).name+(result.utility?' · '+result.utility.name:'')+'.');}}}return s;
}
function project(state,side,revision,now){if(state.effectsVersion==='basic3')return require('./combat-basic3.cjs').project(state,side,revision,now);if(state.effectsVersion==='basic2')return require('./combat-basic2.cjs').project(state,side,revision,now);if(state.effectsVersion==='basic1')return require('./combat-basic1.cjs').project(state,side,revision,now);const s=structuredClone(state);const foe=s.players[1-side];if(foe){foe.handCount=foe.hand.length;foe.deckCount=foe.deck.length;delete foe.hand;delete foe.deck;delete foe.cabinetIds;delete foe.cabinetActions;delete foe.usedActions;delete foe.saved;}
 // Los mazos y su orden nunca se envían, tampoco al dueño.
 for(let i=0;i<2;i++)if(s.players[i])s.players[i].field.forEach(c=>{c.currentZ=power(state,i,c);c.currentNormalZ=normalPower(state,i,c);});
 const own=s.players[side];if(own){if(s.effectsVersion===B.version)own.basicUtilityReady={summon:B.utilityCandidates('summon',own,A.byId).length>0,fasttrack:B.utilityCandidates('fasttrack',own,A.byId).length>0};own.actionRecovery=own.deck.filter(c=>c.action&&(c.availableTurn||0)>own.turn).map(c=>({id:c.id,turns:c.availableTurn-own.turn}));own.deckCount=own.deck.length;delete own.deck;own.field.forEach(c=>{c.currentZ=power(state,side,c);c.canStrong=strong(own,c);c.charge=c.enteredTurn===null?0:1+(own.turn-c.enteredTurn)%3;});}
 return {...s,you:side,revision,serverNow:now};
}
module.exports={initial,apply,project,timeout,catalog,cards,active,power,normalPower,strong};

},
"node:crypto":function(require,module,exports){
module.exports={randomInt:function(){throw Error("Azar sin semilla no permitido en una partida descargada");}};
},
"_dev/online/actions.cjs":function(require,module,exports){
'use strict';
// Prototipo: no importa ni altera inventarios de jugadores reales.
const cards=require('../../js/action-cards.js').cards;
const byId=Object.fromEntries(cards.map(c=>[c.id,c]));
function check(ok,message){if(!ok)throw Error(message);}
function shuffle(list,random=Math.random){const a=list.slice();for(let i=a.length-1;i>0;i--){const x=random();check(Number.isFinite(x)&&x>=0&&x<1,'Azar no válido');const j=Math.floor(x*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function renew(hand,deck,random=Math.random){
 const pool=shuffle([...hand,...deck],random),next=[],rest=[];
 check(new Set(pool.map(c=>c.uid)).size===pool.length,'Carta duplicada entre mano y mazo');
 for(const c of pool){if(next.length<2&&(!c.action||!next.some(x=>x.action)))next.push(c);else rest.push(c);}
 return {hand:next,deck:rest};
}
function renewBalanced(hand,deck,turn,random=Math.random){
 const pool=shuffle([...hand,...deck],random),orators=pool.filter(c=>!c.action).slice(0,2),support=pool.find(c=>c.action&&(c.availableTurn||0)<=turn),chosen=new Set(orators);if(support)chosen.add(support);
 return {hand:[...orators,...(support?[support]:[])],deck:pool.filter(c=>!chosen.has(c))};
}
function recycle(rest,deck,turn,random=Math.random){const eligible=rest.filter(c=>turn>=c.availableTurn);return {rest:rest.filter(c=>!eligible.includes(c)),deck:shuffle([...deck,...eligible.map(c=>({...c,hp:c.maxHp}))],random)};}
function validateCabinet(cabinet,owned,oratorIds){
 check(cabinet&&Array.isArray(cabinet.orators)&&Array.isArray(cabinet.actions),'Gabinete no válido');
 check(cabinet.orators.length===5&&new Set(cabinet.orators).size===5,'Elige cinco oradores distintos');
 check(cabinet.orators.every(id=>oratorIds.includes(id)&&owned.includes(id)),'Orador no disponible');
 check(cabinet.orators.includes(cabinet.leader),'Líder no válido');
 check(cabinet.actions.length<=2&&new Set(cabinet.actions).size===cabinet.actions.length,'Hasta dos acciones distintas');
 check(cabinet.actions.every(id=>byId[id]&&owned.includes(id)),'Acción no disponible');
 return structuredClone(cabinet);
}
// Cinco cartas por sobre. Un único hueco puede contener acción (20 %).
// Se conserva exactamente la rareza de ese hueco y las cuatro cartas restantes.
function pack(slots,random=Math.random){
 check(Array.isArray(slots)&&slots.length===5,'Sobre no válido');
 const out=structuredClone(slots),roll=random();check(roll>=0&&roll<1,'Azar no válido');
 if(roll<0.2){const i=Math.floor(random()*out.length);check(i>=0&&i<5,'Azar no válido');const pool=cards.filter(c=>c.r===out[i].r);check(pool.length,'Rareza no válida');const j=Math.floor(random()*pool.length);check(j>=0&&j<pool.length,'Azar no válido');out[i]={...pool[j],action:true};}
 return out;
}
function covers(pool,rarity){return pool.filter(c=>!c.action&&c.r===rarity);}
function targets(state,side,card,uid){const rival=1-side;if(card.target==='player-rival')return [];
 const groups=card.target==='all'?[side,rival]:[card.target.includes('rival')?rival:side];
 const list=groups.flatMap(s=>state.players[s].field.map(c=>({s,c})));
 if(card.target.startsWith('all'))return list;
 return list.filter(x=>x.c.uid===uid);
}
function apply(original,side,id,uid){
 const s=structuredClone(original),p=s.players[side],foe=s.players[1-side],card=byId[id];
 check(s.status==='active'&&s.side===side&&p,'No es tu turno');check(card,'Acción desconocida');
 check(!p.silenced,'Turno silenciado');check(p.hand.some(c=>c.action&&c.id===id),'La acción no está en tu mano');
 check(!card.oncePerBattle||!p.usedActions.includes(id),'Acción ya utilizada en esta partida');check(p.actionUsedTurn!==p.turn,'Solo una acción por turno');check(p.tdp>=card.cost,'TdP insuficiente');
 const affected=targets(s,side,card,uid);check(card.effect==='silence'||affected.length,'Objetivo no válido');
 if(card.effect==='heal')check(affected.some(({c})=>c.hp<c.maxHp),'No falta Aguante');
 if(card.effect==='guard')check(affected.some(({c})=>!c.guard),'Defensa ya activa');
 if(card.effect==='silence'){
  check(p.field.length===3&&p.field.every(c=>c.ready),'Necesitas tres oradores listos');
  check(p.votes<foe.votes,'Debes tener menos votos que el rival');
  check(!foe.pendingSilence&&foe.turn>(foe.silenceImmuneThrough??-1),'Rival protegido frente al silencio');
  foe.pendingSilence=true;p.field.forEach(c=>c.ready=false);
 }
 p.tdp-=card.cost;p.usedActions.push(id);p.actionUsedTurn=p.turn;const instance=p.hand.find(c=>c.action&&c.id===id);p.hand=p.hand.filter(c=>c!==instance);if(card.oncePerBattle){p.actionDiscard=p.actionDiscard||[];p.actionDiscard.push(instance);}else p.deck.push(instance);
 for(const {s:owner,c}of affected){
  if(card.effect==='heal')c.hp=Math.min(c.maxHp,c.hp+card.value);
  if(card.effect==='boost'){const until=s.players[owner].turn+(owner===side?0:1);c.buffs.push({value:card.value,until});}
  if(card.effect==='guard')c.guard=true;
  if(card.effect==='damage'){const amount=c.guard?Math.ceil(card.value/2):card.value;c.guard=false;c.hp-=amount;}
 }
 for(const player of s.players){const expelled=player.field.filter(c=>c.hp<=0);player.field=player.field.filter(c=>c.hp>0);player.rest.push(...expelled.map(c=>({...c,availableTurn:player.turn+2,guard:false,buffs:[]})));}
 return s;
}
function begin(original,side,random=Math.random){const s=structuredClone(original);check(s.status==='active','Partida terminada');s.side=side;const p=s.players[side];p.turn++;
 p.silenced=!!p.pendingSilence;p.pendingSilence=false;if(p.silenced)p.silenceImmuneThrough=p.turn+2;
 for(const c of p.field){c.guard=false;c.ready=true;c.buffs=c.buffs.filter(b=>b.until>=p.turn);}
 const recycled=recycle(p.rest,p.deck,p.turn,random);p.rest=recycled.rest;
 const next=renew(p.hand,recycled.deck,random);p.hand=next.hand;p.deck=next.deck;
 p.votes+=3+p.field.reduce((sum,c)=>sum+c.votes,0);if(p.votes>=100){s.status='finished';s.winner=side;}
 return s;
}
const api={renewBalanced,cards,byId,shuffle,renew,recycle,validateCabinet,pack,covers,apply,begin};if(typeof module!=='undefined')module.exports=api;else globalThis.HemicycleOnlineActions=api;

},
"js/action-cards.js":function(require,module,exports){
/* Catálogo de acciones: compartido por colección, sobres y ambos motores. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleActions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const cards = Object.freeze([
 {id:'turno-de-palabra',n:'Turno de palabra',r:'comun',cost:1,effect:'boost',target:'self',value:1,text:'+1 Zasca a un orador propio durante este turno.'},
 {id:'replica',n:'Réplica',r:'comun',cost:1,effect:'damage',target:'rival',value:2,text:'Causa 2 de daño a un orador rival.'},
 {id:'receso',n:'Receso',r:'comun',cost:1,effect:'heal',target:'self',value:2,text:'Restaura 2 de Aguante a un orador propio.'},
 {id:'disciplina-de-grupo',n:'Disciplina de grupo',r:'raro',cost:2,effect:'boost',target:'all-self',value:1,text:'+1 Zasca a todos tus oradores durante este turno.'},
 {id:'pregunta-incomoda',n:'Pregunta incómoda',r:'raro',cost:2,effect:'damage',target:'rival',value:4,text:'Causa 4 de daño a un orador rival.'},
 {id:'pausa-parlamentaria',n:'Pausa parlamentaria',r:'raro',cost:2,effect:'heal',target:'all',value:2,text:'Todos los oradores de ambos jugadores recuperan 2 de Aguante.'},
 {id:'escudo-parlamentario',n:'Escudo parlamentario',r:'especial',cost:3,effect:'guard',target:'all-self',value:1,text:'Cada orador propio reduce a la mitad el próximo golpe, hasta su siguiente turno.'},
 {id:'interpelacion',n:'Interpelación',r:'especial',cost:3,effect:'damage',target:'all-rival',value:2,text:'Causa 2 de daño a cada orador rival.'},
 {id:'debate-abierto',n:'Debate abierto',r:'especial',cost:3,effect:'boost',target:'all',value:2,text:'+2 Zasca a ambos bandos, cada uno durante su siguiente turno activo.'},
 {id:'mocion-de-censura',n:'Moción de censura',r:'legendario',cost:4,oncePerBattle:true,effect:'silence',target:'player-rival',value:1,text:'El rival no realiza acciones en su próximo turno, pero conserva el robo y los votos.'},
 {id:'mayoria-reforzada',n:'Mayoría reforzada',r:'legendario',cost:4,effect:'boost',target:'all-self',value:2,text:'+2 Zasca a todos tus oradores durante este turno.'},
 {id:'acuerdo-de-estado',n:'Acuerdo de Estado',r:'legendario',cost:4,effect:'heal',target:'all-self',value:4,text:'Todos tus oradores recuperan 4 de Aguante.'}
].map(Object.freeze));
const byId=Object.fromEntries(cards.map((c,index)=>[c.id,Object.freeze({...c,action:true,c:c.cost,index,ruleLines:rules(c)})]));
Object.setPrototypeOf(byId,null);
function rules(card){const c=typeof card==='string'?byId[card]:card;if(!c)return [];return [c.text,'Coste: '+c.cost+' TdP.','Máximo una carta de acción por turno.',c.oncePerBattle?'Una activación por partida. Va al descarte de acciones.':'Vuelve al mazo y espera dos turnos propios completos antes de poder robarse otra vez.',...(c.effect==='silence'?['Exige tres oradores propios listos y menos votos que el rival; los tres agotan su acción.','El rival conserva el robo y los votos pasivos. Queda protegido contra otro silencio durante dos turnos propios adicionales.']:[])];}
function inject(out,random=Math.random,kind){const result=out.slice();if(random()<(kind==='mitico'?.25:.4)){const index=Math.floor(random()*result.length),pool=cards.filter(c=>c.r===result[index].r);if(pool.length)result[index]=byId[pool[Math.floor(random()*pool.length)].id];}return result;}
function award(profile,ids){ids.forEach(function(id){if(byId[id]){if(!profile.actionAlbum)profile.actionAlbum=[];profile.actionAlbum.push(id);}else profile.album.push(id);});}
function describeAction(card,actor,scope,targets){
 const names=targets.map(t=>t.name+' ('+t.team+')');if(card.target==='self'||card.target==='rival')scope=names.join('; ');let effect;
 if(card.effect==='silence')effect=scope+': no puede realizar acciones en su próximo turno; conserva el robo y los votos.';
 else if(card.effect==='damage')effect=(card.target.startsWith('all')?scope+': ':'')+targets.map((t,i)=>names[i]+': '+t.amount+' de daño').join('; ')+'.';
 else if(card.effect==='heal')effect=(card.target.startsWith('all')?scope+': ':'')+targets.map((t,i)=>names[i]+': +'+t.amount+' de Aguante').join('; ')+'.';
 else if(card.effect==='boost')effect=scope+': +'+card.value+' Zasca '+(card.target==='all'?'durante el turno activo de cada equipo.':'durante este turno.');
 else effect=scope+': defensa del 50 % frente al próximo golpe, hasta el siguiente turno propio.';
 return actor+' activa '+card.n+' · '+card.cost+' TdP. '+effect+' '+(card.oncePerBattle?'Pasa al descarte de acciones.':'Regresa al mazo.');
}
function lootPool(orators,actions,profile){return Array.from(new Set([...(orators||[]),...(actions||[]).filter(id=>byId[id])])).filter(id=>{if(!profile)return true;const action=!!byId[id],album=action?(profile.actionAlbum||[]):profile.album,count=album.filter(x=>x===id).length;return count>0&&(action||new Set(profile.album).size>5||count>1);});}
function removeCopy(profile,id){const key=byId[id]?'actionAlbum':'album',album=profile[key]||[],index=album.indexOf(id);if(index<0)throw Error('La colección ha cambiado.');album.splice(index,1);if(byId[id]&&!album.includes(id)&&profile.cabinets&&profile.cabinets.slots)profile.cabinets.slots.forEach(slot=>{slot.actions=(slot.actions||[]).filter(x=>x!==id);});}
return {lootPool,removeCopy,describeAction,award,cards:cards.map(c=>byId[c.id]),byId,ids:cards.map(c=>c.id),rules,inject};
});

},
"_dev/market/catalog.cjs":function(require,module,exports){
module.exports={"cards":[{"id":"alberto-nunez-feijoo","n":"Alberto Núñez Feijóo","r":"legendario","pa":"guardia","c":4,"a":7,"h":11,"v":5,"q":["El gratis total no hace ningún bien","No acepto pagar el precio","Tengo principios, límites y palabra"]},{"id":"angela-merkel","n":"Angela Merkel","r":"legendario","pa":"guardia","c":5,"a":7,"h":14,"v":5,"q":["La tolerancia no significa «todo vale»","Lo lograremos","Seguridad, bienestar y paz"]},{"id":"barack-obama","n":"Barack Obama","r":"legendario","pa":"viperina","c":4,"a":7,"h":11,"v":5,"q":["Let me be clear","Yes, we can","We rise or fall together"]},{"id":"boris-johnson","n":"Boris Johnson","r":"legendario","pa":"verborrea","c":5,"a":7,"h":14,"v":5,"q":["Get Brexit done","We are going to rise","Let's get breakfast done"]},{"id":"carles-puigdemont","n":"Carles Puigdemont","r":"legendario","pa":"giro","c":4,"a":7,"h":11,"v":5,"q":["No se ha acabado","La libertad individual","Volver a un lugar seguro"]},{"id":"donald-trump","n":"Donald Trump","r":"legendario","pa":"verborrea","c":4,"a":7,"h":11,"v":5,"q":["Fake news!","You're fired!","Never, ever give up"]},{"id":"emmanuel-macron","n":"Emmanuel Macron","r":"legendario","pa":"giro","c":5,"a":7,"h":14,"v":5,"q":["Al mismo tiempo","Debemos retomar el control","Hay que poder resistir"]},{"id":"isabel-diaz-ayuso","n":"Isabel Díaz Ayuso","r":"legendario","pa":"foco","c":5,"a":7,"h":14,"v":5,"q":["¡Libertad!","Comunismo o libertad","Madrid es España"]},{"id":"mariano-rajoy","n":"Mariano Rajoy","r":"legendario","pa":"aforado","c":4,"a":7,"h":11,"v":5,"q":["Es la realidad","Fin de la cita","No tomar ninguna decisión"]},{"id":"pedro-sanchez","n":"Pedro Sánchez","r":"legendario","pa":"foco","c":4,"a":7,"h":11,"v":5,"q":["Pese a todas las dificultades","Como un cohete","Mejorar la vida de la gente"]},{"id":"vladimir-putin","n":"Vladímir Putin","r":"legendario","pa":"aforado","c":5,"a":7,"h":14,"v":5,"q":["Nadie puede cambiar estas cosas","No tenemos miedo de nada","Podemos sentirnos seguros"]},{"id":"yolanda-diaz","n":"Yolanda Díaz","r":"legendario","pa":"viperina","c":5,"a":7,"h":14,"v":5,"q":["Ahora toca gobernar","No es suficiente","Una pieza de estabilidad"]},{"id":"ada-colau","n":"Ada Colau","r":"especial","pa":"foco","c":3,"a":5,"h":8,"v":4,"q":["Mucha emoción contenida","Una victoria de la ciudadanía","Una segunda oportunidad"]},{"id":"andres-manuel-lopez-obrador","n":"Andrés Manuel López Obrador","r":"especial","pa":"foco","c":4,"a":6,"h":8,"v":4,"q":["Ya chole","Me canso ganso","Solo el pueblo puede salvar al pueblo"]},{"id":"bernie-sanders","n":"Bernie Sanders","r":"especial","pa":"guardia","c":4,"a":6,"h":8,"v":4,"q":["I am once again asking","Enough is enough!","Healthcare is a right"]},{"id":"christine-lagarde","n":"Christine Lagarde","r":"especial","pa":"viperina","c":4,"a":6,"h":8,"v":4,"q":["Tengo mi propio estilo","Tomaremos todas las medidas necesarias","Hemos conseguido mantenernos estables"]},{"id":"cristina-fernandez-de-kirchner","n":"Cristina Fernández de Kirchner","r":"especial","pa":"foco","c":3,"a":5,"h":8,"v":4,"q":["No fue magia","Soy una exitosa presidente","Nos vamos a curar"]},{"id":"felipe-gonzalez","n":"Felipe González","r":"especial","pa":"guardia","c":4,"a":6,"h":8,"v":4,"q":["Inventar el futuro","Galopa hacia la anarquía","Superar este peligro"]},{"id":"gabriel-rufian","n":"Gabriel Rufián","r":"especial","pa":"verborrea","c":3,"a":5,"h":8,"v":4,"q":["Competir de tú a tú","Estoy harto de tener la razón","Sin renunciar a lo que soy"]},{"id":"giorgia-meloni","n":"Giorgia Meloni","r":"especial","pa":"aforado","c":4,"a":6,"h":8,"v":4,"q":["Soy Giorgia","Estamos preparados","Defenderemos nuestra identidad"]},{"id":"hillary-clinton","n":"Hillary Clinton","r":"especial","pa":"viperina","c":3,"a":5,"h":8,"v":4,"q":["Deal me in","We are stronger together","Women's rights are human rights"]},{"id":"javier-milei","n":"Javier Milei","r":"especial","pa":"verborrea","c":4,"a":6,"h":8,"v":4,"q":["¡Afuera!","¡Viva la libertad!","No hay plata"]},{"id":"joe-biden","n":"Joe Biden","r":"especial","pa":"guardia","c":3,"a":5,"h":8,"v":4,"q":["Look, folks","No malarkey","Time to heal"]},{"id":"jose-maria-aznar","n":"José María Aznar","r":"especial","pa":"guardia","c":3,"a":5,"h":8,"v":4,"q":["El que pueda hablar, que hable","Váyase, señor presidente","Tomar posesión de un escaño"]},{"id":"justin-trudeau","n":"Justin Trudeau","r":"especial","pa":"giro","c":4,"a":6,"h":8,"v":4,"q":["Because it's 2015","The budget will balance itself","Diversity is our strength"]},{"id":"kamala-harris","n":"Kamala Harris","r":"especial","pa":"viperina","c":4,"a":6,"h":8,"v":4,"q":["I'll repeat the question","We are not going back","I know we can fix it"]},{"id":"marine-le-pen","n":"Marine Le Pen","r":"especial","pa":"giro","c":3,"a":5,"h":8,"v":4,"q":["¿Dónde estoy?","No debemos callarnos","La defensa de Francia"]},{"id":"matteo-salvini","n":"Matteo Salvini","r":"especial","pa":"giro","c":4,"a":6,"h":8,"v":4,"q":["Cambiar las cosas desde dentro","Estamos creciendo","Nos estamos aliando"]},{"id":"nicolas-maduro","n":"Nicolás Maduro","r":"especial","pa":"foco","c":4,"a":6,"h":8,"v":4,"q":["No se tarde en llegar","Venga por mí","Aquí lo espero"]},{"id":"nigel-farage","n":"Nigel Farage","r":"especial","pa":"verborrea","c":4,"a":6,"h":8,"v":4,"q":["Who are you?","That's not good enough","I'm not for sale"]},{"id":"pablo-iglesias","n":"Pablo Iglesias","r":"especial","pa":"verborrea","c":3,"a":5,"h":8,"v":4,"q":["Cuando no se roba, se gobierna mejor","Por asalto","Defender la democracia con la ley"]},{"id":"recep-tayyip-erdogan","n":"Recep Tayyip Erdoğan","r":"especial","pa":"aforado","c":4,"a":6,"h":8,"v":4,"q":["One minute","El mundo es más grande que cinco","Todos somos seres humanos"]},{"id":"salvador-illa","n":"Salvador Illa","r":"especial","pa":"giro","c":3,"a":5,"h":8,"v":4,"q":["Humildad","Un triunfo de todos","Las vacunas salvan vidas"]},{"id":"santiago-abascal","n":"Santiago Abascal","r":"especial","pa":"aforado","c":3,"a":5,"h":8,"v":4,"q":["Yo soy español","¡Viva España!","Ni monárquico ni republicano"]},{"id":"ursula-von-der-leyen","n":"Ursula von der Leyen","r":"especial","pa":"viperina","c":3,"a":5,"h":8,"v":4,"q":["This is a watershed moment","We must fight back","Freedom is priceless"]},{"id":"viktor-orban","n":"Viktor Orbán","r":"especial","pa":"aforado","c":3,"a":5,"h":8,"v":4,"q":["Debemos afrontar este hecho","Firmes en nuestra determinación","Sanar nuestras heridas"]},{"id":"adriana-lastra","n":"Adriana Lastra","r":"raro","pa":"viperina","c":3,"a":4,"h":7,"v":3,"q":["Como siempre, los mejores","Siempre con ánimo de victoria","No tira la toalla"]},{"id":"albert-rivera","n":"Albert Rivera","r":"raro","pa":"aforado","c":3,"a":4,"h":7,"v":3,"q":["Debe ser un mérito","Matar moscas a cañonazos","Venimos a ayudar"]},{"id":"alberto-garzon","n":"Alberto Garzón","r":"raro","pa":"verborrea","c":2,"a":4,"h":6,"v":3,"q":["La verdad es la verdad","Hay que formatear","Moderar el impacto"]},{"id":"ana-botella","n":"Ana Botella","r":"raro","pa":"guardia","c":4,"a":4,"h":7,"v":3,"q":["Mala suerte","Mayor progreso a la humanidad","Relaxing cup of café con leche"]},{"id":"anna-gabriel","n":"Anna Gabriel","r":"raro","pa":"giro","c":3,"a":4,"h":7,"v":3,"q":["La clase trabajadora","Frenaremos a la derecha","Permanecen donde estaban"]},{"id":"begona-villacis","n":"Begoña Villacís","r":"raro","pa":"foco","c":3,"a":4,"h":7,"v":3,"q":["Somos gente","Nada ni nadie va a cohibirnos","Cumplamos con el compromiso adquirido"]},{"id":"cayetana-alvarez-de-toledo","n":"Cayetana Álvarez de Toledo","r":"raro","pa":"foco","c":4,"a":4,"h":7,"v":3,"q":["Un poco extraño, ¿no?","No te lo perdonaré jamás","El último dique de contención"]},{"id":"cristina-cifuentes","n":"Cristina Cifuentes","r":"raro","pa":"guardia","c":2,"a":4,"h":6,"v":3,"q":["Voy a seguir trabajando","No me voy, me quedo","Sin bajar la guardia"]},{"id":"cristobal-montoro","n":"Cristóbal Montoro","r":"raro","pa":"aforado","c":4,"a":4,"h":7,"v":3,"q":["Las reformas estructurales","España se levanta sola","El país no necesita un rescate"]},{"id":"dolores-de-cospedal","n":"Dolores de Cospedal","r":"raro","pa":"aforado","c":4,"a":4,"h":7,"v":3,"q":["¿Pero esto qué es?","Que se presenten a las elecciones","En diferido"]},{"id":"edmundo-bal","n":"Edmundo Bal","r":"raro","pa":"foco","c":2,"a":4,"h":6,"v":3,"q":["Soy Bal, Edmundo Bal","No soporto la mentira","Soy un servidor público"]},{"id":"esperanza-aguirre","n":"Esperanza Aguirre","r":"raro","pa":"guardia","c":2,"a":4,"h":6,"v":3,"q":["Yo también estoy harta","Deben dejar sus cargos","Tenemos que luchar para ello"]},{"id":"ines-arrimadas","n":"Inés Arrimadas","r":"raro","pa":"foco","c":2,"a":4,"h":6,"v":3,"q":["Dar un paso al frente","Ha llegado la hora","Unidos y adelante"]},{"id":"inigo-errejon","n":"Íñigo Errejón","r":"raro","pa":"verborrea","c":4,"a":4,"h":7,"v":3,"q":["Uno a diez en lo estratégico","Diez a uno en lo táctico","Construir normalidad"]},{"id":"irene-montero","n":"Irene Montero","r":"raro","pa":"verborrea","c":3,"a":4,"h":7,"v":3,"q":["El poder se ejerce","Más rápido y de forma más contundente","Poner la vida en el centro"]},{"id":"isabel-cela","n":"Isabel Celaá","r":"raro","pa":"viperina","c":2,"a":4,"h":6,"v":3,"q":["Una ley de todos","Cargada de futuro","Una gran avenida de oportunidades"]},{"id":"jordi-turull","n":"Jordi Turull","r":"raro","pa":"giro","c":3,"a":4,"h":7,"v":3,"q":["No tenía la pretensión","Mantenemos los compromisos","Seguirá estando intacto"]},{"id":"jorge-fernandez-diaz","n":"Jorge Fernández Díaz","r":"raro","pa":"aforado","c":2,"a":4,"h":6,"v":3,"q":["Nada es mera coincidencia","Míreme a los ojos: ¡no!","Siempre ayuda"]},{"id":"jose-luis-rodriguez-zapatero","n":"José Luis Rodríguez Zapatero","r":"raro","pa":"verborrea","c":2,"a":4,"h":6,"v":3,"q":["A cada descalificación, una idea","Estamos en la Champions League","A cada exageración una sonrisa"]},{"id":"jose-manuel-garcia-margallo","n":"José Manuel García-Margallo","r":"raro","pa":"guardia","c":3,"a":4,"h":7,"v":3,"q":["No tengo la menor duda","Estamos en un mundo nuevo","Regeneración de las instituciones"]},{"id":"julio-anguita","n":"Julio Anguita","r":"raro","pa":"guardia","c":4,"a":4,"h":7,"v":3,"q":["Siempre he dicho lo que pensaba","Nunca me he arredrado","Libertad de pensamiento"]},{"id":"laura-borras","n":"Laura Borràs","r":"raro","pa":"giro","c":2,"a":4,"h":6,"v":3,"q":["Servir al país y a la cultura","Nada volverá a ser como antes","Siempre al lado"]},{"id":"luis-de-guindos","n":"Luis de Guindos","r":"raro","pa":"aforado","c":3,"a":4,"h":7,"v":3,"q":["Maximizar los beneficios","Minimizar los costes","Te vale para el resto de la vida"]},{"id":"maria-jesus-montero","n":"María Jesús Montero","r":"raro","pa":"viperina","c":3,"a":4,"h":7,"v":3,"q":["Qué vergüenza","Se enfrentan a gigantes","Aquí estamos contigo"]},{"id":"marta-rovira","n":"Marta Rovira","r":"raro","pa":"giro","c":4,"a":4,"h":7,"v":3,"q":["Confrontar ideas","Aire fresco","Energía renovada"]},{"id":"miquel-iceta","n":"Miquel Iceta","r":"raro","pa":"viperina","c":2,"a":4,"h":6,"v":3,"q":["Queda por hacer","Intenta formar una mayoría de cambio","¡Aguanta, resiste a las presiones!"]},{"id":"miriam-nogueras","n":"Miriam Nogueras","r":"raro","pa":"giro","c":4,"a":4,"h":7,"v":3,"q":["Y yo pago 49 euros","El pueblo eres tú, ¿verdad?","De aquí no marchará nadie"]},{"id":"monica-garcia","n":"Mónica García","r":"raro","pa":"verborrea","c":4,"a":4,"h":7,"v":3,"q":["Un cambio en el modelo","Estamos hablando con un muro","Aportar soluciones"]},{"id":"nadia-calvino","n":"Nadia Calviño","r":"raro","pa":"viperina","c":4,"a":4,"h":7,"v":3,"q":["Necesitamos una respuesta unida","No es aceptable","Triple red de seguridad"]},{"id":"oriol-junqueras","n":"Oriol Junqueras","r":"raro","pa":"giro","c":2,"a":4,"h":6,"v":3,"q":["Una palanca de cambio","Las cosas que no nos dejan aplicar","Todo el aprecio y cariño"]},{"id":"pablo-casado","n":"Pablo Casado","r":"raro","pa":"aforado","c":2,"a":4,"h":6,"v":3,"q":["Una cortina de humo","Hasta aquí hemos llegado","Nosotros unimos"]},{"id":"pablo-echenique","n":"Pablo Echenique","r":"raro","pa":"verborrea","c":3,"a":4,"h":7,"v":3,"q":["Cascao y neoliberal","La defunción del bipartidismo","Por eso, la recurriré"]},{"id":"pilar-alegria","n":"Pilar Alegría","r":"raro","pa":"viperina","c":4,"a":4,"h":7,"v":3,"q":["Una sociedad moderna","Una apuesta fuerte y directa","Tenemos que apoyar fuertemente"]},{"id":"rocio-monasterio","n":"Rocío Monasterio","r":"raro","pa":"foco","c":3,"a":4,"h":7,"v":3,"q":["Un acto de servicio","No quiero que nadie se meta en mi casa","Esa es la verdadera libertad"]},{"id":"sara-gimenez","n":"Sara Giménez","r":"raro","pa":"foco","c":4,"a":4,"h":7,"v":3,"q":["Prejuicios y estereotipos","¡Ya está bien!","Somos muchos"]},{"id":"soraya-saenz-de-santamaria","n":"Soraya Sáenz de Santamaría","r":"raro","pa":"guardia","c":3,"a":4,"h":7,"v":3,"q":["La razón como argumento","El morbo frente a la verdad","Nuestras instituciones"]},{"id":"alfonso-alonso","n":"Alfonso Alonso","r":"comun","pa":"guardia","c":2,"a":2,"h":5,"v":2,"q":["Hoy es la última rueda de prensa","Una decisión firme, irrevocable","Estar unidos"]},{"id":"alvaro-nadal","n":"Álvaro Nadal","r":"comun","pa":"aforado","c":1,"a":2,"h":4,"v":2,"q":["La divergencia de ideas y opiniones","Contamos nuestros gobiernos por recuperaciones","Respetar el medio ambiente"]},{"id":"ana-pastor","n":"Ana Pastor","r":"comun","pa":"foco","c":1,"a":2,"h":4,"v":2,"q":["Realmente no sé si lo conseguí","Seguir avanzando como nación","La unidad de principios y valores"]},{"id":"andrea-levy","n":"Andrea Levy","r":"comun","pa":"foco","c":1,"a":2,"h":4,"v":2,"q":["Todos tenemos una fecha de caducidad","El tiempo nos dio la razón","No se doblegó"]},{"id":"antonio-maillo","n":"Antonio Maíllo","r":"comun","pa":"verborrea","c":2,"a":2,"h":5,"v":2,"q":["Un pack, un tándem","Queremos gobernar y cambiar Andalucía","Un equipo que suma"]},{"id":"borja-semper","n":"Borja Sémper","r":"comun","pa":"foco","c":2,"a":2,"h":5,"v":2,"q":["No le daría otra interpretación","Estoy convencido","Sin mala intención"]},{"id":"carlos-floriano","n":"Carlos Floriano","r":"comun","pa":"guardia","c":2,"a":2,"h":5,"v":2,"q":["Ya estamos preparados para gobernar","Nos ponemos en la senda de ganar","Un partido más sólido"]},{"id":"carme-forcadell","n":"Carme Forcadell","r":"comun","pa":"giro","c":2,"a":2,"h":5,"v":2,"q":["Yo no estoy inhabilitada","Nos dará la razón","Lo avalará"]},{"id":"carmen-calvo","n":"Carmen Calvo","r":"comun","pa":"aforado","c":2,"a":2,"h":5,"v":2,"q":["El dinero público no es de nadie","No renuncio","Soy una tía a la que no doblan"]},{"id":"celia-villalobos","n":"Celia Villalobos","r":"comun","pa":"guardia","c":1,"a":2,"h":4,"v":2,"q":["¡Que pierdo el tren!","Usted a mí no me da lecciones","No eche huesos de vaca"]},{"id":"cuca-gamarra","n":"Cuca Gamarra","r":"comun","pa":"foco","c":2,"a":2,"h":5,"v":2,"q":["Hay que estar para servir","Nos están vendiendo una moto","Bajaremos el IRPF"]},{"id":"dolors-montserrat","n":"Dolors Montserrat","r":"comun","pa":"guardia","c":1,"a":2,"h":4,"v":2,"q":["No puede mirar hacia otro lado","La independencia judicial no es elegible","Los jueces deben estar protegidos"]},{"id":"elias-bendodo","n":"Elías Bendodo","r":"comun","pa":"foco","c":2,"a":2,"h":5,"v":2,"q":["Un clásico","Se les ha caído entero","Las pensiones están garantizadas"]},{"id":"emiliano-garcia-page","n":"Emiliano García-Page","r":"comun","pa":"viperina","c":1,"a":2,"h":4,"v":2,"q":["Las elecciones son como los melones","Salir a dar la batalla electoral","Recuperar entre todos"]},{"id":"esteban-gonzalez-pons","n":"Esteban González Pons","r":"comun","pa":"foco","c":1,"a":2,"h":4,"v":2,"q":["Con las puertas abiertas","Trabajamos unidos","Si soñamos juntos"]},{"id":"fatima-banez","n":"Fátima Báñez","r":"comun","pa":"aforado","c":1,"a":2,"h":4,"v":2,"q":["Los malos también aprenden","Hacen ataques más sofisticados","Prepararnos mejor para el futuro"]},{"id":"fernando-grande-marlaska","n":"Fernando Grande-Marlaska","r":"comun","pa":"aforado","c":2,"a":2,"h":5,"v":2,"q":["Son gajes del oficio","Impedir la llegada","La garantía de la seguridad ciudadana"]},{"id":"inigo-mendez-de-vigo","n":"Íñigo Méndez de Vigo","r":"comun","pa":"aforado","c":2,"a":2,"h":5,"v":2,"q":["Si existe la voluntad política","Dar un salto de calidad","Un pacto necesario"]},{"id":"isabel-garcia-tejerina","n":"Isabel García Tejerina","r":"comun","pa":"verborrea","c":1,"a":2,"h":4,"v":2,"q":["Somos importantes hoy","No podemos dejar a España sin alternativa","La convivencia y la estabilidad"]},{"id":"jaime-de-olano","n":"Jaime de Olano","r":"comun","pa":"verborrea","c":2,"a":2,"h":5,"v":2,"q":["Su cuenta corriente","Nos sobra propaganda","Para que puedan formar un hogar"]},{"id":"javier-maroto","n":"Javier Maroto","r":"comun","pa":"guardia","c":2,"a":2,"h":5,"v":2,"q":["Con dureza democrática","Comprar votos, repito, es corrupción","Compartir un proyecto juntos"]},{"id":"jordi-sanchez","n":"Jordi Sànchez","r":"comun","pa":"giro","c":2,"a":2,"h":5,"v":2,"q":["Todos estamos conjurados","Para la victoria inmediata","Los derechos y libertades de este país"]},{"id":"jose-luis-abalos","n":"José Luis Ábalos","r":"comun","pa":"aforado","c":2,"a":2,"h":5,"v":2,"q":["Soy un mero peón","Tendrán que mirarme a la cara","Voy a defender mi honor personal"]},{"id":"josep-rull","n":"Josep Rull","r":"comun","pa":"giro","c":2,"a":2,"h":5,"v":2,"q":["Dirigirles la palabra","Una nación libre","Seguiremos luchando"]},{"id":"juan-espadas","n":"Juan Espadas","r":"comun","pa":"viperina","c":2,"a":2,"h":5,"v":2,"q":["No voy a dejar Andalucía","A ello dedicaré todo mi esfuerzo","Una segunda opción"]},{"id":"juan-vicente-herrera","n":"Juan Vicente Herrera","r":"comun","pa":"guardia","c":1,"a":2,"h":4,"v":2,"q":["Más pasado que futuro","Que se acuerden de uno","Sin distinción de partidos"]},{"id":"marta-lois","n":"Marta Lois","r":"comun","pa":"verborrea","c":2,"a":2,"h":5,"v":2,"q":["La decisión está tomada","Un cambio histórico","Cuento con vosotros y vosotras"]},{"id":"marta-rivera-de-la-cruz","n":"Marta Rivera de la Cruz","r":"comun","pa":"foco","c":2,"a":2,"h":5,"v":2,"q":["Chulapear","Es una irresponsabilidad","Se han quedado allí"]},{"id":"meritxell-batet","n":"Meritxell Batet","r":"comun","pa":"aforado","c":1,"a":2,"h":4,"v":2,"q":["Somos del pueblo","Ningún partido representa en exclusiva a España","La esperanza es el material político"]},{"id":"miguel-arias-canete","n":"Miguel Arias Cañete","r":"comun","pa":"guardia","c":2,"a":2,"h":5,"v":2,"q":["Nos respetan por ello","No puede jugar sola la partida","Garantizar el estado de bienestar"]},{"id":"nacho-alvarez","n":"Nacho Álvarez","r":"comun","pa":"verborrea","c":2,"a":2,"h":5,"v":2,"q":["Estoy orgulloso","Puso fin al bipartidismo","Redefinir y oxigenar"]},{"id":"oscar-puente","n":"Óscar Puente","r":"comun","pa":"viperina","c":1,"a":2,"h":4,"v":2,"q":["No está mal","Pues no","Así es la vida"]},{"id":"pablo-cambronero","n":"Pablo Cambronero","r":"comun","pa":"verborrea","c":1,"a":2,"h":4,"v":2,"q":["Haré lo que prometí hacer","Lo mantengo","Voy a defender la democracia"]},{"id":"pablo-montesinos","n":"Pablo Montesinos","r":"comun","pa":"foco","c":2,"a":2,"h":5,"v":2,"q":["Sería una irresponsabilidad","Una oposición firme","Pactos de Estado"]},{"id":"patxi-lopez","n":"Patxi López","r":"comun","pa":"viperina","c":2,"a":2,"h":5,"v":2,"q":["Pues va a ser que no","Tú sabrás","Velar por la seguridad"]},{"id":"pere-aragones","n":"Pere Aragonès","r":"comun","pa":"giro","c":2,"a":2,"h":5,"v":2,"q":["Es votando","Culminar la independencia de Cataluña","Abrir un nuevo ciclo de crecimiento"]},{"id":"pilar-llop","n":"Pilar Llop","r":"comun","pa":"viperina","c":2,"a":2,"h":5,"v":2,"q":["Tenemos la obligación","Esto es intolerable","Quiero pedirles ayuda"]},{"id":"quim-torra","n":"Quim Torra","r":"comun","pa":"giro","c":1,"a":2,"h":4,"v":2,"q":["La ratafía nos une","Hemos de atacar","Nos sentimos seguros, protegidos"]},{"id":"rafael-catala","n":"Rafael Catalá","r":"comun","pa":"aforado","c":2,"a":2,"h":5,"v":2,"q":["Que las cosas funcionen bien","Un ascenso","Seguirá haciendo bien su trabajo"]},{"id":"rafael-hernando","n":"Rafael Hernando","r":"comun","pa":"verborrea","c":2,"a":2,"h":5,"v":2,"q":["Esa es la representatividad","¡Inaceptable!","En todo momento hemos respetado"]},{"id":"raquel-sanchez","n":"Raquel Sánchez","r":"comun","pa":"viperina","c":2,"a":2,"h":5,"v":2,"q":["No crece con ladrillos","No hay dignidad sin vivienda","Su función social es incuestionable"]},{"id":"raul-romeva","n":"Raül Romeva","r":"comun","pa":"giro","c":1,"a":2,"h":4,"v":2,"q":["Soy un culo inquieto","Se genera incertidumbre","Trabajo y trabajo"]},{"id":"reyes-maroto","n":"Reyes Maroto","r":"comun","pa":"viperina","c":1,"a":2,"h":4,"v":2,"q":["Esa es la cuestión","Hoy gana el derecho","Protección frente a la especulación"]},{"id":"roger-torrent","n":"Roger Torrent","r":"comun","pa":"giro","c":1,"a":2,"h":4,"v":2,"q":["Respeto para la voluntad mayoritaria","Recuperar las instituciones","Coser la sociedad catalana"]},{"id":"susana-diaz","n":"Susana Díaz","r":"comun","pa":"viperina","c":2,"a":2,"h":5,"v":2,"q":["Cumplir con mi palabra","No se puede permitir","Diálogo, mucho diálogo y consenso"]},{"id":"teodoro-garcia-egea","n":"Teodoro García Egea","r":"comun","pa":"guardia","c":2,"a":2,"h":5,"v":2,"q":["Nunca había lanzado más de 11 m","Ganar abrió una nueva etapa","Yo soy de Murcia"]},{"id":"toni-canto","n":"Toni Cantó","r":"comun","pa":"verborrea","c":1,"a":2,"h":4,"v":2,"q":["Eso es transfuguismo","No haces lo que prometes","Cesen los privilegios"]},{"id":"toni-comin","n":"Toni Comín","r":"comun","pa":"giro","c":2,"a":2,"h":5,"v":2,"q":["Una democracia mundial es posible","Hay que buscar el desgaste económico","Erradicar la pobreza en el mundo"]}]};
},
"js/orator-catalog.js":function(require,module,exports){
/* Catálogo único: datos, IDs y validación compartidos por app y servidor. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.HemicycleCatalog=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function slug(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
var DOCS=[
 {k:'verborrea',n:'Verborrea',d:'+1 TdP al entrar el Líder y por turno. Las expulsiones reservan +2 TdP para el próximo turno activo. Máximo: 8 TdP.',beats:'guardia',col:'#3b6fd4'},
 {k:'guardia',n:'Vieja Guardia',d:'Tus oradores ganan +1 Zasca al terminar tu turno (máx. +3 mientras esté activa).',beats:'aforado',col:'#8b5cf6'},
 {k:'aforado',n:'Aforado',d:'Cada orador puede evitar una expulsión por debate y quedarse con 3 de Aguante.',beats:'viperina',col:'#28a86b'},
 {k:'giro',n:'Giro de Guion',d:'Quien ataca a un orador tuyo recibe 1 de daño.',beats:'verborrea',col:'#d4a03b'},
 {k:'foco',n:'Foco Mediático',d:'Tu Líder regenera 1 de Aguante por turno y sus ataques suman +1 voto.',beats:'giro',col:'#d43b3b'},
 {k:'viperina',n:'Lengua Viperina',d:'Tus oradores infligen +2 de daño al Líder rival.',beats:'foco',col:'#c026d3'}
];
var DOCM={};DOCS.forEach(function(d){DOCM[d.k]=d;});
DOCS.forEach(function(d){DOCM[d.beats].weak=d.k;});
var MAX_TDP=8;
function doctrineMatchup(k){var d=DOCM[k];return 'Contrarresta: '+DOCM[d.beats].n+'. Debilidad: '+DOCM[d.weak].n+'.';}
var RARS=[{k:'comun',n:'Común',c:'#b07a45',g:3},{k:'raro',n:'Raro',c:'#4a7fb5',g:4},{k:'especial',n:'Especial',c:'#8b5cf6',g:5},{k:'legendario',n:'Legendario',c:'#e8b923',g:6}];
var RARM={};RARS.forEach(function(r){RARM[r.k]=r;});
var BALANCE_VERSION='balance-v2';
var TIER={
 comun:{c:[1,2],costs:[1,2,2,1,2,2,1,2],a:[2,2],h:[4,5],v:2,stats:{1:{a:2,h:4},2:{a:2,h:5}}},
 raro:{c:[2,4],a:[4,4],h:[6,7],v:3,stats:{2:{a:4,h:6},3:{a:4,h:7},4:{a:4,h:7}}},
 especial:{c:[3,5],costs:[3,4,4,3],a:[5,6],h:[8,8],v:4,stats:{3:{a:5,h:8},4:{a:6,h:8},5:{a:6,h:8}}},
 legendario:{c:[4,5],a:[7,7],h:[11,14],v:5,stats:{4:{a:7,h:11},5:{a:7,h:14}}}
};
function statsFor(rarity,cost){var tier=TIER[rarity],stats=tier&&tier.stats[cost];if(!stats)throw Error('Coste no definido para esta rareza: '+rarity+'/'+cost);return {a:stats.a,h:stats.h,v:tier.v};}
var TIERORDER={legendario:0,especial:1,raro:2,comun:3};

var ROSTER={
 verborrea:{legendario:['Donald Trump','Boris Johnson'],especial:['Pablo Iglesias','Nigel Farage','Javier Milei','Gabriel Rufián'],raro:['José Luis Rodríguez Zapatero','Pablo Echenique','Íñigo Errejón','Alberto Garzón','Irene Montero','Mónica García'],comun:['Toni Cantó','Antonio Maíllo','Rafael Hernando','Pablo Cambronero','Marta Lois','Nacho Álvarez','Isabel García Tejerina','Jaime de Olano']},
 guardia:{legendario:['Alberto Núñez Feijóo','Angela Merkel'],especial:['José María Aznar','Felipe González','Bernie Sanders','Joe Biden'],raro:['Esperanza Aguirre','Soraya Sáenz de Santamaría','Ana Botella','Cristina Cifuentes','José Manuel García-Margallo','Julio Anguita'],comun:['Celia Villalobos','Alfonso Alonso','Javier Maroto','Juan Vicente Herrera','Carlos Floriano','Miguel Arias Cañete','Dolors Montserrat','Teodoro García Egea']},
 aforado:{legendario:['Mariano Rajoy','Vladímir Putin'],especial:['Santiago Abascal','Giorgia Meloni','Recep Tayyip Erdoğan','Viktor Orbán'],raro:['Pablo Casado','Albert Rivera','Dolores de Cospedal','Jorge Fernández Díaz','Luis de Guindos','Cristóbal Montoro'],comun:['Fátima Báñez','Íñigo Méndez de Vigo','Rafael Catalá','Álvaro Nadal','José Luis Ábalos','Carmen Calvo','Meritxell Batet','Fernando Grande-Marlaska']},
 giro:{legendario:['Carles Puigdemont','Emmanuel Macron'],especial:['Marine Le Pen','Matteo Salvini','Justin Trudeau','Salvador Illa'],raro:['Oriol Junqueras','Jordi Turull','Miriam Nogueras','Laura Borràs','Anna Gabriel','Marta Rovira'],comun:['Quim Torra','Pere Aragonès','Jordi Sànchez','Roger Torrent','Josep Rull','Carme Forcadell','Raül Romeva','Toni Comín']},
 foco:{legendario:['Pedro Sánchez','Isabel Díaz Ayuso'],especial:['Ada Colau','Nicolás Maduro','Andrés Manuel López Obrador','Cristina Fernández de Kirchner'],raro:['Inés Arrimadas','Rocío Monasterio','Cayetana Álvarez de Toledo','Edmundo Bal','Begoña Villacís','Sara Giménez'],comun:['Ana Pastor','Pablo Montesinos','Marta Rivera de la Cruz','Andrea Levy','Cuca Gamarra','Borja Sémper','Esteban González Pons','Elías Bendodo']},
 viperina:{legendario:['Barack Obama','Yolanda Díaz'],especial:['Hillary Clinton','Kamala Harris','Christine Lagarde','Ursula von der Leyen'],raro:['Miquel Iceta','Adriana Lastra','Pilar Alegría','Isabel Cela','María Jesús Montero','Nadia Calviño'],comun:['Óscar Puente','Patxi López','Susana Díaz','Emiliano García-Page','Juan Espadas','Pilar Llop','Reyes Maroto','Raquel Sánchez']}
};
var QBESP={
 "alberto-nunez-feijoo":["El gratis total no hace ningún bien", "No acepto pagar el precio", "Tengo principios, límites y palabra"],
 "angela-merkel":["La tolerancia no significa «todo vale»", "Lo lograremos", "Seguridad, bienestar y paz"],
 "barack-obama":["Let me be clear", "Yes, we can", "We rise or fall together"],
 "boris-johnson":["Get Brexit done", "We are going to rise", "Let's get breakfast done"],
 "carles-puigdemont":["No se ha acabado", "La libertad individual", "Volver a un lugar seguro"],
 "donald-trump":["Fake news!", "You're fired!", "Never, ever give up"],
 "emmanuel-macron":["Al mismo tiempo", "Debemos retomar el control", "Hay que poder resistir"],
 "isabel-diaz-ayuso":["¡Libertad!", "Comunismo o libertad", "Madrid es España"],
 "mariano-rajoy":["Es la realidad", "Fin de la cita", "No tomar ninguna decisión"],
 "pedro-sanchez":["Pese a todas las dificultades", "Como un cohete", "Mejorar la vida de la gente"],
 "vladimir-putin":["Nadie puede cambiar estas cosas", "No tenemos miedo de nada", "Podemos sentirnos seguros"],
 "yolanda-diaz":["Ahora toca gobernar", "No es suficiente", "Una pieza de estabilidad"],
 "ada-colau":["Mucha emoción contenida", "Una victoria de la ciudadanía", "Una segunda oportunidad"],
 "andres-manuel-lopez-obrador":["Ya chole", "Me canso ganso", "Solo el pueblo puede salvar al pueblo"],
 "bernie-sanders":["I am once again asking", "Enough is enough!", "Healthcare is a right"],
 "christine-lagarde":["Tengo mi propio estilo", "Tomaremos todas las medidas necesarias", "Hemos conseguido mantenernos estables"],
 "cristina-fernandez-de-kirchner":["No fue magia", "Soy una exitosa presidente", "Nos vamos a curar"],
 "felipe-gonzalez":["Inventar el futuro", "Galopa hacia la anarquía", "Superar este peligro"],
 "gabriel-rufian":["Competir de tú a tú", "Estoy harto de tener la razón", "Sin renunciar a lo que soy"],
 "giorgia-meloni":["Soy Giorgia", "Estamos preparados", "Defenderemos nuestra identidad"],
 "hillary-clinton":["Deal me in", "We are stronger together", "Women's rights are human rights"],
 "javier-milei":["¡Afuera!", "¡Viva la libertad!", "No hay plata"],
 "joe-biden":["Look, folks", "No malarkey", "Time to heal"],
 "jose-maria-aznar":["El que pueda hablar, que hable", "Váyase, señor presidente", "Tomar posesión de un escaño"],
 "justin-trudeau":["Because it's 2015", "The budget will balance itself", "Diversity is our strength"],
 "kamala-harris":["I'll repeat the question", "We are not going back", "I know we can fix it"],
 "marine-le-pen":["¿Dónde estoy?", "No debemos callarnos", "La defensa de Francia"],
 "matteo-salvini":["Cambiar las cosas desde dentro", "Estamos creciendo", "Nos estamos aliando"],
 "nicolas-maduro":["No se tarde en llegar", "Venga por mí", "Aquí lo espero"],
 "nigel-farage":["Who are you?", "That's not good enough", "I'm not for sale"],
 "pablo-iglesias":["Cuando no se roba, se gobierna mejor", "Por asalto", "Defender la democracia con la ley"],
 "recep-tayyip-erdogan":["One minute", "El mundo es más grande que cinco", "Todos somos seres humanos"],
 "salvador-illa":["Humildad", "Un triunfo de todos", "Las vacunas salvan vidas"],
 "santiago-abascal":["Yo soy español", "¡Viva España!", "Ni monárquico ni republicano"],
 "ursula-von-der-leyen":["This is a watershed moment", "We must fight back", "Freedom is priceless"],
 "viktor-orban":["Debemos afrontar este hecho", "Firmes en nuestra determinación", "Sanar nuestras heridas"],
 "adriana-lastra":["Como siempre, los mejores", "Siempre con ánimo de victoria", "No tira la toalla"],
 "albert-rivera":["Debe ser un mérito", "Matar moscas a cañonazos", "Venimos a ayudar"],
 "alberto-garzon":["La verdad es la verdad", "Hay que formatear", "Moderar el impacto"],
 "ana-botella":["Mala suerte", "Mayor progreso a la humanidad", "Relaxing cup of café con leche"],
 "anna-gabriel":["La clase trabajadora", "Frenaremos a la derecha", "Permanecen donde estaban"],
 "begona-villacis":["Somos gente", "Nada ni nadie va a cohibirnos", "Cumplamos con el compromiso adquirido"],
 "cayetana-alvarez-de-toledo":["Un poco extraño, ¿no?", "No te lo perdonaré jamás", "El último dique de contención"],
 "cristina-cifuentes":["Voy a seguir trabajando", "No me voy, me quedo", "Sin bajar la guardia"],
 "cristobal-montoro":["Las reformas estructurales", "España se levanta sola", "El país no necesita un rescate"],
 "dolores-de-cospedal":["¿Pero esto qué es?", "Que se presenten a las elecciones", "En diferido"],
 "edmundo-bal":["Soy Bal, Edmundo Bal", "No soporto la mentira", "Soy un servidor público"],
 "esperanza-aguirre":["Yo también estoy harta", "Deben dejar sus cargos", "Tenemos que luchar para ello"],
 "ines-arrimadas":["Dar un paso al frente", "Ha llegado la hora", "Unidos y adelante"],
 "inigo-errejon":["Uno a diez en lo estratégico", "Diez a uno en lo táctico", "Construir normalidad"],
 "irene-montero":["El poder se ejerce", "Más rápido y de forma más contundente", "Poner la vida en el centro"],
 "isabel-cela":["Una ley de todos", "Cargada de futuro", "Una gran avenida de oportunidades"],
 "jordi-turull":["No tenía la pretensión", "Mantenemos los compromisos", "Seguirá estando intacto"],
 "jorge-fernandez-diaz":["Nada es mera coincidencia", "Míreme a los ojos: ¡no!", "Siempre ayuda"],
 "jose-luis-rodriguez-zapatero":["A cada descalificación, una idea", "Estamos en la Champions League", "A cada exageración una sonrisa"],
 "jose-manuel-garcia-margallo":["No tengo la menor duda", "Estamos en un mundo nuevo", "Regeneración de las instituciones"],
 "julio-anguita":["Siempre he dicho lo que pensaba", "Nunca me he arredrado", "Libertad de pensamiento"],
 "laura-borras":["Servir al país y a la cultura", "Nada volverá a ser como antes", "Siempre al lado"],
 "luis-de-guindos":["Maximizar los beneficios", "Minimizar los costes", "Te vale para el resto de la vida"],
 "maria-jesus-montero":["Qué vergüenza", "Se enfrentan a gigantes", "Aquí estamos contigo"],
 "marta-rovira":["Confrontar ideas", "Aire fresco", "Energía renovada"],
 "miquel-iceta":["Queda por hacer", "Intenta formar una mayoría de cambio", "¡Aguanta, resiste a las presiones!"],
 "miriam-nogueras":["Y yo pago 49 euros", "El pueblo eres tú, ¿verdad?", "De aquí no marchará nadie"],
 "monica-garcia":["Un cambio en el modelo", "Estamos hablando con un muro", "Aportar soluciones"],
 "nadia-calvino":["Necesitamos una respuesta unida", "No es aceptable", "Triple red de seguridad"],
 "oriol-junqueras":["Una palanca de cambio", "Las cosas que no nos dejan aplicar", "Todo el aprecio y cariño"],
 "pablo-casado":["Una cortina de humo", "Hasta aquí hemos llegado", "Nosotros unimos"],
 "pablo-echenique":["Cascao y neoliberal", "La defunción del bipartidismo", "Por eso, la recurriré"],
 "pilar-alegria":["Una sociedad moderna", "Una apuesta fuerte y directa", "Tenemos que apoyar fuertemente"],
 "rocio-monasterio":["Un acto de servicio", "No quiero que nadie se meta en mi casa", "Esa es la verdadera libertad"],
 "sara-gimenez":["Prejuicios y estereotipos", "¡Ya está bien!", "Somos muchos"],
 "soraya-saenz-de-santamaria":["La razón como argumento", "El morbo frente a la verdad", "Nuestras instituciones"],
 "alfonso-alonso":["Hoy es la última rueda de prensa", "Una decisión firme, irrevocable", "Estar unidos"],
 "alvaro-nadal":["La divergencia de ideas y opiniones", "Contamos nuestros gobiernos por recuperaciones", "Respetar el medio ambiente"],
 "ana-pastor":["Realmente no sé si lo conseguí", "Seguir avanzando como nación", "La unidad de principios y valores"],
 "andrea-levy":["Todos tenemos una fecha de caducidad", "El tiempo nos dio la razón", "No se doblegó"],
 "antonio-maillo":["Un pack, un tándem", "Queremos gobernar y cambiar Andalucía", "Un equipo que suma"],
 "borja-semper":["No le daría otra interpretación", "Estoy convencido", "Sin mala intención"],
 "carlos-floriano":["Ya estamos preparados para gobernar", "Nos ponemos en la senda de ganar", "Un partido más sólido"],
 "carme-forcadell":["Yo no estoy inhabilitada", "Nos dará la razón", "Lo avalará"],
 "carmen-calvo":["El dinero público no es de nadie", "No renuncio", "Soy una tía a la que no doblan"],
 "celia-villalobos":["¡Que pierdo el tren!", "Usted a mí no me da lecciones", "No eche huesos de vaca"],
 "cuca-gamarra":["Hay que estar para servir", "Nos están vendiendo una moto", "Bajaremos el IRPF"],
 "dolors-montserrat":["No puede mirar hacia otro lado", "La independencia judicial no es elegible", "Los jueces deben estar protegidos"],
 "elias-bendodo":["Un clásico", "Se les ha caído entero", "Las pensiones están garantizadas"],
 "emiliano-garcia-page":["Las elecciones son como los melones", "Salir a dar la batalla electoral", "Recuperar entre todos"],
 "esteban-gonzalez-pons":["Con las puertas abiertas", "Trabajamos unidos", "Si soñamos juntos"],
 "fatima-banez":["Los malos también aprenden", "Hacen ataques más sofisticados", "Prepararnos mejor para el futuro"],
 "fernando-grande-marlaska":["Son gajes del oficio", "Impedir la llegada", "La garantía de la seguridad ciudadana"],
 "inigo-mendez-de-vigo":["Si existe la voluntad política", "Dar un salto de calidad", "Un pacto necesario"],
 "isabel-garcia-tejerina":["Somos importantes hoy", "No podemos dejar a España sin alternativa", "La convivencia y la estabilidad"],
 "jaime-de-olano":["Su cuenta corriente", "Nos sobra propaganda", "Para que puedan formar un hogar"],
 "javier-maroto":["Con dureza democrática", "Comprar votos, repito, es corrupción", "Compartir un proyecto juntos"],
 "jordi-sanchez":["Todos estamos conjurados", "Para la victoria inmediata", "Los derechos y libertades de este país"],
 "jose-luis-abalos":["Soy un mero peón", "Tendrán que mirarme a la cara", "Voy a defender mi honor personal"],
 "josep-rull":["Dirigirles la palabra", "Una nación libre", "Seguiremos luchando"],
 "juan-espadas":["No voy a dejar Andalucía", "A ello dedicaré todo mi esfuerzo", "Una segunda opción"],
 "juan-vicente-herrera":["Más pasado que futuro", "Que se acuerden de uno", "Sin distinción de partidos"],
 "marta-lois":["La decisión está tomada", "Un cambio histórico", "Cuento con vosotros y vosotras"],
 "marta-rivera-de-la-cruz":["Chulapear", "Es una irresponsabilidad", "Se han quedado allí"],
 "meritxell-batet":["Somos del pueblo", "Ningún partido representa en exclusiva a España", "La esperanza es el material político"],
 "miguel-arias-canete":["Nos respetan por ello", "No puede jugar sola la partida", "Garantizar el estado de bienestar"],
 "nacho-alvarez":["Estoy orgulloso", "Puso fin al bipartidismo", "Redefinir y oxigenar"],
 "oscar-puente":["No está mal", "Pues no", "Así es la vida"],
 "pablo-cambronero":["Haré lo que prometí hacer", "Lo mantengo", "Voy a defender la democracia"],
 "pablo-montesinos":["Sería una irresponsabilidad", "Una oposición firme", "Pactos de Estado"],
 "patxi-lopez":["Pues va a ser que no", "Tú sabrás", "Velar por la seguridad"],
 "pere-aragones":["Es votando", "Culminar la independencia de Cataluña", "Abrir un nuevo ciclo de crecimiento"],
 "pilar-llop":["Tenemos la obligación", "Esto es intolerable", "Quiero pedirles ayuda"],
 "quim-torra":["La ratafía nos une", "Hemos de atacar", "Nos sentimos seguros, protegidos"],
 "rafael-catala":["Que las cosas funcionen bien", "Un ascenso", "Seguirá haciendo bien su trabajo"],
 "rafael-hernando":["Esa es la representatividad", "¡Inaceptable!", "En todo momento hemos respetado"],
 "raquel-sanchez":["No crece con ladrillos", "No hay dignidad sin vivienda", "Su función social es incuestionable"],
 "raul-romeva":["Soy un culo inquieto", "Se genera incertidumbre", "Trabajo y trabajo"],
 "reyes-maroto":["Esa es la cuestión", "Hoy gana el derecho", "Protección frente a la especulación"],
 "roger-torrent":["Respeto para la voluntad mayoritaria", "Recuperar las instituciones", "Coser la sociedad catalana"],
 "susana-diaz":["Cumplir con mi palabra", "No se puede permitir", "Diálogo, mucho diálogo y consenso"],
 "teodoro-garcia-egea":["Nunca había lanzado más de 11 m", "Ganar abrió una nueva etapa", "Yo soy de Murcia"],
 "toni-canto":["Eso es transfuguismo", "No haces lo que prometes", "Cesen los privilegios"],
 "toni-comin":["Una democracia mundial es posible", "Hay que buscar el desgaste económico", "Erradicar la pobreza en el mundo"]
};

// Keep the original save/image identifier when a corrected surname changes its spelling.
var CARD_NAMES={'isabel-cela':'Isabel Celaá'};
// País de representación política, no lugar de nacimiento ni institución supranacional.
var COUNTRY_NAMES={"ES": "España", "US": "Estados Unidos", "GB": "Reino Unido", "DE": "Alemania", "FR": "Francia", "RU": "Rusia", "IT": "Italia", "TR": "Turquía", "HU": "Hungría", "CA": "Canadá", "VE": "Venezuela", "MX": "México", "AR": "Argentina"};
var COUNTRY_ROSTER={
 "ES":"alberto-nunez-feijoo carles-puigdemont isabel-diaz-ayuso mariano-rajoy pedro-sanchez yolanda-diaz ada-colau felipe-gonzalez gabriel-rufian jose-maria-aznar pablo-iglesias salvador-illa santiago-abascal adriana-lastra albert-rivera alberto-garzon ana-botella anna-gabriel begona-villacis cayetana-alvarez-de-toledo cristina-cifuentes cristobal-montoro dolores-de-cospedal edmundo-bal esperanza-aguirre ines-arrimadas inigo-errejon irene-montero isabel-cela jordi-turull jorge-fernandez-diaz jose-luis-rodriguez-zapatero jose-manuel-garcia-margallo julio-anguita laura-borras luis-de-guindos maria-jesus-montero marta-rovira miquel-iceta miriam-nogueras monica-garcia nadia-calvino oriol-junqueras pablo-casado pablo-echenique pilar-alegria rocio-monasterio sara-gimenez soraya-saenz-de-santamaria alfonso-alonso alvaro-nadal ana-pastor andrea-levy antonio-maillo borja-semper carlos-floriano carme-forcadell carmen-calvo celia-villalobos cuca-gamarra dolors-montserrat elias-bendodo emiliano-garcia-page esteban-gonzalez-pons fatima-banez fernando-grande-marlaska inigo-mendez-de-vigo isabel-garcia-tejerina jaime-de-olano javier-maroto jordi-sanchez jose-luis-abalos josep-rull juan-espadas juan-vicente-herrera marta-lois marta-rivera-de-la-cruz meritxell-batet miguel-arias-canete nacho-alvarez oscar-puente pablo-cambronero pablo-montesinos patxi-lopez pere-aragones pilar-llop quim-torra rafael-catala rafael-hernando raquel-sanchez raul-romeva reyes-maroto roger-torrent susana-diaz teodoro-garcia-egea toni-canto toni-comin".split(' '),
 "US":"donald-trump barack-obama bernie-sanders joe-biden hillary-clinton kamala-harris".split(' '),
 "GB":"boris-johnson nigel-farage".split(' '),
 "DE":"angela-merkel ursula-von-der-leyen".split(' '),
 "FR":"emmanuel-macron marine-le-pen christine-lagarde".split(' '),
 "RU":"vladimir-putin".split(' '),
 "IT":"giorgia-meloni matteo-salvini".split(' '),
 "TR":"recep-tayyip-erdogan".split(' '),
 "HU":"viktor-orban".split(' '),
 "CA":"justin-trudeau".split(' '),
 "VE":"nicolas-maduro".split(' '),
 "MX":"andres-manuel-lopez-obrador".split(' '),
 "AR":"javier-milei cristina-fernandez-de-kirchner".split(' ')
};
var CARD_COUNTRIES={};Object.keys(COUNTRY_ROSTER).forEach(function(code){COUNTRY_ROSTER[code].forEach(function(id){CARD_COUNTRIES[id]=code;});});
var CARDS=[],BYID={};
DOCS.forEach(function(d){
 ['legendario','especial','raro','comun'].forEach(function(t){
  var t2=TIER[t];
  ROSTER[d.k][t].forEach(function(nm,ix){
   var id=slug(nm),cost=t2.costs?t2.costs[ix%t2.costs.length]:t2.c[0]+(ix%(t2.c[1]-t2.c[0]+1)),stats=statsFor(t,cost);
   var c={id:id,n:CARD_NAMES[id]||nm,r:t,pa:d.k,country:CARD_COUNTRIES[id]||null,c:cost,a:stats.a,h:stats.h,v:stats.v};
   c.q=QBESP[c.id].slice();
   CARDS.push(c);BYID[c.id]=c;
  });
 });
});
CARDS.sort(function(a,b){return TIERORDER[a.r]-TIERORDER[b.r]||a.n.localeCompare(b.n,'es');});

var PACKS=[
 {k:'comun',n:'Sobre común',p:400,d:'4 comunes + 20% raro.'},
 {k:'raro',n:'Sobre raro',p:800,d:'4 raros + 25% especial.'},
 {k:'legendario',n:'Sobre legendario',p:1500,d:'1 legendario, 1 especial y 3 raros.'},
 {k:'mitico',n:'Sobre mítico',p:2900,d:'5 legendarios garantizados.'}];
function validate(data){var seen=new Set();for(const c of data.cards){if(!c||!(/^[a-z0-9-]+$/).test(c.id)||seen.has(c.id)||['constructor','prototype','__proto__'].includes(c.id))throw Error('ID de cromo inválido o repetido');seen.add(c.id);if(!c.country||!(/^[A-Z]{2}$/).test(c.country)||!Object.hasOwn(data.countryNames,c.country)||!Object.hasOwn(data.tier,c.r)||!Object.hasOwn(data.roster,c.pa))throw Error('Metadatos incompletos: '+c.id);if(typeof c.n!=='string'||!c.n.trim()||!Array.isArray(c.q)||c.q.length!==3||c.q.some(q=>typeof q!=='string'||!q.trim()))throw Error('Nombre o frases incompletas: '+c.id);for(const k of ['c','a','h','v'])if(!Number.isSafeInteger(c[k])||c[k]<=0)throw Error('Estadística inválida: '+c.id);}return data;}
var data={balanceVersion:BALANCE_VERSION,statsFor:statsFor,cards:CARDS,docs:DOCS,rars:RARS,tier:TIER,roster:ROSTER,quotes:QBESP,countries:CARD_COUNTRIES,countryNames:COUNTRY_NAMES,countryRoster:COUNTRY_ROSTER,tierOrder:TIERORDER,names:CARD_NAMES,packs:PACKS};validate(data);data.validate=validate;return data;});

},
"_dev/online/catalog-legacy-stats.cjs":function(require,module,exports){
'use strict';
// Estadísticas de v31.0.2.6 para salas ya creadas. No modificar.
module.exports={"version":"balance-v1","cards":{"alberto-nunez-feijoo":{"c":4,"a":7,"h":11,"v":8},"angela-merkel":{"c":5,"a":7,"h":16,"v":8},"barack-obama":{"c":4,"a":7,"h":11,"v":8},"boris-johnson":{"c":5,"a":7,"h":16,"v":8},"carles-puigdemont":{"c":4,"a":7,"h":11,"v":8},"donald-trump":{"c":4,"a":7,"h":11,"v":8},"emmanuel-macron":{"c":5,"a":7,"h":16,"v":8},"isabel-diaz-ayuso":{"c":5,"a":7,"h":16,"v":8},"mariano-rajoy":{"c":4,"a":7,"h":11,"v":8},"pedro-sanchez":{"c":4,"a":7,"h":11,"v":8},"vladimir-putin":{"c":5,"a":7,"h":16,"v":8},"yolanda-diaz":{"c":5,"a":7,"h":16,"v":8},"ada-colau":{"c":3,"a":5,"h":8,"v":5},"andres-manuel-lopez-obrador":{"c":4,"a":5,"h":8,"v":5},"bernie-sanders":{"c":4,"a":5,"h":8,"v":5},"christine-lagarde":{"c":4,"a":5,"h":8,"v":5},"cristina-fernandez-de-kirchner":{"c":3,"a":5,"h":8,"v":5},"felipe-gonzalez":{"c":4,"a":5,"h":8,"v":5},"gabriel-rufian":{"c":3,"a":5,"h":8,"v":5},"giorgia-meloni":{"c":4,"a":5,"h":8,"v":5},"hillary-clinton":{"c":3,"a":5,"h":8,"v":5},"javier-milei":{"c":4,"a":5,"h":8,"v":5},"joe-biden":{"c":3,"a":5,"h":8,"v":5},"jose-maria-aznar":{"c":3,"a":5,"h":8,"v":5},"justin-trudeau":{"c":4,"a":5,"h":8,"v":5},"kamala-harris":{"c":4,"a":5,"h":8,"v":5},"marine-le-pen":{"c":3,"a":5,"h":8,"v":5},"matteo-salvini":{"c":4,"a":5,"h":8,"v":5},"nicolas-maduro":{"c":4,"a":5,"h":8,"v":5},"nigel-farage":{"c":4,"a":5,"h":8,"v":5},"pablo-iglesias":{"c":3,"a":5,"h":8,"v":5},"recep-tayyip-erdogan":{"c":4,"a":5,"h":8,"v":5},"salvador-illa":{"c":3,"a":5,"h":8,"v":5},"santiago-abascal":{"c":3,"a":5,"h":8,"v":5},"ursula-von-der-leyen":{"c":3,"a":5,"h":8,"v":5},"viktor-orban":{"c":3,"a":5,"h":8,"v":5},"adriana-lastra":{"c":3,"a":4,"h":6,"v":3},"albert-rivera":{"c":3,"a":4,"h":6,"v":3},"alberto-garzon":{"c":2,"a":4,"h":6,"v":3},"ana-botella":{"c":4,"a":4,"h":6,"v":3},"anna-gabriel":{"c":3,"a":4,"h":6,"v":3},"begona-villacis":{"c":3,"a":4,"h":6,"v":3},"cayetana-alvarez-de-toledo":{"c":4,"a":4,"h":6,"v":3},"cristina-cifuentes":{"c":2,"a":4,"h":6,"v":3},"cristobal-montoro":{"c":4,"a":4,"h":6,"v":3},"dolores-de-cospedal":{"c":4,"a":4,"h":6,"v":3},"edmundo-bal":{"c":2,"a":4,"h":6,"v":3},"esperanza-aguirre":{"c":2,"a":4,"h":6,"v":3},"ines-arrimadas":{"c":2,"a":4,"h":6,"v":3},"inigo-errejon":{"c":4,"a":4,"h":6,"v":3},"irene-montero":{"c":3,"a":4,"h":6,"v":3},"isabel-cela":{"c":2,"a":4,"h":6,"v":3},"jordi-turull":{"c":3,"a":4,"h":6,"v":3},"jorge-fernandez-diaz":{"c":2,"a":4,"h":6,"v":3},"jose-luis-rodriguez-zapatero":{"c":2,"a":4,"h":6,"v":3},"jose-manuel-garcia-margallo":{"c":3,"a":4,"h":6,"v":3},"julio-anguita":{"c":4,"a":4,"h":6,"v":3},"laura-borras":{"c":2,"a":4,"h":6,"v":3},"luis-de-guindos":{"c":3,"a":4,"h":6,"v":3},"maria-jesus-montero":{"c":3,"a":4,"h":6,"v":3},"marta-rovira":{"c":4,"a":4,"h":6,"v":3},"miquel-iceta":{"c":2,"a":4,"h":6,"v":3},"miriam-nogueras":{"c":4,"a":4,"h":6,"v":3},"monica-garcia":{"c":4,"a":4,"h":6,"v":3},"nadia-calvino":{"c":4,"a":4,"h":6,"v":3},"oriol-junqueras":{"c":2,"a":4,"h":6,"v":3},"pablo-casado":{"c":2,"a":4,"h":6,"v":3},"pablo-echenique":{"c":3,"a":4,"h":6,"v":3},"pilar-alegria":{"c":4,"a":4,"h":6,"v":3},"rocio-monasterio":{"c":3,"a":4,"h":6,"v":3},"sara-gimenez":{"c":4,"a":4,"h":6,"v":3},"soraya-saenz-de-santamaria":{"c":3,"a":4,"h":6,"v":3},"alfonso-alonso":{"c":2,"a":2,"h":5,"v":2},"alvaro-nadal":{"c":1,"a":2,"h":7,"v":2},"ana-pastor":{"c":1,"a":2,"h":4,"v":2},"andrea-levy":{"c":1,"a":2,"h":7,"v":2},"antonio-maillo":{"c":2,"a":2,"h":5,"v":2},"borja-semper":{"c":3,"a":2,"h":5,"v":2},"carlos-floriano":{"c":2,"a":2,"h":4,"v":2},"carme-forcadell":{"c":3,"a":2,"h":5,"v":2},"carmen-calvo":{"c":3,"a":2,"h":5,"v":2},"celia-villalobos":{"c":1,"a":2,"h":4,"v":2},"cuca-gamarra":{"c":2,"a":2,"h":4,"v":2},"dolors-montserrat":{"c":1,"a":2,"h":6,"v":2},"elias-bendodo":{"c":2,"a":2,"h":7,"v":2},"emiliano-garcia-page":{"c":1,"a":2,"h":7,"v":2},"esteban-gonzalez-pons":{"c":1,"a":2,"h":6,"v":2},"fatima-banez":{"c":1,"a":2,"h":4,"v":2},"fernando-grande-marlaska":{"c":2,"a":2,"h":7,"v":2},"inigo-mendez-de-vigo":{"c":2,"a":2,"h":5,"v":2},"isabel-garcia-tejerina":{"c":1,"a":2,"h":6,"v":2},"jaime-de-olano":{"c":2,"a":2,"h":7,"v":2},"javier-maroto":{"c":3,"a":2,"h":6,"v":2},"jordi-sanchez":{"c":3,"a":2,"h":6,"v":2},"jose-luis-abalos":{"c":2,"a":2,"h":4,"v":2},"josep-rull":{"c":2,"a":2,"h":4,"v":2},"juan-espadas":{"c":2,"a":2,"h":4,"v":2},"juan-vicente-herrera":{"c":1,"a":2,"h":7,"v":2},"marta-lois":{"c":2,"a":2,"h":4,"v":2},"marta-rivera-de-la-cruz":{"c":3,"a":2,"h":6,"v":2},"meritxell-batet":{"c":1,"a":2,"h":6,"v":2},"miguel-arias-canete":{"c":3,"a":2,"h":5,"v":2},"nacho-alvarez":{"c":3,"a":2,"h":5,"v":2},"oscar-puente":{"c":1,"a":2,"h":4,"v":2},"pablo-cambronero":{"c":1,"a":2,"h":7,"v":2},"pablo-montesinos":{"c":2,"a":2,"h":5,"v":2},"patxi-lopez":{"c":2,"a":2,"h":5,"v":2},"pere-aragones":{"c":2,"a":2,"h":5,"v":2},"pilar-llop":{"c":3,"a":2,"h":5,"v":2},"quim-torra":{"c":1,"a":2,"h":4,"v":2},"rafael-catala":{"c":3,"a":2,"h":6,"v":2},"rafael-hernando":{"c":3,"a":2,"h":6,"v":2},"raquel-sanchez":{"c":2,"a":2,"h":7,"v":2},"raul-romeva":{"c":1,"a":2,"h":6,"v":2},"reyes-maroto":{"c":1,"a":2,"h":6,"v":2},"roger-torrent":{"c":1,"a":2,"h":7,"v":2},"susana-diaz":{"c":3,"a":2,"h":6,"v":2},"teodoro-garcia-egea":{"c":2,"a":2,"h":7,"v":2},"toni-canto":{"c":1,"a":2,"h":4,"v":2},"toni-comin":{"c":2,"a":2,"h":7,"v":2}}};

},
"js/basic-effects.js":function(require,module,exports){
/* Estados de ataques básicos: una plaza por orador, reglas compartidas y azar inyectado. */
(function(root,factory){var api=factory(typeof module==='object'&&module.exports?require('./basic-effects-v3.js'):root.HemicycleBasicEffectsV3);if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBasicEffects=api;})(typeof globalThis!=='undefined'?globalThis:this,function(Legacy){'use strict';
var VERSION='basic4';
var definitions={
 surge:{name:'Se viene arriba',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, gana +1 Zasca para su básico del próximo turno propio. Caduca al terminar ese turno.'},
 coffee:{name:'Café parlamentario',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, recupera 1 Aguante al comenzar su próximo turno propio, sin superar su máximo.'},
 archive:{name:'Hemeroteca insistente',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva pierde 1 Aguante al comienzo de sus dos próximos turnos propios.'},
 tongue:{name:'Lengua de trapo',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el siguiente básico del rival que sobreviva tiene −1 Zasca, con mínimo de 1. Caduca al terminar su siguiente turno.'},
 shield:{name:'Argumentario plastificado',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, absorbe 1 punto del siguiente básico recibido, después de la defensa. Caduca al terminar su siguiente turno.'},
 microphone:{name:'Micrófono indiscreto',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva recibe +1 de daño del próximo básico que lo golpee, antes de la defensa. Caduca al terminar su siguiente turno.'},
 acta:{name:'Fuera del acta',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva aporta 1 voto pasivo menos en su próximo turno. No cambia sus escaños de expulsión ni los 3 votos base.'},
 paperwork:{name:'Papeles traspapelados',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, la próxima defensa o curación voluntaria del rival que sobreviva cuesta 1 TdP. Caduca al terminar su siguiente turno. No afecta a cartas de acción.'},
 escort:{name:'Yo respondo',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, desvía hacia sí el próximo básico dirigido a otro compañero, una sola vez. Caduca al terminar su siguiente turno. No atrae fuertes, acciones ni ataques a huecos.'},
 fineprint:{name:'Letra pequeña',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, su siguiente básico recupera 1 punto del daño evitado por una defensa del 50 %, sin superar el daño sin defensa. Se consume aunque no haya defensa y caduca al terminar su siguiente turno.'},
 bank:{name:'Dietas guardadas',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, reserva 1 TdP sobrante al cerrar el turno y lo devuelve al comenzar el siguiente. Una reserva por bancada, tope de 8 TdP. Se pierde si sale el portador; no crea recursos.'},
 summon:{name:'Llamada al suplente',polarity:'positive',target:'self',instant:true,description:'Tras causar daño con un básico a un orador, roba el orador de menor coste de tu propio mazo, de cualquier rareza, si tienes menos de dos oradores en mano. En empates sigue el orden del mazo. Una activación por turno propio y jugador. No crea copias ni rescata expulsados. Hay que pagar su coste para presentarlo.'},
 fasttrack:{name:'Ventanilla rápida',polarity:'positive',target:'self',instant:true,description:'Tras causar daño con un básico a un orador, adelanta 1 turno la recuperación de una carta de acción de apoyo del mazo a la que le queden al menos 2 turnos. Si hay dos elegibles, escoge una al azar. Una activación por turno propio y jugador, compartida entre sus portadores. No afecta a la curación del orador.'},
 lane:{name:'Debate encarrilado',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva no puede dirigir su próximo básico a un hueco para retirar votos. Puede atacar oradores o usar apoyos y fuertes. Caduca al terminar su siguiente turno.'}

};
// Cada asignación responde a coste/función de juego, no es una afirmación sobre la persona.
var groups={"surge":["toni-canto","dolors-montserrat","fatima-banez","quim-torra","andrea-levy","oscar-puente","pablo-echenique","jordi-turull","gabriel-rufian","marine-le-pen","donald-trump"],"fineprint":["isabel-garcia-tejerina","celia-villalobos","alvaro-nadal","roger-torrent","ana-pastor","reyes-maroto","alberto-garzon","cristina-cifuentes","pablo-casado","oriol-junqueras","ines-arrimadas","isabel-cela","joe-biden","cristina-fernandez-de-kirchner","alberto-nunez-feijoo"],"coffee":["meritxell-batet","esteban-gonzalez-pons","soraya-saenz-de-santamaria","rocio-monasterio","ursula-von-der-leyen","isabel-diaz-ayuso"],"bank":["pablo-cambronero","juan-vicente-herrera","raul-romeva","emiliano-garcia-page","pedro-sanchez"],"archive":["nacho-alvarez","miguel-arias-canete","jordi-sanchez","pilar-llop","inigo-errejon","julio-anguita","cristobal-montoro","marta-rovira","cayetana-alvarez-de-toledo","nadia-calvino"],"microphone":["inigo-mendez-de-vigo","cuca-gamarra","recep-tayyip-erdogan","kamala-harris","boris-johnson"],"shield":["marta-lois","alfonso-alonso","carmen-calvo","pere-aragones","marta-rivera-de-la-cruz","patxi-lopez","luis-de-guindos","maria-jesus-montero","javier-milei","bernie-sanders","salvador-illa","nicolas-maduro","emmanuel-macron"],"tongue":["rafael-hernando","javier-maroto","rafael-catala","carme-forcadell","borja-semper","susana-diaz","nigel-farage","santiago-abascal"],"acta":["antonio-maillo","carlos-floriano","fernando-grande-marlaska","elias-bendodo","jose-luis-rodriguez-zapatero","jorge-fernandez-diaz","miquel-iceta","jose-manuel-garcia-margallo","albert-rivera","adriana-lastra","ada-colau","barack-obama"],"paperwork":["jaime-de-olano","jose-luis-abalos","josep-rull","juan-espadas","irene-montero","anna-gabriel","begona-villacis","felipe-gonzalez","hillary-clinton","carles-puigdemont"],"lane":["teodoro-garcia-egea","toni-comin","pablo-montesinos","raquel-sanchez","esperanza-aguirre","laura-borras","edmundo-bal","justin-trudeau","mariano-rajoy"],"summon":["monica-garcia","dolores-de-cospedal","sara-gimenez","pablo-iglesias","jose-maria-aznar","andres-manuel-lopez-obrador"],"fasttrack":["ana-botella","miriam-nogueras","pilar-alegria","viktor-orban","matteo-salvini","christine-lagarde","yolanda-diaz"],"escort":["giorgia-meloni","angela-merkel","vladimir-putin"]};
var assignments={};Object.keys(groups).forEach(function(id){groups[id].forEach(function(card){if(assignments[card])throw Error('Habilidad repetida: '+card);assignments[card]=id;});});
function ability(id){return Object.hasOwn(assignments,id)?assignments[id]:null;}
function definition(id){return Object.hasOwn(definitions,id)?definitions[id]:null;}
function state(card){var s=card&&card.basicStatus;return s&&definition(s.id)&&Number.isSafeInteger(s.appliedTurn)&&Number.isSafeInteger(s.expires)?s:null;}
function clear(card){delete card.basicStatus;}
function reset(card){clear(card);delete card.basicReadyTurn;}
function canGrant(card,id){var incoming=definition(id),existing=state(card);return !!incoming&&(!existing||incoming.polarity==='negative'&&definition(existing.id).polarity==='positive');}
function grant(card,id,turn,source){if(!canGrant(card,id))return false;var pulse=id==='archive'?2:id==='coffee'?1:0;card.basicStatus={id:id,appliedTurn:turn,starts:id==='surge'||pulse?turn+1:turn,expires:turn+(pulse||1),source:source,lastTick:turn,...(pulse?{ticksLeft:pulse}:{})};return true;}
function active(card,turn){var s=state(card);return !!s&&turn>=s.starts&&turn<=s.expires;}
function normalZ(card,turn,base){var s=state(card),delta=active(card,turn)?s.id==='surge'?1:s.id==='tongue'?-1:0:0;return Math.max(1,base+delta);}
function consumeAttack(card,turn){var s=state(card);if(active(card,turn)&&['surge','tongue','fineprint','lane'].includes(s.id))clear(card);}
function beforeDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='microphone'){clear(card);return amount+1;}return amount;}
function afterDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='shield'){clear(card);return Math.max(0,amount-1);}return amount;}
function begin(card,turn){var s=state(card);if(!s)return null;if(turn>s.expires){clear(card);return null;}if(!s.ticksLeft||turn<s.starts||s.lastTick===turn)return null;s.lastTick=turn;s.ticksLeft--;var result={id:s.id,source:s.source,damage:s.id==='archive'?1:0,heal:s.id==='coffee'?1:0};if(!s.ticksLeft)clear(card);return result;}
function end(card,turn){var s=state(card);if(s&&!s.ticksLeft&&turn>=s.expires)clear(card);}
function afterHit(attacker,target,context){var id=attacker.basicAbility,def=definition(id);if(!def||context.ownTurn<(attacker.basicReadyTurn||0)||context.damage<=0||context.attackerHealth<=0)return null;var self=def.target==='self',card=self?attacker:target;if(!card||!self&&context.targetHealth<=0)return null;if(!canGrant(card,id))return null;var utility=def.instant?useUtility(id,context.team,context.actions,context.random):null;if(def.instant&&!utility)return null;if(!grant(card,id,self?context.ownTurn:context.rivalTurn,context.source))return null;if(def.instant){card.basicStatus.expires=context.ownTurn;card.basicStatus.outcome=utility.name;}attacker.basicReadyTurn=context.ownTurn+2;return {id:id,card:card,utility:utility};}
// Hooks puros compartidos por ambos motores; no consultan el reloj ni azar global.
function supportCost(card,turn){return active(card,turn)&&state(card).id==='paperwork'?1:0;}
function consumeSupport(card,turn){if(supportCost(card,turn))clear(card);}
function canEmpty(card,turn){return !(active(card,turn)&&state(card).id==='lane');}
function pierces(card,turn){return active(card,turn)&&state(card).id==='fineprint';}
function guardedDamage(amount,guarded,piercing){return guarded?Math.min(amount,Math.ceil(amount/2)+(piercing?1:0)):amount;}
function redirect(field,target,turn){if(!target)return null;var protector=field.find(function(c){return c!==target&&active(c,turn)&&state(c).id==='escort';});if(protector){clear(protector);return protector;}return target;}
function passive(card,turn,votes){var s=state(card);if(s&&s.id==='acta'&&turn>s.appliedTurn&&active(card,turn)){clear(card);return Math.max(0,votes-1);}return votes;}
function bank(field,turn,tdp){if(tdp<1||field.some(function(c){var s=state(c);return s&&s.id==='bank'&&s.banked;}))return tdp;var c=field.find(function(c){var s=state(c);return s&&s.id==='bank'&&s.appliedTurn===turn;});if(c){c.basicStatus.banked=1;return tdp-1;}return tdp;}
function collect(field,turn){var amount=0;field.forEach(function(c){var s=state(c);if(s&&s.id==='bank'&&turn>s.appliedTurn){amount+=s.banked||0;clear(c);}});return Math.min(1,amount);}
function utilityCandidates(id,team,actions){if(!team)return [];if(id==='summon'){if(team.summonUsedTurn===team.turn||team.hand.filter(function(c){return !c.action;}).length>=2)return [];var pool=team.deck.filter(function(c){return !c.action;});if(!pool.length)return [];var cost=function(c){return c.cost===undefined?c.c:c.cost;},min=Math.min.apply(null,pool.map(cost));return pool.filter(function(c){return cost(c)===min;}).slice(0,1);}if(id==='fasttrack'){if(team.fasttrackUsedTurn===team.turn)return [];return team.deck.filter(function(c){var a=actions&&actions[c.id||c.k];return c.action&&a&&!a.oncePerBattle&&['heal','guard','boost'].includes(a.effect)&&(c.availableTurn||0)-team.turn>=2;});}return [];}
function useUtility(id,team,actions,random){var candidates=utilityCandidates(id,team,actions);if(!candidates.length)return false;var chosen=candidates[0];if(id==='summon'){team.deck.splice(team.deck.indexOf(chosen),1);team.hand.push(chosen);team.summonUsedTurn=team.turn;}else{if(candidates.length>1){if(typeof random!=='function')throw Error('Falta azar verificado para Ventanilla rápida');var roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('Azar no válido');chosen=candidates[Math.floor(roll*candidates.length)];}chosen.availableTurn--;team.fasttrackUsedTurn=team.turn;}return {name:id==='summon'?'Un orador del mazo':actions[chosen.id||chosen.k].n};}
function view(card,turn){var s=state(card);if(!s)return null;var d=definition(s.id),timing=definition(s.id).instant?'Efecto aplicado'+(s.outcome?' a '+s.outcome:'')+'; el icono permanece hasta cerrar este turno.':s.id==='bank'?(s.banked?'1 TdP reservado para el próximo turno.':'Reserva pendiente al cerrar este turno si sobra TdP.'):s.id==='acta'?'Se consume al sumar los votos de su próximo turno.':s.id==='escort'?'Se consume al desviar un básico; caduca al terminar su siguiente turno.':s.id==='paperwork'?'Se consume al pagar la defensa o curación; caduca al terminar su siguiente turno.':s.ticksLeft?'Quedan '+s.ticksLeft+' pulsos al comenzar sus turnos.':s.id==='surge'&&turn<s.starts?'Se activa en su próximo turno propio.':'Se consume con el básico correspondiente; caduca al terminar '+(turn===s.expires?'este':'su próximo')+' turno propio.';return {id:s.id,name:d.name,polarity:d.polarity,count:s.ticksLeft||1,text:d.name+'. '+d.description+' '+timing};}
function symbol(id){var paths={surge:'M5 16V9l4 3 4-8 6 5v7ZM5 20h14',coffee:'M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM17 9h2a3 3 0 0 1 0 6h-2M7 2v3m4-3v3',archive:'M4 5h16v15H4ZM8 5V2m8 3V2M7 10h10M7 14h6M7 17h8',tongue:'M4 4h16v12h-6l-5 4v-4H4ZM8 8l8 5m0-5-8 5',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6',acta:'M5 3h14v18H5ZM8 7h8M8 11h8M8 15h4m3 1 5 5m0-5-5 5',paperwork:'M4 4h11v14H4ZM8 8h3M8 12h3M15 7h5v14H9v-3',escort:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6ZM8 12h8m-5-3-3 3 3 3',fineprint:'M4 3h11v18H4ZM7 7h5M7 11h4m6 2 4 4m-6 3a4 4 0 1 0 0-8 4 4 0 0 0 0 8',bank:'M4 11h16v10H4ZM3 8l9-5 9 5ZM8 14v4m4-4v4m4-4v4',summon:'M3 4h10v15H3ZM16 8h5v13H9v-2M6 8h4m-2 5v4m-2-2h4',fasttrack:'M3 4h9v15H3ZM6 8h3m-3 4h3m7-10 5 3-5 3m0-3h-2M17 12v4l3 2m-3 4a6 6 0 1 0 0-12 6 6 0 0 0 0 12',lane:'M4 5h16v12h-7l-4 4v-4H4ZM8 9h8m-3-3 3 3-3 3',microphone:'M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM6 10v2a6 6 0 0 0 12 0v-2M12 18v4M20 3v4m-2-2h4'};return '<svg class="basic-effect-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.shield)+'"/></svg>';}
var api={version:VERSION,forVersion:function(version){return version===VERSION?api:Legacy.forVersion(version);},supportCost:supportCost,consumeSupport:consumeSupport,canEmpty:canEmpty,pierces:pierces,guardedDamage:guardedDamage,redirect:redirect,passive:passive,bank:bank,collect:collect,utilityCandidates:utilityCandidates,canGrant:canGrant,definitions:definitions,assignments:assignments,ability:ability,definition:definition,state:state,clear:clear,reset:reset,grant:grant,active:active,normalZ:normalZ,consumeAttack:consumeAttack,beforeDefense:beforeDefense,afterDefense:afterDefense,begin:begin,end:end,afterHit:afterHit,view:view,symbol:symbol};return api;
});

},
"js/basic-effects-v3.js":function(require,module,exports){
/* Estados de ataques básicos: una plaza por orador, reglas compartidas y azar inyectado. */
(function(root,factory){var api=factory(typeof module==='object'&&module.exports?require('./basic-effects-v2.js'):root.HemicycleBasicEffectsV2);if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBasicEffectsV3=api;})(typeof globalThis!=='undefined'?globalThis:this,function(Legacy){'use strict';
var VERSION='basic3';
var definitions={
 surge:{name:'Se viene arriba',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, gana +1 Zasca para su básico del próximo turno propio. Caduca al terminar ese turno.'},
 coffee:{name:'Café parlamentario',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, recupera 1 Aguante al comenzar su próximo turno propio, sin superar su máximo.'},
 archive:{name:'Hemeroteca insistente',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva pierde 1 Aguante al comienzo de sus dos próximos turnos propios.'},
 tongue:{name:'Lengua de trapo',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el siguiente básico del rival que sobreviva tiene −1 Zasca, con mínimo de 1. Caduca al terminar su siguiente turno.'},
 shield:{name:'Argumentario plastificado',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, absorbe 1 punto del siguiente básico recibido, después de la defensa. Caduca al terminar su siguiente turno.'},
 microphone:{name:'Micrófono indiscreto',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva recibe +1 de daño del próximo básico que lo golpee, antes de la defensa. Caduca al terminar su siguiente turno.'},
 acta:{name:'Fuera del acta',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva aporta 1 voto pasivo menos en su próximo turno. No cambia sus escaños de expulsión ni los 3 votos base.'},
 paperwork:{name:'Papeles traspapelados',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, la próxima defensa o curación voluntaria del rival que sobreviva cuesta 1 TdP. Caduca al terminar su siguiente turno. No afecta a cartas de acción.'},
 escort:{name:'Yo respondo',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, desvía hacia sí el próximo básico dirigido a otro compañero, una sola vez. Caduca al terminar su siguiente turno. No atrae fuertes, acciones ni ataques a huecos.'},
 fineprint:{name:'Letra pequeña',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, su siguiente básico recupera 1 punto del daño evitado por una defensa del 50 %, sin superar el daño sin defensa. Se consume aunque no haya defensa y caduca al terminar su siguiente turno.'},
 bank:{name:'Dietas guardadas',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, reserva 1 TdP sobrante al cerrar el turno y lo devuelve al comenzar el siguiente. Una reserva por bancada, tope de 8 TdP. Se pierde si sale el portador; no crea recursos.'},
 summon:{name:'Llamada al suplente',polarity:'positive',target:'self',instant:true,description:'Tras causar daño con un básico a un orador, roba un común de tu propio mazo si tienes menos de dos oradores en mano. No crea copias ni rescata expulsados. Hay que pagar su coste para presentarlo.'},
 fasttrack:{name:'Ventanilla rápida',polarity:'positive',target:'self',instant:true,description:'Tras causar daño con un básico a un orador, adelanta 1 turno la recuperación de una carta de acción de apoyo del mazo a la que le queden al menos 2 turnos. Si hay dos elegibles, escoge una al azar. Una activación por jugador y partida. No afecta a la curación del orador.'},
 lane:{name:'Debate encarrilado',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva no puede dirigir su próximo básico a un hueco para retirar votos. Puede atacar oradores o usar apoyos y fuertes. Caduca al terminar su siguiente turno.'}

};
// Cada asignación responde a coste/función de juego, no es una afirmación sobre la persona.
var groups={
 surge:['toni-canto','dolors-montserrat','fatima-banez','quim-torra','andrea-levy','oscar-puente','pablo-echenique','jordi-turull','gabriel-rufian','marine-le-pen'],
 coffee:['isabel-garcia-tejerina','juan-vicente-herrera','meritxell-batet','roger-torrent','esteban-gonzalez-pons','reyes-maroto','soraya-saenz-de-santamaria','rocio-monasterio','joe-biden','hillary-clinton','vladimir-putin','isabel-diaz-ayuso'],
 archive:['nacho-alvarez','miguel-arias-canete','carmen-calvo','jordi-sanchez','marta-rivera-de-la-cruz','pilar-llop','inigo-errejon','julio-anguita','cristobal-montoro','marta-rovira','cayetana-alvarez-de-toledo','nadia-calvino'],
 tongue:['rafael-hernando','javier-maroto','rafael-catala','carme-forcadell','borja-semper','susana-diaz','monica-garcia','dolores-de-cospedal','miriam-nogueras','pilar-alegria','nigel-farage','recep-tayyip-erdogan'],
 shield:['ana-botella','sara-gimenez','luis-de-guindos','maria-jesus-montero','santiago-abascal','ada-colau','bernie-sanders','matteo-salvini','nicolas-maduro','angela-merkel','emmanuel-macron','yolanda-diaz'],
 microphone:['marta-lois','alfonso-alonso','inigo-mendez-de-vigo','pere-aragones','cuca-gamarra','patxi-lopez','javier-milei','kamala-harris','boris-johnson'],
 fineprint:['alvaro-nadal','ana-pastor','celia-villalobos','alberto-garzon','cristina-cifuentes','edmundo-bal','esperanza-aguirre','ines-arrimadas','isabel-cela','alberto-nunez-feijoo','barack-obama','carles-puigdemont'],
 bank:['emiliano-garcia-page','pablo-cambronero','raul-romeva'],
 acta:['antonio-maillo','carlos-floriano','elias-bendodo','fernando-grande-marlaska','adriana-lastra','albert-rivera'],
 paperwork:['jaime-de-olano','jose-luis-abalos','josep-rull','juan-espadas','anna-gabriel','begona-villacis'],
 lane:['pablo-montesinos','raquel-sanchez','teodoro-garcia-egea','toni-comin','jorge-fernandez-diaz','jose-luis-rodriguez-zapatero','laura-borras','miquel-iceta','oriol-junqueras','pablo-casado','donald-trump','mariano-rajoy','pedro-sanchez'],
 escort:['irene-montero','jose-manuel-garcia-margallo','salvador-illa','viktor-orban','andres-manuel-lopez-obrador','felipe-gonzalez','giorgia-meloni'],
 summon:['cristina-fernandez-de-kirchner','jose-maria-aznar','pablo-iglesias'],
 fasttrack:['ursula-von-der-leyen','christine-lagarde','justin-trudeau']

};
var assignments={};Object.keys(groups).forEach(function(id){groups[id].forEach(function(card){if(assignments[card])throw Error('Habilidad repetida: '+card);assignments[card]=id;});});
function ability(id){return Object.hasOwn(assignments,id)?assignments[id]:null;}
function definition(id){return Object.hasOwn(definitions,id)?definitions[id]:null;}
function state(card){var s=card&&card.basicStatus;return s&&definition(s.id)&&Number.isSafeInteger(s.appliedTurn)&&Number.isSafeInteger(s.expires)?s:null;}
function clear(card){delete card.basicStatus;}
function reset(card){clear(card);delete card.basicReadyTurn;}
function canGrant(card,id){var incoming=definition(id),existing=state(card);return !!incoming&&(!existing||incoming.polarity==='negative'&&definition(existing.id).polarity==='positive');}
function grant(card,id,turn,source){if(!canGrant(card,id))return false;var pulse=id==='archive'?2:id==='coffee'?1:0;card.basicStatus={id:id,appliedTurn:turn,starts:id==='surge'||pulse?turn+1:turn,expires:turn+(pulse||1),source:source,lastTick:turn,...(pulse?{ticksLeft:pulse}:{})};return true;}
function active(card,turn){var s=state(card);return !!s&&turn>=s.starts&&turn<=s.expires;}
function normalZ(card,turn,base){var s=state(card),delta=active(card,turn)?s.id==='surge'?1:s.id==='tongue'?-1:0:0;return Math.max(1,base+delta);}
function consumeAttack(card,turn){var s=state(card);if(active(card,turn)&&['surge','tongue','fineprint','lane'].includes(s.id))clear(card);}
function beforeDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='microphone'){clear(card);return amount+1;}return amount;}
function afterDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='shield'){clear(card);return Math.max(0,amount-1);}return amount;}
function begin(card,turn){var s=state(card);if(!s)return null;if(turn>s.expires){clear(card);return null;}if(!s.ticksLeft||turn<s.starts||s.lastTick===turn)return null;s.lastTick=turn;s.ticksLeft--;var result={id:s.id,source:s.source,damage:s.id==='archive'?1:0,heal:s.id==='coffee'?1:0};if(!s.ticksLeft)clear(card);return result;}
function end(card,turn){var s=state(card);if(s&&!s.ticksLeft&&turn>=s.expires)clear(card);}
function afterHit(attacker,target,context){var id=attacker.basicAbility,def=definition(id);if(!def||context.ownTurn<(attacker.basicReadyTurn||0)||context.damage<=0||context.attackerHealth<=0)return null;var self=def.target==='self',card=self?attacker:target;if(!card||!self&&context.targetHealth<=0)return null;if(!canGrant(card,id))return null;var utility=def.instant?useUtility(id,context.team,context.actions,context.random):null;if(def.instant&&!utility)return null;if(!grant(card,id,self?context.ownTurn:context.rivalTurn,context.source))return null;if(def.instant){card.basicStatus.expires=context.ownTurn;card.basicStatus.outcome=utility.name;}attacker.basicReadyTurn=context.ownTurn+2;return {id:id,card:card,utility:utility};}
// Hooks puros compartidos por ambos motores; no consultan el reloj ni azar global.
function supportCost(card,turn){return active(card,turn)&&state(card).id==='paperwork'?1:0;}
function consumeSupport(card,turn){if(supportCost(card,turn))clear(card);}
function canEmpty(card,turn){return !(active(card,turn)&&state(card).id==='lane');}
function pierces(card,turn){return active(card,turn)&&state(card).id==='fineprint';}
function guardedDamage(amount,guarded,piercing){return guarded?Math.min(amount,Math.ceil(amount/2)+(piercing?1:0)):amount;}
function redirect(field,target,turn){if(!target)return null;var protector=field.find(function(c){return c!==target&&active(c,turn)&&state(c).id==='escort';});if(protector){clear(protector);return protector;}return target;}
function passive(card,turn,votes){var s=state(card);if(s&&s.id==='acta'&&turn>s.appliedTurn&&active(card,turn)){clear(card);return Math.max(0,votes-1);}return votes;}
function bank(field,turn,tdp){if(tdp<1||field.some(function(c){var s=state(c);return s&&s.id==='bank'&&s.banked;}))return tdp;var c=field.find(function(c){var s=state(c);return s&&s.id==='bank'&&s.appliedTurn===turn;});if(c){c.basicStatus.banked=1;return tdp-1;}return tdp;}
function collect(field,turn){var amount=0;field.forEach(function(c){var s=state(c);if(s&&s.id==='bank'&&turn>s.appliedTurn){amount+=s.banked||0;clear(c);}});return Math.min(1,amount);}
function utilityCandidates(id,team,actions){if(!team)return [];if(id==='summon'){if(team.hand.filter(function(c){return !c.action;}).length>=2)return [];return team.deck.filter(function(c){return !c.action&&(c.rarity||c.r)==='comun';}).slice(0,1);}if(id==='fasttrack'){if(team.fasttrackUsed)return [];return team.deck.filter(function(c){var a=actions&&actions[c.id||c.k];return c.action&&a&&!a.oncePerBattle&&['heal','guard','boost'].includes(a.effect)&&(c.availableTurn||0)-team.turn>=2;});}return [];}
function useUtility(id,team,actions,random){var candidates=utilityCandidates(id,team,actions);if(!candidates.length)return false;var chosen=candidates[0];if(id==='summon'){team.deck.splice(team.deck.indexOf(chosen),1);team.hand.push(chosen);}else{if(candidates.length>1){if(typeof random!=='function')throw Error('Falta azar verificado para Ventanilla rápida');var roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('Azar no válido');chosen=candidates[Math.floor(roll*candidates.length)];}chosen.availableTurn--;team.fasttrackUsed=true;}return {name:id==='summon'?'Un orador común':actions[chosen.id||chosen.k].n};}
function view(card,turn){var s=state(card);if(!s)return null;var d=definition(s.id),timing=definition(s.id).instant?'Efecto aplicado'+(s.outcome?' a '+s.outcome:'')+'; el icono permanece hasta cerrar este turno.':s.id==='bank'?(s.banked?'1 TdP reservado para el próximo turno.':'Reserva pendiente al cerrar este turno si sobra TdP.'):s.id==='acta'?'Se consume al sumar los votos de su próximo turno.':s.id==='escort'?'Se consume al desviar un básico; caduca al terminar su siguiente turno.':s.id==='paperwork'?'Se consume al pagar la defensa o curación; caduca al terminar su siguiente turno.':s.ticksLeft?'Quedan '+s.ticksLeft+' pulsos al comenzar sus turnos.':s.id==='surge'&&turn<s.starts?'Se activa en su próximo turno propio.':'Se consume con el básico correspondiente; caduca al terminar '+(turn===s.expires?'este':'su próximo')+' turno propio.';return {id:s.id,name:d.name,polarity:d.polarity,count:s.ticksLeft||1,text:d.name+'. '+d.description+' '+timing};}
function symbol(id){var paths={surge:'M5 16V9l4 3 4-8 6 5v7ZM5 20h14',coffee:'M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM17 9h2a3 3 0 0 1 0 6h-2M7 2v3m4-3v3',archive:'M4 5h16v15H4ZM8 5V2m8 3V2M7 10h10M7 14h6M7 17h8',tongue:'M4 4h16v12h-6l-5 4v-4H4ZM8 8l8 5m0-5-8 5',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6',acta:'M5 3h14v18H5ZM8 7h8M8 11h8M8 15h4m3 1 5 5m0-5-5 5',paperwork:'M4 4h11v14H4ZM8 8h3M8 12h3M15 7h5v14H9v-3',escort:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6ZM8 12h8m-5-3-3 3 3 3',fineprint:'M4 3h11v18H4ZM7 7h5M7 11h4m6 2 4 4m-6 3a4 4 0 1 0 0-8 4 4 0 0 0 0 8',bank:'M4 11h16v10H4ZM3 8l9-5 9 5ZM8 14v4m4-4v4m4-4v4',summon:'M3 4h10v15H3ZM16 8h5v13H9v-2M6 8h4m-2 5v4m-2-2h4',fasttrack:'M3 4h9v15H3ZM6 8h3m-3 4h3m7-10 5 3-5 3m0-3h-2M17 12v4l3 2m-3 4a6 6 0 1 0 0-12 6 6 0 0 0 0 12',lane:'M4 5h16v12h-7l-4 4v-4H4ZM8 9h8m-3-3 3 3-3 3',microphone:'M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM6 10v2a6 6 0 0 0 12 0v-2M12 18v4M20 3v4m-2-2h4'};return '<svg class="basic-effect-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.shield)+'"/></svg>';}
var api={version:VERSION,forVersion:function(version){return version===VERSION?api:Legacy.forVersion(version);},supportCost:supportCost,consumeSupport:consumeSupport,canEmpty:canEmpty,pierces:pierces,guardedDamage:guardedDamage,redirect:redirect,passive:passive,bank:bank,collect:collect,utilityCandidates:utilityCandidates,canGrant:canGrant,definitions:definitions,assignments:assignments,ability:ability,definition:definition,state:state,clear:clear,reset:reset,grant:grant,active:active,normalZ:normalZ,consumeAttack:consumeAttack,beforeDefense:beforeDefense,afterDefense:afterDefense,begin:begin,end:end,afterHit:afterHit,view:view,symbol:symbol};return api;
});

},
"js/basic-effects-v2.js":function(require,module,exports){
/* Estados de ataques básicos: una plaza por orador, reglas compartidas y sin azar. */
(function(root,factory){var api=factory(typeof module==='object'&&module.exports?require('./basic-effects-v1.js'):root.HemicycleBasicEffectsV1);if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBasicEffectsV2=api;})(typeof globalThis!=='undefined'?globalThis:this,function(Legacy){'use strict';
var VERSION='basic2';
var definitions={
 surge:{name:'Se viene arriba',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, gana +1 Zasca para su básico del próximo turno propio. Caduca al terminar ese turno.'},
 coffee:{name:'Café parlamentario',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, recupera 1 Aguante al comenzar su próximo turno propio, sin superar su máximo.'},
 archive:{name:'Hemeroteca insistente',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva pierde 1 Aguante al comienzo de sus dos próximos turnos propios.'},
 tongue:{name:'Lengua de trapo',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el siguiente básico del rival que sobreviva tiene −1 Zasca, con mínimo de 1. Caduca al terminar su siguiente turno.'},
 shield:{name:'Argumentario plastificado',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, absorbe 1 punto del siguiente básico recibido, después de la defensa. Caduca al terminar su siguiente turno.'},
 microphone:{name:'Micrófono indiscreto',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva recibe +1 de daño del próximo básico que lo golpee, antes de la defensa. Caduca al terminar su siguiente turno.'},
 acta:{name:'Fuera del acta',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva aporta 1 voto pasivo menos en su próximo turno. No cambia sus escaños de expulsión ni los 3 votos base.'},
 paperwork:{name:'Papeles traspapelados',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, la próxima defensa o curación voluntaria del rival que sobreviva cuesta 1 TdP. Caduca al terminar su siguiente turno. No afecta a cartas de acción.'},
 escort:{name:'Yo respondo',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, desvía hacia sí el próximo básico dirigido a otro compañero, una sola vez. Caduca al terminar su siguiente turno. No atrae fuertes, acciones ni ataques a huecos.'},
 fineprint:{name:'Letra pequeña',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, su siguiente básico recupera 1 punto del daño evitado por una defensa del 50 %, sin superar el daño sin defensa. Se consume aunque no haya defensa y caduca al terminar su siguiente turno.'},
 bank:{name:'Dietas guardadas',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, reserva 1 TdP sobrante al cerrar el turno y lo devuelve al comenzar el siguiente. Una reserva por bancada, tope de 8 TdP. Se pierde si sale el portador; no crea recursos.'},
 summon:{name:'Llamada al suplente',polarity:'positive',target:'self',instant:true,description:'Tras causar daño con un básico a un orador, roba un común de tu propio mazo si tienes menos de dos oradores en mano. No crea copias ni rescata expulsados. Hay que pagar su coste para presentarlo.'},
 fasttrack:{name:'Ventanilla rápida',polarity:'positive',target:'self',instant:true,description:'Tras causar daño con un básico a un orador, adelanta 1 turno la recuperación de una carta de acción de apoyo del mazo a la que le queden al menos 2 turnos. Si hay dos elegibles, escoge una al azar. Una activación por jugador y partida. No afecta a la curación del orador.'},
 lane:{name:'Debate encarrilado',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva no puede dirigir su próximo básico a un hueco para retirar votos. Puede atacar oradores o usar apoyos y fuertes. Caduca al terminar su siguiente turno.'}

};
// Cada asignación responde a coste/función de juego, no es una afirmación sobre la persona.
var groups={
 surge:['toni-canto','dolors-montserrat','fatima-banez','quim-torra','andrea-levy','oscar-puente','pablo-echenique','jordi-turull','gabriel-rufian','marine-le-pen'],
 coffee:['isabel-garcia-tejerina','juan-vicente-herrera','meritxell-batet','roger-torrent','esteban-gonzalez-pons','reyes-maroto','soraya-saenz-de-santamaria','rocio-monasterio','joe-biden','hillary-clinton','vladimir-putin','isabel-diaz-ayuso'],
 archive:['nacho-alvarez','miguel-arias-canete','carmen-calvo','jordi-sanchez','marta-rivera-de-la-cruz','pilar-llop','inigo-errejon','julio-anguita','cristobal-montoro','marta-rovira','cayetana-alvarez-de-toledo','nadia-calvino'],
 tongue:['rafael-hernando','javier-maroto','rafael-catala','carme-forcadell','borja-semper','susana-diaz','monica-garcia','dolores-de-cospedal','miriam-nogueras','pilar-alegria','nigel-farage','recep-tayyip-erdogan'],
 shield:['ana-botella','sara-gimenez','luis-de-guindos','maria-jesus-montero','santiago-abascal','ada-colau','bernie-sanders','matteo-salvini','nicolas-maduro','angela-merkel','emmanuel-macron','yolanda-diaz'],
 microphone:['marta-lois','alfonso-alonso','inigo-mendez-de-vigo','pere-aragones','cuca-gamarra','patxi-lopez','javier-milei','kamala-harris','boris-johnson'],
 fineprint:['alvaro-nadal','ana-pastor','celia-villalobos','alberto-garzon','cristina-cifuentes','edmundo-bal','esperanza-aguirre','ines-arrimadas','isabel-cela','alberto-nunez-feijoo','barack-obama','carles-puigdemont'],
 bank:['emiliano-garcia-page','pablo-cambronero','raul-romeva'],
 acta:['antonio-maillo','carlos-floriano','elias-bendodo','fernando-grande-marlaska','adriana-lastra','albert-rivera'],
 paperwork:['jaime-de-olano','jose-luis-abalos','josep-rull','juan-espadas','anna-gabriel','begona-villacis'],
 lane:['pablo-montesinos','raquel-sanchez','teodoro-garcia-egea','toni-comin','jorge-fernandez-diaz','jose-luis-rodriguez-zapatero','laura-borras','miquel-iceta','oriol-junqueras','pablo-casado','donald-trump','mariano-rajoy','pedro-sanchez'],
 escort:['irene-montero','jose-manuel-garcia-margallo','salvador-illa','viktor-orban','andres-manuel-lopez-obrador','felipe-gonzalez','giorgia-meloni'],
 summon:['cristina-fernandez-de-kirchner','jose-maria-aznar','pablo-iglesias'],
 fasttrack:['ursula-von-der-leyen','christine-lagarde','justin-trudeau']

};
var assignments={};Object.keys(groups).forEach(function(id){groups[id].forEach(function(card){if(assignments[card])throw Error('Habilidad repetida: '+card);assignments[card]=id;});});
function ability(id){return Object.hasOwn(assignments,id)?assignments[id]:null;}
function definition(id){return Object.hasOwn(definitions,id)?definitions[id]:null;}
function state(card){var s=card&&card.basicStatus;return s&&definition(s.id)&&Number.isSafeInteger(s.appliedTurn)&&Number.isSafeInteger(s.expires)?s:null;}
function clear(card){delete card.basicStatus;}
function reset(card){clear(card);delete card.basicReadyTurn;}
function grant(card,id,turn,source){if(state(card)||!definition(id))return false;var pulse=id==='archive'?2:id==='coffee'?1:0;card.basicStatus={id:id,appliedTurn:turn,starts:id==='surge'||pulse?turn+1:turn,expires:turn+(pulse||1),source:source,lastTick:turn,...(pulse?{ticksLeft:pulse}:{})};return true;}
function active(card,turn){var s=state(card);return !!s&&turn>=s.starts&&turn<=s.expires;}
function normalZ(card,turn,base){var s=state(card),delta=active(card,turn)?s.id==='surge'?1:s.id==='tongue'?-1:0:0;return Math.max(1,base+delta);}
function consumeAttack(card,turn){var s=state(card);if(active(card,turn)&&['surge','tongue','fineprint','lane'].includes(s.id))clear(card);}
function beforeDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='microphone'){clear(card);return amount+1;}return amount;}
function afterDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='shield'){clear(card);return Math.max(0,amount-1);}return amount;}
function begin(card,turn){var s=state(card);if(!s)return null;if(turn>s.expires){clear(card);return null;}if(!s.ticksLeft||turn<s.starts||s.lastTick===turn)return null;s.lastTick=turn;s.ticksLeft--;var result={id:s.id,source:s.source,damage:s.id==='archive'?1:0,heal:s.id==='coffee'?1:0};if(!s.ticksLeft)clear(card);return result;}
function end(card,turn){var s=state(card);if(s&&!s.ticksLeft&&turn>=s.expires)clear(card);}
function afterHit(attacker,target,context){var id=attacker.basicAbility,def=definition(id);if(!def||context.ownTurn<(attacker.basicReadyTurn||0)||context.damage<=0||context.attackerHealth<=0)return null;var self=def.target==='self',card=self?attacker:target;if(!card||!self&&context.targetHealth<=0)return null;if(state(card))return null;var utility=def.instant?useUtility(id,context.team,context.actions,context.random):null;if(def.instant&&!utility)return null;if(!grant(card,id,self?context.ownTurn:context.rivalTurn,context.source))return null;if(def.instant){card.basicStatus.expires=context.ownTurn;card.basicStatus.outcome=utility.name;}attacker.basicReadyTurn=context.ownTurn+2;return {id:id,card:card,utility:utility};}
// Hooks puros compartidos por ambos motores; no consultan el reloj ni azar global.
function supportCost(card,turn){return active(card,turn)&&state(card).id==='paperwork'?1:0;}
function consumeSupport(card,turn){if(supportCost(card,turn))clear(card);}
function canEmpty(card,turn){return !(active(card,turn)&&state(card).id==='lane');}
function pierces(card,turn){return active(card,turn)&&state(card).id==='fineprint';}
function guardedDamage(amount,guarded,piercing){return guarded?Math.min(amount,Math.ceil(amount/2)+(piercing?1:0)):amount;}
function redirect(field,target,turn){if(!target)return null;var protector=field.find(function(c){return c!==target&&active(c,turn)&&state(c).id==='escort';});if(protector){clear(protector);return protector;}return target;}
function passive(card,turn,votes){var s=state(card);if(s&&s.id==='acta'&&turn>s.appliedTurn&&active(card,turn)){clear(card);return Math.max(0,votes-1);}return votes;}
function bank(field,turn,tdp){if(tdp<1||field.some(function(c){var s=state(c);return s&&s.id==='bank'&&s.banked;}))return tdp;var c=field.find(function(c){var s=state(c);return s&&s.id==='bank'&&s.appliedTurn===turn;});if(c){c.basicStatus.banked=1;return tdp-1;}return tdp;}
function collect(field,turn){var amount=0;field.forEach(function(c){var s=state(c);if(s&&s.id==='bank'&&turn>s.appliedTurn){amount+=s.banked||0;clear(c);}});return Math.min(1,amount);}
function utilityCandidates(id,team,actions){if(!team)return [];if(id==='summon'){if(team.hand.filter(function(c){return !c.action;}).length>=2)return [];return team.deck.filter(function(c){return !c.action&&(c.rarity||c.r)==='comun';}).slice(0,1);}if(id==='fasttrack'){if(team.fasttrackUsed)return [];return team.deck.filter(function(c){var a=actions&&actions[c.id||c.k];return c.action&&a&&!a.oncePerBattle&&['heal','guard','boost'].includes(a.effect)&&(c.availableTurn||0)-team.turn>=2;});}return [];}
function useUtility(id,team,actions,random){var candidates=utilityCandidates(id,team,actions);if(!candidates.length)return false;var chosen=candidates[0];if(id==='summon'){team.deck.splice(team.deck.indexOf(chosen),1);team.hand.push(chosen);}else{if(candidates.length>1){if(typeof random!=='function')throw Error('Falta azar verificado para Ventanilla rápida');var roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('Azar no válido');chosen=candidates[Math.floor(roll*candidates.length)];}chosen.availableTurn--;team.fasttrackUsed=true;}return {name:id==='summon'?'Un orador común':actions[chosen.id||chosen.k].n};}
function view(card,turn){var s=state(card);if(!s)return null;var d=definition(s.id),timing=definition(s.id).instant?'Efecto aplicado'+(s.outcome?' a '+s.outcome:'')+'; el icono permanece hasta cerrar este turno.':s.id==='bank'?(s.banked?'1 TdP reservado para el próximo turno.':'Reserva pendiente al cerrar este turno si sobra TdP.'):s.id==='acta'?'Se consume al sumar los votos de su próximo turno.':s.id==='escort'?'Se consume al desviar un básico; caduca al terminar su siguiente turno.':s.id==='paperwork'?'Se consume al pagar la defensa o curación; caduca al terminar su siguiente turno.':s.ticksLeft?'Quedan '+s.ticksLeft+' pulsos al comenzar sus turnos.':s.id==='surge'&&turn<s.starts?'Se activa en su próximo turno propio.':'Se consume con el básico correspondiente; caduca al terminar '+(turn===s.expires?'este':'su próximo')+' turno propio.';return {id:s.id,name:d.name,polarity:d.polarity,count:s.ticksLeft||1,text:d.name+'. '+d.description+' '+timing+' No admite otro estado básico mientras permanezca activo.'};}
function symbol(id){var paths={surge:'M5 16V9l4 3 4-8 6 5v7ZM5 20h14',coffee:'M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM17 9h2a3 3 0 0 1 0 6h-2M7 2v3m4-3v3',archive:'M4 5h16v15H4ZM8 5V2m8 3V2M7 10h10M7 14h6M7 17h8',tongue:'M4 4h16v12h-6l-5 4v-4H4ZM8 8l8 5m0-5-8 5',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6',acta:'M5 3h14v18H5ZM8 7h8M8 11h8M8 15h4m3 1 5 5m0-5-5 5',paperwork:'M4 4h11v14H4ZM8 8h3M8 12h3M15 7h5v14H9v-3',escort:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6ZM8 12h8m-5-3-3 3 3 3',fineprint:'M4 3h11v18H4ZM7 7h5M7 11h4m6 2 4 4m-6 3a4 4 0 1 0 0-8 4 4 0 0 0 0 8',bank:'M4 11h16v10H4ZM3 8l9-5 9 5ZM8 14v4m4-4v4m4-4v4',summon:'M3 4h10v15H3ZM16 8h5v13H9v-2M6 8h4m-2 5v4m-2-2h4',fasttrack:'M3 4h9v15H3ZM6 8h3m-3 4h3m7-10 5 3-5 3m0-3h-2M17 12v4l3 2m-3 4a6 6 0 1 0 0-12 6 6 0 0 0 0 12',lane:'M4 5h16v12h-7l-4 4v-4H4ZM8 9h8m-3-3 3 3-3 3',microphone:'M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM6 10v2a6 6 0 0 0 12 0v-2M12 18v4M20 3v4m-2-2h4'};return '<svg class="basic-effect-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.shield)+'"/></svg>';}
var api={version:VERSION,forVersion:function(version){return version===VERSION?api:version===Legacy.version?Legacy:null;},supportCost:supportCost,consumeSupport:consumeSupport,canEmpty:canEmpty,pierces:pierces,guardedDamage:guardedDamage,redirect:redirect,passive:passive,bank:bank,collect:collect,utilityCandidates:utilityCandidates,definitions:definitions,assignments:assignments,ability:ability,definition:definition,state:state,clear:clear,reset:reset,grant:grant,active:active,normalZ:normalZ,consumeAttack:consumeAttack,beforeDefense:beforeDefense,afterDefense:afterDefense,begin:begin,end:end,afterHit:afterHit,view:view,symbol:symbol};return api;
});

},
"js/basic-effects-v1.js":function(require,module,exports){
/* Estados de ataques básicos: una plaza por orador, reglas compartidas y sin azar. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleBasicEffectsV1=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var VERSION='basic1';
var definitions={
 surge:{name:'Se viene arriba',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, gana +1 Zasca para su básico del próximo turno propio. Caduca al terminar ese turno.'},
 coffee:{name:'Café parlamentario',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, recupera 1 Aguante al comenzar su próximo turno propio, sin superar su máximo.'},
 archive:{name:'Hemeroteca insistente',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva pierde 1 Aguante al comienzo de sus dos próximos turnos propios.'},
 tongue:{name:'Lengua de trapo',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el siguiente básico del rival que sobreviva tiene −1 Zasca, con mínimo de 1. Caduca al terminar su siguiente turno.'},
 shield:{name:'Argumentario plastificado',polarity:'positive',target:'self',description:'Tras causar daño con un básico a un orador, absorbe 1 punto del siguiente básico recibido, después de la defensa. Caduca al terminar su siguiente turno.'},
 microphone:{name:'Micrófono indiscreto',polarity:'negative',target:'rival',description:'Tras causar daño con un básico, el rival que sobreviva recibe +1 de daño del próximo básico que lo golpee, antes de la defensa. Caduca al terminar su siguiente turno.'}
};
// Cada asignación responde a coste/función de juego, no es una afirmación sobre la persona.
var groups={
 surge:['toni-canto','dolors-montserrat','fatima-banez','quim-torra','andrea-levy','oscar-puente','pablo-echenique','jordi-turull','gabriel-rufian','marine-le-pen'],
 coffee:['isabel-garcia-tejerina','juan-vicente-herrera','meritxell-batet','roger-torrent','esteban-gonzalez-pons','reyes-maroto','soraya-saenz-de-santamaria','rocio-monasterio','joe-biden','hillary-clinton','vladimir-putin','isabel-diaz-ayuso'],
 archive:['nacho-alvarez','miguel-arias-canete','carmen-calvo','jordi-sanchez','marta-rivera-de-la-cruz','pilar-llop','inigo-errejon','julio-anguita','cristobal-montoro','marta-rovira','cayetana-alvarez-de-toledo','nadia-calvino'],
 tongue:['rafael-hernando','javier-maroto','rafael-catala','carme-forcadell','borja-semper','susana-diaz','monica-garcia','dolores-de-cospedal','miriam-nogueras','pilar-alegria','nigel-farage','recep-tayyip-erdogan'],
 shield:['ana-botella','sara-gimenez','luis-de-guindos','maria-jesus-montero','santiago-abascal','ada-colau','bernie-sanders','matteo-salvini','nicolas-maduro','angela-merkel','emmanuel-macron','yolanda-diaz'],
 microphone:['marta-lois','alfonso-alonso','inigo-mendez-de-vigo','pere-aragones','cuca-gamarra','patxi-lopez','javier-milei','kamala-harris','boris-johnson']
};
var assignments={};Object.keys(groups).forEach(function(id){groups[id].forEach(function(card){if(assignments[card])throw Error('Habilidad repetida: '+card);assignments[card]=id;});});
function ability(id){return Object.hasOwn(assignments,id)?assignments[id]:null;}
function definition(id){return Object.hasOwn(definitions,id)?definitions[id]:null;}
function state(card){var s=card&&card.basicStatus;return s&&definition(s.id)&&Number.isSafeInteger(s.appliedTurn)&&Number.isSafeInteger(s.expires)?s:null;}
function clear(card){delete card.basicStatus;}
function reset(card){clear(card);delete card.basicReadyTurn;}
function grant(card,id,turn,source){if(state(card)||!definition(id))return false;var pulse=id==='archive'?2:id==='coffee'?1:0;card.basicStatus={id:id,appliedTurn:turn,starts:id==='surge'||pulse?turn+1:turn,expires:turn+(pulse||1),source:source,lastTick:turn,...(pulse?{ticksLeft:pulse}:{})};return true;}
function active(card,turn){var s=state(card);return !!s&&turn>=s.starts&&turn<=s.expires;}
function normalZ(card,turn,base){var s=state(card),delta=active(card,turn)?s.id==='surge'?1:s.id==='tongue'?-1:0:0;return Math.max(1,base+delta);}
function consumeAttack(card,turn){var s=state(card);if(active(card,turn)&&['surge','tongue'].includes(s.id))clear(card);}
function beforeDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='microphone'){clear(card);return amount+1;}return amount;}
function afterDefense(card,turn,amount){var s=state(card);if(amount>0&&active(card,turn)&&s.id==='shield'){clear(card);return Math.max(0,amount-1);}return amount;}
function begin(card,turn){var s=state(card);if(!s)return null;if(turn>s.expires){clear(card);return null;}if(!s.ticksLeft||turn<s.starts||s.lastTick===turn)return null;s.lastTick=turn;s.ticksLeft--;var result={id:s.id,source:s.source,damage:s.id==='archive'?1:0,heal:s.id==='coffee'?1:0};if(!s.ticksLeft)clear(card);return result;}
function end(card,turn){var s=state(card);if(s&&!s.ticksLeft&&turn>=s.expires)clear(card);}
function afterHit(attacker,target,context){var id=attacker.basicAbility,def=definition(id);if(!def||context.ownTurn<(attacker.basicReadyTurn||0)||context.damage<=0||context.attackerHealth<=0)return null;var self=def.target==='self',card=self?attacker:target;if(!card||!self&&context.targetHealth<=0)return null;if(!grant(card,id,self?context.ownTurn:context.rivalTurn,context.source))return null;attacker.basicReadyTurn=context.ownTurn+2;return {id:id,card:card};}
function view(card,turn){var s=state(card);if(!s)return null;var d=definition(s.id),timing=s.ticksLeft?'Quedan '+s.ticksLeft+' pulsos al comenzar sus turnos.':s.id==='surge'&&turn<s.starts?'Se activa en su próximo turno propio.':'Se consume con el básico correspondiente; caduca al terminar '+(turn===s.expires?'este':'su próximo')+' turno propio.';return {id:s.id,name:d.name,polarity:d.polarity,count:s.ticksLeft||1,text:d.name+'. '+d.description+' '+timing+' No admite otro estado básico mientras permanezca activo.'};}
function symbol(id){var paths={surge:'M5 16V9l4 3 4-8 6 5v7ZM5 20h14',coffee:'M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM17 9h2a3 3 0 0 1 0 6h-2M7 2v3m4-3v3',archive:'M4 5h16v15H4ZM8 5V2m8 3V2M7 10h10M7 14h6M7 17h8',tongue:'M4 4h16v12h-6l-5 4v-4H4ZM8 8l8 5m0-5-8 5',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6',microphone:'M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM6 10v2a6 6 0 0 0 12 0v-2M12 18v4M20 3v4m-2-2h4'};return '<svg class="basic-effect-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.shield)+'"/></svg>';}
return {version:VERSION,definitions:definitions,assignments:assignments,ability:ability,definition:definition,state:state,clear:clear,reset:reset,grant:grant,active:active,normalZ:normalZ,consumeAttack:consumeAttack,beforeDefense:beforeDefense,afterDefense:afterDefense,begin:begin,end:end,afterHit:afterHit,view:view,symbol:symbol};
});

},
"_dev/online/progression.cjs":function(require,module,exports){
'use strict';
const Objectives=require('../../js/objectives.js'),Mastery=require('../../js/legendary-mastery.js'),{cards}=require('../market/catalog.cjs');
function appearance(profile,id){
 const gold=id==='donald-trump'&&profile?.dtGoldUnlocked===true&&profile.dtGoldActive===true;
 let confetti=false;try{confetti=!!profile&&Mastery.enabled(profile,id);}catch{}
 return {gold,appearance:confetti?'confetti':gold?'golden':'normal'};
}
function progress(profile,state,side,now){
 const own=state.players[side],foe=state.players[1-side],win=state.winner===side,leader=own.leader;
 const event={win,mode:state.mode,votes:own.votes,enemyVotes:foe.votes,leader,doctrine:cards.find(c=>c.id===leader)?.pa};
 const updated={...profile,objectiveCatalog:cards};updated.objectives=Objectives.record(updated,event,now);
 updated.objectives=Objectives.snapshot(updated,cards,now);
 if(win&&Mastery.eligible(leader))updated.leaderMastery=Mastery.recordWin(updated,leader);
 const dtWins=(profile.dtWins||0)+(win&&state.mode==='ranked'&&leader==='donald-trump'?1:0);
 return {objectives:updated.objectives,leaderMastery:updated.leaderMastery||null,dtWins,dtGoldUnlocked:!!profile.dtGoldUnlocked||dtWins>=10};
}
module.exports={appearance,progress};

},
"js/objectives.js":function(require,module,exports){
/* Misiones por calendario y logros permanentes. Sin efectos de almacenamiento. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleObjectives=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var TYPES=['daily','weekly','monthly'],COUNTS=[7,10,16],LABELS=['Diarios','Semanales','Mensuales'];
function calendar(now){var p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now)),v={};p.forEach(function(x){v[x.type]=x.value;});var day=v.year+'-'+v.month+'-'+v.day,d=new Date(day+'T12:00:00Z'),offset=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-offset);return [day,d.toISOString().slice(0,10),day.slice(0,7)];}
var templates=[['games','Juega debates',1],['wins','Gana debates',1],['votes','Consigue votos',100],['normal','Gana en Normal',1],['ranked','Gana en Clasificatoria',1],['rapida','Gana partidas rápidas',1],['liga','Gana en Liga',1],['majority','Gana con 100 votos',1],['close','Gana por menos de 25 votos',1],['landslide','Gana por 50 votos de diferencia',1],['doctrines','Gana con doctrinas distintas',2],['leaders','Gana con líderes distintos',2],['games','Participa en más debates',3],['votes','Acumula votos parlamentarios',250],['wins','Encadena tu progreso de victorias',3],['ranked','Afianza tu Clasificatoria',3]];
function quests(type,key,limits){var n=TYPES.indexOf(type),count=COUNTS[n],seed=Number(key.replace(/-/g,'')),out=[];for(var i=0;i<count;i++){var t=templates[(i+(seed%3))%templates.length],difficulty=n===0?(i<3?0:i<5?1:i===5?2:3):n===1?(i<3?0:i<6?1:i<8?2:3):Math.floor(i/4),scale=[1,5,18][n],target=t[2]*scale*(1+difficulty);if(t[0]==='leaders'||t[0]==='doctrines')target=Math.min(4+n,target,limits&&limits[t[0]]||4+n);out.push({id:String(i),metric:t[0],title:t[1],target:target,difficulty:difficulty,fs:[15,30,50,75][difficulty]*(n+1)});}return out;}
function fresh(){return {version:1,periods:{},archive:[],totals:{},leaders:[],doctrines:[],leaderWins:{},claimed:[]};}
function metric(s,k){return k==='leaders'?s.leaders.length:k==='doctrines'?s.doctrines.length:(s.totals[k]||0);}
function rewards(type){return type==='daily'?[{at:7,kind:'diario'}]:type==='weekly'?[{at:10,kind:'semanal'}]:[{at:8,kind:'raro'},{at:16,kind:'legendario'}];}
function completed(p){return quests(p.type,p.key,p.limits).filter(function(q){return metric(p,q.metric)>=q.target;}).length;}
function sync(profile,now){var s=profile.objectives?JSON.parse(JSON.stringify(profile.objectives)):fresh(),keys=calendar(now===undefined?Date.now():now);TYPES.forEach(function(type,i){var old=s.periods[type];if(old&&old.key!==keys[i]){if(quests(type,old.key,old.limits).some(function(q){return metric(old,q.metric)>=q.target&&old.claimed.indexOf(q.id)<0;})||rewards(type).some(function(r){return completed(old)>=r.at&&old.claimed.indexOf('bar'+r.at)<0;}))s.archive.push(old);old=null;}if(!old){var available=Array.from(new Set(profile.album||[])),doctrines=Array.from(new Set((profile.objectiveCatalog||[]).filter(function(c){return available.indexOf(c.id)>=0;}).map(function(c){return c.pa;})));s.periods[type]={type:type,key:keys[i],totals:{},leaders:[],doctrines:[],claimed:[],limits:{leaders:Math.max(1,Math.min(4+i,available.length||1)),doctrines:Math.max(1,Math.min(4+i,doctrines.length||1))}};}});return s;}
function record(profile,event,now){var s=sync(profile,now),all=[s].concat(TYPES.map(function(t){return s.periods[t];}));all.forEach(function(p){function inc(k,n){p.totals[k]=(p.totals[k]||0)+n;}inc('games',1);inc('votes',Math.max(0,Math.floor(event.votes||0)));if(event.win){inc('wins',1);inc(event.mode,1);if(event.votes>=100)inc('majority',1);var margin=event.votes-event.enemyVotes;if(margin<25)inc('close',1);if(margin>=50)inc('landslide',1);if(event.leader&&p.leaders.indexOf(event.leader)<0)p.leaders.push(event.leader);if(event.doctrine&&p.doctrines.indexOf(event.doctrine)<0)p.doctrines.push(event.doctrine);}});if(event.win&&event.leader)s.leaderWins[event.leader]=(s.leaderWins[event.leader]||0)+1;return s;}
function achievements(profile,cards){var s=sync(profile),out=[],unique=new Set(profile.album),rarities={};cards.forEach(function(c){if(unique.has(c.id))rarities[c.r]=(rarities[c.r]||0)+1;});function add(id,section,title,value,steps){out.push({id:id,section:section,title:title,value:value,steps:steps});}
add('wins','General','Victorias parlamentarias',profile.w,[1,10,25,100,250]);add('games','General','Debates disputados',profile.w+profile.l,[5,25,100,500]);add('ranked','Clasificatorias','Victorias en Clasificatoria',s.totals.ranked||0,[5,25,100,250]);add('elo','Clasificatorias','Alcanza Elo',Math.max(profile.elo,s.totals.elo||0),[250,500,1000,2500]);add('collection','Colección','Políticos diferentes',Math.max(unique.size,s.totals.collection||0),[10,25,50,100,120]);add('legendary','Colección','Legendarios diferentes',Math.max(rarities.legendario||0,s.totals.legendary||0),[1,3,6,12]);add('doctrines','Gabinetes y doctrinas','Vence con distintas doctrinas',s.doctrines.length,[2,4,6]);add('liga','Liga','Victorias en Liga',s.totals.liga||0,[5,25,100]);cards.forEach(function(c){var value=Math.max(s.leaderWins[c.id]||0,profile.leaderMastery&&profile.leaderMastery.wins[c.id]||0);add('leader:'+c.id,'Líderes','Victorias con '+c.n+' como líder',value,[25,100,250]);});if(profile.dtGoldUnlocked)add('gold-secret','Secretos','Magnate Dorado',1,[1]);return out;}
function snapshot(profile,cards,now){var s=sync(Object.assign({},profile,{objectiveCatalog:cards}),now);var copy=Object.assign({},profile,{objectives:s});achievements(copy,cards).forEach(function(a){if(['elo','collection','legendary'].indexOf(a.id)>=0)s.totals[a.id]=a.value;});return s;}
function claim(profile,id,now){var s=sync(profile,now),parts=id.split('/'),p=TYPES.indexOf(parts[0])>=0?(s.periods[parts[0]].key===parts[1]?s.periods[parts[0]]:s.archive.find(function(x){return x.type===parts[0]&&x.key===parts[1];})):null;if(!p||p.claimed.indexOf(parts[2])>=0)throw new Error('Recompensa no disponible.');var q=quests(p.type,p.key,p.limits).find(function(q){return q.id===parts[2];}),reward;if(q&&metric(p,q.metric)>=q.target)reward={fs:q.fs};else{var r=rewards(p.type).find(function(r){return 'bar'+r.at===parts[2];});if(r&&completed(p)>=r.at)reward={kind:r.kind};}if(!reward)throw new Error('Completa el objetivo primero.');p.claimed.push(parts[2]);return {state:s,reward:reward};}
function claimAchievement(profile,cards,id,step){var s=snapshot(profile,cards),a=achievements(Object.assign({},profile,{objectives:s}),cards).find(function(a){return a.id===id;}),key=id+'/'+step;if(!a||a.steps.indexOf(step)<0||a.value<step||s.claimed.indexOf(key)>=0)throw new Error('Hito no disponible.');s.claimed.push(key);return {state:s,reward:{fs:id==='gold-secret'||step===250&&id.indexOf('leader:')===0&&cards.some(function(c){return c.id===id.slice(7)&&c.r==='legendario';})?0:step===250&&id.indexOf('leader:')===0?250:50+step},leader:step===250&&id.indexOf('leader:')===0?id.slice(7):null};}
// Select only the current earned reward; never collapse multiple rewards into one claim.
function achievementStage(profile,achievement,saved){
 var s=saved||sync(profile),steps=achievement.steps;
 function claimed(t){return s.claimed.indexOf(achievement.id+'/'+t)>=0||(t===250&&achievement.id.indexOf('leader:')===0&&profile.leaderMastery&&Array.isArray(profile.leaderMastery.unlocked)&&profile.leaderMastery.unlocked.indexOf(achievement.id.slice(7))>=0);}
 var earned=steps.filter(function(t){return achievement.value>=t;}),pending=earned.find(function(t){return !claimed(t);}),last=earned.length?earned[earned.length-1]:null;
 return {pending:pending===undefined?null:pending,claimed:pending===undefined&&last!==null&&claimed(last)?last:null,target:pending===undefined?(steps.find(function(t){return achievement.value<t;})||steps[steps.length-1]):pending};
}
function validate(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.version!==1||!raw.periods||typeof raw.periods!=='object'||Array.isArray(raw.periods)||!Array.isArray(raw.archive)||!raw.totals||!Array.isArray(raw.leaders)||!Array.isArray(raw.doctrines)||!raw.leaderWins||!Array.isArray(raw.claimed))throw new Error('Progreso de objetivos no válido.');function numbers(o){if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(function(k){return !Number.isSafeInteger(o[k])||o[k]<0;}))throw new Error('Contadores de objetivos no válidos.');}function strings(a){if(!Array.isArray(a)||new Set(a).size!==a.length||a.some(function(x){return typeof x!=='string'||x.length>150;}))throw new Error('Registro de objetivos no válido.');}numbers(raw.totals);numbers(raw.leaderWins);strings(raw.leaders);strings(raw.doctrines);strings(raw.claimed);Object.keys(raw.periods).forEach(function(k){if(TYPES.indexOf(k)<0||raw.periods[k].type!==k)throw new Error('Periodo no válido.');});Object.values(raw.periods).concat(raw.archive).forEach(function(p){if(!p||TYPES.indexOf(p.type)<0||typeof p.key!=='string'||!/^\d{4}-\d{2}(-\d{2})?$/.test(p.key))throw new Error('Periodo no válido.');if(p.limits){numbers(p.limits);if(!p.limits.leaders||p.limits.leaders>6||!p.limits.doctrines||p.limits.doctrines>6)throw new Error('Límites no válidos.');}numbers(p.totals);strings(p.leaders);strings(p.doctrines);strings(p.claimed);});return JSON.parse(JSON.stringify(raw));}
return {types:TYPES,labels:LABELS,calendar:calendar,quests:quests,rewards:rewards,completed:completed,metric:metric,sync:sync,record:record,snapshot:snapshot,achievements:achievements,claim:claim,claimAchievement:claimAchievement,achievementStage:achievementStage,validate:validate};
});

},
"js/legendary-mastery.js":function(require,module,exports){
/* Ediciones de confeti: hitos permanentes por victorias con el político como líder. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleMastery=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 var IDS=Object.freeze(['alberto-nunez-feijoo','angela-merkel','barack-obama','boris-johnson','carles-puigdemont','donald-trump','emmanuel-macron','isabel-diaz-ayuso','mariano-rajoy','pedro-sanchez','vladimir-putin','yolanda-diaz']),FINAL=250;
 function eligible(id){return IDS.indexOf(id)>=0;}
 function validate(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||!raw.wins||typeof raw.wins!=='object'||Array.isArray(raw.wins)||!Array.isArray(raw.unlocked)||!Array.isArray(raw.active))throw new Error('El progreso de maestría no es válido.');
  var wins={};Object.keys(raw.wins).forEach(function(id){var n=raw.wins[id];if(!eligible(id)||!Number.isSafeInteger(n)||n<0)throw new Error('Las victorias de maestría no son válidas.');wins[id]=n;});
  function list(values){if(values.length>IDS.length||new Set(values).size!==values.length||values.some(function(id){return !eligible(id);}))throw new Error('Las ediciones de maestría no son válidas.');return values.slice();}
  var unlocked=list(raw.unlocked),active=list(raw.active);
  if(unlocked.some(function(id){return (wins[id]||0)<FINAL;})||active.some(function(id){return unlocked.indexOf(id)<0;}))throw new Error('La edición de confeti no está desbloqueada.');
  return {wins:wins,unlocked:unlocked,active:active};
 }
 function state(profile){return profile.leaderMastery?validate(profile.leaderMastery):{wins:{},unlocked:[],active:[]};}
 function recordWin(profile,id){var s=state(profile);if(!eligible(id))return s;s.wins[id]=Math.min(Number.MAX_SAFE_INTEGER,(s.wins[id]||0)+1);return s;}
 function claim(profile,id){var s=state(profile);if(!eligible(id)||(s.wins[id]||0)<FINAL)throw new Error('Consigue 250 victorias con este político como líder.');if(s.unlocked.indexOf(id)<0)s.unlocked.push(id);return s;}
 function equip(profile,id,on){var s=state(profile);if(s.unlocked.indexOf(id)<0)throw new Error('Primero reclama esta edición.');s.active=s.active.filter(function(x){return x!==id;});if(on)s.active.push(id);return s;}
 function enabled(profile,id){return eligible(id)&&state(profile).active.indexOf(id)>=0;}
 return Object.freeze({ids:IDS,finalWins:FINAL,eligible:eligible,validate:validate,state:state,recordWin:recordWin,claim:claim,equip:equip,enabled:enabled});
});

},
"_dev/online/combat-basic3.cjs":function(require,module,exports){
'use strict';
const crypto=require('node:crypto'),A=require('./actions.cjs'),{cards}=require('../market/catalog.cjs'),Balance=require('../../js/orator-catalog.js'),Legacy=require('./catalog-legacy-stats.cjs'),B=require('../../js/basic-effects-v3.js');
const catalog=Object.fromEntries(cards.map(c=>[c.id,c])),beats={verborrea:'guardia',guardia:'aforado',aforado:'viperina',viperina:'foco',foco:'giro',giro:'verborrea'};
const random=()=>crypto.randomInt(0,0x100000000)/0x100000000,check=(v,m)=>{if(!v)throw Error(m);};
function initial(mode='normal'){return {schema:1,catalogVersion:Balance.balanceVersion,effectsVersion:B.version,ruleset:'actions2',emptyVoteLimit:3,mode,status:'preparing',players:[null,null],side:null,first:null,deadline:null,winner:null,events:[]};}
function log(s,text){s.events.push(text);s.events=s.events.slice(-40);}
function visual(s,kind,data){s.visualSequence=(s.visualSequence||0)+1;s.visualEvents=(s.visualEvents||[]).concat({sequence:s.visualSequence,kind,...data}).slice(-60);}
function doctrine(s,i){const p=s.players[i],l=p.field.find(c=>c.id===p.leader);return l?l.doctrine:null;}
function active(s,i){const own=doctrine(s,i),other=doctrine(s,1-i);return own&&beats[other]!==own?own:null;}
function power(s,i,c){return c.z+(active(s,i)==='guardia'?c.buff:0)+c.buffs.reduce((n,b)=>n+b.value,0);}
function normalPower(s,i,c){const rules=B.forVersion(s.effectsVersion);return rules?rules.normalZ(c,s.players[i].turn,power(s,i,c)):power(s,i,c);}
function strong(p,c){return c.hp>=2&&c.enteredTurn!==null&&(p.turn-c.enteredTurn)%3===2&&c.strongUsedTurn!==p.turn;}
function finish(s,winner,reason){s.status='finished';s.winner=winner;s.reason=reason;s.deadline=null;log(s,(winner===0?'Anfitrión':'Invitado')+' gana: '+reason+'.');}
function victory(s){for(let i=0;i<2;i++)if(s.players[i].votes>=100){finish(s,i,'100 votos');return true;}return false;}
function timeout(s,now){if(s.status==='active'&&now>=s.deadline){finish(s,1-s.side,'inactividad');return true;}return false;}
function expel(s,victim,c,attacker,doc=active(s,victim)){
 const p=s.players[victim];if(doc==='aforado'&&!p.saved.includes(c.uid)){p.saved.push(c.uid);c.hp=['actions1','actions2'].includes(s.ruleset)?3:1;log(s,c.name+' conserva el escaño.');return;}
 visual(s,'expel',{uid:c.uid,side:victim});p.field=p.field.filter(x=>x.uid!==c.uid);B.reset(c);Object.assign(c,{hp:0,ready:false,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null,availableTurn:p.turn+2});p.rest.push(c);
 if(attacker!==null){s.players[attacker].votes+=c.votes;log(s,c.name+' al pasillo: +'+c.votes+' votos.');}
 if(doc==='verborrea')p.refund=2;victory(s);
}
function damage(c,n,s,normal=false,turn=0,piercing=false){if(normal&&s.effectsVersion===B.version)n=B.beforeDefense(c,turn,n);const guarded=!!c.guard;let amount=B.guardedDamage(n,guarded,piercing);if(normal&&s.effectsVersion===B.version)amount=B.afterDefense(c,turn,amount);if(n>0)c.guard=false;c.hp-=amount;if(s)visual(s,'damage',{uid:c.uid,value:amount,guarded});return amount;}
function basicBegin(s,i){if(s.effectsVersion!==B.version)return;const p=s.players[i],doc=active(s,i);for(const c of p.field.slice()){const pulse=B.begin(c,p.turn);if(!pulse)continue;if(pulse.damage){c.hp-=pulse.damage;visual(s,'damage',{uid:c.uid,value:pulse.damage,periodic:true});log(s,c.name+': '+B.definition(pulse.id).name+', −1 Aguante.');if(c.hp<=0)expel(s,i,c,pulse.source,doc);}else if(pulse.heal){const amount=Math.min(pulse.heal,c.maxHp-c.hp);c.hp+=amount;visual(s,'heal',{uid:c.uid,value:amount});log(s,c.name+': Café parlamentario, +'+amount+' Aguante.');}if(s.status!=='active')return;}}
function begin(s,i,now,rng){s.side=i;const p=s.players[i];p.turn++;const banked=s.effectsVersion===B.version?B.collect(p.field,p.turn):0;p.emptyVotesTaken=0;p.silenced=!!p.pendingSilence;p.pendingSilence=false;if(p.silenced)p.silenceImmuneThrough=p.turn+2;
 for(const c of p.field){c.ready=true;c.guard=false;c.buffs=c.buffs.filter(b=>b.until>=p.turn);}
 basicBegin(s,i);if(s.status!=='active')return;
 const recycled=A.recycle(p.rest,p.deck,p.turn,rng);p.rest=recycled.rest;
 if(p.turn===1){p.deck=recycled.deck;if(s.ruleset==='actions2'){const action=p.deck.find(c=>c.action);if(action){p.hand.push(action);p.deck=p.deck.filter(c=>c!==action);}}}else{const next=s.ruleset==='actions2'?A.renewBalanced(p.hand,recycled.deck,p.turn,rng):A.renew(p.hand,recycled.deck,rng);p.hand=next.hand;p.deck=next.deck;}
 p.tdpMax=Math.min(6,p.tdpMax+1);const d=active(s,i);p.tdp=Math.min(8,p.tdpMax+(d==='verborrea'?1+p.refund:0)+(s.ruleset==='actions2'&&p.turn===1&&i!==s.first?1:0)+banked);p.refund=0;if(s.ruleset==='actions2'&&p.turn===1&&i!==s.first)log(s,'Compensación de iniciativa: +1 TdP en el primer turno del segundo jugador.');
 if(d==='foco'){const l=p.field.find(c=>c.id===p.leader);l.hp=Math.min(l.maxHp,l.hp+(['actions1','actions2'].includes(s.ruleset)?1:2));}
 const gain=3+p.field.reduce((n,c)=>n+(s.effectsVersion===B.version?B.passive(c,p.turn,c.votes):c.votes),0);p.votes+=gain;visual(s,'turn',{side:i,value:gain});s.deadline=now+(s.mode==='rapida'?60000:90000);log(s,(i===0?'Anfitrión':'Invitado')+': turno '+p.turn+', +'+gain+' votos.');if(victory(s))return;
 if(p.silenced){log(s,'Moción de censura: turno sin acciones; conserva robo y votos.');end(s,i,now,rng);}
}
function end(s,i,now,rng){if(s.effectsVersion===B.version){const p=s.players[i];p.tdp=B.bank(p.field,p.turn,p.tdp);p.field.forEach(c=>B.end(c,p.turn));}if(active(s,i)==='guardia')s.players[i].field.forEach(c=>c.buff=Math.min(3,c.buff+1));begin(s,1-i,now,rng);}
function ready(s,i,choice,now,rng,profile){check(s.status==='preparing','La partida ya ha comenzado');check(!s.players[i],'Ya estás listo');const valid=A.validateCabinet(choice,[...cards.map(c=>c.id),...A.cards.map(c=>c.id)],cards.map(c=>c.id));
 const revision=s.catalogVersion||Legacy.version;if(![Balance.balanceVersion,Legacy.version].includes(revision))throw Error('Versión de catálogo no compatible.');
 const all=valid.orators.map((id,j)=>{const c=revision===Legacy.version?{...catalog[id],...Legacy.cards[id]}:catalog[id],leader=id===valid.leader,edition=require('./progression.cjs').appearance(profile,id);return {uid:i+'-o'+j,...(s.effectsVersion===B.version?{basicAbility:B.ability(id)}:{}),id,name:c.n,rarity:c.r,doctrine:c.pa,cost:c.c,...edition,z:c.a+(leader?1:0)+(edition.gold?2:0),hp:c.h+(leader?3:0)+(edition.gold?2:0),maxHp:c.h+(leader?3:0)+(edition.gold?2:0),votes:c.v,q:c.q,ready:true,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null};});
 const leader=all.find(c=>c.id===valid.leader),others=A.shuffle(all.filter(c=>c!==leader),rng),actions=valid.actions.map((id,j)=>({uid:i+'-a'+j,id,action:true}));
 s.players[i]={cabinetIds:valid.orators.slice(),cabinetActions:valid.actions.slice(),leader:valid.leader,turn:0,tdp:0,tdpMax:2,votes:0,hand:[leader,others.shift()],deck:A.shuffle([...others,...actions],rng),field:[],rest:[],actionDiscard:[],saved:[],refund:0,usedActions:[],silenced:false};log(s,(i===0?'Anfitrión':'Invitado')+' está listo.');
 if(s.players.every(Boolean)){s.status='active';s.first=rng()<.5?0:1;log(s,'Sorteo: '+(s.first===0?'cara, empieza el anfitrión.':'cruz, empieza el invitado.'));begin(s,s.first,now,rng);}
}
function actionCard(s,i,id,target){const p=s.players[i],foe=s.players[1-i],a=A.byId[id],c=p.hand.find(c=>c.action&&c.id===id);check(a&&c,'Acción fuera de la mano');check((c.availableTurn||0)<=p.turn,'La acción sigue en recuperación');check(p.tdp>=a.cost,'TdP insuficiente');check(p.actionUsedTurn!==p.turn,'Solo una acción por turno');check(!a.oncePerBattle||!p.usedActions.includes(id),'Acción agotada');
 const owners=a.target==='all'?[i,1-i]:[a.target.includes('rival')?1-i:i];let affected=owners.flatMap(owner=>s.players[owner].field.map(c=>({owner,c,doc:active(s,owner)})));if(!a.target.startsWith('all'))affected=affected.filter(x=>x.c.uid===target);
 check(a.effect==='silence'||affected.length,'Objetivo no válido');if(a.effect==='heal')check(affected.some(x=>x.c.hp<x.c.maxHp),'No falta Aguante');if(a.effect==='guard')check(affected.some(x=>!x.c.guard),'Defensa ya activa');
 if(a.effect==='silence'){check(p.field.length===3&&p.field.every(c=>c.ready),'Necesitas tres oradores listos');check(p.votes<foe.votes,'Debes tener menos votos');check(!foe.pendingSilence&&foe.turn>(foe.silenceImmuneThrough??-1),'Rival protegido');foe.pendingSilence=true;p.field.forEach(c=>c.ready=false);}
 const before=affected.map(x=>x.c.hp);visual(s,'action',{side:i,id,discard:!!a.oncePerBattle});
 p.tdp-=a.cost;p.actionUsedTurn=p.turn;p.usedActions.push(id);p.hand=p.hand.filter(x=>x!==c);if(a.oncePerBattle)p.actionDiscard.push(c);else{if(s.ruleset==='actions2')c.availableTurn=p.turn+3;p.deck.push(c);}
 for(const x of affected){if(a.effect==='damage')damage(x.c,a.value,s);if(a.effect==='heal')x.c.hp=Math.min(x.c.maxHp,x.c.hp+a.value);if(a.effect==='guard')x.c.guard=true;if(a.effect==='boost')x.c.buffs.push({value:a.value,until:s.players[x.owner].turn+(x.owner===i?0:1)});}
 affected.forEach((x,j)=>{if(a.effect==='heal')visual(s,'heal',{uid:x.c.uid,value:x.c.hp-before[j]});if(a.effect==='guard')visual(s,'guard',{uid:x.c.uid});});
 const teams=['equipo anfitrión','equipo invitado'],scope=a.effect==='silence'?teams[1-i]:a.target==='all'?'Todos los oradores de ambos equipos':a.target.startsWith('all')?'Todos los oradores del '+teams[owners[0]]:'Orador '+(a.target==='self'?'propio':'rival');
 log(s,require('../../js/action-cards.js').describeAction(a,i===0?'El anfitrión':'El invitado',scope,affected.map((x,j)=>({name:x.c.name,team:teams[x.owner],amount:a.effect==='heal'?x.c.hp-before[j]:before[j]-x.c.hp}))));s.lastAction={side:i,id,discard:!!a.oncePerBattle,turn:p.turn};
 for(const x of affected)if(x.c.hp<=0&&s.status==='active')expel(s,x.owner,x.c,x.owner===i?null:i,x.doc);
}
function apply(original,i,command,now=Date.now(),rng=random,profile){check(i===0||i===1,'Jugador no válido');check(command&&typeof command.type==='string','Acción no válida');if(original.effectsVersion==='basic2')return require('./combat-basic2.cjs').apply(original,i,command,now,rng,profile);if(original.effectsVersion==='basic1')return require('./combat-basic1.cjs').apply(original,i,command,now,rng,profile);const s=structuredClone(original);if(timeout(s,now))return s;
 if(command.type==='ready'){ready(s,i,command.cabinet,now,rng,profile);return s;}
 check(s.status==='active','No hay una partida activa');if(command.type==='resign'){finish(s,1-i,'rendición');return s;}check(s.side===i,'No es tu turno');const p=s.players[i],foe=s.players[1-i];check(!p.silenced,'Turno silenciado');
 if(command.type==='end'){end(s,i,now,rng);return s;}
 if(command.type==='action'){actionCard(s,i,command.id,command.target);return s;}
 if(command.type==='play'){const c=p.hand.find(c=>c.uid===command.uid&&!c.action);check(c,'Cromo fuera de la mano');check(p.field.length<3,'La tribuna está llena');check(c.cost<=p.tdp,'TdP insuficiente');p.hand=p.hand.filter(x=>x!==c);p.field.push(c);B.reset(c);p.tdp-=c.cost;Object.assign(c,{hp:c.maxHp,enteredTurn:p.turn,ready:true,guard:false,buff:0,buffs:[],lastHealTurn:null,strongUsedTurn:null});if(active(s,i)==='guardia'&&s.ruleset!=='actions2')c.buff=1;if(c.id===p.leader&&active(s,i)==='verborrea')p.tdp=Math.min(8,p.tdp+1);visual(s,'card',{uid:c.uid,side:i});log(s,c.name+' entra en la tribuna.');return s;}
 const c=p.field.find(c=>c.uid===command.uid);check(c&&c.ready,'Orador no disponible');
 const supportCost=s.effectsVersion===B.version?B.supportCost(c,p.turn):0;
 if(command.type==='guard'){check(!c.guard,'Defensa ya activa');check(p.tdp>=supportCost,'Necesitas 1 TdP por Papeles traspapelados');p.tdp-=supportCost;B.consumeSupport(c,p.turn);c.guard=true;c.ready=false;visual(s,'guard',{uid:c.uid});log(s,c.name+' se defiende.');return s;}
 if(command.type==='heal'){check(c.hp<c.maxHp&&(c.lastHealTurn===null||p.turn>=c.lastHealTurn+2),'Curación no disponible');check(p.tdp>=supportCost,'Necesitas 1 TdP por Papeles traspapelados');p.tdp-=supportCost;B.consumeSupport(c,p.turn);const amount=Math.min(c.maxHp-c.hp,Math.max(3,Math.ceil((c.maxHp-c.hp)/2)));c.hp+=amount;c.lastHealTurn=p.turn;c.ready=false;visual(s,'heal',{uid:c.uid,value:amount});log(s,c.name+' recupera '+amount+' de Aguante.');return s;}
 check(command.type==='attack','Acción desconocida');check(command.variant==='normal'||command.variant==='strong','Ataque no válido');const powerful=command.variant==='strong';check(!powerful||strong(p,c),'Ataque fuerte no disponible');let target=foe.field.find(c=>c.uid===command.target);const empty=command.target==='empty';check(empty?foe.field.length<3:!!target,'Objetivo no válido');check(!empty||s.emptyVoteLimit==null||(p.emptyVotesTaken||0)<s.emptyVoteLimit,'Límite de resta de votos alcanzado este turno');check(!empty||powerful||s.effectsVersion!==B.version||B.canEmpty(c,p.turn),'Debate encarrilado: elige un orador para el básico');if(target&&!powerful&&s.effectsVersion===B.version){const original=target;target=B.redirect(foe.field,target,foe.turn);if(target!==original){visual(s,'basic-state',{uid:target.uid,effect:'escort'});log(s,target.name+': Yo respondo, desvía el básico.');}}const piercing=!powerful&&s.effectsVersion===B.version&&B.pierces(c,p.turn);const ownDoc=active(s,i),enemyDoc=active(s,1-i);visual(s,'attack',{uid:c.uid,target:target?.uid||null,side:i,strong:powerful});c.ready=false;if(powerful){c.hp--;visual(s,'damage',{uid:c.uid,value:1});c.strongUsedTurn=p.turn;}let amount=powerful?Math.ceil(power(s,i,c)*1.5):normalPower(s,i,c);if(!powerful&&s.effectsVersion===B.version)B.consumeAttack(c,p.turn);if(target&&ownDoc==='viperina'&&target.id===foe.leader)amount+=2;
 if(empty){amount=Math.min(foe.votes,amount,s.emptyVoteLimit==null?Infinity:Math.max(0,s.emptyVoteLimit-(p.emptyVotesTaken||0)));p.emptyVotesTaken=(p.emptyVotesTaken||0)+amount;foe.votes-=amount;visual(s,'votes',{side:1-i,value:-amount});}else{amount=damage(target,amount,s,!powerful,foe.turn,piercing);if(enemyDoc==='giro')damage(c,1,s);}

 if(ownDoc==='foco'&&c.id===p.leader)p.votes++;log(s,c.name+': «'+c.q[powerful?1:0]+'» · '+amount+(empty?' votos retirados.':' de daño.'));if(victory(s))return s;if(target&&target.hp<=0)expel(s,1-i,target,i,enemyDoc);if(s.status==='active'&&c.hp<=0)expel(s,i,c,null,ownDoc);if(s.status==='active'){if(!empty&&!powerful&&s.effectsVersion===B.version){const result=B.afterHit(c,target,{damage:amount,attackerHealth:c.hp,targetHealth:target.hp,ownTurn:p.turn,rivalTurn:foe.turn,source:i,team:p,actions:A.byId,random:rng});if(result){visual(s,'basic-state',{uid:result.card.uid,effect:result.id});log(s,result.card.name+': '+B.definition(result.id).name+(result.utility?' · '+result.utility.name:'')+'.');}}}return s;
}
function project(state,side,revision,now){if(state.effectsVersion==='basic2')return require('./combat-basic2.cjs').project(state,side,revision,now);if(state.effectsVersion==='basic1')return require('./combat-basic1.cjs').project(state,side,revision,now);const s=structuredClone(state);const foe=s.players[1-side];if(foe){foe.handCount=foe.hand.length;foe.deckCount=foe.deck.length;delete foe.hand;delete foe.deck;delete foe.cabinetIds;delete foe.cabinetActions;delete foe.usedActions;delete foe.saved;}
 // Los mazos y su orden nunca se envían, tampoco al dueño.
 for(let i=0;i<2;i++)if(s.players[i])s.players[i].field.forEach(c=>{c.currentZ=power(state,i,c);c.currentNormalZ=normalPower(state,i,c);});
 const own=s.players[side];if(own){own.actionRecovery=own.deck.filter(c=>c.action&&(c.availableTurn||0)>own.turn).map(c=>({id:c.id,turns:c.availableTurn-own.turn}));own.deckCount=own.deck.length;delete own.deck;own.field.forEach(c=>{c.currentZ=power(state,side,c);c.canStrong=strong(own,c);c.charge=c.enteredTurn===null?0:1+(own.turn-c.enteredTurn)%3;});}
 return {...s,you:side,revision,serverNow:now};
}
module.exports={initial,apply,project,timeout,catalog,cards,active,power,normalPower,strong};

},
"_dev/online/combat-basic2.cjs":function(require,module,exports){
'use strict';
const crypto=require('node:crypto'),A=require('./actions.cjs'),{cards}=require('../market/catalog.cjs'),Balance=require('../../js/orator-catalog.js'),Legacy=require('./catalog-legacy-stats.cjs'),B=require('../../js/basic-effects-v2.js');
const catalog=Object.fromEntries(cards.map(c=>[c.id,c])),beats={verborrea:'guardia',guardia:'aforado',aforado:'viperina',viperina:'foco',foco:'giro',giro:'verborrea'};
const random=()=>crypto.randomInt(0,0x100000000)/0x100000000,check=(v,m)=>{if(!v)throw Error(m);};
function initial(mode='normal'){return {schema:1,catalogVersion:Balance.balanceVersion,effectsVersion:B.version,ruleset:'actions2',emptyVoteLimit:3,mode,status:'preparing',players:[null,null],side:null,first:null,deadline:null,winner:null,events:[]};}
function log(s,text){s.events.push(text);s.events=s.events.slice(-40);}
function visual(s,kind,data){s.visualSequence=(s.visualSequence||0)+1;s.visualEvents=(s.visualEvents||[]).concat({sequence:s.visualSequence,kind,...data}).slice(-60);}
function doctrine(s,i){const p=s.players[i],l=p.field.find(c=>c.id===p.leader);return l?l.doctrine:null;}
function active(s,i){const own=doctrine(s,i),other=doctrine(s,1-i);return own&&beats[other]!==own?own:null;}
function power(s,i,c){return c.z+(active(s,i)==='guardia'?c.buff:0)+c.buffs.reduce((n,b)=>n+b.value,0);}
function normalPower(s,i,c){return s.effectsVersion===B.version?B.normalZ(c,s.players[i].turn,power(s,i,c)):power(s,i,c);}
function strong(p,c){return c.hp>=2&&c.enteredTurn!==null&&(p.turn-c.enteredTurn)%3===2&&c.strongUsedTurn!==p.turn;}
function finish(s,winner,reason){s.status='finished';s.winner=winner;s.reason=reason;s.deadline=null;log(s,(winner===0?'Anfitrión':'Invitado')+' gana: '+reason+'.');}
function victory(s){for(let i=0;i<2;i++)if(s.players[i].votes>=100){finish(s,i,'100 votos');return true;}return false;}
function timeout(s,now){if(s.status==='active'&&now>=s.deadline){finish(s,1-s.side,'inactividad');return true;}return false;}
function expel(s,victim,c,attacker,doc=active(s,victim)){
 const p=s.players[victim];if(doc==='aforado'&&!p.saved.includes(c.uid)){p.saved.push(c.uid);c.hp=['actions1','actions2'].includes(s.ruleset)?3:1;log(s,c.name+' conserva el escaño.');return;}
 visual(s,'expel',{uid:c.uid,side:victim});p.field=p.field.filter(x=>x.uid!==c.uid);B.reset(c);Object.assign(c,{hp:0,ready:false,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null,availableTurn:p.turn+2});p.rest.push(c);
 if(attacker!==null){s.players[attacker].votes+=c.votes;log(s,c.name+' al pasillo: +'+c.votes+' votos.');}
 if(doc==='verborrea')p.refund=2;victory(s);
}
function damage(c,n,s,normal=false,turn=0,piercing=false){if(normal&&s.effectsVersion===B.version)n=B.beforeDefense(c,turn,n);const guarded=!!c.guard;let amount=B.guardedDamage(n,guarded,piercing);if(normal&&s.effectsVersion===B.version)amount=B.afterDefense(c,turn,amount);if(n>0)c.guard=false;c.hp-=amount;if(s)visual(s,'damage',{uid:c.uid,value:amount,guarded});return amount;}
function basicBegin(s,i){if(s.effectsVersion!==B.version)return;const p=s.players[i],doc=active(s,i);for(const c of p.field.slice()){const pulse=B.begin(c,p.turn);if(!pulse)continue;if(pulse.damage){c.hp-=pulse.damage;visual(s,'damage',{uid:c.uid,value:pulse.damage,periodic:true});log(s,c.name+': '+B.definition(pulse.id).name+', −1 Aguante.');if(c.hp<=0)expel(s,i,c,pulse.source,doc);}else if(pulse.heal){const amount=Math.min(pulse.heal,c.maxHp-c.hp);c.hp+=amount;visual(s,'heal',{uid:c.uid,value:amount});log(s,c.name+': Café parlamentario, +'+amount+' Aguante.');}if(s.status!=='active')return;}}
function begin(s,i,now,rng){s.side=i;const p=s.players[i];p.turn++;const banked=s.effectsVersion===B.version?B.collect(p.field,p.turn):0;p.emptyVotesTaken=0;p.silenced=!!p.pendingSilence;p.pendingSilence=false;if(p.silenced)p.silenceImmuneThrough=p.turn+2;
 for(const c of p.field){c.ready=true;c.guard=false;c.buffs=c.buffs.filter(b=>b.until>=p.turn);}
 basicBegin(s,i);if(s.status!=='active')return;
 const recycled=A.recycle(p.rest,p.deck,p.turn,rng);p.rest=recycled.rest;
 if(p.turn===1){p.deck=recycled.deck;if(s.ruleset==='actions2'){const action=p.deck.find(c=>c.action);if(action){p.hand.push(action);p.deck=p.deck.filter(c=>c!==action);}}}else{const next=s.ruleset==='actions2'?A.renewBalanced(p.hand,recycled.deck,p.turn,rng):A.renew(p.hand,recycled.deck,rng);p.hand=next.hand;p.deck=next.deck;}
 p.tdpMax=Math.min(6,p.tdpMax+1);const d=active(s,i);p.tdp=Math.min(8,p.tdpMax+(d==='verborrea'?1+p.refund:0)+(s.ruleset==='actions2'&&p.turn===1&&i!==s.first?1:0)+banked);p.refund=0;if(s.ruleset==='actions2'&&p.turn===1&&i!==s.first)log(s,'Compensación de iniciativa: +1 TdP en el primer turno del segundo jugador.');
 if(d==='foco'){const l=p.field.find(c=>c.id===p.leader);l.hp=Math.min(l.maxHp,l.hp+(['actions1','actions2'].includes(s.ruleset)?1:2));}
 const gain=3+p.field.reduce((n,c)=>n+(s.effectsVersion===B.version?B.passive(c,p.turn,c.votes):c.votes),0);p.votes+=gain;visual(s,'turn',{side:i,value:gain});s.deadline=now+(s.mode==='rapida'?60000:90000);log(s,(i===0?'Anfitrión':'Invitado')+': turno '+p.turn+', +'+gain+' votos.');if(victory(s))return;
 if(p.silenced){log(s,'Moción de censura: turno sin acciones; conserva robo y votos.');end(s,i,now,rng);}
}
function end(s,i,now,rng){if(s.effectsVersion===B.version){const p=s.players[i];p.tdp=B.bank(p.field,p.turn,p.tdp);p.field.forEach(c=>B.end(c,p.turn));}if(active(s,i)==='guardia')s.players[i].field.forEach(c=>c.buff=Math.min(3,c.buff+1));begin(s,1-i,now,rng);}
function ready(s,i,choice,now,rng,profile){check(s.status==='preparing','La partida ya ha comenzado');check(!s.players[i],'Ya estás listo');const valid=A.validateCabinet(choice,[...cards.map(c=>c.id),...A.cards.map(c=>c.id)],cards.map(c=>c.id));
 const revision=s.catalogVersion||Legacy.version;if(![Balance.balanceVersion,Legacy.version].includes(revision))throw Error('Versión de catálogo no compatible.');
 const all=valid.orators.map((id,j)=>{const c=revision===Legacy.version?{...catalog[id],...Legacy.cards[id]}:catalog[id],leader=id===valid.leader,edition=require('./progression.cjs').appearance(profile,id);return {uid:i+'-o'+j,...(s.effectsVersion===B.version?{basicAbility:B.ability(id)}:{}),id,name:c.n,rarity:c.r,doctrine:c.pa,cost:c.c,...edition,z:c.a+(leader?1:0)+(edition.gold?2:0),hp:c.h+(leader?3:0)+(edition.gold?2:0),maxHp:c.h+(leader?3:0)+(edition.gold?2:0),votes:c.v,q:c.q,ready:true,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null};});
 const leader=all.find(c=>c.id===valid.leader),others=A.shuffle(all.filter(c=>c!==leader),rng),actions=valid.actions.map((id,j)=>({uid:i+'-a'+j,id,action:true}));
 s.players[i]={cabinetIds:valid.orators.slice(),cabinetActions:valid.actions.slice(),leader:valid.leader,turn:0,tdp:0,tdpMax:2,votes:0,hand:[leader,others.shift()],deck:A.shuffle([...others,...actions],rng),field:[],rest:[],actionDiscard:[],saved:[],refund:0,usedActions:[],silenced:false};log(s,(i===0?'Anfitrión':'Invitado')+' está listo.');
 if(s.players.every(Boolean)){s.status='active';s.first=rng()<.5?0:1;log(s,'Sorteo: '+(s.first===0?'cara, empieza el anfitrión.':'cruz, empieza el invitado.'));begin(s,s.first,now,rng);}
}
function actionCard(s,i,id,target){const p=s.players[i],foe=s.players[1-i],a=A.byId[id],c=p.hand.find(c=>c.action&&c.id===id);check(a&&c,'Acción fuera de la mano');check((c.availableTurn||0)<=p.turn,'La acción sigue en recuperación');check(p.tdp>=a.cost,'TdP insuficiente');check(p.actionUsedTurn!==p.turn,'Solo una acción por turno');check(!a.oncePerBattle||!p.usedActions.includes(id),'Acción agotada');
 const owners=a.target==='all'?[i,1-i]:[a.target.includes('rival')?1-i:i];let affected=owners.flatMap(owner=>s.players[owner].field.map(c=>({owner,c,doc:active(s,owner)})));if(!a.target.startsWith('all'))affected=affected.filter(x=>x.c.uid===target);
 check(a.effect==='silence'||affected.length,'Objetivo no válido');if(a.effect==='heal')check(affected.some(x=>x.c.hp<x.c.maxHp),'No falta Aguante');if(a.effect==='guard')check(affected.some(x=>!x.c.guard),'Defensa ya activa');
 if(a.effect==='silence'){check(p.field.length===3&&p.field.every(c=>c.ready),'Necesitas tres oradores listos');check(p.votes<foe.votes,'Debes tener menos votos');check(!foe.pendingSilence&&foe.turn>(foe.silenceImmuneThrough??-1),'Rival protegido');foe.pendingSilence=true;p.field.forEach(c=>c.ready=false);}
 const before=affected.map(x=>x.c.hp);visual(s,'action',{side:i,id,discard:!!a.oncePerBattle});
 p.tdp-=a.cost;p.actionUsedTurn=p.turn;p.usedActions.push(id);p.hand=p.hand.filter(x=>x!==c);if(a.oncePerBattle)p.actionDiscard.push(c);else{if(s.ruleset==='actions2')c.availableTurn=p.turn+3;p.deck.push(c);}
 for(const x of affected){if(a.effect==='damage')damage(x.c,a.value,s);if(a.effect==='heal')x.c.hp=Math.min(x.c.maxHp,x.c.hp+a.value);if(a.effect==='guard')x.c.guard=true;if(a.effect==='boost')x.c.buffs.push({value:a.value,until:s.players[x.owner].turn+(x.owner===i?0:1)});}
 affected.forEach((x,j)=>{if(a.effect==='heal')visual(s,'heal',{uid:x.c.uid,value:x.c.hp-before[j]});if(a.effect==='guard')visual(s,'guard',{uid:x.c.uid});});
 const teams=['equipo anfitrión','equipo invitado'],scope=a.effect==='silence'?teams[1-i]:a.target==='all'?'Todos los oradores de ambos equipos':a.target.startsWith('all')?'Todos los oradores del '+teams[owners[0]]:'Orador '+(a.target==='self'?'propio':'rival');
 log(s,require('../../js/action-cards.js').describeAction(a,i===0?'El anfitrión':'El invitado',scope,affected.map((x,j)=>({name:x.c.name,team:teams[x.owner],amount:a.effect==='heal'?x.c.hp-before[j]:before[j]-x.c.hp}))));s.lastAction={side:i,id,discard:!!a.oncePerBattle,turn:p.turn};
 for(const x of affected)if(x.c.hp<=0&&s.status==='active')expel(s,x.owner,x.c,x.owner===i?null:i,x.doc);
}
function apply(original,i,command,now=Date.now(),rng=random,profile){check(i===0||i===1,'Jugador no válido');check(command&&typeof command.type==='string','Acción no válida');if(original.effectsVersion==='basic1')return require('./combat-basic1.cjs').apply(original,i,command,now,rng,profile);const s=structuredClone(original);if(timeout(s,now))return s;
 if(command.type==='ready'){ready(s,i,command.cabinet,now,rng,profile);return s;}
 check(s.status==='active','No hay una partida activa');if(command.type==='resign'){finish(s,1-i,'rendición');return s;}check(s.side===i,'No es tu turno');const p=s.players[i],foe=s.players[1-i];check(!p.silenced,'Turno silenciado');
 if(command.type==='end'){end(s,i,now,rng);return s;}
 if(command.type==='action'){actionCard(s,i,command.id,command.target);return s;}
 if(command.type==='play'){const c=p.hand.find(c=>c.uid===command.uid&&!c.action);check(c,'Cromo fuera de la mano');check(p.field.length<3,'La tribuna está llena');check(c.cost<=p.tdp,'TdP insuficiente');p.hand=p.hand.filter(x=>x!==c);p.field.push(c);B.reset(c);p.tdp-=c.cost;Object.assign(c,{hp:c.maxHp,enteredTurn:p.turn,ready:true,guard:false,buff:0,buffs:[],lastHealTurn:null,strongUsedTurn:null});if(active(s,i)==='guardia'&&s.ruleset!=='actions2')c.buff=1;if(c.id===p.leader&&active(s,i)==='verborrea')p.tdp=Math.min(8,p.tdp+1);visual(s,'card',{uid:c.uid,side:i});log(s,c.name+' entra en la tribuna.');return s;}
 const c=p.field.find(c=>c.uid===command.uid);check(c&&c.ready,'Orador no disponible');
 const supportCost=s.effectsVersion===B.version?B.supportCost(c,p.turn):0;
 if(command.type==='guard'){check(!c.guard,'Defensa ya activa');check(p.tdp>=supportCost,'Necesitas 1 TdP por Papeles traspapelados');p.tdp-=supportCost;B.consumeSupport(c,p.turn);c.guard=true;c.ready=false;visual(s,'guard',{uid:c.uid});log(s,c.name+' se defiende.');return s;}
 if(command.type==='heal'){check(c.hp<c.maxHp&&(c.lastHealTurn===null||p.turn>=c.lastHealTurn+2),'Curación no disponible');check(p.tdp>=supportCost,'Necesitas 1 TdP por Papeles traspapelados');p.tdp-=supportCost;B.consumeSupport(c,p.turn);const amount=Math.min(c.maxHp-c.hp,Math.max(3,Math.ceil((c.maxHp-c.hp)/2)));c.hp+=amount;c.lastHealTurn=p.turn;c.ready=false;visual(s,'heal',{uid:c.uid,value:amount});log(s,c.name+' recupera '+amount+' de Aguante.');return s;}
 check(command.type==='attack','Acción desconocida');check(command.variant==='normal'||command.variant==='strong','Ataque no válido');const powerful=command.variant==='strong';check(!powerful||strong(p,c),'Ataque fuerte no disponible');let target=foe.field.find(c=>c.uid===command.target);const empty=command.target==='empty';check(empty?foe.field.length<3:!!target,'Objetivo no válido');check(!empty||s.emptyVoteLimit==null||(p.emptyVotesTaken||0)<s.emptyVoteLimit,'Límite de resta de votos alcanzado este turno');check(!empty||powerful||s.effectsVersion!==B.version||B.canEmpty(c,p.turn),'Debate encarrilado: elige un orador para el básico');if(target&&!powerful&&s.effectsVersion===B.version){const original=target;target=B.redirect(foe.field,target,foe.turn);if(target!==original){visual(s,'basic-state',{uid:target.uid,effect:'escort'});log(s,target.name+': Yo respondo, desvía el básico.');}}const piercing=!powerful&&s.effectsVersion===B.version&&B.pierces(c,p.turn);const ownDoc=active(s,i),enemyDoc=active(s,1-i);visual(s,'attack',{uid:c.uid,target:target?.uid||null,side:i,strong:powerful});c.ready=false;if(powerful){c.hp--;visual(s,'damage',{uid:c.uid,value:1});c.strongUsedTurn=p.turn;}let amount=powerful?Math.ceil(power(s,i,c)*1.5):normalPower(s,i,c);if(!powerful&&s.effectsVersion===B.version)B.consumeAttack(c,p.turn);if(target&&ownDoc==='viperina'&&target.id===foe.leader)amount+=2;
 if(empty){amount=Math.min(foe.votes,amount,s.emptyVoteLimit==null?Infinity:Math.max(0,s.emptyVoteLimit-(p.emptyVotesTaken||0)));p.emptyVotesTaken=(p.emptyVotesTaken||0)+amount;foe.votes-=amount;visual(s,'votes',{side:1-i,value:-amount});}else{amount=damage(target,amount,s,!powerful,foe.turn,piercing);if(enemyDoc==='giro')damage(c,1,s);}

 if(ownDoc==='foco'&&c.id===p.leader)p.votes++;log(s,c.name+': «'+c.q[powerful?1:0]+'» · '+amount+(empty?' votos retirados.':' de daño.'));if(victory(s))return s;if(target&&target.hp<=0)expel(s,1-i,target,i,enemyDoc);if(s.status==='active'&&c.hp<=0)expel(s,i,c,null,ownDoc);if(s.status==='active'){if(!empty&&!powerful&&s.effectsVersion===B.version){const result=B.afterHit(c,target,{damage:amount,attackerHealth:c.hp,targetHealth:target.hp,ownTurn:p.turn,rivalTurn:foe.turn,source:i,team:p,actions:A.byId,random:rng});if(result){visual(s,'basic-state',{uid:result.card.uid,effect:result.id});log(s,result.card.name+': '+B.definition(result.id).name+(result.utility?' · '+result.utility.name:'')+'.');}}}return s;
}
function project(state,side,revision,now){if(state.effectsVersion==='basic1')return require('./combat-basic1.cjs').project(state,side,revision,now);const s=structuredClone(state);const foe=s.players[1-side];if(foe){foe.handCount=foe.hand.length;foe.deckCount=foe.deck.length;delete foe.hand;delete foe.deck;delete foe.cabinetIds;delete foe.cabinetActions;delete foe.usedActions;delete foe.saved;}
 // Los mazos y su orden nunca se envían, tampoco al dueño.
 for(let i=0;i<2;i++)if(s.players[i])s.players[i].field.forEach(c=>{c.currentZ=power(state,i,c);c.currentNormalZ=normalPower(state,i,c);});
 const own=s.players[side];if(own){own.actionRecovery=own.deck.filter(c=>c.action&&(c.availableTurn||0)>own.turn).map(c=>({id:c.id,turns:c.availableTurn-own.turn}));own.deckCount=own.deck.length;delete own.deck;own.field.forEach(c=>{c.currentZ=power(state,side,c);c.canStrong=strong(own,c);c.charge=c.enteredTurn===null?0:1+(own.turn-c.enteredTurn)%3;});}
 return {...s,you:side,revision,serverNow:now};
}
module.exports={initial,apply,project,timeout,catalog,cards,active,power,normalPower,strong};

},
"_dev/online/combat-basic1.cjs":function(require,module,exports){
'use strict';
const crypto=require('node:crypto'),A=require('./actions.cjs'),{cards}=require('../market/catalog.cjs'),Balance=require('../../js/orator-catalog.js'),Legacy=require('./catalog-legacy-stats.cjs'),B=require('../../js/basic-effects-v1.js');
const catalog=Object.fromEntries(cards.map(c=>[c.id,c])),beats={verborrea:'guardia',guardia:'aforado',aforado:'viperina',viperina:'foco',foco:'giro',giro:'verborrea'};
const random=()=>crypto.randomInt(0,0x100000000)/0x100000000,check=(v,m)=>{if(!v)throw Error(m);};
function initial(mode='normal'){return {schema:1,catalogVersion:Balance.balanceVersion,effectsVersion:B.version,ruleset:'actions2',emptyVoteLimit:3,mode,status:'preparing',players:[null,null],side:null,first:null,deadline:null,winner:null,events:[]};}
function log(s,text){s.events.push(text);s.events=s.events.slice(-40);}
function visual(s,kind,data){s.visualSequence=(s.visualSequence||0)+1;s.visualEvents=(s.visualEvents||[]).concat({sequence:s.visualSequence,kind,...data}).slice(-60);}
function doctrine(s,i){const p=s.players[i],l=p.field.find(c=>c.id===p.leader);return l?l.doctrine:null;}
function active(s,i){const own=doctrine(s,i),other=doctrine(s,1-i);return own&&beats[other]!==own?own:null;}
function power(s,i,c){return c.z+(active(s,i)==='guardia'?c.buff:0)+c.buffs.reduce((n,b)=>n+b.value,0);}
function normalPower(s,i,c){return s.effectsVersion===B.version?B.normalZ(c,s.players[i].turn,power(s,i,c)):power(s,i,c);}
function strong(p,c){return c.hp>=2&&c.enteredTurn!==null&&(p.turn-c.enteredTurn)%3===2&&c.strongUsedTurn!==p.turn;}
function finish(s,winner,reason){s.status='finished';s.winner=winner;s.reason=reason;s.deadline=null;log(s,(winner===0?'Anfitrión':'Invitado')+' gana: '+reason+'.');}
function victory(s){for(let i=0;i<2;i++)if(s.players[i].votes>=100){finish(s,i,'100 votos');return true;}return false;}
function timeout(s,now){if(s.status==='active'&&now>=s.deadline){finish(s,1-s.side,'inactividad');return true;}return false;}
function expel(s,victim,c,attacker,doc=active(s,victim)){
 const p=s.players[victim];if(doc==='aforado'&&!p.saved.includes(c.uid)){p.saved.push(c.uid);c.hp=['actions1','actions2'].includes(s.ruleset)?3:1;log(s,c.name+' conserva el escaño.');return;}
 visual(s,'expel',{uid:c.uid,side:victim});p.field=p.field.filter(x=>x.uid!==c.uid);B.reset(c);Object.assign(c,{hp:0,ready:false,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null,availableTurn:p.turn+2});p.rest.push(c);
 if(attacker!==null){s.players[attacker].votes+=c.votes;log(s,c.name+' al pasillo: +'+c.votes+' votos.');}
 if(doc==='verborrea')p.refund=2;victory(s);
}
function damage(c,n,s,normal=false,turn=0){if(normal&&s.effectsVersion===B.version)n=B.beforeDefense(c,turn,n);const guarded=!!c.guard;let amount=guarded?Math.ceil(n/2):n;if(normal&&s.effectsVersion===B.version)amount=B.afterDefense(c,turn,amount);if(n>0)c.guard=false;c.hp-=amount;if(s)visual(s,'damage',{uid:c.uid,value:amount,guarded});return amount;}
function basicBegin(s,i){if(s.effectsVersion!==B.version)return;const p=s.players[i],doc=active(s,i);for(const c of p.field.slice()){const pulse=B.begin(c,p.turn);if(!pulse)continue;if(pulse.damage){c.hp-=pulse.damage;visual(s,'damage',{uid:c.uid,value:pulse.damage,periodic:true});log(s,c.name+': '+B.definition(pulse.id).name+', −1 Aguante.');if(c.hp<=0)expel(s,i,c,pulse.source,doc);}else if(pulse.heal){const amount=Math.min(pulse.heal,c.maxHp-c.hp);c.hp+=amount;visual(s,'heal',{uid:c.uid,value:amount});log(s,c.name+': Café parlamentario, +'+amount+' Aguante.');}if(s.status!=='active')return;}}
function begin(s,i,now,rng){s.side=i;const p=s.players[i];p.turn++;p.emptyVotesTaken=0;p.silenced=!!p.pendingSilence;p.pendingSilence=false;if(p.silenced)p.silenceImmuneThrough=p.turn+2;
 for(const c of p.field){c.ready=true;c.guard=false;c.buffs=c.buffs.filter(b=>b.until>=p.turn);}
 basicBegin(s,i);if(s.status!=='active')return;
 const recycled=A.recycle(p.rest,p.deck,p.turn,rng);p.rest=recycled.rest;
 if(p.turn===1){p.deck=recycled.deck;if(s.ruleset==='actions2'){const action=p.deck.find(c=>c.action);if(action){p.hand.push(action);p.deck=p.deck.filter(c=>c!==action);}}}else{const next=s.ruleset==='actions2'?A.renewBalanced(p.hand,recycled.deck,p.turn,rng):A.renew(p.hand,recycled.deck,rng);p.hand=next.hand;p.deck=next.deck;}
 p.tdpMax=Math.min(6,p.tdpMax+1);const d=active(s,i);p.tdp=Math.min(8,p.tdpMax+(d==='verborrea'?1+p.refund:0)+(s.ruleset==='actions2'&&p.turn===1&&i!==s.first?1:0));p.refund=0;if(s.ruleset==='actions2'&&p.turn===1&&i!==s.first)log(s,'Compensación de iniciativa: +1 TdP en el primer turno del segundo jugador.');
 if(d==='foco'){const l=p.field.find(c=>c.id===p.leader);l.hp=Math.min(l.maxHp,l.hp+(['actions1','actions2'].includes(s.ruleset)?1:2));}
 const gain=3+p.field.reduce((n,c)=>n+c.votes,0);p.votes+=gain;visual(s,'turn',{side:i,value:gain});s.deadline=now+(s.mode==='rapida'?60000:90000);log(s,(i===0?'Anfitrión':'Invitado')+': turno '+p.turn+', +'+gain+' votos.');if(victory(s))return;
 if(p.silenced){log(s,'Moción de censura: turno sin acciones; conserva robo y votos.');end(s,i,now,rng);}
}
function end(s,i,now,rng){if(s.effectsVersion===B.version)s.players[i].field.forEach(c=>B.end(c,s.players[i].turn));if(active(s,i)==='guardia')s.players[i].field.forEach(c=>c.buff=Math.min(3,c.buff+1));begin(s,1-i,now,rng);}
function ready(s,i,choice,now,rng,profile){check(s.status==='preparing','La partida ya ha comenzado');check(!s.players[i],'Ya estás listo');const valid=A.validateCabinet(choice,[...cards.map(c=>c.id),...A.cards.map(c=>c.id)],cards.map(c=>c.id));
 const revision=s.catalogVersion||Legacy.version;if(![Balance.balanceVersion,Legacy.version].includes(revision))throw Error('Versión de catálogo no compatible.');
 const all=valid.orators.map((id,j)=>{const c=revision===Legacy.version?{...catalog[id],...Legacy.cards[id]}:catalog[id],leader=id===valid.leader,edition=require('./progression.cjs').appearance(profile,id);return {uid:i+'-o'+j,...(s.effectsVersion===B.version?{basicAbility:B.ability(id)}:{}),id,name:c.n,rarity:c.r,doctrine:c.pa,cost:c.c,...edition,z:c.a+(leader?1:0)+(edition.gold?2:0),hp:c.h+(leader?3:0)+(edition.gold?2:0),maxHp:c.h+(leader?3:0)+(edition.gold?2:0),votes:c.v,q:c.q,ready:true,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null};});
 const leader=all.find(c=>c.id===valid.leader),others=A.shuffle(all.filter(c=>c!==leader),rng),actions=valid.actions.map((id,j)=>({uid:i+'-a'+j,id,action:true}));
 s.players[i]={cabinetIds:valid.orators.slice(),cabinetActions:valid.actions.slice(),leader:valid.leader,turn:0,tdp:0,tdpMax:2,votes:0,hand:[leader,others.shift()],deck:A.shuffle([...others,...actions],rng),field:[],rest:[],actionDiscard:[],saved:[],refund:0,usedActions:[],silenced:false};log(s,(i===0?'Anfitrión':'Invitado')+' está listo.');
 if(s.players.every(Boolean)){s.status='active';s.first=rng()<.5?0:1;log(s,'Sorteo: '+(s.first===0?'cara, empieza el anfitrión.':'cruz, empieza el invitado.'));begin(s,s.first,now,rng);}
}
function actionCard(s,i,id,target){const p=s.players[i],foe=s.players[1-i],a=A.byId[id],c=p.hand.find(c=>c.action&&c.id===id);check(a&&c,'Acción fuera de la mano');check((c.availableTurn||0)<=p.turn,'La acción sigue en recuperación');check(p.tdp>=a.cost,'TdP insuficiente');check(p.actionUsedTurn!==p.turn,'Solo una acción por turno');check(!a.oncePerBattle||!p.usedActions.includes(id),'Acción agotada');
 const owners=a.target==='all'?[i,1-i]:[a.target.includes('rival')?1-i:i];let affected=owners.flatMap(owner=>s.players[owner].field.map(c=>({owner,c,doc:active(s,owner)})));if(!a.target.startsWith('all'))affected=affected.filter(x=>x.c.uid===target);
 check(a.effect==='silence'||affected.length,'Objetivo no válido');if(a.effect==='heal')check(affected.some(x=>x.c.hp<x.c.maxHp),'No falta Aguante');if(a.effect==='guard')check(affected.some(x=>!x.c.guard),'Defensa ya activa');
 if(a.effect==='silence'){check(p.field.length===3&&p.field.every(c=>c.ready),'Necesitas tres oradores listos');check(p.votes<foe.votes,'Debes tener menos votos');check(!foe.pendingSilence&&foe.turn>(foe.silenceImmuneThrough??-1),'Rival protegido');foe.pendingSilence=true;p.field.forEach(c=>c.ready=false);}
 const before=affected.map(x=>x.c.hp);visual(s,'action',{side:i,id,discard:!!a.oncePerBattle});
 p.tdp-=a.cost;p.actionUsedTurn=p.turn;p.usedActions.push(id);p.hand=p.hand.filter(x=>x!==c);if(a.oncePerBattle)p.actionDiscard.push(c);else{if(s.ruleset==='actions2')c.availableTurn=p.turn+3;p.deck.push(c);}
 for(const x of affected){if(a.effect==='damage')damage(x.c,a.value,s);if(a.effect==='heal')x.c.hp=Math.min(x.c.maxHp,x.c.hp+a.value);if(a.effect==='guard')x.c.guard=true;if(a.effect==='boost')x.c.buffs.push({value:a.value,until:s.players[x.owner].turn+(x.owner===i?0:1)});}
 affected.forEach((x,j)=>{if(a.effect==='heal')visual(s,'heal',{uid:x.c.uid,value:x.c.hp-before[j]});if(a.effect==='guard')visual(s,'guard',{uid:x.c.uid});});
 const teams=['equipo anfitrión','equipo invitado'],scope=a.effect==='silence'?teams[1-i]:a.target==='all'?'Todos los oradores de ambos equipos':a.target.startsWith('all')?'Todos los oradores del '+teams[owners[0]]:'Orador '+(a.target==='self'?'propio':'rival');
 log(s,require('../../js/action-cards.js').describeAction(a,i===0?'El anfitrión':'El invitado',scope,affected.map((x,j)=>({name:x.c.name,team:teams[x.owner],amount:a.effect==='heal'?x.c.hp-before[j]:before[j]-x.c.hp}))));s.lastAction={side:i,id,discard:!!a.oncePerBattle,turn:p.turn};
 for(const x of affected)if(x.c.hp<=0&&s.status==='active')expel(s,x.owner,x.c,x.owner===i?null:i,x.doc);
}
function apply(original,i,command,now=Date.now(),rng=random,profile){check(i===0||i===1,'Jugador no válido');check(command&&typeof command.type==='string','Acción no válida');const s=structuredClone(original);if(timeout(s,now))return s;
 if(command.type==='ready'){ready(s,i,command.cabinet,now,rng,profile);return s;}
 check(s.status==='active','No hay una partida activa');if(command.type==='resign'){finish(s,1-i,'rendición');return s;}check(s.side===i,'No es tu turno');const p=s.players[i],foe=s.players[1-i];check(!p.silenced,'Turno silenciado');
 if(command.type==='end'){end(s,i,now,rng);return s;}
 if(command.type==='action'){actionCard(s,i,command.id,command.target);return s;}
 if(command.type==='play'){const c=p.hand.find(c=>c.uid===command.uid&&!c.action);check(c,'Cromo fuera de la mano');check(p.field.length<3,'La tribuna está llena');check(c.cost<=p.tdp,'TdP insuficiente');p.hand=p.hand.filter(x=>x!==c);p.field.push(c);B.reset(c);p.tdp-=c.cost;Object.assign(c,{hp:c.maxHp,enteredTurn:p.turn,ready:true,guard:false,buff:0,buffs:[],lastHealTurn:null,strongUsedTurn:null});if(active(s,i)==='guardia'&&s.ruleset!=='actions2')c.buff=1;if(c.id===p.leader&&active(s,i)==='verborrea')p.tdp=Math.min(8,p.tdp+1);visual(s,'card',{uid:c.uid,side:i});log(s,c.name+' entra en la tribuna.');return s;}
 const c=p.field.find(c=>c.uid===command.uid);check(c&&c.ready,'Orador no disponible');
 if(command.type==='guard'){check(!c.guard,'Defensa ya activa');c.guard=true;c.ready=false;visual(s,'guard',{uid:c.uid});log(s,c.name+' se defiende.');return s;}
 if(command.type==='heal'){check(c.hp<c.maxHp&&(c.lastHealTurn===null||p.turn>=c.lastHealTurn+2),'Curación no disponible');const amount=Math.min(c.maxHp-c.hp,Math.max(3,Math.ceil((c.maxHp-c.hp)/2)));c.hp+=amount;c.lastHealTurn=p.turn;c.ready=false;visual(s,'heal',{uid:c.uid,value:amount});log(s,c.name+' recupera '+amount+' de Aguante.');return s;}
 check(command.type==='attack','Acción desconocida');check(command.variant==='normal'||command.variant==='strong','Ataque no válido');const powerful=command.variant==='strong';check(!powerful||strong(p,c),'Ataque fuerte no disponible');const target=foe.field.find(c=>c.uid===command.target),empty=command.target==='empty';check(empty?foe.field.length<3:!!target,'Objetivo no válido');check(!empty||s.emptyVoteLimit==null||(p.emptyVotesTaken||0)<s.emptyVoteLimit,'Límite de resta de votos alcanzado este turno');const ownDoc=active(s,i),enemyDoc=active(s,1-i);visual(s,'attack',{uid:c.uid,target:target?.uid||null,side:i,strong:powerful});c.ready=false;if(powerful){c.hp--;visual(s,'damage',{uid:c.uid,value:1});c.strongUsedTurn=p.turn;}let amount=powerful?Math.ceil(power(s,i,c)*1.5):normalPower(s,i,c);if(!powerful&&s.effectsVersion===B.version)B.consumeAttack(c,p.turn);if(target&&ownDoc==='viperina'&&target.id===foe.leader)amount+=2;
 if(empty){amount=Math.min(foe.votes,amount,s.emptyVoteLimit==null?Infinity:Math.max(0,s.emptyVoteLimit-(p.emptyVotesTaken||0)));p.emptyVotesTaken=(p.emptyVotesTaken||0)+amount;foe.votes-=amount;visual(s,'votes',{side:1-i,value:-amount});}else{amount=damage(target,amount,s,!powerful,foe.turn);if(enemyDoc==='giro')damage(c,1,s);}

 if(ownDoc==='foco'&&c.id===p.leader)p.votes++;log(s,c.name+': «'+c.q[powerful?1:0]+'» · '+amount+(empty?' votos retirados.':' de daño.'));if(victory(s))return s;if(target&&target.hp<=0)expel(s,1-i,target,i,enemyDoc);if(s.status==='active'&&c.hp<=0)expel(s,i,c,null,ownDoc);if(s.status==='active'){if(!empty&&!powerful&&s.effectsVersion===B.version){const result=B.afterHit(c,target,{damage:amount,attackerHealth:c.hp,targetHealth:target.hp,ownTurn:p.turn,rivalTurn:foe.turn,source:i});if(result){visual(s,'basic-state',{uid:result.card.uid,effect:result.id});log(s,result.card.name+': '+B.definition(result.id).name+'.');}}}return s;
}
function project(state,side,revision,now){const s=structuredClone(state);const foe=s.players[1-side];if(foe){foe.handCount=foe.hand.length;foe.deckCount=foe.deck.length;delete foe.hand;delete foe.deck;delete foe.cabinetIds;delete foe.cabinetActions;delete foe.usedActions;delete foe.saved;}
 // Los mazos y su orden nunca se envían, tampoco al dueño.
 for(let i=0;i<2;i++)if(s.players[i])s.players[i].field.forEach(c=>{c.currentZ=power(state,i,c);c.currentNormalZ=normalPower(state,i,c);});
 const own=s.players[side];if(own){own.actionRecovery=own.deck.filter(c=>c.action&&(c.availableTurn||0)>own.turn).map(c=>({id:c.id,turns:c.availableTurn-own.turn}));own.deckCount=own.deck.length;delete own.deck;own.field.forEach(c=>{c.currentZ=power(state,side,c);c.canStrong=strong(own,c);c.charge=c.enteredTurn===null?0:1+(own.turn-c.enteredTurn)%3;});}
 return {...s,you:side,revision,serverNow:now};
}
module.exports={initial,apply,project,timeout,catalog,cards,active,power,normalPower,strong};

},
"_dev/online/ai.cjs":function(require,module,exports){
'use strict';
const E=require('./combat.cjs'),A=require('./actions.cjs');
function cabinet(human,elo,random=Math.random,recipeOverride){
 const tiersList=['comun','raro','especial','legendario'],level=r=>tiersList.indexOf(r);
 let recipe=recipeOverride||(elo<2500?['comun','comun','comun','raro','raro']:elo<5000?['comun','comun','raro','raro','especial']:elo<7500?['comun','raro','raro','especial','legendario']:['raro','raro','especial','especial','legendario']);
 if(!recipeOverride&&human.orators?.length===5){const own=human.orators.map(id=>E.catalog[id].r).sort((a,b)=>level(a)-level(b));recipe=recipe.slice().sort((a,b)=>level(a)-level(b)).map((r,i)=>tiersList[Math.max(level(r),level(own[i]))]);}

 const orators=[];for(const rarity of recipe){const pool=E.cards.filter(c=>c.r===rarity&&!orators.includes(c.id));orators.push(pool[Math.floor(random()*pool.length)].id);}
 const tiers={comun:0,raro:1,especial:2,legendario:3},leader=orators.slice().sort((a,b)=>tiers[E.catalog[b].r]-tiers[E.catalog[a].r])[0],actions=[];
 for(const id of human.actions){const pool=A.cards.filter(c=>c.r===A.byId[id].r&&!actions.includes(c.id));actions.push(pool[Math.floor(random()*pool.length)].id);}
 return {orators,leader,actions};
}
function choose(state,side=1,now=Date.now()){
 const p=state.players[side],foe=state.players[1-side];
 const valid=command=>{try{E.apply(state,side,command,now,()=>.5);return true;}catch{return false;}};
 const opening=p.field.length<2&&p.hand.filter(c=>!c.action&&c.cost<=p.tdp).sort((a,b)=>(b.id===p.leader)-(a.id===p.leader)||b.votes-a.votes)[0];if(opening)return {type:'play',uid:opening.uid};
 for(const card of p.hand.filter(c=>c.action)){const a=A.byId[card.id],targets=a.target==='self'?p.field:a.target==='rival'?foe.field:[null];for(const target of targets){const command={type:'action',id:a.id,...(target?{target:target.uid}:{})};if(valid(command))return command;}}
 if(p.field.length<3){const playable=p.hand.filter(c=>!c.action&&c.cost<=p.tdp).sort((a,b)=>(b.id===p.leader)-(a.id===p.leader)||b.votes-a.votes);if(playable[0])return {type:'play',uid:playable[0].uid};}
 for(const c of p.field.filter(c=>c.ready)){
  if(c.hp<c.maxHp/3&&valid({type:'heal',uid:c.uid}))return {type:'heal',uid:c.uid};
  const variant=E.strong(p,c)?'strong':'normal',targets=foe.field.slice().sort((a,b)=>a.hp-b.hp||b.votes-a.votes);
  for(const target of targets){const command={type:'attack',uid:c.uid,target:target.uid,variant};if(valid(command))return command;}
  if(foe.field.length<3){const normal=E.normalPower(state,side,c),limit=Math.min(foe.votes,state.emptyVoteLimit==null?Infinity:state.emptyVoteLimit-(p.emptyVotesTaken||0)),command={type:'attack',uid:c.uid,target:'empty',variant:normal>=limit?'normal':variant};if(valid(command))return command;}
 }
 return {type:'end'};
}
function advance(state,now,random=Math.random){let next=state;for(let i=0;next.status==='active'&&next.side===1&&i<24;i++)next=E.apply(next,1,choose(next,1,now),now,random);if(next.status==='active'&&next.side===1)throw Error('La IA no pudo terminar su turno.');return next;}
module.exports={cabinet,choose,advance};

}},cache={};function load(id){if(cache[id])return cache[id].exports;var m=cache[id]={exports:{}};modules[id](function(name){if(name[0]!=='.')return load(name);var parts=id.split('/');parts.pop();name.split('/').forEach(function(p){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);});return load(parts.join('/'));},m,m.exports);return m.exports;}root.HemicycleOfflineRules=load("_dev/online/offline-rules.cjs");})(globalThis);
