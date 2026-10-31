# Grosor común y botonera de una columna · v31.0.2.11

Los marcos ilustrados de ventanas, paneles, filas de logros/desafíos, recompensas, pies de acciones y miniaturas comparten `--menu-frame-width: 20px`. Los controles compactos usan la excepción acordada `--menu-control-frame-width: 10px`: Perfil, Ayuda, Novedades, Desafíos, Jugadores y el soporte lateral.

La botonera lateral no dibuja marcos en sus botones individuales. Su soporte conserva un solo marco y los cinco iconos se ordenan siempre en una columna. En horizontal, Jugar reserva espacio a la derecha para esa columna. Las pantallas de 568×320 utilizan controles de 24 píxeles de alto; los demás tamaños conservan áreas mayores. Los iconos mantienen su proporción, visibilidad y estado accesible.

Solo la capa de fondo del soporte usa opacidad 0,7. Marco, botones e iconos mantienen opacidad 1. La apertura descubre los iconos mediante recorte de altura, sin atenuarlos. El movimiento reducido hace el despliegue inmediato.

Los elementos con marco de 20 píxeles tienen al menos 40 píxeles de alto para que el navegador no reduzca el borde al sumar lados opuestos. Los rellenos y textos dejan espacio interior; las miniaturas limitan sus pistas de cuadrícula para que el emblema no crezca ni quede cortado. Los botones de recompensa conservan los estados y su alineación inferior con la barra. Elo permanece en una línea en las cabeceras estrechas.

## Validación

- [48 configuraciones principales](browser.json): seis temas, texto al 100 y 116 %, iconos al 116 %, cuatro tamaños (320×568, 393×851, 768×1024 y 844×390). Inicio, Opciones, Perfil, Editor, Desafíos, Logros, Tienda, Liga, Resultado, Sobres, confirmaciones y selector de frases. El Acta conserva su superficie de lectura existente.
- [24 configuraciones en horizontal pequeño](short.json): los seis temas a 568×320 y 667×375, con ambos tamaños de texto. Se comprueba la botonera de una columna, los cinco iconos y el acceso real a Jugar. El selector de frases se mantiene dentro de la pantalla; esta matriz no modifica ni comprueba la disposición del botón de Acta en 568×320.
- La comprobación recorre elementos y pseudoelementos con marco ilustrado: todos tienen su grosor esperado (20/10), y el factor efectivo con el que el navegador ajustaría bordes opuestos es 1. No se comprimen al cambiar de tamaño.
- Se verifica que los botones internos de la botonera no tengan `border-image`, que sus centros horizontales coincidan, que sean pulsables y que sus iconos no pierdan opacidad. Fondo 0,7 y marco 1.
- Se prueban los tres estados de recompensa, la posición del texto dentro del marco, la alineación con la barra y los emblemas dentro de las miniaturas.
- [Animación de los seis temas](animation.json): apertura interpolada, cierre, estado `inert`, iconos opacos durante el despliegue y movimiento reducido.
- 93 pruebas de presentación e interacción aprobadas. Sintaxis y reproducción del motor offline comprobadas.
- [Actualización PWA](pwa/pwa.json) desde `c877427`: 219 recursos, progreso y preferencias conservados, caché nueva y funcionamiento sin conexión, incluida la botonera.

Capturas: [Holográfico](toolbar-hologram.png), [Papiro](toolbar-parchment.png), [botonera en horizontal](toolbar-hologram-568.png), [recompensas](challenges.png) y [miniaturas](editor-book.png).

Caché `hemiciclo-v31.0.2.11-uniform7`. No requiere SQL ni modifica reglas, economía, XP, Elo, cromos o preferencias guardadas.
