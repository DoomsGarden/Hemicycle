(function(root){
 'use strict';
 root.HemicycleMarketUI={create:function(app){
  var rules=HemicycleMarket.create(app.cards,app.packs),rarities=app.rarities;
  var state={tab:'sell',id:'',quantity:1,target:'machine',search:'',rarity:'',buySearch:'',buyRarity:'',missing:false,remote:false,me:null,seen:false,connecting:false,busy:false,error:'',notice:'',listings:[],players:[],activity:{listings:[],trades:[],receipts:[]},recipient:'',remoteCards:[],give:'',receive:'',method:'fs',extra:''};
  var esc=app.esc;
  function key(){return typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);}
  function repaint(){app.refresh();}
  function profile(){if(!state.remote||!state.me)return app.getProfile();var album=[],actions=[];state.me.inventory.forEach(function(c){for(var i=0;i<c.quantity;i++)(rules.card(c.id).action?actions:album).push(c.id);});return Object.assign({},app.getProfile(),{album:album,actionAlbum:actions,fs:state.me.fs});}
  function ownedCards(){var d=profile();return d.album.concat(d.actionAlbum||[]);}
  function available(){var counts=rules.counts(ownedCards());return app.cards.filter(function(c){return counts[c.id]>1;}).map(function(c){return {card:c,quantity:counts[c.id]-1};});}
  function priceTable(){return '<details class="market-prices"><summary>Precios y reglas del mercado</summary><div class="price-scroll"><table><thead><tr><th>Rareza</th><th>Compra de la IA</th><th>Entre jugadores</th></tr></thead><tbody>'+rarities.map(function(r){var p=rules.prices[r.k];return '<tr><td>'+r.n+'</td><td>'+p.machine+' FS</td><td>'+p.player+' FS</td></tr>';}).join('')+'</tbody></table></div><p>Entre jugadores recibes el precio de la IA +20 %. Los importes se redondean hacia arriba para usar FS enteros. El suplemento de un intercambio es la diferencia entre los precios de la IA +20 %.</p><p>Misma rareza: cantidades equivalentes. Rarezas consecutivas: un cromo inferior más FS, o dos inferiores por uno superior. No se permite saltar dos rarezas. Solo se usan repetidos; se conserva una copia de cada cromo.</p></details>';}
  async function request(path,body){
   var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},6000);
   try{
    var a=app.account&&app.account(),pendingKey=a?'hemicycle_market_pending_v1:'+a.userId:null,pending=null;try{pending=pendingKey&&JSON.parse(localStorage.getItem(pendingKey));}catch(ignore){}
    if(body!==undefined&&a){var semantic=JSON.stringify(Object.keys(body).filter(function(k){return k!=='key'&&k!=='operationId';}).sort().map(function(k){return [k,body[k]];}));if(pending){if(pending.path!==path||pending.semantic!==semantic)throw Error('Hay una operación pendiente. Pulsa Reintentar operación pendiente antes de hacer otra.');body=pending.body;}else{if(!body.key&&!body.operationId)body.operationId=crypto.randomUUID();pending={path:path,semantic:semantic,body:body};localStorage.setItem(pendingKey,JSON.stringify(pending));}}
    var headers=a?{Authorization:'Bearer '+a.accessToken}:{},server=a&&app.base?app.base:'';if(body!==undefined){headers['Content-Type']='application/json';if(!body.key&&!body.operationId)body.operationId=crypto.randomUUID();}
    var response=await fetch(server+'/api/market'+path,{method:body===undefined?'GET':'POST',headers:headers,body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin',cache:'no-store',signal:controller.signal});
    var data=await response.json();if(!response.ok){if(body!==undefined&&pendingKey&&response.status<500)localStorage.removeItem(pendingKey);throw new Error(data.error||'No se ha podido completar la operación.');}if(body!==undefined&&pendingKey)localStorage.removeItem(pendingKey);return data;
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
   var previousNotice=state.notice;
   try{await work();if(state.real&&app.reconcile)await app.reconcile();if(app.sound&&state.notice&&state.notice!==previousNotice)app.sound('reward');}catch(e){state.error=e.message||'No se ha podido completar la operación.';if(app.sound)app.sound('error');}
   state.busy=false;repaint();
  }
  async function enter(){
   if(state.seen)return;state.seen=true;state.connecting=true;repaint();
   try{
    var status=await request('/status');
    if(status.enabled&&(status.demo||status.real&&app.account&&app.account())){if(status.demo)state.me=await request('/session',{});state.real=!!status.real;state.remote=true;await sync();}
   }catch(e){state.remote=false;if(app.account&&app.account())state.error=e.message;}
   state.connecting=false;repaint();
  }
  function summary(title,lines){return '<div class="market-review"><span class="review-step">'+esc(title)+'</span>'+lines.map(function(line){return '<p>'+esc(line)+'</p>';}).join('')+'</div>';}
  function confirmOne(title,lines,label,verify,commit){
   app.modal(title,summary('Revisa los datos y marca el tick para continuar',lines),label,false,function(){
    task(async function(){var verified=await verify();await commit(verified);state.notice='Operación completada.';if(state.remote){await sync();if(state.real&&app.reconcile)await app.reconcile();}});
   },true,true);
  }
  function thumb(c){if(c.action&&app.actionArt)return '<div class="market-thumb" aria-hidden="true">'+app.actionArt(c)+'</div>';return '<div class="market-thumb" aria-hidden="true"><img src="cards/'+c.id+'.webp" alt="" loading="lazy"></div>';}
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
    +form+'<p class="market-note">'+list.length+' cromos con repetidos · toca uno para elegir cantidad y destino.</p><div class="market-stock">'+(list.length?list.map(function(row){var c=row.card;return '<button class="market-card-row'+(state.id===c.id?' selected':'')+'" data-market="select" data-id="'+c.id+'">'+thumb(c)+'<span class="market-card-copy"><b>'+esc(c.n)+'</b><small style="color:'+app.rarity(c.r).c+'">'+app.rarity(c.r).n+' · '+row.quantity+' repetido'+(row.quantity===1?'':'s')+'</small></span><span class="row-price">'+rules.prices[c.r].machine+' <small>FS / ud.</small><span>›</span></span></button>';}).join(''):'<div class="market-empty"><b>No hay repetidos aquí.</b><p>Los cromos de los que solo tienes una copia quedan protegidos.</p></div>')+'</div>';
  }
  function offlineView(){return '<div class="market-empty"><span class="empty-market-icon">⇄</span><b>El mercado entre jugadores necesita un servidor</b><p>Las ventas a la máquina ya están disponibles. Las compras y los intercambios se habilitan al conectar el servicio compartido.</p><button class="btn ghost sm" data-market="connect">Comprobar conexión</button></div>';}
  function buyView(){
   if(!state.remote)return offlineView();
   var owned=rules.counts(ownedCards()),list=state.listings.filter(function(l){var c=rules.card(l.card);return l.seller!==state.me.id&&(!state.missing||!owned[l.card])&&(!state.buyRarity||c.r===state.buyRarity)&&app.search(c.n).includes(app.search(state.buySearch));});
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
   var own=available(),other=state.remoteCards.map(function(c){return {card:rules.card(c.id),quantity:c.available===undefined?c.quantity:c.available};}),terms=null,error='';
   if(state.give&&state.receive){try{terms=tradeTerms();}catch(e){error=e.message;}}
   var different=state.give&&state.receive&&rules.card(state.give).r!==rules.card(state.receive).r;
   var lowerOwn=different&&HemicycleMarket.rarities.indexOf(rules.card(state.give).r)<HemicycleMarket.rarities.indexOf(rules.card(state.receive).r);
   var lowerId=lowerOwn?state.give:state.receive,extras=different?(lowerOwn?own:other).filter(function(row){return row.card.r===rules.card(lowerId).r&&(row.card.id!==lowerId||row.quantity>=2);}):[];
   return '<p class="market-note">Revisa la propuesta, marca el tick y confirma en una sola ventana. El intercambio se completa cuando ambos jugadores lo aceptan.</p>'
    +'<div class="trade-compose"><label>Jugador<select id="tradePlayer"><option value="">Selecciona otro jugador</option>'+state.players.map(function(p){return '<option value="'+p.id+'"'+(state.recipient===p.id?' selected':'')+'>'+esc(p.name)+'</option>';}).join('')+'</select></label>'
    +'<div class="trade-pair"><label>Tú entregas<select id="tradeGive">'+options(own,state.give)+'</select></label><span aria-hidden="true">⇄</span><label>Tú recibes<select id="tradeReceive"'+(!state.recipient?' disabled':'')+'>'+options(other,state.receive)+'</select></label></div>'
    +(different?'<label>Cómo compensar la diferencia<select id="tradeMethod"><option value="fs"'+(state.method==='fs'?' selected':'')+'>Un cromo inferior + suplemento en FS</option><option value="two"'+(state.method==='two'?' selected':'')+'>Dos cromos inferiores por uno superior</option></select></label>':'')
    +(different&&state.method==='two'?'<label>Segundo cromo inferior<select id="tradeExtra">'+options(extras,state.extra)+'</select></label>':'')
    +(terms?'<div class="trade-quote"><b>'+(terms.kind==='equal'?'Intercambio equivalente':terms.kind==='two-for-one'?'Dos por uno · sin suplemento':'Suplemento: '+terms.fee+' FS')+'</b><span>'+(terms.giveFS?'Lo abonas tú.':terms.receiveFS?'Lo abona el otro jugador.':'No se abonan FS adicionales.')+'</span><span>Valor de tus cromos: '+reference(terms.give)+' FS.<br>Valor de los que recibes: '+reference(terms.receive)+' FS.</span></div>':'')
    +(error?'<p class="market-error">'+esc(error)+'</p>':'')
    +'<button class="btn wide" data-market="propose"'+(!terms||!state.recipient||state.busy?' disabled':'')+'>Revisar propuesta</button></div>'
    +(!state.players.length?'<p class="market-note">'+(state.real?'No hay jugadores que permitan propuestas en este momento. Vuelve a actualizar más tarde.':'Abre otra sesión de navegador para añadir un segundo jugador de pruebas.')+'</p>':'');
  }
  function bundleText(items){return items.map(function(c){return c.quantity+' × '+rules.card(c.id).n;}).join(' + ');}
  function tradeLines(t){return [t.proposerName+' entrega: '+bundleText(t.terms.give)+(t.terms.giveFS?' + '+t.terms.giveFS+' FS':''),t.recipientName+' entrega: '+bundleText(t.terms.receive)+(t.terms.receiveFS?' + '+t.terms.receiveFS+' FS':''),'Valor de referencia de los cromos: '+reference(t.terms.give)+' FS frente a '+reference(t.terms.receive)+' FS.','La propuesta caduca si no se completa en '+(state.real?'24 horas':'15 minutos')+'.'];}
  function tradeCard(t){
   var side=t.proposer===state.me.id?'a':'b',confirmed=t.status==='pending'?side==='a':t['confirmed_'+side];
   var labels={pending:'Pendiente de aceptación',verification:'Pendiente de aceptación',confirmation:'Pendiente de aceptación',completed:'Completado',cancelled:'Cancelado',expired:'Caducado'};
   return '<article class="trade-activity"><div class="bar between"><b>Intercambio con '+esc(side==='a'?t.recipientName:t.proposerName)+'</b><span class="trade-status '+t.status+'">'+labels[t.status]+'</span></div>'
    +tradeLines(t).slice(0,2).map(function(line){return '<p>'+esc(line)+'</p>';}).join('')
    +(['pending','verification','confirmation'].includes(t.status)?'<div class="trade-progress"><span>'+(confirmed?'✓ Tú has aceptado':'○ Tu aceptación pendiente')+'</span><span>'+(t['confirmed_'+(side==='a'?'b':'a')]?'✓ El otro jugador ha aceptado':'○ El otro jugador pendiente')+'</span></div><div class="bar">'
     +(!confirmed?'<button class="btn sm" data-market="accept" data-id="'+t.id+'">Revisar intercambio</button>':'<span class="market-note">Esperando al otro jugador.</span>')
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
  function pendingRequest(){try{var a=app.account&&app.account();return a&&JSON.parse(localStorage.getItem('hemicycle_market_pending_v1:'+a.userId));}catch(ignore){return null;}}
  function render(){
   return '<div class="market-heading"><div><span class="eyebrow">TU COLECCIÓN TIENE VALOR</span><h2>Mercado<span class="market-dot">.</span></h2></div><strong class="market-balance" aria-label="Saldo disponible">'+profile().fs+' FS</strong><button class="mini market-refresh" data-market="refresh"'+(state.busy||state.connecting?' disabled':'')+' aria-label="Actualizar mercado">↻</button></div>'
    +'<div class="market-account '+(state.remote?(state.real?'connected':'demo'):'')+'"><span class="account-dot"></span><span>'+(state.connecting?'Comprobando conexión…':state.remote?(state.real?'Mercado conectado · ':'Mercado de pruebas · ')+esc(state.me.name):'Venta a la máquina · guardado local')+'</span></div>'
    +(state.remote&&!state.real?'<p class="market-note demo-note">Inventario y FS de demostración. Tu partida real se conserva aparte.</p>':'')
    +(state.remote&&state.real?'<label class="market-note"><input type="checkbox" data-market-visibility '+(state.me.visible?'checked':'')+'> Permitir propuestas de intercambio: mostrar mi nick y mis repetidos.</label>':'')+'<div class="market-tabs" role="tablist" aria-label="Secciones del mercado">'+[['sell','Vender'],['buy','Comprar'],['trade','Intercambiar'],['activity','Mis operaciones']].map(function(tab){return '<button role="tab" aria-selected="'+(state.tab===tab[0])+'" class="'+(state.tab===tab[0]?'on':'')+'" data-market="tab" data-value="'+tab[0]+'">'+tab[1]+'</button>';}).join('')+'</div>'
    +(pendingRequest()?'<button class="btn ghost sm" data-market="retry-pending">Reintentar operación pendiente</button>':'')+(state.error?'<p class="market-error" role="alert">'+esc(state.error)+'</p>':'')+(state.notice?'<p class="market-success" role="status">'+esc(state.notice)+'</p>':'')
    +'<div class="inner-scroll market-body" id="marketBody"><div class="market-section-intro"><b>'+({sell:'Vende tus repetidos',buy:'Completa tu colección',trade:'Intercambia con otro jugador',activity:'Tus ofertas, propuestas e historial'}[state.tab])+'</b><p>'+({sell:'Elige un cromo. Conservas siempre una copia de cada uno.',buy:'Busca ofertas de jugadores y revisa su precio antes de pagar.',trade:'Elige un jugador, lo que entregas y lo que quieres recibir.',activity:'Acepta propuestas, retira ofertas o consulta tus últimas operaciones.'}[state.tab])+'</p></div>'+({sell:sellView,buy:buyView,trade:tradeView,activity:activityView}[state.tab]())+priceTable()+'</div>';
  }
  function handle(button){
   var action=button.dataset.market,id=button.dataset.id;if(state.busy||state.connecting)return;
   state.error='';state.notice='';
   if(action==='retry-pending'){var pending=pendingRequest();if(pending)task(async function(){await request(pending.path,pending.body);await sync();});return;}
   if(action==='tab'){state.tab=button.dataset.value;repaint();return;}
   if(action==='missing'){state.missing=!state.missing;repaint();return;}
   if(action==='select'){state.id=id;state.quantity=1;repaint();return;}
   if(action==='unselect'){state.id='';repaint();return;}
   if(action==='target'){state.target=button.dataset.value;repaint();return;}
   if(action==='less'||action==='more'){state.quantity=Math.max(1,Math.min(rules.duplicates(ownedCards(),state.id),state.quantity+(action==='more'?1:-1)));repaint();return;}
   if(action==='connect'){state.seen=false;enter();return;}
   if(action==='refresh'){if(state.remote)task(sync);else{state.seen=false;enter();}return;}
   if(action==='sell'){
    var target=state.remote?state.target:'machine',quantity=state.quantity,cardId=state.id,quote=rules.sale(cardId,quantity,target),operation=key();
    var lines=[quantity+' × '+rules.card(cardId).n,(target==='machine'?'La máquina paga: ':'Precio total de la oferta: ')+quote.total+' FS',target==='machine'?'La venta es definitiva. Se conserva una copia.':'Recibirás los FS cuando otro jugador compre. Los cromos quedan reservados.'];
    confirmOne(target==='machine'?'Vender a la máquina':'Publicar oferta',lines,target==='machine'?'Realizar venta':'Publicar oferta',async function(){if(rules.duplicates(ownedCards(),cardId)<quantity)throw new Error('La cantidad de repetidos ha cambiado.');return quote;},async function(){
     if(app.account&&app.account()&&!state.remote)throw Error('Conecta con el mercado para verificar la venta. Tu colección está protegida.');
     if(state.remote)await request(target==='machine'?'/sales/machine':'/listings',{id:cardId,quantity:quantity,key:operation});
     else{var save=function(){app.saveProfile(rules.machineSale(app.getProfile(),cardId,quantity,operation));};if(navigator.locks)await navigator.locks.request('hemicycle-market-sale',save);else save();}
     state.id='';
    });return;
   }
   if(action==='buy'){
    var listing=state.listings.find(function(l){return l.id===id;});if(!listing)return;
    app.quantityModal(rules.card(listing.card).n,listing.remaining,listing.unit,function(quantity){
     task(async function(){
      var quote=await request('/quotes/purchase',{listing:id,quantity:quantity});
      if(quote.cardId!==listing.card||quote.quantity!==quantity||quote.unit!==listing.unit||quote.total!==quantity*listing.unit)throw new Error('La oferta ha cambiado. Revisa la compra de nuevo.');
      await request('/purchases',{quote:quote.id});if(state.real&&app.reconcile)await app.reconcile();state.notice='Compra completada.';await sync();
     });
    },listing.sellerName);return;
   }
   if(action==='propose'){
    var terms=tradeTerms(),recipient=state.recipient,other=state.players.find(function(p){return p.id===recipient;});
    var proposal={proposerName:state.me.name,recipientName:other.name,terms:terms},operation=key();
    app.modal('Revisar intercambio',summary('Revisa los datos y marca el tick para continuar',tradeLines(proposal).concat(['Al confirmar aceptas la propuesta y reservas tu parte. El intercambio se completa cuando el otro jugador también lo acepta.'])),'Realizar intercambio',false,function(){task(async function(){await request('/trades',{key:operation,recipient:recipient,give:terms.give,receive:terms.receive,accept:true});state.tab='activity';await sync();});},true,true);return;
   }
   if(action==='accept'||action==='cancel-trade'){
    var trade=state.activity.trades.find(function(t){return t.id===id;});if(!trade)return;
    var cancelling=action==='cancel-trade';
    app.modal(cancelling?'Cancelar intercambio':'Revisar intercambio',summary(cancelling?'Devolver recursos':'Revisa los datos y marca el tick para continuar',tradeLines(trade)),cancelling?'Cancelar y devolver reservas':'Realizar intercambio',cancelling,function(){task(async function(){await request('/trades/'+id+'/'+(cancelling?'cancel':'accept'),{});await sync();});},true,!cancelling);return;
   }
   if(action==='cancel-listing'){app.modal('Retirar oferta','Los cromos que aún no se hayan vendido volverán a estar disponibles.','Retirar oferta',false,function(){task(async function(){await request('/listings/'+id+'/cancel',{});await sync();});});}
  }
  function change(input){
   if(input.hasAttribute('data-market-visibility')){task(async function(){await request('/visibility',{visible:input.checked});await sync();});return;}
   var id=input.id;
   if(id==='marketSearch'||id==='marketBuySearch'){var field=id==='marketSearch'?'search':'buySearch';state[field]=input.value;repaint();var next=document.getElementById(id);if(next){next.focus();next.setSelectionRange(state[field].length,state[field].length);}return;}
   if(id==='marketRarity'){state.rarity=input.value;repaint();return;}
   if(id==='marketBuyRarity'){state.buyRarity=input.value;repaint();return;}
   if(id==='marketQuantity'){
    var max=rules.duplicates(ownedCards(),state.id),n=Number(input.value),valid=Number.isSafeInteger(n)&&n>=1&&n<=max;
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
