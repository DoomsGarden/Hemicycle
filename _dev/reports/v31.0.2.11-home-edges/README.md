# Marco lateral completo y foco de Jugar · v31.0.2.11

La botonera sobresalía ocho píxeles de `.view-body`, que recorta sus descendientes. A 393×851, el dibujo llegaba a x=385 mientras el contenedor terminaba en x=377: desaparecía su lado derecho. La columna se recoge ahora doce píxeles, dejando el dibujo y su sombra dentro del espacio visible. El marco llega a x=373. En horizontal, el pie de Jugar reserva ocho píxeles adicionales para conservar la separación.

Jugar recibe el foco automáticamente al terminar la entrada. Según el dispositivo y el método de entrada, podía activar el contorno global de foco sobre el botón interior. Jugar y su selector eliminan ese contorno, borde y sombra propios. El teclado conserva un indicador mediante el material del control y la iluminación del marco ilustrado. No cambia la gestión del foco ni la lógica de entrada.

Se conservan la columna única, el fondo al 70 %, los iconos opacos, los grosores acordados, la navegación y las preferencias.

## Comprobaciones

Pruebas de navegador en Chromium; las dimensiones y la entrada táctil se emulan.

- [90 arranques limpios](browser.json): seis temas × cinco tamaños (320×568, 393×851, 768×1024, 844×390 y 568×320) × ratón, táctil y teclado.
- Primera medición antes de pulsar controles del menú, repetida tras cargar fuentes, desplegar la botonera y volver desde Colección. Se compara el marco completo con todos sus ancestros que recortan contenido. Ningún lateral queda fuera.
- Texto al 100 % con ratón y al 116 % con táctil/teclado; iconos al 116 %. La prueba táctil usa escala de píxel 1,5.
- Se comprueba ausencia de contorno y borde CSS en Jugar y su selector, el foco de teclado visible dentro del estilo, apertura/cierre del selector, los cinco iconos de una columna, sus áreas de pulsación y el acceso a Jugar.
- Seis pruebas de navegación y escenario aprobadas. Sintaxis y reproducción del motor offline comprobadas.
- [Actualización PWA](pwa/pwa.json) desde `62e6c59`: 219 recursos, sustitución de caché, progreso/preferencias preservados y comprobación del marco y Jugar sin conexión.

Capturas desde el primer arranque: [Clásico](startup-classic.png), [Holográfico](startup-hologram.png) y [Holográfico desplegado](expanded-hologram.png).

Caché `hemiciclo-v31.0.2.11-edge8`. No requiere SQL ni cambia reglas, economía, progreso o ajustes del jugador.
