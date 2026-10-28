# v31.0.2.4 — Liga por rendimiento y revancha rápida

El premio de fin de Liga deja de ser aleatorio: `redondear(1100 − 800 × (puesto − 1) / 29)`. Primer puesto: 1100 FS; 15.º: 714 FS; último: 300 FS. Los importes intermedios disminuyen proporcionalmente. Juego local y servidor importan la misma función. Se mantienen los desempates actuales por puntos y victorias, divisiones y premios de jornada; lo ya abonado no cambia.

Los recibos nuevos del servidor incluyen el puesto y el premio de temporada para explicarlo en resultados. El total de FS del resultado incluye también la recompensa habitual de esa partida. La guía de Liga explica el nuevo rango sin añadir pasos.

Volver a jugar tras Rápida llama al mismo inicio automático que Jugar en Rápida desde Inicio: prepara un gabinete automático y conserva los turnos de 60 segundos. Normal y Clasificatoria continúan pasando por el selector de gabinete.

## Validación

- 79 pruebas relacionadas correctas. Cubren los 30 puestos en local, todas las posiciones en las tres divisiones del servidor con distintas fuentes aleatorias, límites, redondeo, ascensos/descensos y ausencia de segundo pago local (`tests.log`).
- PostgreSQL local con las migraciones existentes: cierres verificados en puestos 1, 15 y 30; saldo y temporada avanzan una vez, el reintento devuelve el recibo y otra operación con el mismo ticket no puede abonarlo de nuevo. Elo conservado (`settlement.json`, `settlement.log`).
- Navegador: resultados de Liga locales y verificados, repetición real del botón de Rápida a 320 y 393 px, gabinete automático nuevo, reloj de 60 segundos, entrada al inicio de partida descargada en modo `rapida` para una cuenta vinculada simulada y selección conservada en Normal (`browser.json`, `browser.log`).
- PWA desde 739c098: 116 recursos, actualización de caché y funcionamiento offline con perfil, Liga y audio conservados (`pwa.log`, `pwa/pwa.json`).
- Escalado de texto, motor offline generado, sintaxis y diferencias sin errores.

No requiere SQL. Las pruebas usan navegador y PostgreSQL locales; no se modificaron cuentas de producción. El cambio de servidor se distribuye por el despliegue de Render desde la rama publicada; su estado Live no se puede consultar desde este entorno.
