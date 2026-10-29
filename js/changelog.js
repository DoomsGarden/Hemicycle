/* Notas del prelanzamiento, contrastadas con el historial del repositorio. */
(function(root,entries){
 if(typeof module==='object'&&module.exports)module.exports=entries;
 else root.HemicycleChangelog=entries;
})(typeof globalThis!=='undefined'?globalThis:this,[
{"version": "v31.0.2.8", "date": "2026-10-29", "title": "Habilidades para el ataque básico", "sections": [{"title": "Estados y estilos", "items": ["Corrección: los ataques rechazados dejan de bloquear la partida. Las casillas vacías y las frases indican el límite compartido de 3 votos por turno; un objetivo desaparecido no se convierte en un hueco. El ataque básico muestra el icono de su habilidad, efecto y disponibilidad. Las fichas eliminan las reglas repetidas, reunidas en Ayuda junto al listado de oradores por habilidad.", "Revisión de los 120 oradores: 67 reciben una habilidad adicional y 53 conservan sus estadísticas y doctrina. Se viene arriba, Café parlamentario, Hemeroteca insistente, Lengua de trapo, Argumentario plastificado y Micrófono indiscreto aportan presión, desgaste, control o protección.", "Cada orador admite un solo estado básico activo, positivo o negativo. El primero permanece hasta consumirse o caducar: no se acumula, renueva ni sustituye. Cada habilidad puede generar un estado una vez cada dos turnos propios.", "Solo causar daño con un básico a un orador puede generar estados; el fuerte, las acciones y golpear huecos no los aplican. El desgaste sucede antes de los votos pasivos; una expulsión concede los escaños habituales una sola vez."]}, {"title": "Lectura y compatibilidad", "items": ["El estado aparece sobre el hombro izquierdo del orador afectado, con icono propio, color y duración consultable. La ficha de Colección explica su habilidad y los consejos de combate recuerdan cómo consultar el icono. Se respeta el movimiento reducido.", "Los combates anteriores conservan sus reglas. Los nuevos paquetes descargados usan offline4; los resultados antiguos se verifican con su motor original. La práctica guiada utiliza cromos prestados sin habilidades adicionales para enseñar las reglas básicas.", "Se conservan las estadísticas, escaños, fórmula y ciclo del fuerte, doctrinas, acciones y progresión de Elo de la versión anterior."]}]},
{"version": "v31.0.2.7", "date": "2026-10-29", "title": "Ajuste de oradores y escaños", "sections": [{"title": "Estadísticas base", "items": ["Comunes: coste 1 con 2 de Zasca y 4 de Aguante; coste 2 con 2 y 5. Los comunes de coste 3 pasan a 2. Raros: coste 2 con 4 y 6; costes 3 y 4 con 4 y 7.", "Especiales: coste 3 con 5 de Zasca y 8 de Aguante; coste 4 con 6 y 8. Legendarios: coste 4 con 7 y 11; coste 5 con 7 y 14. Los costes de raros, especiales y legendarios se conservan."]}, {"title": "Ritmo de los debates", "items": ["Escaños por rareza: 2 en comunes, 3 en raros, 4 en especiales y 5 en legendarios. Se aplican a los votos por turno y al expulsar rivales. Se mantienen los 3 votos base: dos legendarios y un especial producen 17 votos por turno en lugar de 24.", "El fuerte conserva el 150 % del Zasca, el redondeo, su ciclo de tres turnos y su coste de Aguante. Se conservan los bonos de líder, doctrinas, acciones, Elo y escalafones."]}, {"title": "Partidas anteriores", "items": ["Las nuevas partidas usan el catálogo ajustado. Las salas ya preparándose y las partidas descargadas anteriores mantienen las estadísticas con las que empezaron; los resultados pendientes se verifican con su versión original."]}]},
{"version": "v31.0.2.6", "date": "2026-10-29", "title": "Entrada breve y conexiones claras", "sections": [{"title": "Aprender a tu ritmo", "items": ["Corrección de primera entrada: el selector de edad busca espacio para mostrar todas sus opciones; los listados largos anuncian el desplazamiento y muestran su barra. La práctica comparte el tablero, tamaños y Acta flotante del combate normal. Tiempo de Palabra se explica antes de usar TdP, y las ayudas y ventanas de frases usan fondos translúcidos con texto nítido y un resplandor sobre el objetivo.", "Corrección de fuentes: nueva página con las 360 frases del catálogo actual, buscador por orador o expresión y distinción entre fragmentos, traducciones, adaptación y referencias parciales. Información legal ampliada para explicar su contexto lúdico y las ilustraciones generadas mediante IA.", "La primera práctica se reduce a ocho pasos sobre oradores, ataques, turnos y votos. La guía completa, las prácticas tácticas y los menús siguen disponibles desde Ayuda, sin encadenar automáticamente la visita completa al terminar.", "La guía de menús se adapta a los invitados de 12–13 años y evita los pasos de cuenta que no corresponden. Consejos breves de acciones, curación y fuerte aparecen cuando pueden resultar útiles y se pueden ocultar."]}, {"title": "Conexión y Mercado", "items": ["Corrección: el diagnóstico muestra sus párrafos sin etiquetas HTML visibles y la descarga con el botón normal. Aclara que mide operaciones completas, no ping, y muestra las interrupciones por separado.", "Las esperas distinguen la comprobación del guardado, la preparación de partida y la búsqueda de rival. Puedes volver mientras se comprueba una operación, conservando los identificadores y la recuperación de resultados pendientes.", "Ayuda permite descargar un diagnóstico local de tiempos de esta sesión, sin identidad ni contenido de operaciones y sin envío automático.", "Mercado diferencia falta de ofertas y filtros sin coincidencias, con acceso para limpiar filtros o vender repetidos. No se simula actividad de otros jugadores."]}, {"title": "Carga y mantenimiento", "items": ["Los recursos esenciales se preparan primero; las animaciones y pistas restantes se completan en segundo plano. Opciones permite preparar expresamente los recursos para uso sin conexión.", "Marcos identificados por rareza explícita y código base separado por responsabilidades. Se conservan las reglas y la compatibilidad con partidas descargadas antiguas.", "Clasificatoria muestra el progreso a la siguiente subdivisión sin alterar Elo, escalafones, umbrales o premios de ascenso. Los metadatos identifican el juego como independiente y no oficial."]}]},
{"version": "v31.0.2.5", "date": "2026-10-28", "title": "El Senado cobra vida", "sections": [{"title": "Dominio del juego", "items": ["La dirección principal del juego pasa a hemicycle.online. Las cuentas y su progreso vinculado permanecen en el mismo servicio de nube. El guardado local de GitHub Pages pertenece a otro origen: conserva una copia antes del cambio y, al entrar en el dominio nuevo, revisa y recupera la nube de tu cuenta habitual."]}, {"title": "Información legal y acceso", "items": ["Nueva ventana de información legal tras Iniciar y antes de entrar al juego, con documentos desplegables, condiciones sin aceptación premarcada y acceso permanente desde Opciones. La consulta y la aceptación guardada funcionan sin conexión; un fallo del servidor no bloquea la entrada.", "Acceso desde 12 años: los jugadores de 12–13 utilizan el modo invitado; las cuentas están disponibles desde 14 años. Se declara un tramo de edad sin pedir la fecha de nacimiento completa.", "Fuentes y créditos explican la generación de las ilustraciones mediante IA y las referencias documentadas, sin atribuir afiliación a partidos, instituciones o personas representadas. Opciones incorpora acceso a los contactos de soporte, legal y privacidad."]}, {"title": "Recuperación de cuenta", "items": ["Corrección: los enlaces válidos de recuperación abren el formulario de nueva contraseña al entrar, también si la verificación llega tarde. Se admiten los enlaces anteriores sin cambiar el acceso con Google. El formulario se conserva al recargar la pestaña y las actualizaciones del perfil no borran lo escrito. Los enlaces caducados o abiertos sin la verificación necesaria permiten solicitar otro, sin utilizar una sesión anterior para dar el enlace por válido."]}, {"title": "Menú principal animado", "items": ["Corrección: las piernas se deforman de forma continua alrededor de la rodilla, con máscaras separadas para evitar recortes de la otra pierna o de las manos. Las poses comparten un anclaje y se enlazan sin transparentar el cuerpo; la caminata se suaviza al llegar y salir. La frase completa permanece 0,9 segundos antes de abandonar la tribuna.", "Corrección de la barra inferior: el marco de selección se posiciona siempre dentro de su barra, también en resultados y en sobres cerrados o abiertos, sin aparecer sobre la cabecera.", "Añadido funcional leve: arrastrar lateralmente recorre Tienda, Cromos, Inicio, Liga y Mercado, con bloqueo en los extremos. Se respetan las listas horizontales, formularios y ventanas; un arrastre no abre el cromo al soltar. La barra inferior acompaña el cambio con un resaltado deslizante y transiciones de sus iconos. El Senado continúa fijo y se respeta el movimiento reducido.", "Corrección: el Senado continúa detrás de los menús principales sin reiniciarse ni desplazarse al navegar o deslizar listas. Fuera de Inicio se oscurece al 70 %, sin el rótulo 3D, el abanico ni los bocadillos. Combates, aperturas y resultados conservan sus escenas.", "El encabezado utiliza el mismo logotipo vectorial de la entrada, sin el subtítulo. La versión pasa al pie de Opciones. Las cifras de V/D, Elo y Colección pueden distribuirse en varias líneas para evitar solapamientos con texto ampliado, manteniendo sus valores completos.", "Corrección visual: los oradores abandonan la tribuna al acabar su frase; el público reduce su tamaño y se superpone por filas sin recortar brazos. Los recortes del atlas excluyen los fragmentos de personajes vecinos y conservan los pies completos.", "Inicio incorpora un rótulo WebP animado propio de Toma la palabra, en dos filas, con letras gruesas arqueadas, biseles claros y varias capas de relieve doradas y azul oscuro. Comparte el movimiento de las cartas; su halo blanco y dorado gira en sentido horario desde el centro del arco hacia el exterior, limitado y desvanecido por encima de los cromos. Se reserva espacio para que el panel de Jugar no los tape, también con texto ampliado. El panel de Jugar adopta el fondo oscuro translúcido al 50 % de las barras, baja ligeramente y elimina la línea del catálogo en Inicio.", "El menú incorpora un Senado con 32 personajes sentados siguiendo sus sillas y mesas. Doce oradores entran por los laterales, intervienen por turnos con sus frases y regresan por el mismo lado.", "Caminata unificada con piernas alternas y rodillas articuladas para todos los oradores, tanto al entrar como al salir. Las frases se muestran progresivamente con una fuente local de videojuego 2D, aplicada solo al diálogo, sin desplazar los controles. Los balbuceos vocales de estilo RPG, sin palabras inteligibles y con tonos y timbres distintos, siguen la aparición de las letras y respetan el volumen y el interruptor de efectos.", "La escena continúa detrás de las barras superior e inferior, que permanecen por encima con un fondo oscuro translúcido al 50 %. Se mantienen los accesos, el selector de modo, los cromos destacados y los ajustes de tamaño de texto.", "Los recursos se guardan para usar el menú sin conexión. La animación se pausa al ocultar la aplicación o abrir ventanas y ayudas; el movimiento reducido muestra una escena estática. No modifica partidas, progreso ni música."]}, {"title": "Respuesta online", "items": ["Las jugadas tienen prioridad sobre las consultas automáticas del combate: una lectura en curso deja de rechazar el clic del jugador. Las respuestas sustituidas no pisan un estado más reciente y las jugadas pendientes conservan su identificador para reintentar sin duplicarlas.", "Aceptar una invitación abre la sala sin esperar consultas adicionales del directorio. Las consultas de sala y jugadores se realizan en paralelo, espaciando los avisos de presencia y comprobando siempre la visibilidad actual de la cuenta."]}]},
{"version": "v31.0.2.4", "date": "2026-10-27", "title": "Moneda en relieve y accesibilidad", "sections": [{"title": "Sorteo y lectura", "items": ["Nueva moneda reflectante con hemiciclo, laureles, cinco estrellas y corona. Corrección visual: separación entre laureles y hemiciclo, corona más estrecha y eliminación de la línea que cruzaba la estrella superior. Las hojas de laurel quedan unidas a sus tallos mediante pecíolos finos, sin huecos. Cara dorada y Cruz sombreada conservan el mismo relieve claro.", "El sorteo muestra solo moneda y resultado durante dos segundos. En partidas locales empieza automáticamente después; si la página está oculta espera al regreso. Los avisos online no pausan el reloj del servidor.", "El registro temporal de sorteos valida los datos dañados o inesperados para evitar que fallen los avisos.", "Opciones añade tamaño de iconos del 100 al 116 %, independiente del texto. Aumenta botones y navegación sin ampliar los cromos ni habilitar el zoom del navegador."]}, {"title": "Mercado y selectores", "items": ["Corrección de Mercado: Elegir y Comprar despliegan sus controles debajo del cromo u oferta seleccionados, con transición suave y desplazamiento dentro de la lista. La compra conserva la revisión del importe y su validación en el servidor.", "Corrección visual de Mercado: el cromo elegido se transforma en una sola tarjeta de compra o venta, con un único nombre y cierre. Los selectores de país, cantidad de sobres, rarezas e intercambios usan listas con el estilo del juego, compatibles con teclado, texto ampliado y movimiento reducido."]}, {"title": "Liga", "items": ["Corrección: el premio final de Liga depende de la posición, con 1100 FS para el primer puesto y 300 FS para el último; los puestos intermedios reciben una cantidad proporcional redondeada a FS enteros. Se aplica en partidas locales y verificadas por el servidor, y el resultado indica el puesto y su premio. Se conservan las recompensas ya abonadas."]}, {"title": "Partidas rápidas", "items": ["Corrección: Volver a jugar tras una Rápida prepara directamente otra partida rápida con gabinete automático y turnos de 60 segundos, siguiendo el mismo flujo que desde Inicio, sin abrir el selector de favoritos."]}]},
{
 "version":"v31.0.2.3","date":"2026-10-26","title":"Mano táctica y fiabilidad",
 "sections":[{"title":"Legibilidad y navegación","items":["Los envoltorios integran su título y rareza como trazados vectoriales dentro del área imprimible, sin cambiar los retratos semanales ni la apertura.","Corrección de legibilidad: el ajuste del 100 al 116 % escala los tamaños de texto de menús, fichas, estadísticas, botones, ayudas y combate, incluidos los tamaños adaptativos. Las etiquetas inferiores se reducen y desvanecen dentro de un espacio fijo, sin empujar los iconos.","Inicio agrupa Logros e Historial en una botonera flotante desplegable, dejando siempre visibles Opciones y Buzón. La flecha respira suavemente si hay logros sin reclamar. Historial separa Normal, Clasificatoria, Liga y Rápida con cuatro botones superiores, conservando los recibos y la exportación completa.","Mesa más despejada: el acta se abre desde un botón a la izquierda de Pasar turno en un panel parcial, sin pausar el reloj. Se retira el contorno de la bancada activa, se redondea el pie del cromo y los pilotos se ajustan a su ancho. Fuerte e intervención utilizada comparten una posición interior, lejos del centro del retrato.","Los oradores en mesa muestran tres indicadores fijos sobre el marco: apagados sin efecto y encendidos con pulso mientras esté activo. El hueco está reservado incluso antes de presentar al orador; la consulta explica también los estados apagados y se respeta el movimiento reducido. La defensa recupera el escudo con su indicación del 50 %.","Corrección visual: los estados de combate pasan a los laterales exteriores del marco para dejar libres las caras, conservando sus animaciones y consulta. Los marcadores de intervención y fuerte se sitúan en el lateral exterior izquierdo.","Estados de combate con iconos separados bajo la franja superior: cruz verde prohibida durante la recuperación de curación, Z con flecha y brillo radial para apoyos de daño, y escudo de defensa. Se respeta el movimiento reducido y se conservan las consultas de efectos. Desafíos y logros muestran progreso a la izquierda y recompensa a la derecha, sin cambiar los sobres ni el progreso superior.","El buscador de Colección permanece siempre visible a la derecha de Filtros, tanto en Oradores como en Acciones. El desplegable conserva país, rareza y doctrina.","Colección comienza con los gabinetes y filtros plegados para dejar más espacio a los cromos. Un botón a la derecha de las cinco casillas muestra los integrantes y acciones; los filtros conservan su selección al ocultarlos. Editar un gabinete abre sus controles, y la guía explica ambos desplegables sin añadir pasos.","Opciones permite aumentar el texto del 100 % al 116 %. Las etiquetas de navegación inferior se ocultan gradualmente para conservar espacio, manteniendo sus iconos y nombres accesibles.","Corrección de revisión leve: Mercado conserva foco y desplazamiento al cambiar filtros o cantidades; sus secciones admiten flechas e Inicio/Fin con teclado. Se refuerza el foco visible en Opciones, Mercado y prácticas, y el movimiento reducido elimina el brillo animado de las gemas.","Opciones agrupa sonido y lectura. Los apoyos utilizan la fuente del juego e iconos propios, con explicaciones breves de duración y recuperación.","El sorteo inicial muestra Cara o Cruz y quién comienza, sin detener el reloj; su resultado puede consultarse en la mesa.","Mercado separa Oradores y Acciones al comprar y vender. Las miniaturas muestran el marco y las estadísticas, permiten ampliar el cromo y ofrecen un botón Elegir para seleccionar la venta.","Ayuda ofrece tres retos breves de práctica: ataque fuerte, contrarrestar doctrinas y combinar acciones. No conceden ni consumen premios. Se actualizan las guías de Opciones y Mercado sin ampliar sus pasos.","Se unifica la presentación de retratos y se valida el catálogo compartido de oradores, conservando sus datos y estadísticas."]},{"title":"Combate y aprendizaje","items":["La mano reserva dos huecos para oradores y uno adicional para una acción: equipar apoyos ya no reduce el robo de oradores.","La galería muestra el número de copias de cada acción. Los sobres tienen un 40 % de probabilidad de incluir una acción y el mítico un 25 %: como máximo una, sustituyendo un orador de la misma rareza.","Las acciones equipadas también pueden ganarse o perderse en los modos con transferencia de cromos. Se actualizan su inventario, el resultado y el historial; perder la última copia la retira de los gabinetes afectados y conserva los cinco últimos oradores.","Las acciones reutilizables esperan dos turnos propios completos antes de poder robarse otra vez. Moción de censura conserva su límite de una activación por partida.","La IA de partidas normales utiliza rarezas acordes al gabinete elegido. Se conservan las estadísticas base de los cromos y el progreso de las cuentas. El segundo jugador recibe +1 TdP solo en su primer turno y Vieja Guardia mejora al terminar el turno, con máximo +3; ya no añade daño inmediato al presentar un orador.","Réplica y Receso pueden recogerse gratis desde Acciones en Colección si todavía no se poseen, sin añadir copias repetidas. Colección permite filtrar oradores por país. La mesa muestra cuándo podrá volver a robarse cada acción en recuperación.","Los cromos en mesa permiten consultar defensa, apoyos y recuperación de curación; los equipos indican silencio pendiente y protección. Las animaciones recibidas juntas se presentan escalonadas sin bloquear las jugadas.","Historial permite exportar voluntariamente datos de balance sin nick, ID, fechas ni nombres de cromos. Las partidas verificadas nuevas conservan contexto de doctrina, rareza y uso de acciones."]},{"title":"Guardado y actualización","items":["Las preparaciones obsoletas dejan de bloquear descargas compatibles con el gabinete actual. Las partidas antiguas conservan su motor de validación.","Los resultados rechazados definitivamente se conservan para revisión y exportación, permitiendo sincronizar los siguientes. Se amplía el margen de validación de preparaciones caducadas.","Las actualizaciones requieren los archivos esenciales completos antes de reemplazar la versión anterior y reutilizan medios locales sin cambios.","Nube puede cerrarse mientras verifica una activación; el resultado sigue su comprobación. Perfil ofrece desplazamiento interno en pantallas pequeñas.","Las operaciones simultáneas del Mercado tienen espera y capacidad limitadas. Si el servicio está ocupado o pierde conexión, se conserva la operación pendiente para reintentar; las peticiones repetidas recuperan el mismo recibo confirmado.","Los errores de verificación incorporan una referencia de consulta. El servicio registra fallos, tiempos de respuesta y conflictos sin guardar claves ni datos personales en esos registros.","Las escenas animadas de victoria y derrota reducen su descarga conjunta un 47 %, manteniendo su duración y la comprobación del guardado. Se prepara una revisión administrativa de migraciones con control de cambios y registro de decisiones, sin aprobaciones automáticas."]}]
},
{
 "version":"v31.0.2.2","date":"2026-10-25","title":"Guía de Mercado, historial y recompensas animadas",
 "sections":[{"title":"Navegación y resultados","items":[
 "Mercado tiene su propia guía en la primera visita desde esta actualización, repetible desde Ayuda. La guía general ya no repite esas explicaciones y se actualiza para mostrar el historial.",
 "Las ganancias de FS y los cambios de Elo recorren visualmente los importes confirmados hasta llegar a cero y desaparecer, mientras el total de la cuenta cambia en pantalla. No se abonan dos veces; el movimiento reducido muestra el resultado directamente.",
 "Historial de partidas desde Perfil: resultados, FS, Elo y cromos ganados o perdidos. Combina recibos de tu cuenta y registros de este dispositivo, identificando su procedencia. El historial se inicia con las nuevas partidas.",
 "Al perder la última copia de un integrante de un gabinete, el resultado ofrece acceso directo a su edición en Colección.",
 "Intercambios con selección visual de cromos, búsqueda y comparación de lo que entregas y recibes, con el suplemento de FS visible antes de confirmar.",
 "Botoneras de Mercado con acabado metálico, iconos y tipografía coherentes con la navegación inferior.",
 "Corrección del alta en la nube tras jugar como invitado: distingue una solicitud de migración enviada de una activación fallida, conserva la copia local y facilita el acceso a Nube antes de iniciar partidas con cuenta sin vincular.",
 "Los errores de activación, migración y descarga de partidas indican si faltan funciones o permisos del servidor, con una referencia de soporte para identificar otros rechazos sin mostrar datos privados."
 ]},{"title":"Acciones y países","items":[
 "Las doce cartas de acción añaden efectos de impacto, curación, escudo, mejora de Zasca o censura sobre la mesa, en partidas locales, descargadas y online.",
 "Moción de censura indica que afecta al próximo turno. Las mejoras de Zasca muestran su valor y las curaciones reflejan el Aguante realmente restaurado.",
 "Las animaciones respetan el movimiento reducido y se retiran al salir de la mesa, cambiar de partida, ocultar o redimensionar la aplicación.",
 "Los 120 oradores muestran una bandera antes del nombre y el país completo en su ficha, según su representación política. Los datos quedan preparados para un futuro filtro por país.",
 "Banderas locales que funcionan sin conexión y ajustes de nombres y estadísticas en las miniaturas más pequeñas."
 ]}]
},
{
  "version": "v31.0.2.1",
  "date": "2026-10-25",
  "title": "Efectos de combate y fondo animado de inicio",
  "sections": [{
    "title": "Presentación y animaciones",
    "items": [
      "Ataques normales con estela e impacto; ataques fuertes diferenciados con doble onda y más partículas, ajustados al tamaño del cromo.",
      "Defensa con escudo luminoso y respuesta visual al amortiguar un golpe; curación con aura, destellos y la cantidad de Aguante recuperada.",
      "Los efectos usan las mismas jugadas verificadas en partidas online y descargadas, además del modo local, sin bloquear controles ni cambiar las reglas de combate.",
      "Nuevo fondo WebP animado en la pantalla de inicio, con movimiento suave y una composición oscura que conserva la legibilidad del logo, el título y el botón Iniciar.",
      "Recursos disponibles sin conexión tras descargarse; fondo estático y efectos simplificados cuando el dispositivo solicita movimiento reducido.",
      "Resultados y Liga: cromo de recompensa o pérdida más grande y centrado, con el texto debajo. Verificadas victorias, derrotas y cierre de temporada de Liga.",
      "Mercado: cabecera y pestañas compactas, casilla de propuestas de tamaño fijo y más espacio para ver y seleccionar cromos.",
      "Corrección: los resultados de Clasificatoria muestran el cromo ganado o perdido, con su imagen y nombre, tanto online como en partidas descargadas. La entrega se verifica una sola vez en el servidor y respeta las cartas protegidas.",
      "Corrección adicional: las copias verificadas conservan exactamente los logros y la temporada del servidor; se evita que el recálculo local vuelva a bloquear Clasificatoria después de sincronizar.",
      "Música de inicio: tema instrumental con inicio automático cuando el navegador lo permite y transición suave de volumen hacia el menú, sin reiniciar la pista. Si se requiere un toque, hay un control para activarla. Respeta el volumen y el apagado configurados.",
      "Corrección: Clasificatoria recupera el progreso validado de la cuenta antes de comprobar el guardado, conservando las preferencias locales. Se evita el aviso repetido de sincronización cuando la copia local está desactualizada."
    ]
  }]
},
{
  "version": "v31.0.2.0",
  "date": "2026-10-25",
  "title": "Progreso verificado y nuevas escenas de resultado",
  "sections": [
    {
      "title": "Cuenta, nube y partidas descargadas",
      "items": [
        "El servidor valida las compras, ventas y recompensas de las cuentas vinculadas; los recursos ya guardados se conservan.",
        "Puedes preparar partidas para jugar sin conexión. Sus premios quedan pendientes hasta comprobar las jugadas al reconectar, sin duplicar recompensas al reintentar.",
        "Nube permite sincronizar las partidas descargadas. El progreso anterior que solo exista en un dispositivo dispone de una solicitud de migración revisada.",
        "Se añade creación de cuenta por correo, recuperación de acceso y cambio de contraseña desde el enlace recibido."
      ]
    },
    {
      "title": "Mercado conectado",
      "items": [
        "Las cuentas pueden publicar ofertas, comprar e intercambiar repetidos con reservas y pagos comprobados por el servidor.",
        "Las acciones repetidas también se pueden vender e intercambiar, conservando una copia y respetando las reglas de rareza.",
        "Puedes elegir aparecer en el listado de intercambios mostrando tu nick y tus repetidos; los respaldos y correos permanecen privados."
      ]
    },
    {
      "title": "Combate y presentación",
      "items": [
        "Corrección: se recupera automáticamente la partida interrumpida al entrar, conservando el reloj del servidor. Se cierran las selecciones obsoletas y los cromos que ya actuaron no abren acciones de nuevo.",
        "Mercado: saldo visible, secciones más claras, explicación de cada paso y controles más cómodos para comprar, vender e intercambiar.",
        "Corrección: los errores al reclamar recompensas ya no dejan bloqueada la navegación. Si la verificación final falla o tarda, puedes volver al menú conservando el resultado pendiente, sin acreditar premios sin comprobar.",
        "Desafíos y Logros muestran un pequeño círculo en las pestañas con recompensas disponibles sin reclamar, sin numeración y respetando la opción de reducir animaciones.",
        "Corrección: los cromos en la mano ya no aparecen como Hecho ni atenuados por haber actuado antes; ese indicador solo corresponde a oradores en la Tribuna.",
        "Los ataques a bancadas vacías pueden restar entre todos tus oradores un máximo de 3 votos por turno propio, para evitar estancamientos.",
        "Los ataques, defensas, curaciones y cartas online incorporan sus efectos visuales y sonoros sin reiniciar la música.",
        "Victoria y derrota tienen escenas realistas en WebP animado. Siguiente abre los resultados después de comprobar la partida y el guardado; si falla la comprobación se puede reintentar.",
        "El perfil se adapta a pantallas bajas y las fichas de acciones incorporan navegación Anterior/Siguiente.",
        "Se mantienen la temporada 1 de prelanzamiento, el progreso existente y las novedades de versiones anteriores."
      ]
    }
  ]
},
{
  "version": "v31.0.1.4",
  "date": "2026-10-24",
  "title": "Combates integrados y acceso online más sencillo",
  "sections": [
    {
      "title": "Jugar e invitar",
      "items": [
        "El selector de modo junto a Jugar mantiene su forma y su flecha centrada en todos los tamaños de pantalla.",
        "La preparación online utiliza el mismo selector de cinco gabinetes favoritos que las partidas contra IA, con líder, cromos y acciones visibles. Los integrantes se editan desde Colección; al confirmar quedan bloqueados hasta empezar el combate.",
        "Jugadores muestra un listado compacto de conectados y desconectados. Las invitaciones usan el modo elegido en Inicio; ya no hay que repetir la selección ni copiar códigos.",
        "Sin invitación pendiente, Jugar inicia contra IA. La Clasificatoria contra IA sigue dando Elo durante el prelanzamiento; con una cuenta conectada el servidor ejecuta al rival y guarda el resultado.",
        "La Clasificatoria entre jugadores sigue usando una cola por Elo, accesible desde el selector de Jugar. Las invitaciones directas son para Normal y Rápida."
      ]
    },
    {
      "title": "Una sola mesa de combate",
      "items": [
        "Las partidas online utilizan la mesa habitual del juego, con sus tres puestos, dos cartas en mano, marcadores de votos, reloj y registro. El combate deja de mostrarse dentro de una ventana emergente.",
        "Corregidos los reinicios de la música al realizar acciones o recibir actualizaciones en partidas online y contra IA. La intensidad musical cambia con los votos sin interrumpir la melodía, y se conservan las transiciones de victoria y derrota.",
        "Las acciones muestran una ficha más clara con su arte, coste y reglas. Si necesitan un objetivo, se elige tocando un cromo iluminado de la mesa, igual que al atacar; cancelar no gasta TdP.",
        "Los tutoriales de combate y menú explican estos controles. Se conserva el progreso al actualizar la aplicación."
      ]
    },
    {
      "title": "Correcciones acumuladas de preparación y recuperación",
      "items": [
        "Los favoritos vacíos no pueden iniciar una partida. La confirmación utiliza exactamente los cinco oradores, el líder y las acciones del favorito elegido, sin volver a seleccionarlos en listas.",
        "Editar en Colección y volver mantiene la partida pendiente y el favorito elegido. Después de confirmar, la selección permanece bloqueada mientras espera al rival.",
        "La preparación se adapta a móvil y horizontal para mantener visibles los cinco cromos, sus estadísticas, las acciones y el botón de confirmar sobre la navegación.",
        "Si se pierde la respuesta de una confirmación o una acción, se recupera la misma operación sin duplicar sus efectos ni su coste.",
        "Al recargar y pulsar Jugar se recupera la partida online que seguía en curso. Se conserva su reloj y no se crea otra sala.",
        "El resultado clasificatorio se sincroniza antes de mostrar el Elo final. Rápida mantiene sus 60 segundos y su modo al volver a jugar.",
        "Los nombres, las estadísticas y las descripciones de los cromos respetan el marco. Las acciones muestran su texto completo en la vista normal y ampliada, con tamaños adaptados a cada carta."
      ]
    },
    {
      "title": "Resultados y espacio en pantalla",
      "items": [
        "Clasificatoria vuelve a detallar el Elo ganado o perdido, el Elo anterior y final y los FS obtenidos. El servidor abona de 50 a 100 FS por victoria y de 20 a 30 por derrota en las partidas nuevas; volver a cargar no duplica el premio.",
        "El resumen de Liga compacta la recompensa y reserva espacio para los botones. La selección de gabinete muestra los cinco oradores juntos, también con la altura reducida del navegador móvil.",
        "El registro de las acciones explica su efecto y a quién afecta: un orador, un equipo o ambos. El daño y la curación reflejan la cantidad aplicada.",
        "Los mensajes de recompensa hablan de conseguir o perder un cromo. Se conservan las novedades y correcciones anteriores de esta misma versión."
      ]
    },
    {
      "title": "Progreso de desafíos online",
      "items": [
        "Los nuevos combates online con el guardado en la nube activado registran el avance de desafíos diarios, semanales y mensuales: partidas, votos, victorias, modo, líderes y doctrinas. También se aplica a Clasificatoria contra la IA del servidor. En Normal y Rápida avanzan los desafíos sin cambiar FS, cromos ni Elo.",
        "El progreso se guarda junto al resultado y se sincroniza antes de volver al menú. Reconectar o recuperar una respuesta no cuenta la partida dos veces; se conservan los hitos y recompensas anteriores."
      ]
    }
  ]
},
{
  "version": "v31.0.1.3",
  "date": "2026-10-24",
  "title": "Primeras partidas online de prueba",
  "sections": [
    {
      "title": "Juega con otros probadores",
      "items": [
        "Inicio incorpora el acceso a jugadores y partidas online de prueba con tu cuenta del juego. El listado optativo muestra conectados y desconectados por nick o alias provisional.",
        "Puedes invitar a otro jugador y aceptar invitaciones. Al aceptar se abre la preparación de la partida, sin copiar códigos; las salas por código también siguen disponibles.",
        "El online utiliza por ahora una colección común de prueba, cinco oradores y hasta dos acciones. Normal y Rápida admiten invitaciones y búsqueda de rival; Clasificatoria utiliza una cola por Elo que amplía el margen con la espera. Normal y Clasificatoria duran 90 segundos por turno; Rápida, 60. Se gana a 100 votos. Normal y Rápida son amistosas: no cambian tu progreso.",
        "Clasificatoria requiere guardar y sincronizar el progreso en la nube. Conserva el Elo existente al vincularlo y actualiza Elo, victorias, derrotas y recompensas de ascenso en el servidor. No reinicia tu cuenta ni cambia los FS o la colección.",
        "Las acciones se activan desde la mano. Las reutilizables regresan al mazo y las de un solo uso quedan en un descarte atenuado. Puedes recuperar una partida al reconectar; el reloj sigue avanzando.",
        "Corregida la carga del combate al acceder desde el dominio del juego. Si falla la conexión inicial, Actualizar / reintentar vuelve a cargar la preparación sin crear otra sala."
      ]
    },
    {
      "title": "Acciones, sobres y gabinetes",
      "items": [
        "Doce cartas de acción con ilustraciones propias se consiguen en los mismos sobres. Cada sobre conserva sus cinco cromos y sus rarezas: puede incluir una acción en lugar de un orador de la misma rareza. Las portadas siguen mostrando solo oradores.",
        "Un botón de Colección alterna Oradores y Acciones. Cada favorito mantiene cinco oradores y permite añadir hasta dos acciones distintas de tu colección. Puedes leer todos sus efectos, costes y requisitos desde la ficha o al tocarlas en la mano.",
        "Las acciones no ocupan hueco en la Tribuna. Se activa como máximo una por turno; las reutilizables regresan al mazo y las de un solo uso quedan visibles y sombreadas en su descarte. La mano se renueva al comenzar cada turno propio, con hasta dos cartas y nunca dos acciones juntas.",
        "El robo de dos cartas se acompaña de un ajuste de pasivas: Foco regenera 1 de Aguante por turno y Aforado recupera 3 al evitar una expulsión una vez por cromo y debate. Se mantiene el círculo de debilidades.",
        "Las acciones y sus gabinetes se conservan en los respaldos y la nube. Los tutoriales de combate y menú enseñan los nuevos controles sin gastar FS ni alterar tu colección."
      ]
    },
    {
      "title": "Temporada de prelanzamiento",
      "items": [
        "La temporada 1 de Clasificatoria permanece abierta, sin descenso por calendario. Se conservan los ascensos y las recompensas ya reclamadas o pendientes.",
        "La temporada 2 comenzará con el lanzamiento oficial en Google Play. A partir de entonces volverán las temporadas de 30 días naturales. Los desafíos diarios, semanales y mensuales mantienen sus propios periodos."
      ]
    },
    {
      "title": "Correcciones y compatibilidad incorporadas",
      "items": [
        "Se evita abrir varias veces la preparación de la misma partida cuando llega una actualización de la sala, conservando la selección que ya estaba en curso.",
        "Las nuevas cartas de acción se guardan en su colección correspondiente, también al abrir lotes y sobres de recompensas. Una copia antigua de la aplicación no elimina ese inventario al guardar en la nube.",
        "Los dos huecos opcionales de acción se conservan al cargar, guardar, elegir de nuevo o recuperar un gabinete. La IA recibe el mismo número de acciones y de rarezas equivalentes en las partidas locales.",
        "Una acción de objetivo individual no puede convertirse en un efecto para toda la mesa por no haber elegido un cromo. La falta de recursos o un objetivo inválido no consume la carta.",
        "Las guías incorporan el acceso online, la colección de acciones y los dos huecos del gabinete. Los ejemplos prestados no gastan FS ni modifican la colección, incluso si todavía está vacía.",
        "Se conservan el progreso y los ajustes al actualizar la aplicación; los nuevos recursos de acciones quedan disponibles sin conexión una vez descargados."
      ]
    }
  ]
},
{
  "version": "v31.0.1.2",
  "date": "2026-10-24",
  "title": "Desafíos, logros y ediciones de líder",
  "sections": [
    {
      "title": "Nuevas metas para tu progreso",
      "items": [
        "Desafíos reúne 7 misiones diarias, 10 semanales y 16 mensuales. Cada misión completada llena un segmento; sus FS y los sobres de la barra se reclaman por separado.",
        "Los periodos se renuevan según la hora de Madrid. Las recompensas conseguidas y pendientes se conservan; los sobres adicionales no cambian la espera de los gratuitos de la tienda.",
        "Logros reúne cadenas permanentes por secciones y recompensas únicas. Los máximos de colección y Elo se conservan, y los nuevos contadores registran tus partidas desde esta actualización."
      ]
    },
    {
      "title": "Ediciones y presentación",
      "items": [
        "Las doce cartas legendarias pueden conseguir una edición de confeti tras 250 victorias con ese político como líder. Se reclama una vez y puedes equiparla o volver al aspecto clásico; no cambia sus estadísticas. Los logros muestran un único botón contextual a la derecha de su progreso. La ficha sustituye el bloque de maestría por una insignia al conseguir la edición y coloca los selectores de aspecto bajo las frases.",
        "Los sobres incorporan reflejos metalizados, grabados y adornos por rareza. Se mantienen las portadas semanales, las compras x1, x5 y x10 y el corte superior al abrir.",
        "La guía del menú incluye los nuevos accesos. Si ya la completaste, verás una explicación breve y podrás repetir la guía completa desde Ayuda. Se conservan tu progreso y tus ajustes. La interfaz incorpora una fuente incluida, iconos centrados y cifras más claras en los cromos. Al reclamar recompensas se conserva la posición de la lista."
      ]
    },
    {
      "title": "Correcciones de navegación y lectura",
      "items": [
        "Desafíos, Logros, Opciones y Buzón utilizan iconos centrados y áreas de pulsación alineadas. Las pestañas de Logros y Desafíos se distribuyen en tres columnas con la selección más visible.",
        "Las pestañas y el botón de cierre permanecen accesibles mientras se recorre la lista. Se puede navegar con el teclado, cerrar con Escape y recuperar el foco en el botón de acceso.",
        "Reclamar un hito o los FS de una misión mantiene la misma posición. También se recuerda la sección y el desplazamiento al cerrar y reabrir la ventana.",
        "Al abrir un sobre de recompensa, Volver a desafíos regresa a la sección y posición anteriores, incluso después de consultar o ampliar un premio. No vuelve a entregar recompensas.",
        "La fuente Inter se incluye en la aplicación para mantener el mismo aspecto entre dispositivos y sin conexión. El título y el reloj conservan su tipografía propia.",
        "Los cromos muestran Zasca y Aguante en casillas separadas, con números adaptados al tamaño de cada carta. En combate se distingue el Aguante actual del máximo y los indicadores no tapan el nombre ni las cifras."
      ]
    },
    {
      "title": "Correcciones de hitos y aspectos",
      "items": [
        "Cada logro muestra solo una acción junto a la barra: Reclamar para el primer hito alcanzado y pendiente, o Reclamado cuando ya se han recogido los alcanzados. Antes del primer hito no aparece botón; los hitos futuros no llenan la tarjeta con botones desactivados.",
        "Los hitos pendientes se recogen uno a uno, sin perder los anteriores ni repetir entregas. Las ediciones ya reclamadas siguen contando como obtenidas.",
        "Se retira el bloque de maestría de la ficha. La insignia junto al nombre aparece solo después de conseguir la edición; los controles Clásico y Confeti quedan inmediatamente debajo de las frases.",
        "Cambiar el aspecto conserva la posición de la ficha y el foco en el botón elegido. Las ediciones, los logros y los desafíos se mantienen al recargar y en los respaldos.",
        "Los objetivos de diversidad se adaptan a los líderes y doctrinas disponibles al comenzar cada periodo. Rápida registra sus resultados en su modo correspondiente y los tutoriales no aumentan los contadores.",
        "Se corrige la presentación del confeti en la Tribuna del jugador y el comportamiento cuando el dispositivo no puede dibujarlo: permanece el retrato y el juego continúa."
      ]
    }
  ]
},
{
  "version": "v31.0.1.1",
  "date": "2026-10-23",
  "title": "Sobres por lotes y nuevas portadas",
  "sections": [
    {
      "title": "Elige cómo abrir tus sobres",
      "items": [
        "Los sobres de pago permiten elegir x1, x5 o x10 junto al precio. El importe muestra el total de la compra; los gratuitos se siguen abriendo de uno en uno.",
        "Los lotes se cobran una sola vez y guardan todos los cromos al comprarlos. Puedes recorrer los sobres de uno en uno y volver a sus resultados sin nuevos cobros.",
        "Cada sobre luce una portada de su rareza que cambia los lunes. El personaje de la imagen no está garantizado: se mantienen los contenidos y probabilidades habituales.",
        "La apertura corta y separa la parte superior del envoltorio antes de revelar los cromos. Con movimiento reducido, el resultado aparece directamente."
      ]
    },
    {
      "title": "Una guía más ágil",
      "items": [
        "La guía del menú pasa de 24 a 18 pasos, con transiciones automáticas, explicación de las compras múltiples y una apertura de muestra sin gastar FS ni añadir cromos.",
        "Las zonas que necesitan desplazamiento siguen funcionando, con las barras visuales ocultas para mantener el aspecto del juego."
      ]
    },
    {
      "title": "Apertura y progreso protegidos",
      "items": [
        "Si falla el guardado de una compra, se conservan el saldo, la colección y los tiempos de los sobres gratuitos; no aparece una entrega que no se haya podido guardar.",
        "La apertura bloquea pulsaciones repetidas durante el corte y permite consultar la ficha y ampliar los premios sin perder el resultado del sobre.",
        "Si una portada no está descargada al jugar sin conexión, permanece visible el envoltorio del sobre. La actualización conserva la colección, la Liga y los ajustes de sonido."
      ]
    }
  ]
},
{
  "version": "v31.0.1.0",
  "date": "2026-10-23",
  "title": "Tu colección y tus sobres, más claros",
  "sections": [
    {
      "title": "Colección y gabinetes",
      "items": [
        "La colección muestra tres cromos por fila para facilitar la lectura. Los filtros y favoritos comparten el acabado azul y dorado del juego.",
        "Los cinco favoritos mantienen sus botones compactos y sus puntos de estado. Debajo puedes ver sus integrantes y reconocer al líder por su estrella.",
        "Durante la edición puedes quitar integrantes tocando sus retratos, guardar o cancelar. Tus gabinetes y el progreso anterior se conservan."
      ]
    },
    {
      "title": "Tienda y apertura de sobres",
      "items": [
        "Los sobres gratuitos y los que cuestan Fuerza Soberana aparecen separados, con seis diseños de sobre y contadores más fáciles de leer.",
        "Después de adquirir un sobre, tócalo para revelar sus cinco cromos. Los premios quedan guardados antes de la animación; volver al sobre no repite cobros ni entregas.",
        "Puedes consultar y ampliar cada premio, navegar entre los políticos de ese sobre y regresar al resultado. La apertura respeta la opción de reducir movimiento.",
        "Se mantienen los precios, las probabilidades, los tiempos de espera y las recompensas existentes."
      ]
    }
  ]
},
{
  "version": "v31.0.0.5",
  "date": "2026-10-23",
  "title": "El debate cobra voz y afina su estrategia",
  "sections": [
    {
      "title": "Música y efectos",
      "items": [
        "El combate estrena una composición orquestal que se intensifica cuando cualquiera supera los 50 votos y vuelve al estado normal si ambos quedan en 50 o menos, sin reiniciar la melodía.",
        "Victoria y derrota tienen remates musicales breves. Los menús, cartas, moneda, ataques, defensa, curación, sobres y recompensas incorporan efectos propios.",
        "Desde Opciones, en el menú principal, puedes ajustar el volumen maestro, los efectos y la música, y encender o apagar estos dos últimos por separado. Se recuerda tu elección en este dispositivo y el audio se detiene en segundo plano."
      ]
    },
    {
      "title": "Más tiempo y decisiones en combate",
      "items": [
        "Cada turno dispone de 90 segundos para realizar las acciones y pasar.",
        "El ataque fuerte está disponible en los turnos propios 3, 6, 9… de cada cromo en mesa. La oportunidad caduca si no se usa; cuesta 1 de Aguante y requiere al menos 2. Un icono de tres secciones muestra su carga.",
        "La defensa reduce un único golpe a la mitad y caduca al comenzar el siguiente turno propio si no se utiliza. Cada cromo debe descansar un turno propio entre curaciones activas.",
        "Foco Mediático recupera 2 de Aguante por turno para ajustar su equilibrio con las demás doctrinas. Se conservan las seis pasivas y sus debilidades circulares. El tutorial y Ayuda explican las nuevas reglas."
      ]
    },
    {
      "title": "Tus cinco gabinetes favoritos",
      "items": [
        "Colección permite guardar cinco gabinetes de cinco cromos y elegir sus líderes. Antes del combate puedes seleccionar uno; sus integrantes se editan desde Colección.",
        "Los botones numerados son compactos y sus puntos gris o verde indican si el gabinete está listo. Los favoritos se incluyen en el respaldo y el guardado en la nube.",
        "Tu colección, estadísticas y progreso existente se conservan."
      ]
    }
  ]
},
  {
  "version": "v31.0.0.4",
  "date": "2026-10-22",
  "title": "Un nuevo aspecto para el debate y tus recompensas",
  "sections": [
    {
      "title": "El hemiciclo",
      "items": [
        "Dos bancadas con fondos independientes. Desde Perfil puedes elegir Clásico o Mármol azul, gratuitos durante el prelanzamiento.",
        "Los votos aparecen en barras iguales y centradas: rojo para el rival y azul para ti. El reloj numérico está a su lado.",
        "El acta del debate gana espacio y distingue daño, defensa, curación y votos. Se retira la indicación fija que repetía el tutorial.",
        "Ataques, curaciones, defensas y votos tienen efectos breves. Se señala el turno activo y el ataque fuerte disponible, respetando la opción de reducir movimiento."
      ]
    },
    {
      "title": "Buzón y ayuda",
      "items": [
        "El menú principal incluye un buzón que avisa cuando tienes sobres por recoger. Cada mensaje indica el motivo y el nombre del sobre antes de reclamarlo.",
        "Los sobres pendientes de Clasificatoria se conservan y se recogen desde el buzón. La explicación de temporadas y premios pasa de la tienda a Ayuda.",
        "Ayuda se organiza por temas desplegables con flechas animadas, para consultar las reglas y el guardado con más claridad."
      ]
    }
  ]
},
  {
    "version": "v31.0.0.3",
    "date": "2026-10-22",
    "title": "Tres frases, cuatro formas de intervenir",
    "sections": [
        {
            "title": "Acciones de los cromos",
            "items": [
                "La primera frase realiza un ataque normal con el Zasca vigente. La segunda realiza un ataque fuerte del 150 %, redondeado hacia arriba.",
                "El ataque fuerte se habilita en el segundo turno propio del cromo en mesa. Después de usarlo espera dos turnos propios; salir y volver a entrar reinicia su contador individual.",
                "La tercera frase permite elegir defensa o curación. La defensa reduce a la mitad solo el siguiente golpe; la curación recupera la mitad del Aguante perdido, con un mínimo de 3 y sin superar el máximo.",
                "Cada cromo puede realizar una acción por turno. Los medios puntos de daño tras defender y de curación se redondean hacia arriba. El rival utiliza las mismas reglas."
            ]
        },
        {
            "title": "Frases y controles",
            "items": [
                "Los 120 cromos incorporan tres frases breves documentadas, sin nombres de otras personas, con recortes y traducciones recogidos en las fuentes.",
                "Al tocar un orador de tu Tribuna aparece una ventana con sus tres frases y valores. La tercera sustituye el contenido de esa misma ventana por Defensa y Curación, con un botón para volver.",
                "Las selecciones y los cambios de contenido tienen animación. Se respeta la preferencia de reducir movimiento y las opciones no necesitan desplazamiento dentro de la ventana."
            ]
        },
        {
            "title": "Aprendizaje y móviles",
            "items": [
                "El tutorial de combate permite practicar ataque normal, ataque fuerte, defensa y curación, con cromos prestados y sin modificar tu progreso. Puedes repetirlo desde Ayuda.",
                "Se corrige la ampliación por gestos de dos dedos en las secciones del juego, incluidas las ventanas de acceso y perfil."
            ]
        }
    ]
},
  {
    "version":"v31.0.0.2",
    "date":"2026-10-21",
    "title":"Tu progreso, también en la nube",
    "sections":[{"title":"Guardado en la nube","items":[
      "Desde Perfil → Nube puedes activar el guardado de tu progreso en la cuenta. La primera copia requiere revisar y confirmar los datos.",
      "Se conservan cromos y copias, estadísticas, FS, Elo, Liga, tutoriales y recompensas pendientes. El reinicio competitivo queda reservado para el estreno multijugador.",
      "Tras activarlo, los cambios se guardan automáticamente. En otro dispositivo puedes iniciar sesión y recuperar la copia desde Perfil → Nube.",
      "Si hay cambios distintos entre dispositivos, se conservan las copias para que puedas revisarlas. Una copia antigua no sustituye automáticamente a otra más reciente.",
      "Antes de recuperar una copia se guarda el progreso local anterior, disponible para descargar. El respaldo en archivo sigue disponible."
    ]},{"title":"Acceso","items":[
      "El guardado pertenece a la cuenta, tanto si accedes con Google como con un correo y contraseña ya registrados.",
      "Puedes seguir jugando sin cuenta. Activar el guardado es opcional y no modifica las reglas de las partidas."
    ]}]
  },
  {
    "version":"v31.0.0.1",
    "date":"2026-10-21",
    "title":"Tu cuenta y tu perfil de jugador",
    "sections":[{"title":"Acceso","items":[
      "Después de INICIAR puedes acceder con Google o continuar sin cuenta. Una sesión válida guardada permite entrar directamente en ese navegador.",
      "Conectar o cerrar la cuenta conserva el progreso de este dispositivo. El guardado de la colección en la nube y el multijugador se activarán en una fase posterior."
    ]},{"title":"Perfil","items":[
      "La guía del menú abre el perfil y enseña sus estadísticas, el nick y el cambio anual, sin modificar datos.",
      "El menú principal incluye un botón cuadrado de perfil a la izquierda de las victorias y derrotas. Abre una ventana con tus estadísticas, colección y situación en la Liga.",
      "Puedes elegir un nick para tu cuenta. La primera elección es gratuita; después dispones de un cambio gratuito al cumplirse un año desde el último."
    ]}]
  },
  {
    "version":"v30.2.61",
    "date":"2026-10-21",
    "title":"Tutoriales, nuevos debates y temporadas",
    "sections":[{"title":"Tutoriales","items":[
      "La primera vez, INICIAR abre directamente el combate guiado. Al completarlo comienza la guía del menú.",
      "La guía recorre Inicio, Tienda, Colección, Mercado y, por último, Liga, con explicaciones junto a las zonas señaladas.",
      "Desde Ayuda puedes repetir por separado el tutorial de combate y la guía del menú. Las guías terminadas no vuelven a abrirse automáticamente.",
      "El recorrido del menú es de consulta: no gasta FS, no reclama sobres y no realiza ventas ni cambia tu Liga. Puedes salir de la guía cuando lo necesites."
    ]}, {"title":"Debates","items":[
      "Victoria inmediata al alcanzar 100 votos, sin límite de rondas. Cada turno dispone de 60 segundos; agotarlos supone abandonar por inactividad. El tutorial no tiene cuenta atrás.",
      "Se mantienen tres espacios en mesa. La mano tiene dos cromos como máximo y el resto espera en el mazo; se roba al comenzar el turno si queda espacio.",
      "Los oradores expulsados descansan y luego se barajan con el mazo. No pueden volver a robarse en el siguiente turno propio.",
      "Los votos aparecen entre ambas tribunas. Verborrea permite un robo adicional tras una expulsión si sigue activa, sin superar dos cartas en mano ni ocho TdP; Foco Mediático regenera tres de Aguante al líder."
    ]}, {"title":"Clasificatoria","items":[
      "Los seis rangos tienen diez divisiones: de X a I. Cada ascenso requiere 250 Elo.",
      "Cada nueva división entrega un sobre común; cada cinco ascensos se añade un raro y al subir de rango se añade un legendario. Se reclaman desde Tienda y no se repiten por recuperar una división durante la misma temporada.",
      "Las temporadas duran 30 días naturales. Al renovarse, desciendes un rango conservando la división, hasta el rango mínimo. Los sobres pendientes se mantienen."
    ]}, {"title":"Tu progreso","items":[
      "Ayuda incluye un ID estable y la descarga de un respaldo con colección, estadísticas, progreso, Liga, tutoriales y recompensas de temporada.",
      "Puedes restaurar ese archivo en otro dispositivo tras revisarlo y confirmar. Es un respaldo local: la conexión a cuentas y al guardado en la nube llegará más adelante."
    ]}]
  },
  {
    "version":"v30.2.60",
    "date":"2026-10-20",
    "title":"Una nueva bienvenida",
    "sections":[{"title":"Pantalla de inicio","items":[
      "Al abrir el juego aparecen el logo, el nombre HEMICICLO con letras de doble trazo y el botón INICIAR.",
      "Al pulsar INICIAR, el logo asciende, el nombre se aleja y una transición suave muestra el menú principal.",
      "La entrada funciona sin conexión y respeta la preferencia de reducir el movimiento. Volver al menú durante la sesión no repite la presentación."
    ]}]
  },
  {
    "version":"v30.2.59",
    "date":"2026-10-20",
    "title":"Tu primer combate, paso a paso",
    "sections":[{"title":"Tutorial de combate","items":[
      "La próxima vez que pulses Jugar podrás aprender en un combate guiado muy fácil con cromos prestados.",
      "Las explicaciones flotantes dejan libre el elemento que debes tocar. La zona señalada brilla hasta realizar la acción; con movimiento reducido mantiene un borde fijo.",
      "Practica el sorteo, los votos, el TdP, el líder y su doctrina, presentar cromos, atacar, pasar turno y conseguir la victoria.",
      "La práctica no modifica tu colección, Fuerza Soberana, Elo ni Liga. Puedes salir sin penalización y repetirla desde Ayuda."
    ]}]
  },
  {
    "version": "v30.2.58",
    "date": "2026-10-20",
    "title": "Botones con relieve",
    "sections": [{"title":"Menú inferior","items":[
      "Los cinco botones tienen acabado metálico, bordes biselados y símbolos en relieve.",
      "La sección abierta mantiene su botón más grande y elevado. Al pulsar un botón, este se hunde ligeramente.",
      "Se conserva la distribución del menú y la altura compacta de las estadísticas."
    ]}]
  },
  {
    "version": "v30.2.57",
    "date": "2026-10-20",
    "title": "Interfaz más compacta",
    "sections": [
      {
        "title": "Pantalla de juego",
        "items": [
          "Las estadísticas ocupan menos altura y conservan la franja superior del nombre y sus botones.",
          "El fondo y las barras permanecen fijos. Las listas y los paneles que lo necesitan siguen permitiendo desplazarse.",
          "Se evita el menú contextual y el arrastre de imágenes dentro del juego. Los campos de texto mantienen la selección y la edición."
        ]
      }
    ]
  },
  {
    "version": "v30.2.56",
    "date": "2026-10-20",
    "title": "Inicio y ajustes del mercado",
    "sections": [
      {
        "title": "Interfaz",
        "items": [
          "El icono de Mercado comparte el estilo de trazo del icono de Liga en la barra inferior.",
          "Al pulsar Inicio se eligen hasta tres cromos aleatorios de tu colección. Se balancean suavemente en vertical con un recorrido de 5 px; el movimiento respeta la preferencia de reducir animaciones."
        ]
      },
      {
        "title": "Confirmaciones",
        "items": [
          "Las ventas, compras e intercambios se revisan desde una sola ventana. Marca el tick situado entre Cancelar y el botón de la operación para habilitarla; el tick se vuelve verde al activarlo.",
          "Cada jugador acepta el intercambio una vez. La entrega se completa cuando ambos han confirmado, conservando la protección de la última copia."
        ]
      }
    ]
  },
  {
    "version": "v30.2.55",
    "date": "2026-10-20",
    "title": "Nuevo menú y mercado de repetidos",
    "sections": [
      {
        "title": "Interfaz",
        "items": [
          "Las estadísticas y el progreso de la colección se muestran en la parte superior. La barra inferior reúne Tienda, Cromos, Inicio, Liga y Mercado.",
          "El acceso de la sección abierta se eleva y aumenta de tamaño. Jugar permite elegir el modo desde un selector desplegable hacia arriba."
        ]
      },
      {
        "title": "Mercado",
        "items": [
          "Se pueden vender repetidos a la máquina de uno en uno o en la cantidad elegida, conservando una copia de cada cromo.",
          "La venta entre jugadores toma el precio de compra de la IA y añade un 20 %. Comprar permite buscar por nombre y rareza, o mostrar solo los cromos que te faltan.",
          "Las ventas entre jugadores y los intercambios se ensayan en un servidor con inventario y FS de demostración, separado de la partida real. Su alojamiento online queda pendiente.",
          "Los intercambios admiten rarezas iguales o consecutivas. La diferencia se compensa con FS o con dos cromos inferiores por uno superior. Ambos jugadores verifican las condiciones y después confirman."
        ]
      }
    ]
  },
  {
    "version": "v30.2.2",
    "date": "2026-10-20",
    "title": "Doctrinas con debilidades y novedades del juego",
    "sections": [
      {
        "title": "Combates y equilibrio",
        "items": [
          "Las seis doctrinas conservan sus políticos y ahora forman un ciclo: cada una contrarresta a una rival y tiene una debilidad. La neutralización dura mientras ambos líderes estén en la Tribuna.",
          "Verborrea da +1 TdP al presentar al líder y por turno; las expulsiones reservan hasta 2 TdP para el siguiente. Nunca se empieza con más de 8 TdP.",
          "Vieja Guardia mejora al entrar y al terminar el turno, hasta +3 Zasca. Sus mejoras dejan de aplicarse si se neutraliza la doctrina y se pierden al salir el orador de la Tribuna.",
          "Giro de Guion devuelve 1 de daño por ataque. Foco Mediático regenera 2 de Aguante al líder por turno.",
          "Los cromos especiales cuestan como máximo 4 TdP. La IA tiene en cuenta las nuevas interacciones."
        ]
      },
      {
        "title": "Sorteo inicial",
        "items": [
          "Cara o cruz aparece en una ventana emergente sobre el tablero. La partida espera a que confirmes el resultado."
        ]
      },
      {
        "title": "Novedades",
        "items": [
          "Nuevo historial de versiones en la barra superior, entre el rango y la ayuda. Puedes desplegar cada versión con su flecha animada.",
          "Se recuperan las notas de las versiones conservadas desde el primer día del repositorio."
        ]
      }
    ]
  },
  {
    "version": "v30.2.1",
    "date": "2026-10-20",
    "title": "Sorteo inicial, Elo y victoria inmediata",
    "sections": [
      {
        "title": "Partidas",
        "items": [
          "Cara o cruz decide quién empieza, con la misma probabilidad para ambos jugadores. Si nadie alcanza 100 votos, cada uno dispone de siete turnos.",
          "Al llegar a 100 votos termina el combate y se cancelan las jugadas pendientes del rival. Las recompensas se entregan una sola vez."
        ]
      },
      {
        "title": "Clasificatoria",
        "items": [
          "El Elo depende de la diferencia proporcional de votos, sin exigir ganar en una ronda temprana. Ganar 100 a 25 concede +25 Elo; perder 25 a 100 descuenta 14.",
          "La penalización de 18 Elo se reserva para terminar sin votos o abandonar. El empate mantiene el Elo y el saldo nunca baja de cero."
        ]
      }
    ]
  },
  {
    "version": "v30.1",
    "date": "2026-10-20",
    "title": "Frases propias y revisión del castellano",
    "sections": [
      {
        "title": "Cromos",
        "items": [
          "Los 120 cromos pasan a tener tres frases propias: 360 frases distintas en total.",
          "Se añaden frases a los 84 cromos que usaban líneas compartidas y se completan las que faltaban en los otros 36."
        ]
      },
      {
        "title": "Textos",
        "items": [
          "Se revisan nombres, tildes y textos visibles en español. Se conservan las frases en inglés.",
          "Las fuentes y las propuestas de uso futuro de las frases quedan documentadas; todavía no se activan ataques de distintos tipos."
        ]
      }
    ]
  },
  {
    "version": "v30",
    "date": "2026-10-20",
    "title": "Continuidad de las animaciones",
    "sections": [
      {
        "title": "Animación",
        "items": [
          "Se elimina el fotograma inicial sin retrato y se preparan los fotogramas antes de mostrarlos.",
          "Un fundido de 100 milisegundos une el final y el comienzo del recorrido para evitar cortes y huecos negros.",
          "La animación mantiene su ritmo al navegar entre pantallas y dispone de imagen de respaldo durante la carga."
        ]
      }
    ]
  },
  {
    "version": "v29",
    "date": "2026-10-18",
    "title": "Rivales con estadísticas reales y Elo por rendimiento",
    "sections": [
      {
        "title": "Combates",
        "items": [
          "Los gabinetes rivales se adaptan al modo, al rango y a la división mediante la rareza de sus cartas, sin inflar sus estadísticas.",
          "La IA prioriza presentar a su líder y elegir objetivos que pueda expulsar."
        ]
      },
      {
        "title": "Clasificatoria e interfaz",
        "items": [
          "Se incorpora el cálculo de Elo por rendimiento y se muestra la ganancia o pérdida en el resultado. Este cálculo se revisa posteriormente en v30.2.1.",
          "Se corrigen los botones de confirmación de las ventanas emergentes.",
          "Tras la prueba horizontal, se recupera la presentación vertical habitual."
        ]
      }
    ]
  },
  {
    "version": "v29-landscape",
    "date": "2026-10-18",
    "title": "Prueba de distribución horizontal",
    "sections": [
      {
        "title": "Presentación",
        "items": [
          "Se prueba una distribución horizontal para aprovechar pantallas anchas, reorganizando el menú, las cartas y el combate.",
          "La revisión posterior de v29 recupera el diseño vertical."
        ]
      }
    ]
  },
  {
    "version": "v28",
    "date": "2026-10-17",
    "title": "Continuidad al cambiar de vista",
    "sections": [
      {
        "title": "Animación",
        "items": [
          "Se reutilizan los lienzos al cambiar de pantalla para reducir los reinicios de las animaciones.",
          "Se ajusta el recorrido de ida y vuelta de los fotogramas."
        ]
      }
    ]
  },
  {
    "version": "v27",
    "date": "2026-10-17",
    "title": "Combates a pantalla completa",
    "sections": [
      {
        "title": "Interfaz",
        "items": [
          "Las barras superior e inferior se ocultan durante el combate para dejar más espacio al tablero.",
          "Se compactan menús, tienda, fichas y resultados para adaptarlos a la altura de la pantalla.",
          "Se refuerza la señal de los cromos elegidos y los objetivos de ataque, por encima del marco."
        ]
      }
    ]
  },
  {
    "version": "v26",
    "date": "2026-10-17",
    "title": "Cromos ampliados y navegación por gestos",
    "sections": [
      {
        "title": "Colección",
        "items": [
          "Tocar un retrato abre una vista ampliada del cromo.",
          "Se puede pasar de un cromo a otro deslizando, con los botones Anterior y Siguiente o con las flechas del teclado.",
          "La ficha y la vista ampliada mantienen sincronizado el cromo seleccionado."
        ]
      }
    ]
  },
  {
    "version": "v25.1",
    "date": "2026-10-17",
    "title": "Mejoras contra los parpadeos",
    "sections": [
      {
        "title": "Animación",
        "items": [
          "Se refuerza la detección de fotogramas vacíos, transparentes u oscuros.",
          "Se mejora la composición de los fotogramas y se evitan borrados innecesarios del retrato entre imágenes."
        ]
      }
    ]
  },
  {
    "version": "v25",
    "date": "2026-10-17",
    "title": "Filtros y posición de la colección",
    "sections": [
      {
        "title": "Navegación",
        "items": [
          "Los filtros de rareza y doctrina conservan mejor su posición al actualizar la colección.",
          "Se recuerda el desplazamiento de la colección y se añade una indicación clara cuando una búsqueda no tiene resultados.",
          "Se preserva el desplazamiento de la mano y del registro del combate al actualizar el tablero."
        ]
      },
      {
        "title": "Combate",
        "items": [
          "Las expulsiones resuelven la doctrina que estaba activa al comenzar el golpe, aunque el líder salga de la Tribuna."
        ]
      }
    ]
  },
  {
    "version": "v24.1",
    "date": "2026-10-17",
    "title": "Primer motor del retrato animado",
    "sections": [
      {
        "title": "Animación",
        "items": [
          "Se incorpora la preparación de fotogramas y su reproducción de ida y vuelta.",
          "Se añaden efectos visuales de brillo y una alternativa de imagen cuando la reproducción avanzada no está disponible."
        ]
      }
    ]
  },
  {
    "version": "v24",
    "date": "2026-10-17",
    "title": "Mejoras de presentación",
    "sections": [
      {
        "title": "Colección",
        "items": [
          "Se amplía el sistema de presentación visual de los cromos."
        ]
      }
    ]
  },
  {
    "version": "v23",
    "date": "2026-10-17",
    "title": "Gabinetes, confirmaciones y seguro parlamentario",
    "sections": [
      {
        "title": "Preparación y partidas",
        "items": [
          "Se exige un gabinete de cinco cromos distintos y un líder, con selección automática como ayuda.",
          "Se recuerda el último gabinete para preparar otra partida.",
          "La IA actúa paso a paso y se ordena el cierre del debate tras siete rondas."
        ]
      },
      {
        "title": "Protecciones",
        "items": [
          "Las acciones como borrar el progreso o abandonar una partida piden confirmación.",
          "El Seguro Parlamentario protege los cinco últimos políticos únicos al resolver el botín."
        ]
      }
    ]
  },
  {
    "version": "v22.3",
    "date": "2026-10-16",
    "title": "Marcos por rareza",
    "sections": [
      {
        "title": "Cromos",
        "items": [
          "Se ajustan los marcos y sus colores: bronce, azul, morado y dorado según la rareza.",
          "Se mejora la colocación del coste y las estadísticas para que el marco no los tape."
        ]
      }
    ]
  },
  {
    "version": "v22.2",
    "date": "2026-10-16",
    "title": "Ajustes del menú principal",
    "sections": [
      {
        "title": "Interfaz",
        "items": [
          "Se recupera una distribución más fluida del menú y del área de contenido.",
          "Se corrige la presentación del botón de vuelta a la colección cuando no se encuentra un cromo."
        ]
      }
    ]
  },
  {
    "version": "v22",
    "date": "2026-10-16",
    "title": "Marcos de los retratos y capas de información",
    "sections": [
      {
        "title": "Cromos",
        "items": [
          "Se incorpora el marco gráfico de los cromos y se refuerza el color de su rareza.",
          "El coste, el nombre, la corona del líder y los botones de selección se colocan sobre el marco para seguir siendo legibles."
        ]
      }
    ]
  },
  {
    "version": "v21.1",
    "date": "2026-10-16",
    "title": "Fichas más visibles",
    "sections": [
      {
        "title": "Colección",
        "items": [
          "Se amplía el retrato de la ficha y se ordena su información.",
          "Se ajustan el área de contenido y la barra inferior para mantener accesible la navegación."
        ]
      }
    ]
  },
  {
    "version": "v21",
    "date": "2026-10-16",
    "title": "Retratos, marcos y gemas de rareza",
    "sections": [
      {
        "title": "Cromos",
        "items": [
          "Se activan los retratos de los políticos en la colección y en el combate.",
          "Cada rareza recibe un marco y una gema propios, con animación de brillo.",
          "Se mejoran las señales visuales de selección y objetivo."
        ]
      }
    ]
  },
  {
    "version": "v20",
    "date": "2026-10-16",
    "title": "Adaptación al móvil y reglas del líder",
    "sections": [
      {
        "title": "Navegación",
        "items": [
          "El botón Atrás del navegador o del móvil permite volver entre pantallas.",
          "Se ajustan los márgenes para respetar las barras del sistema y la zona de gestos."
        ]
      },
      {
        "title": "Combate",
        "items": [
          "Se evita acumular de nuevo la bonificación del líder cada vez que vuelve a jugarse.",
          "Atacar un hueco vacío resta votos al rival; se revisa la aplicación de Foco Mediático.",
          "Si falta un retrato, el cromo puede mostrar las iniciales en su lugar."
        ]
      }
    ]
  },
  {
    "version": "v19",
    "date": "2026-10-15",
    "title": "Primera versión jugable conservada",
    "sections": [
      {
        "title": "Base del juego",
        "items": [
          "Colección de cromos, sobres, Fuerza Soberana y preparación de gabinetes con seis doctrinas.",
          "Partidas normales, clasificatoria y Liga, con fichas de políticos y frases de ataque.",
          "Se prepara la instalación como aplicación web y el funcionamiento mediante caché."
        ]
      }
    ]
  },
  {
    "version": "Inicio",
    "date": "2026-10-15",
    "title": "Primer día registrado del proyecto",
    "sections": [
      {
        "title": "Estructura inicial",
        "items": [
          "Se añade la estructura de la aplicación: barra superior, zona de contenido y navegación inferior."
        ]
      }
    ]
  }
]);
