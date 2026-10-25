/* Primera visita desde v31.0.2.2; sin compras ni transferencias durante la guía. */
(function(root){'use strict';const KEY='hemiciclo_market_tutorial_v1';
function create(api){return HemicycleTutorial.create({key:KEY,layerId:'marketTutorialRoot',textId:'marketTutorialText',label:'Guía de Mercado',caption:'MERCADO',exitSelector:'#menuTutorialExit',read:api.read,write:api.write,inBattle:api.isOpen,prepare:api.prepare,pause:api.leave,leave:api.leave,action:api.action,steps:[
 ['tabs','.market-tabs','Tu Mercado','Vender, Comprar, Intercambio y Operaciones. Esta guía no gasta FS ni mueve cromos. Toca las pestañas.'],
 ['search','#marketSearch','Encuentra tus repetidos','Solo puedes vender copias repetidas: siempre conservas una. Busca por nombre o filtra por rareza. Toca el buscador.'],
 ['sales','.market-body','Vende con confirmación','Elige un repetido, la cantidad y si lo vendes a la máquina o publicas una oferta. Antes de confirmar verás el total y marcarás el tick. Toca esta zona.','buy'],
 ['buy','.market-tabs [data-value="buy"]','Compra para tu colección','Las ofertas muestran precio y cantidad disponible. Solo los que me faltan ayuda a completar tu colección. Toca Comprar.','trade'],
 ['trade','.market-tabs [data-value="trade"]','Compara antes de intercambiar','El selector visual muestra qué entregas, qué recibes y quién paga el suplemento de FS. Solo se permiten rarezas iguales o consecutivas. Toca Intercambio.','demo'],
 ['comparison','.market-guide-demo','Un ejemplo, sin gastar','Estas cartas son una demostración. En un intercambio real debes elegir un jugador y tus repetidos; el servidor valida ambos inventarios. Toca la comparación.','activity'],
 ['activity','.market-tabs [data-value="activity"]','Tus operaciones','Aquí aceptas propuestas, retiras ofertas y revisas operaciones. Mostrar tu nick y repetidos para recibir propuestas es opcional. Puedes repetir esta guía desde Ayuda. Toca para terminar.']
]});}root.HemicycleMarketTutorial={create,key:KEY};})(globalThis);
