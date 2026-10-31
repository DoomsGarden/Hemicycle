# Importación inicial automática

Política autorizada por el propietario: primera copia local válida por cuenta, con aceptación explícita del origen local sin firma. El formato válido no acredita que el progreso histórico sea auténtico. Desde la importación, los recursos continúan sujetos a la economía del servidor.

- Nuevo SQL: `_dev/online/20261031_automatic_legacy_import.sql`. Procesa pendientes y habilita aprobación automática; repetible sin duplicar progreso.
- RPC limitado al servicio, identidad obtenida de la sesión, validación completa del respaldo en JavaScript y refuerzo de invariantes en SQL.
- Bloqueo transaccional, auditoría privada, hash de solicitud y origen único. No sustituye nubes existentes ni sobrescribe rechazos previos.
- Cliente reconoce aprobación inmediata, mantiene compatibilidad con la base anterior y archiva la copia local antes de activar/restaurar.

## Comprobaciones

`tests.log`: 44 pruebas aprobadas; validación de respaldos, servicio, cliente, SQL real en PGlite, aprobación por lotes, repeticiones, solicitudes cambiadas, datos inválidos, doble vinculación, nubes existentes, rechazos previos, permisos y recuperación tras perder la respuesta. Incluye la cadena completa de migraciones de economía/XP y conservación de tickets y resultados anteriores.

`browser.json` y capturas: navegador con sesión Google simulada, frontend y servicio reales, RPC sobre PGlite. Solicitud nueva aprobada durante activación; pendiente de la base anterior aprobada al ejecutar el SQL; respuesta perdida recuperable; nube existente preservada. Tres aprobaciones de prueba, ninguna cuenta real. HTTPS externo bloqueado.

`pwa/pwa.json`: actualización desde 950c823, caché reemplazada, 219 recursos, progreso y preferencias conservados y arranque sin conexión.

## Activación real pendiente

No se dispone de credenciales administrativas de Supabase en este entorno. No se han leído ni aprobado solicitudes reales. Ejecutar el SQL completo una vez en SQL Editor activa la política y procesa las pendientes; el resultado devuelve solo cantidades. Un resultado omitido no implica aprobación: revisar la causa indicada, sin reemplazar datos existentes.
