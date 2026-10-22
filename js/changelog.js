/* Notas del prelanzamiento, contrastadas con el historial del repositorio. */
(function(root,entries){
 if(typeof module==='object'&&module.exports)module.exports=entries;
 else root.HemicycleChangelog=entries;
})(typeof globalThis!=='undefined'?globalThis:this,[
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
