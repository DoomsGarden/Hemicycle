'use strict';
const path=require('node:path'),{createReserve}=require('./create-reserve.cjs');
const first=require('../../proposals/espana-1986-2026/propuesta.json'),next=require('../espana-60-02/propuesta.json');
const q1=require('../espana-20/frases.json'),q2=require('../espana-60-02/frases.json');
const cards=[...first.cards.map(c=>({...c,bundleId:'es20',artRoot:path.resolve(__dirname,'../../proposals/espana-1986-2026')})),...next.cards.map(c=>({...c,bundleId:'es60-02',artRoot:path.resolve(__dirname,'../espana-60-02')}))];
const reserve=createReserve({id:'reserva-espana',consulted:'2026-11-04',cards,phrases:{...q2,cromos:[...q1.cromos,...q2.cromos]}});
module.exports=reserve;
if(require.main===module){const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--preview')throw Error('Uso: node prepare.cjs --preview /tmp/hemicycle-reserva');console.log('Overlay interno generado en '+reserve.emit(args[1])+'. La reserva permanece desactivada.');}
