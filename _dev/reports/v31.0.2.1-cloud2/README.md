# v31.0.2.1 — sincronización de perfiles anteriores y música de Inicio

La corrección cloud1 no cubría la divergencia introducida al aplicar una copia verificada. Se reprodujo el mensaje exacto «El guardado ha cambiado durante la comprobación…» con contadores de objetivos de una copia anterior: el servidor devolvía un total de colección 0 y `atomicLocal` lo recalculaba a 120. La lectura posterior marcaba pending de nuevo. No se trata de una modificación concurrente real de la cuenta.

`atomicLocal` admite una escritura canónica que conserva los objetivos tal como llegan. Se usa al adoptar y recuperar una copia de servidor; los guardados locales de invitados siguen calculando sus objetivos. La representación de clasificatoria no vuelve a generar ni guardar una temporada en cuentas vinculadas. No se relaja el requisito synced, la validación de identidad ni el control de revisiones.

Pruebas: el log anterior reproduce el error con HTTP, SQL PGlite y SDK oficial sobre una cuenta sintética. La verificación nueva confirma sincronización tras conservar objetivos antiguos y temporada null, y arranca una clasificatoria real contra el servicio de pruebas. La suite completa pasa 526 pruebas. No hay acceso a los datos privados de la cuenta de producción del usuario. No se necesita SQL.

Audio: el tema instrumental de menú se solicita desde Inicio automáticamente, sujeto a la política de reproducción del navegador. En Inicio se aplica el 70 % del volumen musical elegido; al entrar se recupera suavemente el volumen normal mediante Web Audio, sin reiniciar la pista ni superponer otra. Se respetan silencio, volumen y apagado de música. Un control accesible permite activar el audio cuando se requiere un gesto. La botonera permite recorrer ambos controles con teclado. Chromium se prueba con reproducción automática permitida y con activación explícita de documento; se comprueba primera pulsación, silencio y continuidad a menú.

Actualización PWA desde 2afdb7c: misma versión visible, nueva caché cloud2, 87 recursos, progreso conservado y apertura sin conexión. El changelog mantiene las novedades anteriores y añade ambas correcciones.
