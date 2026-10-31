# Barra inferior al iniciar · v31.0.2.11

La versión publicada (`e9ccf26`) deja el halo seleccionado 9 píxeles por debajo del icono al entrar, hasta la primera navegación. La comparación se ejecuta con dos arranques limpios, sin pulsar la barra: [antes](before-bar.png), [después](after-bar.png) y [mediciones](comparison.json).

El observador de geometría seguía solo el tamaño de la barra. Ahora sigue también el botón activo y su icono, retirando los nodos anteriores cuando se reconstruye la navegación. Las mediciones se agrupan por fotograma y se repiten al entrar, terminar de cargar fuentes y regresar a la aplicación. El centrado horizontal conserva los píxeles fraccionarios. No cambia el diseño ni los gestos.

## Validación

- [12 arranques limpios](startup.json): cuatro tamaños (320×568, 393×851, 768×1024 y 844×390), tres configuraciones de fuentes/tamaños/movimiento, fuente editorial retrasada, Perfil y Opciones antes de navegar, redimensionado y regreso a la aplicación. Error de alineación inferior a un píxel CSS. [Captura inicial](initial-aligned.png).
- [Gestos reales](swipe/swipe.json): ambos sentidos, extremos, desplazamiento vertical y horizontal, cancelación, controles y ventanas, ratón, animación del halo en tres tamaños y movimiento reducido.
- Suite completa: 2.005 pruebas aprobadas, ninguna fallida.
- [PWA](pwa/pwa.json): actualización desde `e9ccf26`, 215 recursos precargados, sustitución de caché, carga sin conexión y conservación de progreso y preferencias.
- Sintaxis JavaScript y reproducción del motor offline comprobadas.

Caché `hemiciclo-v31.0.2.11-nav4`. Sin SQL ni cambios de reglas, recompensas o progresión.
