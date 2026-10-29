/* El motor de cada partida descargada se elige por su versión, no por la fecha del cliente. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleOfflineRuleDispatch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function create(engines){function forTicket(ticket){var version=ticket&&ticket.rules;if(!['offline1','offline2','offline3'].includes(version)||!engines[version])throw Error('Versión de partida descargada no compatible. Conecta para actualizar el juego.');return engines[version];}return Object.assign({},engines.offline3,{forTicket:forTicket,start:function(ticket,cabinet,mode){return forTicket(ticket).start(ticket,cabinet,mode);}});}
return {create:create};});
