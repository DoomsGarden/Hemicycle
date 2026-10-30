'use strict';
// Pure rules. Only the authenticated service can commit their result to PostgreSQL.
const XP=require('../../js/progression-xp.js');
const crypto=require('node:crypto'),{cards,packs}=require('../market/catalog.cjs'),A=require('../../js/action-cards.js'),O=require('../../js/objectives.js'),M=require('../../js/legendary-mastery.js'),R=require('../../js/ranked-seasons.js');
const catalog=[...cards,...A.cards],byId=Object.fromEntries(catalog.map(c=>[c.id,c])),rules=require('../../js/market-rules.js').create(catalog,packs);
const random=()=>crypto.randomInt(0,0x100000000)/0x100000000,pick=(list,rng)=>list[Math.floor(rng()*list.length)],check=(condition,message)=>{if(!condition)throw Error(message);};
function contents(kind,rng=random){
 const tier=r=>pick(cards.filter(c=>c.r===r),rng);let out=[];
 if(['comun','diario'].includes(kind))out=[...Array.from({length:4},()=>tier('comun')),tier(rng()<.2?'raro':'comun')];
 else if(['raro','semanal'].includes(kind))out=[...Array.from({length:4},()=>tier('raro')),tier(rng()<.25?'especial':'raro')];
 else if(kind==='legendario')out=[tier('legendario'),tier('especial'),tier('raro'),tier('raro'),tier('raro')];
 else if(kind==='mitico')out=Array.from({length:5},()=>tier('legendario'));else throw Error('Sobre no válido.');
 return A.inject(out,rng,kind).map(c=>c.id);
}
function starter(identity,now,rng=random){
 check(/^HC-[0-9a-f-]{36}$/i.test(identity||''),'ID no válido.');
 const album=[];for(const [r,n]of [['comun',18],['raro',8],['especial',3],['legendario',1]]){const pool=cards.filter(c=>c.r===r);for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}for(let i=0;i<n;i++)album.push(pool[i%pool.length].id);}
 const profile={xp:0,fs:1500,elo:0,w:0,l:0,album,actionAlbum:[],lastDaily:0,lastWeekly:0,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false};profile.objectives=O.snapshot(profile,cards,now);
 return {format:'hemiciclo-backup',schemaVersion:1,identity:{id:identity,createdAt:new Date(now).toISOString()},exportedAt:new Date(now).toISOString(),gameVersion:'v31.0.2.11',profile,league:null,ranked:R.sync(null,0,now).state,tutorials:{battle:null,menu:null}};
}
function inventory(profile){return [...profile.album,...profile.actionAlbum||[]];}
function take(profile,id,quantity){rules.card(id);rules.integer(quantity,'Cantidad');const key=byId[id].action?'actionAlbum':'album',album=profile[key]||[];check(rules.duplicates(album,id)>=quantity,'No hay suficientes repetidos. Conservas siempre una copia.');let remaining=quantity;profile[key]=album.filter(c=>c!==id||remaining--<=0);}
function pay(p,n){check(Number.isSafeInteger(n)&&n>=0&&p.fs>=n,'No hay suficientes FS.');p.fs-=n;}
function credit(p,n){check(Number.isSafeInteger(n)&&n>=0&&Number.isSafeInteger(p.fs+n)&&p.fs+n<=1000000000,'Saldo fuera del intervalo permitido.');p.fs+=n;}
function operate(input,actor,command,now=Date.now(),rng=random){
 const s=structuredClone(input),market=s.market||={players:[],listings:[],trades:[],quotes:[],receipts:[]};const changed=new Set();
 const account=id=>{const a=s.accounts[id];check(a?.payload,'Activa primero el progreso en la nube.');return a;},profile=id=>account(id).payload.profile;
 const touch=id=>{changed.add(id);return profile(id);},me=profile(actor);
 const receipt=(id,kind,data)=>market.receipts.push({id:crypto.randomUUID(),player:id,kind,data,created:now});
 const refund=t=>{A.award(touch(t.proposer),t.terms.give.flatMap(c=>Array(c.quantity).fill(c.id)));credit(profile(t.proposer),t.terms.giveFS);};
 // Expired proposals return only the proposer's escrow; the recipient never loses anything before accepting.
 for(const t of market.trades)if(t.status==='pending'&&t.expires<=now){refund(t);t.status='expired';}
 let result={};const type=command.type;
 if(type==='maintenance'){}else if(type==='learning-actions'){for(const id of ['replica','receso'])if(!(me.actionAlbum||[]).includes(id)){A.award(me,[id]);changed.add(actor);}result={granted:true};}else if(type==='offline-settle'){
  const ticket=s.ticket;check(ticket&&ticket.expires+30*86400000>now&&!ticket.result,'Partida descargada no disponible o caducada.');
  const state=require('./offline-engines.cjs').forTicket(ticket).replay(ticket,command.record),own=state.players[0],foe=state.players[1],win=state.winner===0,competitive=state.mode==='ranked'||state.mode==='liga';
  const before=me.elo,margin=Math.max(0,Math.min(1,Math.abs(own.votes-foe.votes)/Math.max(1,win?own.votes:foe.votes)));
  let fs=win?(competitive?50+Math.floor(rng()*51):20+Math.floor(rng()*31)):competitive?20+Math.floor(rng()*11):0,won=null,lost=null;
  if(win){me.w++;if(M.eligible(own.leader))me.leaderMastery=M.recordWin(me,own.leader);if(competitive){won=pick(A.lootPool(foe.cabinetIds,foe.cabinetActions),rng);A.award(me,[won]);}if(competitive&&own.leader==='donald-trump'){me.dtWins++;if(me.dtWins>=10)me.dtGoldUnlocked=true;}}
  else{me.l++;if(competitive){const candidates=A.lootPool(own.cabinetIds,own.cabinetActions,me);if(candidates.length){lost=pick(candidates,rng);A.removeCopy(me,lost);}}}
  if(state.mode==='ranked'){const delta=win?10+Math.floor(15*Math.min(1,margin/.75)):state.reason==='rendición'||state.reason==='inactividad'?-18:-5-Math.floor(13*margin);me.elo=Math.max(0,me.elo+delta);account(actor).payload.ranked=R.advance(account(actor).payload.ranked,before,me.elo,now);}
  if(state.mode==='liga'){const lg=account(actor).payload.league;check(lg,'Crea una Liga antes de jugarla.');const next=require('./league.cjs').advance(lg,win,rng);account(actor).payload.league=next.league;fs+=next.reward;result.season=!!next.reward;if(result.season){result.leaguePosition=next.position;result.leagueTeams=lg.teams.length;result.seasonFS=next.reward;}}
  const xp=XP.add(me,XP.match(state.mode,win,state.reason));credit(me,fs);me.objectives=O.record(me,{win,mode:state.mode,votes:own.votes,enemyVotes:foe.votes,leader:own.leader,doctrine:byId[own.leader].pa},now);changed.add(actor);
  result={...result,win,mode:state.mode,fs,xp,eloBefore:before,eloAfter:me.elo,eloDelta:me.elo-before,won,lost,votes:own.votes,enemyVotes:foe.votes};
  require('./battle-history.cjs').record(market,actor,{...result,balance:require('./battle-history.cjs').context(state,0),opponentKind:'ai',firstWasSelf:state.first===0,ownTurns:own.turn,opponentTurns:foe.turn,ruleset:state.ruleset,resultId:'offline:'+ticket.id},now);
 }else if(type==='league-create'){check(!account(actor).payload.league,'Ya tienes una Liga activa.');account(actor).payload.league=require('./league.cjs').create(3,1,rng);changed.add(actor);
 }else if(type==='league-abandon'){account(actor).payload.league=null;changed.add(actor);
 }else if(type==='pack'){
  const {kind,quantity,free}=command;check(Number.isSafeInteger(quantity)&&[1,5,10].includes(quantity),'Cantidad no válida.');
  if(free){check(quantity===1&&['diario','semanal'].includes(kind),'Sobre gratuito no válido.');const key=kind==='diario'?'lastDaily':'lastWeekly',wait=kind==='diario'?86400000:604800000;check(now>=me[key]+wait,'El sobre gratuito todavía no está disponible.');me[key]=now;}
  else{const pack=packs.find(p=>p.k===kind);check(pack,'Sobre no válido.');pay(me,pack.p*quantity);}
  const opened=Array.from({length:quantity},()=>contents(kind,rng));opened.forEach(ids=>A.award(me,ids));changed.add(actor);result={packs:opened,kind};
 }else if(type==='claim'){
  const backup=account(actor).payload;let reward;
  if(command.view==='ranked'){const claim=R.claim(backup.ranked,command.id);backup.ranked=claim.state;reward=claim.reward;}
  else{check(['challenges','achievements'].includes(command.view),'Recompensa no válida.');const claim=command.view==='challenges'?O.claim(me,command.id,now):O.claimAchievement(me,cards,command.id,command.step,now);me.objectives=claim.state;reward=claim.reward;if(claim.leader&&M.eligible(claim.leader))me.leaderMastery=M.claim(me,claim.leader);}
  if(reward.fs)credit(me,reward.fs);if(reward.xp)result.xp=XP.add(me,reward.xp);if(reward.kind){result={kind:reward.kind,packs:[contents(reward.kind,rng)]};A.award(me,result.packs[0]);}changed.add(actor);
 }else if(type==='machine'){const quote=rules.sale(command.id,command.quantity,'machine');take(touch(actor),command.id,command.quantity);credit(me,quote.total);receipt(actor,'machine',{cardId:command.id,quantity:command.quantity,total:quote.total});result=quote;
 }else if(type==='visibility'){
  check(typeof command.visible==='boolean','Estado no válido.');let p=market.players.find(p=>p.id===actor);if(!p){p={id:actor};market.players.push(p);}p.visible=command.visible;
 }else if(type==='listing'){
  check(market.listings.filter(l=>l.seller===actor&&l.status==='active').length<50,'Retira alguna oferta antes de publicar más.');const quote=rules.sale(command.id,command.quantity,'player');take(touch(actor),command.id,command.quantity);
  result={id:crypto.randomUUID(),seller:actor,card:command.id,remaining:command.quantity,quantity:command.quantity,unit:quote.unit,status:'active',revision:1,created:now};market.listings.push(result);
 }else if(type==='cancel-listing'){
  const l=market.listings.find(l=>l.id===command.id&&l.seller===actor);check(l,'Oferta no disponible.');if(l.status==='active'){A.award(touch(actor),Array(l.remaining).fill(l.card));l.remaining=0;l.status='cancelled';l.revision++;}
 }else if(type==='quote'){
  const l=market.listings.find(l=>l.id===command.listing);check(l?.status==='active'&&l.seller!==actor,'Oferta no disponible.');rules.integer(command.quantity,'Cantidad');check(command.quantity<=l.remaining,'La cantidad disponible ha cambiado.');check(me.fs>=l.unit*command.quantity,'No hay suficientes FS.');
  result={id:crypto.randomUUID(),buyer:actor,listing:l.id,quantity:command.quantity,revision:l.revision,unit:l.unit,total:l.unit*command.quantity,cardId:l.card,expires:now+60000};market.quotes.push(result);
 }else if(type==='purchase'){
  const q=market.quotes.find(q=>q.id===command.quote&&q.buyer===actor);check(q,'Revisión no disponible.');if(q.completed)result=q.result;else{const l=market.listings.find(l=>l.id===q.listing);check(q.expires>now&&l?.status==='active'&&l.revision===q.revision&&l.remaining>=q.quantity,'La oferta cambió o la revisión ha caducado. Vuelve a revisarla.');pay(touch(actor),q.total);credit(touch(l.seller),q.total);A.award(me,Array(q.quantity).fill(l.card));l.remaining-=q.quantity;l.revision++;if(!l.remaining)l.status='sold';receipt(actor,'purchase',{cardId:l.card,quantity:q.quantity,total:q.total});receipt(l.seller,'player-sale',{cardId:l.card,quantity:q.quantity,total:q.total});q.completed=true;result=q.result={total:q.total,cardId:l.card,quantity:q.quantity};}
 }else if(type==='trade'){
  check(command.recipient!==actor&&market.players.some(p=>p.id===command.recipient&&p.visible),'Jugador no disponible para intercambiar.');check(market.trades.filter(t=>t.proposer===actor&&t.status==='pending').length<20,'Ya tienes demasiadas propuestas pendientes.');
  const terms=rules.trade(command.give,command.receive),other=profile(command.recipient);for(const c of terms.receive)check(rules.duplicates(inventory(other),c.id)>=c.quantity,'El otro jugador ya no tiene esos repetidos.');
  terms.give.forEach(c=>take(touch(actor),c.id,c.quantity));pay(touch(actor),terms.giveFS);
  result={id:crypto.randomUUID(),proposer:actor,recipient:command.recipient,terms,status:'pending',expires:now+86400000,created:now};market.trades.push(result);
 }else if(type==='accept-trade'||type==='cancel-trade'){
  const t=market.trades.find(t=>t.id===command.id&&(t.proposer===actor||t.recipient===actor));check(t,'Intercambio no disponible.');
  if(type==='accept-trade'){check(t.recipient===actor,'Solo el destinatario puede aceptar.');check(t.status==='pending'&&t.expires>now,'El intercambio ya no está disponible.');t.terms.receive.forEach(c=>take(touch(actor),c.id,c.quantity));pay(touch(actor),t.terms.receiveFS);A.award(profile(actor),t.terms.give.flatMap(c=>Array(c.quantity).fill(c.id)));credit(profile(actor),t.terms.giveFS);A.award(touch(t.proposer),t.terms.receive.flatMap(c=>Array(c.quantity).fill(c.id)));credit(profile(t.proposer),t.terms.receiveFS);t.status='completed';receipt(actor,'trade',{trade:t.id});receipt(t.proposer,'trade',{trade:t.id});}
  else if(t.status==='pending'){refund(t);t.status='cancelled';}
 }else throw Error('Operación no válida.');
 for(const id of changed)profile(id).objectives=O.snapshot(profile(id),cards,now);
 market.quotes=market.quotes.filter(q=>q.expires>now-3600000);market.listings=market.listings.filter(l=>l.status==='active'||l.created>now-30*86400000);market.trades=market.trades.filter(t=>t.status==='pending'||t.created>now-30*86400000);var receiptCounts={};market.receipts=market.receipts.slice().reverse().filter(r=>(receiptCounts[r.player]=(receiptCounts[r.player]||0)+1)<=100).reverse();
 return {market,updates:[...changed].map(id=>({userId:id,revision:s.accounts[id].revision,payload:s.accounts[id].payload})),result};
}
function view(s,actor,path){
 const market=s.market||{players:[],listings:[],trades:[],quotes:[],receipts:[]},names=id=>s.accounts[id]?.name||'Jugador',me=s.accounts[actor];check(me?.payload,'Activa primero el progreso en la nube.');
 const tradable=id=>Object.entries(rules.counts(inventory(s.accounts[id]?.payload.profile||{album:[]}))).filter(([,n])=>n>1).map(([id,n])=>({id,quantity:n-1,available:n-1}));
 if(path==='/me')return {id:actor,name:names(actor),fs:me.payload.profile.fs,inventory:Object.entries(rules.counts(inventory(me.payload.profile))).map(([id,quantity])=>({id,quantity})),visible:!!market.players.find(p=>p.id===actor&&p.visible)};
 if(path==='/players')return market.players.filter(p=>p.visible&&p.id!==actor).map(p=>({id:p.id,name:names(p.id)}));
 if(path.startsWith('/players/')){const id=path.split('/')[2];check(market.players.some(p=>p.id===id&&p.visible),'Jugador no disponible.');return tradable(id);}
 if(path==='/listings')return market.listings.filter(l=>l.status==='active').map(l=>({...l,sellerName:names(l.seller)}));
 if(path==='/history')return market.receipts.filter(r=>r.player===actor&&r.kind==='battle').slice(-50).reverse().map(r=>({...r.data,created:r.created,verified:true}));
 if(path==='/activity')return {listings:market.listings.filter(l=>l.seller===actor),trades:market.trades.filter(t=>t.proposer===actor||t.recipient===actor).map(t=>({...t,confirmed_a:t.status==='pending'||t.status==='completed',confirmed_b:t.status==='completed',proposerName:names(t.proposer),recipientName:names(t.recipient)})),receipts:market.receipts.filter(r=>r.player===actor&&r.kind!=='battle').slice(-100).reverse()};
 throw Error('Ruta no disponible.');
}
module.exports={operate,view,contents,starter,rules,catalog};
