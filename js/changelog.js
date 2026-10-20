/* Notas del prelanzamiento, contrastadas con el historial del repositorio. */
(function(root,entries){
 if(typeof module==='object'&&module.exports)module.exports=entries;
 else root.HemicycleChangelog=entries;
})(typeof globalThis!=='undefined'?globalThis:this,[
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
