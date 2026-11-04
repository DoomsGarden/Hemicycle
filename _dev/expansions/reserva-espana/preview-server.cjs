'use strict';
const {createServer}=require('../espana-20/preview-server.cjs'),reserve=require('./prepare.cjs');
module.exports={createServer:()=>createServer(reserve)};
if(require.main===module)createServer(reserve).listen(8097,'127.0.0.1',()=>console.log('Reserva completa: http://127.0.0.1:8097 · 80 reservados, 120 activos; solo vista interna.'));
