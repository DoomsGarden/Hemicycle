'use strict';
const files={offline1:'./offline-v1.cjs',offline2:'./offline-v2.cjs',offline3:'./offline-v3.cjs',offline4:'./offline-v4.cjs',offline5:'./offline-v5.cjs'};
function forTicket(ticket){if(!ticket||!Object.hasOwn(files,ticket.rules))throw Error('Versión de partida descargada no compatible.');return require(files[ticket.rules]);}
module.exports={forTicket};
