/* Reglas compartidas por el mercado local y el servidor de pruebas. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.HemicycleMarket=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 var RARITIES=['comun','raro','especial','legendario'];
 function fail(message){throw new Error(message);}
 function integer(value,label,min){
  if(!Number.isSafeInteger(value)||value<(min===undefined?1:min)||value>1000000000)fail(label+' no válido.');
  return value;
 }
 function create(catalog,packs){
  var cards=Object.create(null);catalog.forEach(function(c){cards[c.id]=c;});
  var pack={};(packs||[{k:'comun',p:400},{k:'raro',p:800},{k:'legendario',p:1500},{k:'mitico',p:2900}]).forEach(function(p){pack[p.k]=p.p;});
  var rare=Math.floor((pack.raro/5)*0.95/5)*5;
  var base={comun:Math.floor((pack.comun-0.2*rare)/4.8/5)*5,raro:rare,
   especial:Math.floor((pack.raro-4.75*rare)/0.25),legendario:Math.floor(pack.mitico/5)};
  var prices={};RARITIES.forEach(function(r){
   integer(base[r],'Valor de rareza');
   var machine=Math.floor(base[r]*0.2);
   prices[r]=Object.freeze({base:base[r],machine:machine,player:Math.ceil(machine*1.2)});
  });
  function card(id){if(!Object.prototype.hasOwnProperty.call(cards,id))fail('Cromo no válido.');return cards[id];}
  function sale(id,quantity,target){
   var c=card(id);integer(quantity,'Cantidad');
   if(target!=='machine'&&target!=='player')fail('Destino de venta no válido.');
   var unit=prices[c.r][target],total=unit*quantity;integer(total,'Importe');
   return {cardId:id,quantity:quantity,target:target,rarity:c.r,unit:unit,total:total};
  }
  function counts(album){var result=Object.create(null);album.forEach(function(id){if(cards[id])result[id]=(result[id]||0)+1;});return result;}
  function duplicates(album,id){card(id);return Math.max(0,(counts(album)[id]||0)-1);}
  function bundle(items){
   if(!Array.isArray(items)||!items.length||items.length>100)fail('Selecciona los cromos del intercambio.');
   var result=Object.create(null);items.forEach(function(item){card(item.id);integer(item.quantity,'Cantidad');result[item.id]=(result[item.id]||0)+item.quantity;});
   var list=Object.keys(result).sort().map(function(id){return {id:id,quantity:integer(result[id],'Cantidad')};});
   if(new Set(list.map(function(item){return card(item.id).r;})).size!==1)fail('Los cromos de cada lado deben tener la misma rareza.');
   return list;
  }
  function trade(give,receive){
   give=bundle(give);receive=bundle(receive);
   var gr=card(give[0].id).r,rr=card(receive[0].id).r,gap=RARITIES.indexOf(gr)-RARITIES.indexOf(rr);
   var gn=give.reduce(function(s,c){return s+c.quantity;},0),rn=receive.reduce(function(s,c){return s+c.quantity;},0);
   var result={give:give,receive:receive,giveFS:0,receiveFS:0,kind:'equal',fee:0};
   if(Math.abs(gap)>1)fail('Solo se pueden intercambiar rarezas iguales o consecutivas.');
   if(!gap){if(gn!==rn)fail('A igual rareza, la cantidad de cromos debe ser equivalente.');return result;}
   var lower=gap<0?gn:rn,higher=gap<0?rn:gn;
   if(higher!==1||(lower!==1&&lower!==2))fail('Ofrece un cromo inferior más FS, o dos inferiores por uno superior.');
   if(lower===2){result.kind='two-for-one';return result;}
   result.kind='topup';result.fee=Math.ceil(Math.abs(prices[gr].machine-prices[rr].machine)*1.2);
   if(gap<0)result.giveFS=result.fee;else result.receiveFS=result.fee;
   return result;
  }
  function machineSale(profile,id,quantity,operationId){
   var quote=sale(id,quantity,'machine');integer(profile.fs,'Saldo FS',0);
   if(typeof operationId!=='string'||operationId.length<8||operationId.length>100)fail('Identificador de operación no válido.');
   var previous=(profile.marketReceipts||[]).find(function(r){return r.id===operationId;});
   if(previous){if(previous.cardId!==id||previous.quantity!==quantity)fail('El identificador pertenece a otra venta.');return profile;}
   if(duplicates(profile.album,id)<quantity)fail('No hay suficientes repetidos. Conservas siempre una copia.');
   integer(profile.fs+quote.total,'Saldo FS',0);
   var remaining=quantity;
   var next=Object.assign({},profile,{fs:profile.fs+quote.total,album:profile.album.filter(function(c){if(c===id&&remaining>0){remaining--;return false;}return true;})});
   next.marketReceipts=[{id:operationId,cardId:id,quantity:quantity,total:quote.total}].concat(profile.marketReceipts||[]).slice(0,100);
   return next;
  }
  return Object.freeze({prices:Object.freeze(prices),integer:integer,card:card,sale:sale,trade:trade,counts:counts,duplicates:duplicates,machineSale:machineSale});
 }
 return Object.freeze({create:create,rarities:RARITIES,integer:integer});
});
