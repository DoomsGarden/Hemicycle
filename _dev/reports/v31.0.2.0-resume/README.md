# Corrección acumulada v31.0.2.0 — recuperación y Mercado

Se conserva la versión visible y el historial de novedades. Caché: `hemiciclo-v31.0.2.0-recovery2`.

- La partida del servidor se recuerda por cuenta en almacenamiento persistente; se migran referencias de sesión anteriores.
- Tras Iniciar y completar el acceso se recupera automáticamente una partida pendiente, tanto descargada como online. No se crea una nueva ni se reinicia su reloj.
- Se cierran selecciones de oradores agotados, retirados o con turno cambiado; cancelar permanece disponible aunque la selección ya no sea válida.
- Una excepción al pintar una jugada online ya no deja activado permanentemente el bloqueo de envío. Prueba específica de fallo y reintento sin enviar dos comandos.
- Mercado con saldo, pestañas de mayor tamaño, instrucciones contextuales y formularios de intercambio en columna.

Validación: pruebas Node, navegador Chromium con HTTP real + SQL PGlite + SDK oficial y autenticación sintética; compra y venta canónicas, partidas descargadas y clasificatorias, recarga con reanudación automática, partida online recuperada sin sessionStorage, cromo agotado, cancelación obsoleta, salida con verificación pendiente y liquidación única. Actualización de PWA desde 7088cf7: 85 recursos, conservación de progreso y caché ajena, apertura sin red; cuatro pestañas de Mercado en 320, 393 y 768 px sin desbordamiento horizontal.

No se reprodujo el fallo intermitente exacto del dispositivo antes del parche: el toque en el cromo agotado pasó también en la versión anterior. Se corrigieron las rutas obsoletas y el bloqueo por excepción de renderizado verificable, sin atribuir al usuario una causa no demostrada.

No se necesita SQL nuevo. Render y Supabase de producción no se prueban con cuentas reales desde este entorno; las pruebas de backend usan transporte local y datos sintéticos. La publicación debe verificarse después contra los archivos públicos de GitHub Pages.
