# v31.0.2.1 — Liga, cromo de resultado y Mercado compacto

Liga ya devuelve los identificadores `won` y `lost` en el recibo de sus partidas descargadas. Se verificó el recorrido completo con HTTP real, SQL PGlite y el SDK oficial sobre cuentas sintéticas: victoria, derrota y cierre de temporada con registros legales de jugadas. Se comprueba el cambio exacto de una copia y que el Elo no cambie en Liga. Los tres casos equivalentes del motor local de invitados tienen regresiones propias. La protección de cromos sin pérdida también se explica en resultados de Liga.

La carta del resultado se muestra más grande, centrada y con su texto debajo. Se ajusta al alto disponible, y se mantiene la zona desplazable para la información adicional sin cubrir los botones. Se probaron 393×851, 320×640 y 844×390 con el sello real de mayoría, controles visibles y el texto de la carta dentro del área disponible.

En Mercado se acotan explícitamente las dimensiones de la casilla de visibilidad para evitar que herede los tamaños de los campos de texto. Casilla de 17 px, consentimiento claro, cuatro pestañas en una fila, título más compacto e instrucciones breves. Prueba con una cuenta vinculada y el mercado real local a 320, 393 y 768 px: primera fila visible y ausencia de desbordamiento horizontal. No cambia precios, inventarios ni consentimiento existente.

543 pruebas automatizadas aprobadas. Actualización PWA desde c0828d2: misma versión visible, caché `hemiciclo-v31.0.2.1-ui3`, 87 recursos, progreso conservado y uso sin conexión. Las novedades anteriores se mantienen y se añaden las correcciones. No necesita SQL ni modificaciones de reglas descargadas. No se ha accedido a datos privados de usuarios de producción.
