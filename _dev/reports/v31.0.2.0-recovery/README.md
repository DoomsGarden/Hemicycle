# v31.0.2.0 — recuperación tras errores de servidor

Autorizado publicar como corrección de la misma versión. Sin nuevas migraciones.

- Sustituir un modal de objetivos libera sus bloqueos antes de crear la ventana de error; cerrar el aviso devuelve las barras de navegación.
- La escena de resultado ofrece volver al menú tras un error o después de ocho segundos de espera. La salida devuelve un resultado pendiente, restaura foco/controles y limpia sus escuchas. Siguiente continúa reservado a resultados verificados.
- Las partidas descargadas conservan su registro pendiente. En partidas remotas la referencia de sala se retira únicamente después de verificar; una partida aplazada puede recuperarse desde Jugar sin repetir premios.
- Novedades acumuladas y caché PWA actualizadas, conservando v31.0.2.0.

513 pruebas Node superadas. Navegador Chromium: errores de reclamación de Desafíos/Logros, servidor HTTP 503, salida pendiente y restauración de controles, reintento posterior, partida descargada aplazada y sincronización, resultado remoto con consulta de nube fallida, vuelta al menú y recuperación verificada desde Jugar. Pruebas de servidor con PostgreSQL aislado y autenticación sintética, sin operaciones sobre usuarios reales.
