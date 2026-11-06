'use strict';
const {createServer}=require('../espana-20/preview-server.cjs'),reserve=require('./prepare.cjs');
module.exports={createServer:()=>createServer(reserve)};
if(require.main===module)createServer(reserve).listen(8098,'127.0.0.1',()=>console.log('Reserva francesa interna: 440 reservados, 120 activos; solo localhost.'));
