# Despliegue pendiente — no ejecutado

El usuario ha solicitado revisar el trabajo antes de publicarlo. No hacer push: Render sigue esta rama y podría desplegar automáticamente.

1. Revisar `INFORME.md`, la escena y la política de migración local. Exportar una copia de seguridad del estado de producción antes de cambiar funciones SQL.
2. Mantener v31.0.1.4 visible hasta decidir la publicación. Elegir el número/alcance de las notas con el usuario; acumular las correcciones sin borrar el historial existente ni divulgar logros ocultos.
3. Comprobar en staging el nuevo servidor y `_dev/online/20261025_economy_authority.sql` sobre el esquema actual. Esta migración incluye las funciones económicas, partidas descargadas, actualización de progreso validado y protección de la antigua escritura de respaldos. No ejecutar de nuevo las migraciones antiguas como sustituto de esta.
4. Coordinar el corte de clientes antiguos: la escritura económica de esos clientes dejará de aceptarse tras activar la protección. Publicar el cliente actualizado y comprobar su actualización PWA; atender por separado el progreso legítimo que se hubiera quedado local antes del cambio. No aprobar importaciones automáticamente.
5. Desplegar el servicio en Render con la configuración existente. No se necesitan nuevas claves públicas ni pegar secretos en el repositorio. Conservar la clave privada de Supabase únicamente en el entorno del servidor.
6. Ejecutar la migración candidata **una vez aprobada** en Supabase; comprobar los respaldos antes/después y las denegaciones de permisos. Revisar individualmente las solicitudes locales pendientes si se decide admitirlas.
7. Probar con dos cuentas reales de prueba: correo/Google, restauración, compra, venta de acción, oferta y compra P2P, intercambio con y sin suplemento, cancelación y caducidad; ningún participante debe poder leer el respaldo del otro.
8. Probar Normal, Rápida, Clasificatoria y Liga; desconectar, cerrar y reabrir la PWA, recuperar la partida, terminar y reconectar. Comprobar el recibo único, FS/Elo y desafíos. No cambiar la temporada 1 ni reiniciar cuentas.
9. Comprobar `/health`, respuesta real del mercado, envío/recepción de correos y URLs de autenticación. La validación local con SDK simulado no sustituye estas comprobaciones del despliegue.
10. Solo tras la aprobación y estas verificaciones, publicar el cliente y comprobar los recursos/caché en el dominio.

Comprobaciones locales:

```
node --test tests/*.test.cjs tests/online/*.test.cjs
node _dev/build-offline.cjs --check
node _dev/checks/economy-authority.cjs
node _dev/checks/audit-fixes-browser.cjs
node _dev/checks/audit-fixes-audio.cjs
node _dev/checks/audit-fixes-email.cjs
node _dev/checks/audit-fixes-pwa.cjs
node _dev/checks/result-scenes-browser.cjs
```

Los arneses de navegador de economía/audio utilizan el puerto 8033: ejecutarlos uno detrás de otro. Necesitan Chromium, Playwright, PGlite y el servidor estático local de pruebas en 8045. Las rutas de módulos se proporcionan mediante `NODE_PATH`/`PGLITE_MODULE` en este entorno; no son dependencias de los jugadores.

## Reglas descargadas

`js/offline-rules.js` y `_dev/online/offline-v1.cjs` contienen las mismas fuentes empaquetadas, sin dependencias de red. El servidor reproduce con la copia versionada. Después de publicar reglas nuevas, conservar la versión anterior para validar partidas emitidas con ella: no regenerar ni sobrescribir una versión ya emitida sin preparar la compatibilidad y su periodo de caducidad. Los cambios de reglas locales de esta candidata aún no se han emitido a jugadores reales.
