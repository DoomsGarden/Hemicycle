'use strict';
const E=require('./combat.cjs'),AI=require('./ai.cjs');
const VERSION='offline4';
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
