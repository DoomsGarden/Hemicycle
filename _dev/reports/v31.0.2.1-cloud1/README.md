# v31.0.2.1 — corrección de acceso a Clasificatoria

Causa reproducida: el acceso ejecutaba `save()` y `refresh()` exigiendo luego `synced`. Desde el progreso autoritativo, `save()` prepara los saldos con la copia del servidor; eso evita subir valores locales, pero no sustituye el progreso local. Si el saldo local difiere o llega una revisión del servidor, la evaluación sigue devolviendo `pending`/`conflict` y el acceso repite el aviso genérico.

Corrección: comprobar la conexión y la vinculación, adoptar la copia canónica, guardar las preferencias locales y confirmar el estado antes de crear una partida/entrar en cola. Se mantiene la comprobación de identidad y no se activa una cuenta sin consentimiento. Se propagan los errores de conexión y de guardado antes de crear el combate. No se modifica SQL ni el cálculo de Elo, recompensas o reglas.

Pruebas:
- Cinco regresiones nuevas sobre copia local obsoleta, revisión remota nueva, preferencias conservadas, cuenta no vinculada, fallo de lectura y otra identidad (las dos comprobaciones de progreso son pruebas distintas).
- `before.log` contiene fallos esperados con la función anterior; `tests.log` contiene 522 pruebas aprobadas con la corrección.
- Navegador con HTTP real, PGlite y SDK oficial sobre cuentas sintéticas: se ejecuta la función anterior para reproducir el aviso exacto; la entrada corregida permite jugar Clasificatoria con los FS y Elo del servidor, conservando el fondo preferido. Comprueba resultado, reconexión, reanudación y abono único.
- Actualización PWA desde 39b0b51: misma versión visible, nueva caché `hemiciclo-v31.0.2.1-cloud1`, 87 recursos, progreso intacto y uso sin red.

No se ha accedido a datos privados de la cuenta de producción del usuario. El changelog conserva los añadidos anteriores de v31.0.2.1 y suma esta corrección. No requiere ejecutar SQL.
