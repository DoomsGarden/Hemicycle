# Verificación v31.0.2.2

- 548 pruebas automatizadas: 548 correctas, cero fallos.
- Chromium real: guía independiente de Mercado (siete pasos), primera visita, no repetición, repetición manual y salida; sin transacciones ni cambios de perfil.
- Tutoriales completos de menú y combate: progreso intacto. Mercado no aparece en la guía general.
- Intercambio visual completo entre dos cuentas sintéticas sobre HTTP local, SDK de Supabase y PostgreSQL PGlite. Selector con búsqueda y comparación; aceptación por la segunda cuenta.
- Resultado clasificatorio: recibo propio del servidor, historial, cromos y animación de FS hasta cero; perfil sin mutaciones por la animación. Pruebas unitarias de Elo positivo/negativo y movimiento reducido.
- Acceso desde el resultado al gabinete que perdió su última copia; edición en Colección.
- Actualización PWA desde bedb10b: 91 recursos precacheados, sustitución de caché, perfil/Liga/audio conservados y arranque sin conexión.
- Cuatro pestañas de Mercado en 320, 393 y 768 px. Perfil con nuevo botón de historial comprobado en 320×640.

Los JSON y capturas adjuntos recogen las pruebas. La autenticación y las partidas usan cuentas sintéticas; no se han utilizado cuentas privadas de producción. Render/Supabase de producción no son accesibles desde la política de red de este entorno. No requiere nuevo SQL. El servidor debe desplegar este mismo commit para habilitar los nuevos recibos de historial.

El historial comienza con partidas nuevas. Los resultados descargados y las clasificatorias online generan recibos de cuenta; los resultados locales y amistosos online también se conservan en este dispositivo, identificados como tales. No se reconstruyen partidas antiguas.
