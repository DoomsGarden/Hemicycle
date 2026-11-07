# Servicio online · Estado de v32.0.0.2

Revisado el 7 de noviembre de 2026 contra el código del repositorio. El juego integra cuentas, directorio e invitaciones, combates privados Normal/Rápida, Clasificatoria, economía y Mercado autoritativos y partidas descargadas verificables. El catálogo vigente contiene 899 oradores y 92 acciones.

Esta página describe el código y su configuración. La revisión local no consulta ni cambia los servicios de producción.

## Configuración actual

El servicio usa `_dev/online/server.cjs`, Node 24 y la rama `codex/online-actions-foundation`:

```sh
node --check _dev/online/server.cjs
node _dev/online/server.cjs
```

| Variable | Uso |
| --- | --- |
| `SUPABASE_URL` | URL del proyecto configurado. |
| `SUPABASE_PUBLISHABLE_KEY` | Clave pública del proyecto. |
| `SUPABASE_SERVICE_ROLE_KEY` | Credencial administrativa, exclusivamente en el servidor. |
| `ALLOWED_ORIGINS` | Orígenes explícitos. El juego usa `https://hemicycle.online`; GitHub Pages puede conservarse durante la migración. |
| `PORT` | Puerto local; Render lo proporciona al desplegar. |

`GET /health` informa de versión, revisión desplegada, `configured` y `combatEnabled`. No demuestra por sí solo el funcionamiento de cada RPC o de las migraciones. El identificador histórico del servicio se conserva por compatibilidad.

Los retornos OAuth se configuran en Supabase para el dominio del juego. La ventana `/rooms-test/` conserva una sesión separada y sirve para diagnóstico; las partidas del juego se abren desde su interfaz principal.

## Progreso, economía y combate

- El cliente prepara automáticamente la nube al entrar con correo o Google, incluidas las cuentas existentes sin activar. La primera importación local válida puede aprobarse automáticamente mediante `automatic-local-v1` si la cuenta aún no tiene nube. Una nube existente se recupera; no se fusionan inventarios. [Política y activación](../admin/README.md).
- Compras, intercambios, premios y partidas vinculadas se validan en el servidor. La presentación del navegador no concede recursos ni decide el resultado autoritativo.
- Normal/Clasificatoria usan 90 segundos y Rápida, 60. Las animaciones conservan el plazo real.
- Las partidas descargadas conservan su motor histórico y sus recibos pendientes. Los motores anteriores no se sustituyen al actualizar la interfaz.
- El cliente conserva el combate y la selección cuando no cambia la revisión; las jugadas confirmadas conservan su identificador al reintentar.

En un servicio instalado no deben repetirse las instrucciones de activación de los prototipos. Para cambios de base de datos, consultar la migración concreta y sus notas. La ampliación requiere aplicar [`deploy.sql`](../releases/v32/deploy.sql) antes de desplegar el servicio y la web. Incluye los permisos visuales, recibos de eventos, catálogo de acciones, offline9 y la edición legal. Publicar código no ejecuta esta migración.

## Verificación y operación

```sh
NODE_PATH=/workspace/.hemicycle-tools/node_modules \
PGLITE_MODULE=/workspace/.hemicycle-tools/node_modules/@electric-sql/pglite \
node --test tests/online/*.test.cjs
```

Las pruebas usan transporte simulado y bases aisladas. Las comprobaciones con cuentas alojadas y dispositivos son verificaciones de producción separadas.

- [Supervisión, métricas y límites](../operations/README.md).
- [Notas de v32.0.0.2](../releases/v32.0.0.2.md).
- [Historial de salas, prototipos e instrucciones iniciales](HISTORIAL-FUNDACION.md).
- [Primera partida privada, documento histórico](COMBATE-PRIVADO.md).

La revisión v32.0.0.2 requiere aplicar [`20261107_review_v321.sql`](20261107_review_v321.sql) después del bloque de v32. Admite gabinetes de ocho oradores y cuatro acciones, conserva importaciones históricas y offline1–9, y añade offline10. Guarda de forma autoritativa el evento independiente de revisión y el bonus por racha. La migración es repetible y no se ejecuta al publicar código.
