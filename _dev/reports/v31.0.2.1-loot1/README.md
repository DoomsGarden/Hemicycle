# v31.0.2.1 — cromos del resultado de Clasificatoria

Se verificaron dos fallos: el adaptador online descartaba `won`/`lost`, y la liquidación online solo registraba FS/Elo/estadísticas. Las partidas descargadas ya devolvían un recibo con el cromo ganado o perdido. No se infieren premios a partir del álbum ni se cargan pérdidas históricas sin registro.

El servidor registra el movimiento de un cromo de los gabinetes implicados usando las operaciones canónicas existentes de economía. Una sola operación por sala mueve ambas colecciones con comprobación de revisiones y guarda ambos recibos privados. Se recupera el mismo recibo después de perder una respuesta, repetir una jugada o consultar desde cualquiera de los participantes. La petición pública de economía no admite esta operación interna. Se respeta la protección de los cinco últimos oradores únicos y se conservan FS, Elo, cromos de acción y demás progreso.

Solo se marcan para liquidación los combates nuevos que se cierran con este servicio. Los históricos sin marcador se señalan como resultados sin cromo registrado y no generan movimientos retroactivos. La pantalla usa el recibo confirmado para mostrar imagen, nombre, rareza y copias restantes, igual que en el modo local. Las partidas descargadas pendientes no muestran un cromo como confirmado hasta reconectar y verificarlo.

Validación:
- Navegador y HTTP reales, SQL PGlite con las migraciones existentes y SDK oficial sobre cuentas sintéticas.
- Victoria/derrota PvP: una carta entregada y retirada, mismo ID en ambos recibos; pérdida deliberada de la respuesta después del commit y reintento sin duplicar cromos, FS ni Elo.
- Derrota contra IA y partidas descargadas: derrota sin red pendiente hasta verificación; victoria obtenida mediante una secuencia legal de jugadas, reproducida y validada por el servicio.
- Capturas online y offline de victoria/derrota en móvil; pruebas de protección, copias repetidas, recibos antiguos y rechazo de solicitudes públicas de premios.
- Actualización PWA desde b6e79ef, 87 recursos y progreso conservado, incluida apertura sin red.

No requiere SQL nuevo: se reutilizan las funciones de contexto/commit ya instaladas. Se publica el cliente y el servicio de Render en la rama configurada, manteniendo v31.0.2.1 y sus novedades acumuladas. Este entorno no dispone de credenciales de despliegue de Render ni acceso permitido a su dominio para verificar su estado privado en producción; la validación del servicio se realiza con el backend real en local. Deben verificarse los archivos públicos de Pages tras publicar.
