'use strict';
const path=require('node:path'),{createReserve}=require('./create-reserve.cjs');
const batches=require('./batches.cjs');
const cards=batches.flatMap(b=>require(b.proposal).cards.map(c=>({...c,bundleId:b.id,artRoot:path.resolve(__dirname,b.artRoot)})));
const phrases=batches.map(b=>require(b.phrases));
const reserve=createReserve({id:'reserva-espana',consulted:'2026-11-05',cards,phrases:{...phrases.at(-1),cromos:phrases.flatMap(p=>p.cromos)}});
module.exports=reserve;
if(require.main===module){const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--preview')throw Error('Uso: node prepare.cjs --preview /tmp/hemicycle-reserva');console.log('Overlay interno generado en '+reserve.emit(args[1])+'. La reserva permanece desactivada.');}
