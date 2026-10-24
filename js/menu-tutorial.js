/* Guía de los menús: recorre pantallas reales sin comprar, vender ni crear ligas. */
(function(root){
'use strict';
var KEY='hemiciclo_menu_tutorial_v1';
function create(api){
 return root.HemicycleTutorial.create({
  key:KEY,layerId:'menuTutorialRoot',textId:'menuTutorialText',label:'Guía de los menús',caption:'GUÍA DEL MENÚ',exitSelector:'#menuTutorialExit',
  read:api.read,write:api.write,prepare:api.prepare,pause:api.pause,inBattle:api.isOpen,action:api.action,leave:api.leave,
  steps:[
   ['home','.hud-strip','1. Tu menú principal','Victorias, derrotas, Elo y colección, de un vistazo. El botón inferior más grande indica dónde estás. El buzón guarda los sobres que ganes en Clasificatoria. Toca tus estadísticas.'],
   ['challenges','[data-act="challenges"]','Desafíos por periodo','Completa 7 misiones diarias, 10 semanales y 16 mensuales. Cada misión llena un segmento: reclama los FS y los sobres de la barra por separado. Los premios ganados se conservan al reiniciarse el periodo. Toca para continuar sin reclamar nada.'],
   ['achievements','[data-act="achievements"]','Logros permanentes','Debajo del buzón encontrarás Logros: secciones, cadenas con hitos y recompensas únicas. No se reinician. Las cadenas de líder terminan en 250 victorias. Toca para continuar.'],
   ['profile-open','[data-act="profile"]','Tu perfil','Este botón abre tus estadísticas completas, el nick, el fondo de tu bancada y el acceso a la nube. Tócalo para entrar.','profile-open'],
   ['profile-nick','.profile-nickname','Nick, estadísticas y nube','Aquí puedes elegir tu nick con una cuenta; después tienes un cambio gratis al año. El perfil también reúne tus estadísticas y Nube permite guardar o recuperar tu progreso. Esta visita no cambia nada. Toca este bloque.'],
   ['profile-close','[data-profile="close"]','Vuelve al inicio','El perfil se abre encima del menú. Toca la cruz para volver.','profile-close'],
   ['options','[data-audio-open]','Ajusta el sonido','Opciones contiene el volumen maestro y los niveles de música y efectos, con interruptores independientes. Debajo está Buzón. Toca Opciones; ahora te mostraremos los modos sin cambiar tus ajustes.','modes'],
   ['modes','.play-options','Elige cómo jugar','La flecha de Jugar abre Normal, Clasificatoria, Rápida y Liga. Los gabinetes se editan en Colección. Normal y Clasificatoria usan 90 segundos; Rápida, 60. Toca para conocer el acceso online sin iniciar una partida.','online-demo'],
   ['online-modes','#online-mode','Partidas online desde Inicio','El modo se elige junto a Jugar. Ese botón inicia contra IA; desde Jugadores invitas en Normal o Rápida. La Clasificatoria online se busca por Elo desde el selector de Inicio. Toca el modo indicado.'],
   ['online-players','#online-players','Encuentra a otros jugadores','El listado optativo distingue conectados y desconectados. Una invitación aceptada abre el gabinete de ambos. Para Clasificatoria, sincroniza la nube: conservas tu Elo actual y los resultados los guarda el servidor. Toca el listado de ejemplo.'],
   ['online-close','[data-online="close"]','Vuelve a la guía','No hemos enviado invitaciones ni entrado en una cola. Toca la cruz para visitar la tienda.','online-close-shop'],
   ['free','[data-menu-guide="free"]','2. La tienda','Diario y Semanal son gratuitos y tienen esperas independientes. Los contadores indican cuándo vuelven. Toca este bloque; no reclamaremos ningún sobre.'],
   ['packs','.pack-card .pack-purchase','Uno, cinco o diez sobres','El desplegable elige x1, x5 o x10; el precio muestra el total. Las portadas cambian cada semana por rareza y no garantizan el cromo de la imagen. Toca esta zona para ver una apertura de muestra, sin gastar FS.','demo-pack'],
   ['demo-open','.sealed-pack','Corta y descubre','Toca el sobre: se corta su borde superior antes de mostrar los cinco cromos. En una compra múltiple recorres los sobres uno a uno; todos se guardan desde la compra. Esta apertura es solo una demostración.','demo-reveal'],
   ['demo-rewards','.reward-card','Examina tus premios','Cada cromo abre su ficha y zoom. Volver al sobre no vuelve a cobrar; los repetidos cuentan como copias. Toca este ejemplo: pasaremos a Colección sin añadir estos premios.','collection'],
   ['cabinets','.cabinet-tabs','3. Tu colección','Los cinco números son tus gabinetes favoritos. Toca uno para editar sus miembros y líder; después guarda o cancela. Los retratos muestran quién lo integra. Toca los botones para continuar sin editar.'],
   ['collection-type','.collection-toggle','Oradores o acciones','Un único botón alterna los dos tipos sin perder el gabinete que estés editando. Las acciones se consiguen en los mismos sobres, pero nunca aparecen en las portadas. Toca para ver acciones.','show-actions'],
   ['action-card','#gridBox .action-card','Tus cartas de acción','Su arte y marco identifican el tipo y la rareza. El número indica el coste en TdP. Si aún no tienes acciones, mostramos un ejemplo prestado. Tócalo para consultar la ficha.','action-card'],
   ['action-info','.action-rules','Efecto y requisitos','La ficha explica coste, objetivos, límites y condiciones de activación. Esta misma información está disponible al tocar la acción en tu mano durante el combate. Toca las reglas para volver.','back-orators'],
   ['cabinet-actions','.cabinet-action-slots','Cinco oradores y dos acciones','Debajo de los oradores están los dos huecos opcionales de acción. Edita un favorito, cambia a Acciones, elige hasta dos distintas y guarda. Sus integrantes se editan solo desde Colección. Toca los huecos.'],
   ['filters','#chipsR','Busca y consulta','Busca por nombre o filtra por rareza y doctrina. Toca estos filtros: abriremos una ficha automáticamente. Si tu colección está vacía, usaremos un ejemplo prestado.','card'],
   ['details','.stat','Conoce cada cromo','Coste TdP: presentarlo. Zasca: daño. Aguante: resistencia. Escaños: votos. La ficha incluye doctrina, frases, zoom y navegación. Toca sus valores para ir al mercado.','market'],
   ['market','.market-tabs','4. El mercado','Vende repetidos conservando tu última copia. Comprar e intercambiar con otras personas necesita el servidor compartido. Revisa los datos, marca el tick y confirma cada operación. Toca las pestañas para ver las reglas.','prices'],
   ['rules','.market-prices table','Precios e intercambios','La venta entre jugadores paga al menos un 20 % más que la máquina. Solo se intercambian rarezas iguales o consecutivas; la diferencia se compensa con FS o dos cromos inferiores. Toca la tabla para ir a Ayuda.','help'],
   ['help','[data-act="menu-tutorial"]','Ayuda cuando la necesites','En ? puedes consultar las reglas y repetir por separado esta guía o el tutorial de combate. Las novedades están junto a Ayuda. Toca este botón: iremos a la última parada sin reiniciar la guía.','league'],
   ['league','#tabbar [data-go="liga"]','5. La Liga','Liga es una competición por jornadas, distinta de la Clasificatoria de Elo. Toca su botón para conocer la pantalla sin crear una temporada.','league'],
   ['league-info','#content .view-body>div:first-child','Todo listo para jugar','Aquí ves tu Liga o creas una temporada: 30 grupos, 12 jornadas y tres divisiones. Sus partidas pueden transferir un cromo. Toca este bloque para terminar y volver al inicio.']
  ]
 });
}
root.HemicycleMenuTutorial={create:create,key:KEY};
})(typeof globalThis!=='undefined'?globalThis:this);
