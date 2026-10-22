/* Guía de los menús: recorre pantallas reales sin comprar, vender ni crear ligas. */
(function(root){
'use strict';
var KEY='hemiciclo_menu_tutorial_v1';
function create(api){
 return root.HemicycleTutorial.create({
  key:KEY,layerId:'menuTutorialRoot',textId:'menuTutorialText',label:'Guía de los menús',caption:'GUÍA DEL MENÚ',exitSelector:'#menuTutorialExit',
  read:api.read,write:api.write,prepare:api.prepare,pause:api.pause,inBattle:api.isOpen,action:api.action,leave:api.leave,
  steps:[
   ['home','#tabbar [data-go="menu"]','1. Tu menú principal','Inicio es tu punto de partida. El botón de la sección abierta se ve más grande. Esta guía no gastará FS ni modificará tu colección. Toca Inicio.'],
   ['stats','.hud-strip','Tu progreso de un vistazo','Aquí aparecen tus victorias, derrotas, Elo y cromos distintos. El saldo de Fuerza Soberana está en la franja superior; el sobre del menú abre tu buzón de recompensas. Toca las estadísticas.'],
   ['profile-open','[data-act="profile"]','Abre tu perfil','El botón cuadrado junto a las victorias y derrotas abre tu perfil sobre el menú principal. Tócalo para conocerlo.','profile-open'],
   ['profile-stats','.profile-stats','Tus estadísticas completas','Aquí consultas tus partidas, victorias, derrotas, Elo, colección y recompensas. Debajo aparecen las rarezas y la Liga; en Tu bancada puedes elegir el fondo de tu mitad del tablero. Desde Perfil → Nube puedes activar una copia de tu cuenta o recuperarla en otro dispositivo. Toca las estadísticas.'],
   ['profile-nick','.profile-nickname','Elige tu nick','Con una cuenta puedes elegir tu nick: la primera elección es gratis y el siguiente cambio gratuito llega al cumplirse un año. Esta visita no modifica el nick ni inicia o cierra sesiones. Toca este bloque para continuar.'],
   ['profile-close','[data-profile="close"]','Regresa al menú','Puedes abrir y cerrar el perfil cuando lo necesites desde Inicio. Toca la cruz para volver al menú y continuar con la guía.','profile-close'],
   ['play','[data-act="play-menu"]','Cómo elegir una partida','Jugar permite preparar tu gabinete. La flecha abre los modos de juego. Tócala para verlos sin iniciar un combate.','modes'],
   ['modes','.play-options','Los modos de juego','Normal permite practicar; Clasificatoria cambia el Elo y tiene botín; Rápida elige tu gabinete; Liga abre la competición por jornadas. Toca este menú para cerrarlo.','close-modes'],
   ['shop','#tabbar [data-go="tienda"]','2. La tienda','Aquí consigues sobres para ampliar la colección. Toca Tienda; durante la guía solo revisaremos sus opciones.','shop'],
   ['free','[data-menu-guide="free"]','Sobres gratuitos','Los sobres diario y semanal tienen sus propios tiempos de espera. Cuando estén disponibles podrás reclamarlos aquí. Toca el bloque para continuar; la guía no los abre.'],
   ['packs','.pack-card','Sobres y Fuerza Soberana','Cada sobre indica su precio en FS y qué rarezas puede contener. Comprueba el contenido antes de comprar. Toca este sobre de ejemplo; no se cobrará ni se abrirá.'],
   ['collection','#tabbar [data-go="coleccion"]','3. Tu colección','Aquí consultas tus cromos y cuántas copias tienes de cada uno. Toca Cromos para abrir la colección.','collection'],
   ['filters','#chipsR','Encuentra tus cromos','Puedes buscar por nombre y filtrar por rareza o doctrina. Todas muestra la colección completa. Toca los filtros para continuar.'],
   ['card','#gridBox [data-card],#gridBox .empty-box','Consulta una ficha','Toca un cromo para ver sus estadísticas, doctrina y frases. Si no tienes cromos, mostraremos una ficha de ejemplo sin añadirla a tu colección.','card'],
   ['details','.stat','Lee sus estadísticas','Coste TdP indica cuánto cuesta presentarlo; Zasca es el daño, Aguante la resistencia y Escaños los votos que aporta. También puedes ampliar la imagen o deslizar entre fichas. Toca las estadísticas.'],
   ['market','#tabbar [data-go="mercado"]','4. El mercado','Vende tus repetidos o consulta las opciones de intercambio. La última copia de cada cromo está protegida. Toca Mercado.','market'],
   ['connection','.market-account','Comprueba la conexión','Las ventas a la máquina funcionan con el guardado local. Comprar e intercambiar con otras personas requiere el servidor compartido. Si aparece una cuenta de pruebas, su inventario es independiente. Toca este estado.'],
   ['market-tabs','.market-tabs','Vender, comprar e intercambiar','Vender permite elegir la cantidad de repetidos. Comprar muestra ofertas; Intercambiar prepara propuestas y Actividad recoge operaciones. Antes de una operación real, revisa los datos, marca el tick y confirma. Toca las pestañas.'],
   ['prices','.market-prices summary','Precios y reglas','La venta entre jugadores paga al menos un 20 % más que la máquina. Los intercambios admiten rarezas iguales o consecutivas; las diferencias se compensan con FS o dos cromos inferiores. Toca para desplegar las reglas.','prices'],
   ['rules','.market-prices table','Consulta los importes','Esta tabla muestra los valores actuales por rareza. Puedes revisar las reglas siempre que lo necesites. Esta guía no crea ofertas ni envía propuestas. Toca la tabla.'],
   ['help','#appbar [data-go="ayuda"]','Ayuda y novedades','El botón ? contiene las reglas y permite repetir por separado el tutorial de combate y esta guía. A su lado están las novedades por versión. Toca Ayuda.','help'],
   ['replay','[data-act="menu-tutorial"]','Repite solo lo que necesites','Tutorial de combate y Guía del menú son independientes. Puedes salir y repetirlos sin penalización. Toca este botón para continuar con la última sección; ahora no reiniciaremos la guía.'],
   ['league','#tabbar [data-go="liga"]','5. La Liga','La Liga es la última parada: una competición de 30 grupos con 12 jornadas, tres divisiones, ascensos y descensos. Toca Liga.','league'],
   ['league-info','#content .view-body>div:first-child','Tu temporada','Desde aquí puedes crear una temporada o consultar la que ya tienes. Las partidas de Liga tienen botín y pueden transferir una copia de un cromo. La guía no crea temporadas ni juega jornadas. Toca este bloque para terminar.']
  ]
 });
}
root.HemicycleMenuTutorial={create:create,key:KEY};
})(typeof globalThis!=='undefined'?globalThis:this);
