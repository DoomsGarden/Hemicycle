/* Cada partida descargada conserva el motor con el que se preparó. */
(function(root,factory){
 var api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.HemicycleOfflineRuleDispatch=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 var versions=['offline1','offline2','offline3','offline4','offline5','offline6','offline7','offline8','offline9','offline10','offline11','offline12'];
 function current(engines){
  return ['offline12','offline11','offline10','offline9'].find(function(version){return Object.hasOwn(engines,version)&&engines[version];});
 }
 function create(engines,version){
  version=version||current(engines);
  if(version&&!versions.includes(version))throw Error('Motor descargado no compatible.');
  function has(id){return Object.hasOwn(engines,id)&&!!engines[id];}
  function forTicket(ticket){
   var id=ticket&&ticket.rules;
   if(!versions.includes(id)||!has(id))throw Error('Versión de partida descargada no compatible. Conecta para actualizar el juego.');
   return engines[id];
  }
  return Object.assign({},engines[version],{
   version:version,
   has:has,
   register:function(id,engine){
    if(!versions.includes(id)||!engine||engine.version!==id)throw Error('Motor descargado no compatible.');
    if(has(id)&&engines[id]!==engine)throw Error('El motor ya está registrado.');
    engines[id]=engine;
   },
   forTicket:forTicket,
   start:function(ticket,cabinet,mode){return forTicket(ticket).start(ticket,cabinet,mode);}
  });
 }
 return {create:create};
});
