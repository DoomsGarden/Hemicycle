(function(root){
 'use strict';
 root.HemicycleMarketUI={create:function(app){
  var rules=HemicycleMarket.create(app.cards,app.packs),rarities=app.rarities;
  var state={tab:'sell',id:'',quantity:1,target:'machine',search:'',rarity:'',buySearch:'',buyRarity:'',missing:false,remote:false,me:null,seen:false,connecting:false,busy:false,error:'',notice:'',listings:[],players:[],activity:{listings:[],trades:[],receipts:[]},recipient:'',remoteCards:[],give:'',receive:'',method:'fs',extra:''};
  var esc=app.esc;
  function key(){return typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);}
  function repaint(){app.refresh();}
  function profile(){if(!state.remote||!state.me)return app.getProfile();var album=[];state.me.inventory.forEach(function(c){for(var i=0;i<c.quantity;i++)album.push(c.id);});return Object.assign({},app.getProfile(),{album:album,fs:state.me.fs});}
  function available(){var d=profile(),counts=rules.counts(d.album);return app.cards.filter(function(c){return counts[c.id]>1;}).map(function(c){return {card:c,quantity:counts[c.id]-1};});}
  function priceTable(){return '<details class="market-prices"><summary>Precios y reglas del mercado</summary><div class="price-scroll"><table><thead><tr><th>Rareza</th><th>Compra de la IA</th><th>Entre jugadores</th></tr></thead><tbody>'+rarities.map(function(r){var p=rules.prices[r.k];return '<tr><td>'+r.n+'</td><td>'+p.machine+' FS</td><td>'+p.player+' FS</td></tr>';}).join('')+'</tbody></table></div><p>Entre jugadores recibes el precio de la IA +20 %. Los importes se redondean hacia arriba para usar FS enteros. El suplemento de un intercambio es la diferencia entre los precios de la IA +20 %.</p><p>Misma rareza: cantidades equivalentes. Rarezas consecutivas: un cromo inferior más FS, o dos inferiores por uno superior. No se permite saltar dos rarezas. Solo se usan repetidos; se conserva una copia de cada cromo.</p></details>';}
  async function request(path,body){
   var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},6000);
   try{
    var response=await fetch('/api/market'+path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin',cache:'no-store',signal:controller.signal});
    var data=await response.json();if(!response.ok)throw new Error(data.error||'No se ha podido completar la operación.');return data;
   }catch(e){if(['AbortError','TypeError','SyntaxError'].indexOf(e.name)>=0)throw new Error('No se puede conectar con el mercado. Actualiza antes de volver a intentarlo.');throw e;}
   finally{clearTimeout(timer);}
  }
  async function sync(){
   var values=await Promise.all([request('/me'),request('/listings'),request('/players'),request('/activity')]);
   state.me=values[0];state.listings=values[1];state.players=values[2];state.activity=values[3];
   if(state.recipient)state.remoteCards=await request('/players/'+state.recipient+'/cards');
  }
  async function task(work){
   if(state.busy)return;state.busy=true;state.error='';repaint();
   try{await work();}catch(e){state.error=e.message||'No se ha podido completar la operación.';}
   state.busy=false;repaint();
  }
  async function enter(){
   if(state.seen)return;state.seen=true;state.connecting=true;repaint();
   try{
    var status=await request('/status');
    if(status.enabled&&status.demo){state.me=await request('/session',{});state.remote=true;await sync();}
   }catch(e){state.remote=false;}
   state.connecting=false;repaint();
  }
  function summary(title,lines){return '<div class="market-review"><span class="review-step">'+esc(title)+'</span>'+lines.map(function(line){return '<p>'+esc(line)+'</p>';}).join('')+'</div>';}
  function confirmTwo(title,lines,verify,commit){
   app.modal(title,summary('Paso 1 de 2 · Revisa las condiciones',lines),'Verificar condiciones',false,function(){
    task(async function(){var verified=await verify();app.modal(title,summary('Paso 2 de 2 · Confirmación final',lines),'Confirmar operación',false,function(){task(async function(){await commit(verified);state.notice='Operación completada.';if(state.remote)await sync();});});});
   },true);
  }
  function thumb(c){return '<div class="market-thumb" aria-hidden="true"><img src="cards/'+c.id+'.webp" alt="" loading="lazy"></div>';}
  function sellView(){
   var owned=available(),list=owned.filter(function(row){return (!state.rarity||row.card.r===state.rarity)&&app.search(row.card.n).includes(app.search(state.search));});
   var selected=owned.find(function(row){return row.card.id===state.id;}),form='';
   if(selected){
    var c=selected.card,q=Math.min(state.quantity,selected.quantity),target=state.remote?state.target:'machine',quote=rules.sale(c.id,q,target);state.quantity=q;
    form='<section class="sell-sheet"><div class="bar between"><b>'+esc(c.n)+'</b><button class="mini" data-market="unselect" aria-label="Cerrar selección">×</button></div>'
     +'<div class="sell-target"><button data-market="target" data-value="machine" class="'+(target==='machine'?'on':'')+'">A la máquina</button><button data-market="target" data-value="player" class="'+(target==='player'?'on':'')+'"'+(!state.remote?' disabled':'')+'>A otro jugador</button></div>'
     +'<div class="quantity-row"><label for="marketQuantity">Cantidad <small>'+selected.quantity+' repetidos disponibles</small></label><div class="quantity-control"><button class="mini" data-market="less" aria-label="Vender uno menos"'+(q<=1?' disabled':'')+'>−</button><input id="marketQuantity" type="number" min="1" max="'+selected.quantity+'" value="'+q+'" inputmode="numeric"><button class="mini" data-market="more" aria-label="Vender uno más"'+(q>=selected.quantity?' disabled':'')+'>+</button></div></div>'
     +'<div class="sell-total"><span>'+quote.unit+' FS por cromo</span><strong>'+quote.total+' <small>FS</small></strong></div><p class="market-note">'+(target==='player'?'Los cromos se reservan hasta la compra. Puedes retirar la oferta y recuperarlos.':'La venta conserva una copia del cromo en tu colección.')+'</p>'
     +'<button class="btn wide" data-market="sell"'+(state.busy||state.connecting?' disabled':'')+'>'+(target==='player'?'Revisar oferta':'Revisar venta')+'</button></section>';
   }
   return '<div class="market-filters"><input id="marketSearch" type="search" placeholder="Buscar entre tus repetidos…" value="'+esc(state.search)+'" aria-label="Buscar repetidos"><select id="marketRarity" aria-label="Filtrar rareza"><option value="">Todas las rarezas</option>'+rarities.map(function(r){return '<option value="'+r.k+'"'+(state.rarity===r.k?' selected':'')+'>'+r.n+'</option>';}).join('')+'</select></div>'
    +form+'<div class="market-stock">'+(list.length?list.map(function(row){var c=row.card;return '<button class="market-card-row'+(state.id===c.id?' selected':'')+'" data-market="select" data-id="'+c.id+'">'+thumb(c)+'<span class="market-card-copy"><b>'+esc(c.n)+'</b><small style="color:'+app.rarity(c.r).c+'">'+app.rarity(c.r).n+' · '+row.quantity+' repetido'+(row.quantity===1?'':'s')+'</small></span><span class="row-price">'+rules.prices[c.r].machine+' <small>FS / ud.</small><span>›</span></span></button>';}).join(''):'<div class="market-empty"><b>No hay repetidos aquí.</b><p>Los cromos de los que solo tienes una copia quedan protegidos.</p></div>')+'</div>';
  }
  function offlineView(){return '<div class="market-empty"><span class="empty-market-icon">⇄</span><b>El mercado entre jugadores necesita un servidor</b><p>Las ventas a la máquina ya están disponibles. Las compras y los intercambios se habilitan al conectar el servicio compartido.</p><button class="btn ghost sm" data-market="connect">Comprobar conexión</button></div>';}
  function buyView(){
   if(!state.remote)return offlineView();
   var owned=rules.counts(profile().album),list=state.listings.filter(function(l){var c=rules.card(l.card);return l.seller!==state.me.id&&(!state.missing||!owned[l.card])&&(!state.buyRarity||c.r===state.buyRarity)&&app.search(c.n).includes(app.search(state.buySearch));});
   return '<div class="market-filters"><input id="marketBuySearch" type="search" placeholder="Busca el cromo que te falta…" value="'+esc(state.buySearch)+'" aria-label="Buscar ofertas"><select id="marketBuyRarity" aria-label="Rareza de las ofertas"><option value="">Todas las rarezas</option>'+rarities.map(function(r){return '<option value="'+r.k+'"'+(state.buyRarity===r.k?' selected':'')+'>'+r.n+'</option>';}).join('')+'</select></div><button class="missing-filter'+(state.missing?' on':'')+'" data-market="missing" aria-pressed="'+state.missing+'">'+(state.missing?'✓ ':'')+'Solo los que me faltan</button><p class="market-note">Ofertas de otros jugadores. Verificarás el importe antes de confirmar cada compra.</p>'+(list.length?list.map(function(l){var c=rules.card(l.card);return '<div class="market-card-row">'+thumb(c)+'<span class="market-card-copy"><b>'+esc(c.n)+'</b><small>'+esc(l.sellerName)+' · '+l.remaining+' disponibles</small><strong>'+l.unit+' FS por cromo</strong>'+(!owned[l.card]?'<small class="missing-label">Te falta en la colección</small>':'')+'</span><button class="btn sm" data-market="buy" data-id="'+l.id+'">Comprar</button></div>';}).join(''):'<div class="market-empty"><b>No hay ofertas que coincidan.</b><p>'+(state.buySearch||state.buyRarity||state.missing?'Prueba otros filtros o vuelve a actualizar más tarde.':'Publica tus repetidos desde Vender o vuelve a actualizar más tarde.')+'</p></div>');
  }
  function options(list,selected){return '<option value="">Selecciona un cromo</option>'+list.map(function(row){var c=row.card||rules.card(row.id);return '<option value="'+c.id+'"'+(selected===c.id?' selected':'')+'>'+esc(c.n)+' · '+app.rarity(c.r).n+'</option>';}).join('');}
  function tradeTerms(){
   var give=[{id:state.give,quantity:1}],receive=[{id:state.receive,quantity:1}];
   if(state.method==='two'&&rules.card(state.give).r!==rules.card(state.receive).r){
    if(!state.extra)throw new Error('Selecciona el segundo cromo inferior.');
    var lower=HemicycleMarket.rarities.indexOf(rules.card(state.give).r)<HemicycleMarket.rarities.indexOf(rules.card(state.receive).r);
    (lower?give:receive).push({id:state.extra,quantity:1});
   }
   return rules.trade(give,receive);
  }
  function reference(items){return items.reduce(function(sum,c){return sum+rules.prices[rules.card(c.id).r].player*c.quantity;},0);}
  function tradeView(){
   if(!state.remote)return offlineView();
   var own=available(),other=state.remoteCards.map(function(c){return {card:rules.card(c.id),quantity:c.available};}),terms=null,error='';
   if(state.give&&state.receive){try{terms=tradeTerms();}catch(e){error=e.message;}}
   var different=state.give&&state.receive&&rules.card(state.give).r!==rules.card(state.receive).r;
   var lowerOwn=different&&HemicycleMarket.rarities.indexOf(rules.card(state.give).r)<HemicycleMarket.rarities.indexOf(rules.card(state.receive).r);
   var lowerId=lowerOwn?state.give:state.receive,extras=different?(lowerOwn?own:other).filter(function(row){return row.card.r===rules.card(lowerId).r&&(row.card.id!==lowerId||row.quantity>=2);}):[];
   return '<p class="market-note">Primero se verifican las condiciones y se reservan los recursos. Después, ambos jugadores confirman el intercambio.</p>'
    +'<div class="trade-compose"><label>Jugador<select id="tradePlayer"><option value="">Selecciona otro jugador</option>'+state.players.map(function(p){return '<option value="'+p.id+'"'+(state.recipient===p.id?' selected':'')+'>'+esc(p.name)+'</option>';}).join('')+'</select></label>'
    +'<div class="trade-pair"><label>Tú entregas<select id="tradeGive">'+options(own,state.give)+'</select></label><span aria-hidden="true">⇄</span><label>Tú recibes<select id="tradeReceive"'+(!state.recipient?' disabled':'')+'>'+options(other,state.receive)+'</select></label></div>'
    +(different?'<label>Cómo compensar la diferencia<select id="tradeMethod"><option value="fs"'+(state.method==='fs'?' selected':'')+'>Un cromo inferior + suplemento en FS</option><option value="two"'+(state.method==='two'?' selected':'')+'>Dos cromos inferiores por uno superior</option></select></label>':'')
    +(different&&state.method==='two'?'<label>Segundo cromo inferior<select id="tradeExtra">'+options(extras,state.extra)+'</select></label>':'')
    +(terms?'<div class="trade-quote"><b>'+(terms.kind==='equal'?'Intercambio equivalente':terms.kind==='two-for-one'?'Dos por uno · sin suplemento':'Suplemento: '+terms.fee+' FS')+'</b><span>'+(terms.giveFS?'Lo abonas tú.':terms.receiveFS?'Lo abona el otro jugador.':'No se abonan FS adicionales.')+'</span><span>Valor de tus cromos: '+reference(terms.give)+' FS.<br>Valor de los que recibes: '+reference(terms.receive)+' FS.</span></div>':'')
    +(error?'<p class="market-error">'+esc(error)+'</p>':'')
    +'<button class="btn wide" data-market="propose"'+(!terms||!state.recipient||state.busy?' disabled':'')+'>Revisar propuesta</button></div>'
    +(!state.players.length?'<p class="market-note">Abre otra sesión de navegador para añadir un segundo jugador de pruebas.</p>':'');
  }
  function bundleText(items){return items.map(function(c){return c.quantity+' × '+rules.card(c.id).n;}).join(' + ');}
  function tradeLines(t){return [t.proposerName+' entrega: '+bundleText(t.terms.give)+(t.terms.giveFS?' + '+t.terms.giveFS+' FS':''),t.recipientName+' entrega: '+bundleText(t.terms.receive)+(t.terms.receiveFS?' + '+t.terms.receiveFS+' FS':''),'Valor de referencia de los cromos: '+reference(t.terms.give)+' FS frente a '+reference(t.terms.receive)+' FS.','La propuesta caduca si no se completa en 15 minutos.'];}
  function tradeCard(t){
   var side=t.proposer===state.me.id?'a':'b',verified=t['verified_'+side],confirmed=t['confirmed_'+side];
   var labels={verification:'1 · Verificación',confirmation:'2 · Confirmación',completed:'Completado',cancelled:'Cancelado',expired:'Caducado'};
   return '<article class="trade-activity"><div class="bar between"><b>Intercambio con '+esc(side==='a'?t.recipientName:t.proposerName)+'</b><span class="trade-status '+t.status+'">'+labels[t.status]+'</span></div>'
    +tradeLines(t).slice(0,2).map(function(line){return '<p>'+esc(line)+'</p>';}).join('')
    +(['verification','confirmation'].includes(t.status)?'<div class="trade-progress"><span>'+((t.verified_a&&t.verified_b)?'✓':'○')+' Ambos verifican</span><span>'+((t.confirmed_a&&t.confirmed_b)?'✓':'○')+' Ambos confirman</span></div><div class="bar">'
     +(t.status==='verification'&&!verified?'<button class="btn sm" data-market="verify" data-id="'+t.id+'">Verificar condiciones</button>':t.status==='confirmation'&&!confirmed?'<button class="btn sm" data-market="confirm" data-id="'+t.id+'">Confirmar intercambio</button>':'<span class="market-note">Esperando al otro jugador.</span>')
     +'<button class="btn ghost sm" data-market="cancel-trade" data-id="'+t.id+'">Cancelar</button></div>':'')+'</article>';
  }
  function activityView(){
   if(!state.remote){var receipts=app.getProfile().marketReceipts||[];return receipts.length?receipts.map(function(r){return '<div class="market-receipt"><span>'+r.quantity+' × '+esc(rules.card(r.cardId).n)+'</span><b>+'+r.total+' FS</b></div>';}).join(''):'<div class="market-empty"><b>Todavía no has realizado ventas.</b><p>Aquí podrás revisar tus últimas operaciones.</p></div>';}
   var offers=state.activity.listings.filter(function(l){return l.status==='active';});
   var receipts=state.activity.receipts;
   return '<h3>Intercambios</h3>'+(state.activity.trades.length?state.activity.trades.map(tradeCard).join(''):'<p class="market-note">Todavía no hay propuestas.</p>')
    +'<h3>Mis ofertas</h3>'+(offers.length?offers.map(function(l){return '<div class="market-receipt"><span>'+esc(rules.card(l.card).n)+'<small>'+l.remaining+' reservados · '+l.unit+' FS / ud.</small></span><button class="btn ghost sm" data-market="cancel-listing" data-id="'+l.id+'">Retirar</button></div>';}).join(''):'<p class="market-note">No tienes ofertas abiertas.</p>')
    +'<h3>Operaciones recientes</h3>'+(receipts.length?receipts.map(function(r){var labels={machine:'Venta a la máquina',purchase:'Compra', 'player-sale':'Venta a un jugador',trade:'Intercambio completado'};return '<div class="market-receipt"><span>'+labels[r.kind]+(r.data.cardId?'<small>'+r.data.quantity+' × '+esc(rules.card(r.data.cardId).n)+'</small>':'')+'</span>'+(r.data.total?'<b>'+(r.kind==='purchase'?'−':'+')+r.data.total+' FS</b>':'<b>✓</b>')+'</div>';}).join(''):'<p class="market-note">Todavía no hay operaciones completadas.</p>');
  }
  function render(){
   return '<div class="market-heading"><div><span class="eyebrow">TU COLECCIÓN TIENE VALOR</span><h2>Mercado<span class="market-dot">.</span></h2></div><button class="mini market-refresh" data-market="refresh"'+(state.busy||state.connecting?' disabled':'')+' aria-label="Actualizar mercado">↻</button></div>'
    +'<div class="market-account '+(state.remote?'demo':'')+'"><span class="account-dot"></span><span>'+(state.connecting?'Comprobando conexión…':state.remote?'Mercado de pruebas · '+esc(state.me.name):'Venta a la máquina · guardado local')+'</span></div>'
    +(state.remote?'<p class="market-note demo-note">Inventario y FS de demostración. Tu partida real se conserva aparte.</p>':'')
    +'<div class="market-tabs" role="tablist" aria-label="Secciones del mercado">'+[['sell','Vender'],['buy','Comprar'],['trade','Intercambiar'],['activity','Actividad']].map(function(tab){return '<button role="tab" aria-selected="'+(state.tab===tab[0])+'" class="'+(state.tab===tab[0]?'on':'')+'" data-market="tab" data-value="'+tab[0]+'">'+tab[1]+'</button>';}).join('')+'</div>'
    +(state.error?'<p class="market-error" role="alert">'+esc(state.error)+'</p>':'')+(state.notice?'<p class="market-success" role="status">'+esc(state.notice)+'</p>':'')
    +'<div class="inner-scroll market-body" id="marketBody">'+({sell:sellView,buy:buyView,trade:tradeView,activity:activityView}[state.tab]())+priceTable()+'</div>';
  }
  function handle(button){
   var action=button.dataset.market,id=button.dataset.id;if(state.busy||state.connecting)return;
   state.error='';state.notice='';
   if(action==='tab'){state.tab=button.dataset.value;repaint();return;}
   if(action==='missing'){state.missing=!state.missing;repaint();return;}
   if(action==='select'){state.id=id;state.quantity=1;repaint();return;}
   if(action==='unselect'){state.id='';repaint();return;}
   if(action==='target'){state.target=button.dataset.value;repaint();return;}
   if(action==='less'||action==='more'){state.quantity=Math.max(1,Math.min(rules.duplicates(profile().album,state.id),state.quantity+(action==='more'?1:-1)));repaint();return;}
   if(action==='connect'){state.seen=false;enter();return;}
   if(action==='refresh'){if(state.remote)task(sync);else{state.seen=false;enter();}return;}
   if(action==='sell'){
    var target=state.remote?state.target:'machine',quantity=state.quantity,cardId=state.id,quote=rules.sale(cardId,quantity,target),operation=key();
    var lines=[quantity+' × '+rules.card(cardId).n,(target==='machine'?'La máquina paga: ':'Precio total de la oferta: ')+quote.total+' FS',target==='machine'?'La venta es definitiva. Se conserva una copia.':'Recibirás los FS cuando otro jugador compre. Los cromos quedan reservados.'];
    confirmTwo(target==='machine'?'Vender a la máquina':'Publicar oferta',lines,async function(){if(rules.duplicates(profile().album,cardId)<quantity)throw new Error('La cantidad de repetidos ha cambiado.');return quote;},async function(){
     if(state.remote)await request(target==='machine'?'/sales/machine':'/listings',{id:cardId,quantity:quantity,key:operation});
     else{var save=function(){app.saveProfile(rules.machineSale(app.getProfile(),cardId,quantity,operation));};if(navigator.locks)await navigator.locks.request('hemicycle-market-sale',save);else save();}
     state.id='';
    });return;
   }
   if(action==='buy'){
    var listing=state.listings.find(function(l){return l.id===id;});if(!listing)return;
    app.quantityModal(rules.card(listing.card).n,listing.remaining,listing.unit,function(quantity){
     var lines=[quantity+' × '+rules.card(listing.card).n,'Vendedor: '+listing.sellerName,'Total: '+quantity*listing.unit+' FS'];
     confirmTwo('Comprar cromos',lines,function(){return request('/quotes/purchase',{listing:id,quantity:quantity});},function(quote){return request('/purchases',{quote:quote.id});});
    });return;
   }
   if(action==='propose'){
    var terms=tradeTerms(),recipient=state.recipient,other=state.players.find(function(p){return p.id===recipient;});
    var proposal={proposerName:state.me.name,recipientName:other.name,terms:terms},operation=key();
    app.modal('Verificar propuesta',summary('Paso 1 de 2 · Verificar y reservar',tradeLines(proposal).concat(['Tus cromos y el suplemento quedan reservados. Se devolverán si se cancela o caduca.'])),'Verificar y enviar',false,function(){task(async function(){await request('/trades',{key:operation,recipient:recipient,give:terms.give,receive:terms.receive,verify:true});state.tab='activity';await sync();});},true);return;
   }
   if(action==='verify'||action==='confirm'||action==='cancel-trade'){
    var trade=state.activity.trades.find(function(t){return t.id===id;});if(!trade)return;
    var labels={verify:['Verificar intercambio','Verificar y reservar'],confirm:['Confirmar intercambio','Confirmar intercambio'],'cancel-trade':['Cancelar intercambio','Cancelar y devolver reservas']};
    app.modal(labels[action][0],summary(action==='verify'?'Paso 1 de 2':action==='confirm'?'Paso 2 de 2':'Devolver recursos',tradeLines(trade)),labels[action][1],action==='cancel-trade',function(){task(async function(){await request('/trades/'+id+'/'+(action==='cancel-trade'?'cancel':action),{});await sync();});},true);return;
   }
   if(action==='cancel-listing'){app.modal('Retirar oferta','Los cromos que aún no se hayan vendido volverán a estar disponibles.','Retirar oferta',false,function(){task(async function(){await request('/listings/'+id+'/cancel',{});await sync();});});}
  }
  function change(input){
   var id=input.id;
   if(id==='marketSearch'||id==='marketBuySearch'){var field=id==='marketSearch'?'search':'buySearch';state[field]=input.value;repaint();var next=document.getElementById(id);if(next){next.focus();next.setSelectionRange(state[field].length,state[field].length);}return;}
   if(id==='marketRarity'){state.rarity=input.value;repaint();return;}
   if(id==='marketBuyRarity'){state.buyRarity=input.value;repaint();return;}
   if(id==='marketQuantity'){
    var max=rules.duplicates(profile().album,state.id),n=Number(input.value),valid=Number.isSafeInteger(n)&&n>=1&&n<=max;
    var sell=document.querySelector('[data-market="sell"]');if(sell)sell.disabled=!valid;
    if(valid){state.quantity=n;var quote=rules.sale(state.id,n,state.remote?state.target:'machine'),total=document.querySelector('.sell-total strong');if(total)total.innerHTML=quote.total+' <small>FS</small>';}
    return;
   }
   if(id==='tradePlayer'){state.recipient=input.value;state.receive='';state.extra='';state.remoteCards=[];if(state.recipient)task(async function(){state.remoteCards=await request('/players/'+state.recipient+'/cards');});else repaint();return;}
   var fields={tradeGive:'give',tradeReceive:'receive',tradeMethod:'method',tradeExtra:'extra'};
   if(fields[id]){state[fields[id]]=input.value;if(id!=='tradeExtra')state.extra='';if(id==='tradeGive'||id==='tradeReceive')state.method='fs';repaint();}
  }
  return {render:render,enter:enter,handle:handle,change:change,profile:profile,state:state};
 }};
})(typeof globalThis!=='undefined'?globalThis:this);
