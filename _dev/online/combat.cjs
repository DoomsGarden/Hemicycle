'use strict';
const crypto=require('node:crypto'),A=require('./actions.cjs'),{cards}=require('../market/catalog.cjs');
const catalog=Object.fromEntries(cards.map(c=>[c.id,c])),beats={verborrea:'guardia',guardia:'aforado',aforado:'viperina',viperina:'foco',foco:'giro',giro:'verborrea'};
const random=()=>crypto.randomInt(0,0x100000000)/0x100000000,check=(v,m)=>{if(!v)throw Error(m);};
function initial(mode='normal'){return {schema:1,ruleset:'actions1',mode,status:'preparing',players:[null,null],side:null,first:null,deadline:null,winner:null,events:[]};}
function log(s,text){s.events.push(text);s.events=s.events.slice(-40);}
function doctrine(s,i){const p=s.players[i],l=p.field.find(c=>c.id===p.leader);return l?l.doctrine:null;}
function active(s,i){const own=doctrine(s,i),other=doctrine(s,1-i);return own&&beats[other]!==own?own:null;}
function power(s,i,c){return c.z+(active(s,i)==='guardia'?c.buff:0)+c.buffs.reduce((n,b)=>n+b.value,0);}
function strong(p,c){return c.hp>=2&&c.enteredTurn!==null&&(p.turn-c.enteredTurn)%3===2&&c.strongUsedTurn!==p.turn;}
function finish(s,winner,reason){s.status='finished';s.winner=winner;s.reason=reason;s.deadline=null;log(s,(winner===0?'Anfitrión':'Invitado')+' gana: '+reason+'.');}
function victory(s){for(let i=0;i<2;i++)if(s.players[i].votes>=100){finish(s,i,'100 votos');return true;}return false;}
function timeout(s,now){if(s.status==='active'&&now>=s.deadline){finish(s,1-s.side,'inactividad');return true;}return false;}
function expel(s,victim,c,attacker,doc=active(s,victim)){
 const p=s.players[victim];if(doc==='aforado'&&!p.saved.includes(c.uid)){p.saved.push(c.uid);c.hp=s.ruleset==='actions1'?3:1;log(s,c.name+' conserva el escaño.');return;}
 p.field=p.field.filter(x=>x.uid!==c.uid);Object.assign(c,{hp:0,ready:false,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null,availableTurn:p.turn+2});p.rest.push(c);
 if(attacker!==null){s.players[attacker].votes+=c.votes;log(s,c.name+' al pasillo: +'+c.votes+' votos.');}
 if(doc==='verborrea')p.refund=2;victory(s);
}
function damage(c,n){const amount=c.guard?Math.ceil(n/2):n;if(n>0)c.guard=false;c.hp-=amount;return amount;}
function begin(s,i,now,rng){s.side=i;const p=s.players[i];p.turn++;p.silenced=!!p.pendingSilence;p.pendingSilence=false;if(p.silenced)p.silenceImmuneThrough=p.turn+2;
 for(const c of p.field){c.ready=true;c.guard=false;c.buffs=c.buffs.filter(b=>b.until>=p.turn);}
 const recycled=A.recycle(p.rest,p.deck,p.turn,rng);p.rest=recycled.rest;
 if(p.turn===1){p.deck=recycled.deck;}else{const next=A.renew(p.hand,recycled.deck,rng);p.hand=next.hand;p.deck=next.deck;}
 p.tdpMax=Math.min(6,p.tdpMax+1);const d=active(s,i);p.tdp=Math.min(8,p.tdpMax+(d==='verborrea'?1+p.refund:0));p.refund=0;
 if(d==='foco'){const l=p.field.find(c=>c.id===p.leader);l.hp=Math.min(l.maxHp,l.hp+(s.ruleset==='actions1'?1:2));}
 const gain=3+p.field.reduce((n,c)=>n+c.votes,0);p.votes+=gain;s.deadline=now+(s.mode==='rapida'?60000:90000);log(s,(i===0?'Anfitrión':'Invitado')+': turno '+p.turn+', +'+gain+' votos.');if(victory(s))return;
 if(p.silenced){log(s,'Moción de censura: turno sin acciones; conserva robo y votos.');end(s,i,now,rng);}
}
function end(s,i,now,rng){if(active(s,i)==='guardia')s.players[i].field.forEach(c=>c.buff=Math.min(3,c.buff+1));begin(s,1-i,now,rng);}
function ready(s,i,choice,now,rng){check(s.status==='preparing','La partida ya ha comenzado');check(!s.players[i],'Ya estás listo');const valid=A.validateCabinet(choice,[...cards.map(c=>c.id),...A.cards.map(c=>c.id)],cards.map(c=>c.id));
 const all=valid.orators.map((id,j)=>{const c=catalog[id],leader=id===valid.leader;return {uid:i+'-o'+j,id,name:c.n,rarity:c.r,doctrine:c.pa,cost:c.c,z:c.a+(leader?1:0),hp:c.h+(leader?3:0),maxHp:c.h+(leader?3:0),votes:c.v,q:c.q,ready:true,guard:false,buff:0,buffs:[],enteredTurn:null,strongUsedTurn:null,lastHealTurn:null};});
 const leader=all.find(c=>c.id===valid.leader),others=A.shuffle(all.filter(c=>c!==leader),rng),actions=valid.actions.map((id,j)=>({uid:i+'-a'+j,id,action:true}));
 s.players[i]={cabinetIds:valid.orators.slice(),cabinetActions:valid.actions.slice(),leader:valid.leader,turn:0,tdp:0,tdpMax:2,votes:0,hand:[leader,others.shift()],deck:A.shuffle([...others,...actions],rng),field:[],rest:[],actionDiscard:[],saved:[],refund:0,usedActions:[],silenced:false};log(s,(i===0?'Anfitrión':'Invitado')+' está listo.');
 if(s.players.every(Boolean)){s.status='active';s.first=rng()<.5?0:1;log(s,'Sorteo: '+(s.first===0?'cara, empieza el anfitrión.':'cruz, empieza el invitado.'));begin(s,s.first,now,rng);}
}
function actionCard(s,i,id,target){const p=s.players[i],foe=s.players[1-i],a=A.byId[id],c=p.hand.find(c=>c.action&&c.id===id);check(a&&c,'Acción fuera de la mano');check(p.tdp>=a.cost,'TdP insuficiente');check(p.actionUsedTurn!==p.turn,'Solo una acción por turno');check(!a.oncePerBattle||!p.usedActions.includes(id),'Acción agotada');
 const owners=a.target==='all'?[i,1-i]:[a.target.includes('rival')?1-i:i];let affected=owners.flatMap(owner=>s.players[owner].field.map(c=>({owner,c,doc:active(s,owner)})));if(!a.target.startsWith('all'))affected=affected.filter(x=>x.c.uid===target);
 check(a.effect==='silence'||affected.length,'Objetivo no válido');if(a.effect==='heal')check(affected.some(x=>x.c.hp<x.c.maxHp),'No falta Aguante');if(a.effect==='guard')check(affected.some(x=>!x.c.guard),'Defensa ya activa');
 if(a.effect==='silence'){check(p.field.length===3&&p.field.every(c=>c.ready),'Necesitas tres oradores listos');check(p.votes<foe.votes,'Debes tener menos votos');check(!foe.pendingSilence&&foe.turn>(foe.silenceImmuneThrough??-1),'Rival protegido');foe.pendingSilence=true;p.field.forEach(c=>c.ready=false);}
 p.tdp-=a.cost;p.actionUsedTurn=p.turn;p.usedActions.push(id);p.hand=p.hand.filter(x=>x!==c);if(a.oncePerBattle)p.actionDiscard.push(c);else p.deck.push(c);
 for(const x of affected){if(a.effect==='damage')damage(x.c,a.value);if(a.effect==='heal')x.c.hp=Math.min(x.c.maxHp,x.c.hp+a.value);if(a.effect==='guard')x.c.guard=true;if(a.effect==='boost')x.c.buffs.push({value:a.value,until:s.players[x.owner].turn+(x.owner===i?0:1)});}
 log(s,a.n+' activada.');s.lastAction={side:i,id,discard:!!a.oncePerBattle,turn:p.turn};
 for(const x of affected)if(x.c.hp<=0&&s.status==='active')expel(s,x.owner,x.c,x.owner===i?null:i,x.doc);
}
function apply(original,i,command,now=Date.now(),rng=random){check(i===0||i===1,'Jugador no válido');check(command&&typeof command.type==='string','Acción no válida');const s=structuredClone(original);if(timeout(s,now))return s;
 if(command.type==='ready'){ready(s,i,command.cabinet,now,rng);return s;}
 check(s.status==='active','No hay una partida activa');if(command.type==='resign'){finish(s,1-i,'rendición');return s;}check(s.side===i,'No es tu turno');const p=s.players[i],foe=s.players[1-i];check(!p.silenced,'Turno silenciado');
 if(command.type==='end'){end(s,i,now,rng);return s;}
 if(command.type==='action'){actionCard(s,i,command.id,command.target);return s;}
 if(command.type==='play'){const c=p.hand.find(c=>c.uid===command.uid&&!c.action);check(c,'Cromo fuera de la mano');check(p.field.length<3,'La tribuna está llena');check(c.cost<=p.tdp,'TdP insuficiente');p.hand=p.hand.filter(x=>x!==c);p.field.push(c);p.tdp-=c.cost;Object.assign(c,{hp:c.maxHp,enteredTurn:p.turn,ready:true,guard:false,buff:0,buffs:[],lastHealTurn:null,strongUsedTurn:null});if(active(s,i)==='guardia')c.buff=1;if(c.id===p.leader&&active(s,i)==='verborrea')p.tdp=Math.min(8,p.tdp+1);log(s,c.name+' entra en la tribuna.');return s;}
 const c=p.field.find(c=>c.uid===command.uid);check(c&&c.ready,'Orador no disponible');
 if(command.type==='guard'){check(!c.guard,'Defensa ya activa');c.guard=true;c.ready=false;log(s,c.name+' se defiende.');return s;}
 if(command.type==='heal'){check(c.hp<c.maxHp&&(c.lastHealTurn===null||p.turn>=c.lastHealTurn+2),'Curación no disponible');const amount=Math.min(c.maxHp-c.hp,Math.max(3,Math.ceil((c.maxHp-c.hp)/2)));c.hp+=amount;c.lastHealTurn=p.turn;c.ready=false;log(s,c.name+' recupera '+amount+' de Aguante.');return s;}
 check(command.type==='attack','Acción desconocida');check(command.variant==='normal'||command.variant==='strong','Ataque no válido');const powerful=command.variant==='strong';check(!powerful||strong(p,c),'Ataque fuerte no disponible');const target=foe.field.find(c=>c.uid===command.target),empty=command.target==='empty';check(empty?foe.field.length<3:!!target,'Objetivo no válido');const ownDoc=active(s,i),enemyDoc=active(s,1-i);c.ready=false;if(powerful){c.hp--;c.strongUsedTurn=p.turn;}let amount=power(s,i,c);if(powerful)amount=Math.ceil(amount*1.5);if(target&&ownDoc==='viperina'&&target.id===foe.leader)amount+=2;
 if(empty){amount=Math.min(foe.votes,amount);foe.votes-=amount;}else{amount=damage(target,amount);if(enemyDoc==='giro')damage(c,1);}
 if(ownDoc==='foco'&&c.id===p.leader)p.votes++;log(s,c.name+': «'+c.q[powerful?1:0]+'» · '+amount+(empty?' votos retirados.':' de daño.'));if(victory(s))return s;if(target&&target.hp<=0)expel(s,1-i,target,i,enemyDoc);if(s.status==='active'&&c.hp<=0)expel(s,i,c,null,ownDoc);return s;
}
function project(state,side,revision,now){const s=structuredClone(state);const foe=s.players[1-side];if(foe){foe.handCount=foe.hand.length;foe.deckCount=foe.deck.length;delete foe.hand;delete foe.deck;delete foe.cabinetIds;delete foe.cabinetActions;delete foe.usedActions;delete foe.saved;}
 // Los mazos y su orden nunca se envían, tampoco al dueño.
 for(let i=0;i<2;i++)if(s.players[i])s.players[i].field.forEach(c=>{c.currentZ=power(state,i,c);});
 const own=s.players[side];if(own){own.deckCount=own.deck.length;delete own.deck;own.field.forEach(c=>{c.currentZ=power(state,side,c);c.canStrong=strong(own,c);c.charge=c.enteredTurn===null?0:1+(own.turn-c.enteredTurn)%3;});}
 return {...s,you:side,revision,serverNow:now};
}
module.exports={initial,apply,project,timeout,catalog,cards,active,power,strong};
