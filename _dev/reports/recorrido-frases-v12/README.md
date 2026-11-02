# Recorrido y fin de frase · Corrección de v31.0.2.12

La reproducción anterior mostraba opacidad 1 en el último fotograma y mantenía un desvanecimiento posterior de 160 ms. Esa cola se elimina: el texto pierde opacidad durante el último tramo del recorrido, acaba a cero y se retira al recibir `animationend`. El temporizador queda como respaldo. Cancelar la animación o abandonar la escena también retira el texto.

Los destinos de frase y efecto se validan según la pertenencia real del orador y del objetivo. Un ataque normal o fuerte usa el campo contrario; defensa y curación, la mitad propia. Las coordenadas se resuelven al comenzar a mostrar la frase para evitar reutilizar una posición que ya no corresponda al tablero. Un objetivo ausente o una referencia al lado propio usa el campo contrario como destino visual, sin cambiar la jugada del motor.

## Comprobaciones

- 16 recorridos: cuatro intervenciones, dos perspectivas, móvil de 393 × 851 y horizontal de 844 × 390. Se mide el inicio y los puntos 25 %, 50 %, 75 %, 95 %, 99,9 % y 100 %.
- Los ataques llegan al campo opuesto y los apoyos permanecen en su mitad. El crecimiento del punto medio y el tamaño al llegar se conservan. El último fotograma tiene opacidad cero y no queda nodo residual.
- Seis casos adicionales: ataque a bancada vacía, indicación de lado incoherente y referencia visual a un objetivo propio, desde ambas perspectivas. El destino visual sigue siendo el campo contrario.
- Reproducción natural con muestreo cada 10 ms: una sola frase, ningún fotograma final fijo visible, limpieza completa y controles liberados antes de terminar el texto.
- 48 configuraciones de selector y 17 flujos locales, online y descargados, incluidos movimiento reducido y respuestas encadenadas. [Resultado](full/browser.json).
- 165 pruebas unitarias. [Registro](tests.log).
- Actualización PWA desde `78b0954`: caché `hemiciclo-v31.0.2.12-trayecto4`, 227 recursos, progreso y preferencias conservados, código nuevo disponible sin conexión. [Resultado](pwa/pwa.json).

[Mediciones de recorrido](browser.json), [reproducción anterior](before.log), [script de navegador](../../checks/recorrido-frases-v12.cjs).

![Frase de ataque durante el cruce hacia el rival](normal-crossing.png)

Se mantiene v31.0.2.12 y su etiqueta. Sin SQL ni cambios de reglas, reloj, inventario o premios. Las pruebas usan datos locales de demostración y bloquean conexiones a servicios de jugadores.
