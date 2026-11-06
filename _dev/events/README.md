# Eventos y avisos reutilizables

La primera configuración es `HemicycleExpansionEvent.presentation` en `js/expansion-event.js`. `js/event-presenter.js` es el componente de presentación y no concede FS ni cromos.

Un evento define `id`, `title`, `image`, `imageAlt`, `paragraphs`, `buttonLabel`, `durationMs` y `reminder`. La ampliación usa 15.000 ms. El componente conserva el estilo, transparencia, animación y movimiento reducido del juego. Cierra por botón, fondo o tiempo y llama una sola vez al callback. Interrumpirlo con otro diálogo limpia el temporizador para no cerrar la ventana siguiente.

`HemicycleEventPresenter.create({open, close})` adapta el componente al sistema de ventanas. `open(título, HTML, botón)` debe devolver el nodo del diálogo; al cerrarlo se llama a `closed()`. `show(configuración, alCerrar)` presenta el evento. `hintHTML(texto)` crea la viñeta junto al buzón. La visita al buzón confirma el recordatorio, sin reclamar las entregas.

Para el siguiente evento se crea un identificador y configuración nuevos, se conecta su elegibilidad y sus entregas al buzón y se reutiliza el presentador. Las recompensas deben conservar recibos propios en la economía autoritativa; cambiar el arte o el temporizador jamás vuelve a concederlas. El ejemplo de ampliación guarda aviso, visita y reclamaciones por cuenta, con copias locales para invitados.

Comprobaciones: `_dev/checks/expansion-event-v32.cjs`, `expansion-event-v32-pwa.cjs` y `expansion-v32-sql.cjs`. La prueba de navegador cubre el límite de 15 segundos, botón y pulsación fuera del aviso, la viñeta y las entregas.
