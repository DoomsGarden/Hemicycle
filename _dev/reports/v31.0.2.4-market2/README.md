# v31.0.2.4 — Una tarjeta de Mercado y selectores del juego

La fila elegida se transforma en su editor de venta o compra: conserva una miniatura ampliable, un solo nombre y un solo cierre. La apertura anima desde el tamaño de la fila hasta los controles, sin una segunda tarjeta debajo. Se elimina «Comprar» del título. Cantidades, confirmación y validación de los importes conservan sus reglas.

Los selectores de país, cantidades de sobres, rareza y opciones de intercambio usan una lista propia con fuente del juego, colores oscuros/dorados, opción seleccionada y flecha. Conservan el valor y los eventos del control original. Admiten teclado, búsqueda por primeras letras, opciones deshabilitadas, Escape y Tab; la lista se ajusta al espacio disponible, se cierra al navegar y respeta el movimiento reducido. La preferencia de tamaño de texto también se aplica al desplegable.

El changelog conserva las dos correcciones de Mercado en v31.0.2.4. Se corrige la ubicación de la nota anterior, que había quedado en v31.0.2.3. La guía de Mercado explica la tarjeta única sin añadir pasos.

## Validación

- 27 pruebas relacionadas de Mercado, servidor y changelog (`tests.log`).
- Compra y venta simuladas en Chromium, a 320×640, 393×851 y 844×390, texto al 116 %, con cantidades, revisión, presupuestos cambiados, acciones, foco, desplazamiento y movimiento reducido (`browser.json`). Los filtros de rareza y selectores de jugador, método y segundo cromo mantienen sus manejadores.
- País filtra la colección; x5 actualiza el precio real mostrado de los sobres. Listas dentro de la pantalla en tres tamaños, selección con teclado, búsqueda, Escape/Tab, controles y opciones deshabilitadas, eventos únicos, actualización externa y limpieza al cerrar el diálogo (`selectors.json`).
- PWA desde 17b96a5: 115 recursos precargados, nueva caché, acceso sin conexión y progreso, Liga y audio conservados (`pwa.log`, `pwa/pwa.json`).
- Sintaxis, escalado de texto, motor offline generado y `git diff --check`: correctos.

Las transacciones de navegador usan un servicio local simulado; no se compró ni vendió inventario de jugadores en producción. No requiere SQL ni altera reglas de combate.
