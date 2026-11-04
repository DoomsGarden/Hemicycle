'use strict';
const path=require('node:path'),{createReserve}=require('../reserva-espana/create-reserve.cjs');
const proposal=require('../../proposals/espana-1986-2026/propuesta.json'),phrases=require('./frases.json');
const reserve=createReserve({id:'espana-20',consulted:'2026-11-04',cards:proposal.cards.map(c=>({...c,bundleId:'es20',artRoot:path.resolve(__dirname,'../../proposals/espana-1986-2026')})),phrases});
module.exports=reserve;
if(require.main===module){const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--preview')throw Error('Uso: node prepare.cjs --preview /tmp/hemicycle-es20');console.log('Overlay interno generado en '+reserve.emit(args[1])+'. No activa la ampliación.');}
