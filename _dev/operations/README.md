# Supervisión del servicio de Hemicycle

Disponible desde la corrección `v31.0.2.3-ops1`. `v31.0.2.6` añade histogramas acotados de latencia; no requiere SQL, claves ni variables nuevas.

## Consultar en Render

En el servicio → Logs, buscar `hemicycle.operations`. Cada instancia emite un resumen acumulado cada 60 segundos y al cerrar normalmente. `instanceId` distingue reinicios/instancias; los totales no sobreviven al proceso, los registros conservados por Render sí según su retención contratada. No es un almacén histórico propio ni configura alertas automáticas.

Los registros individuales de errores, esperas de 1,5 segundos o más y conflictos incluyen `requestId`, ruta normalizada, estado HTTP, duración y conflictos. El error económico del jugador muestra «Consulta: …»: buscar ese UUID en los logs. No copiar claves ni respaldos al investigar. No se registran JWT, cuentas, correos, nicks, cuerpos, inventarios, códigos de sala ni URL con parámetros. No hay endpoint público de métricas.

Los resúmenes incluyen peticiones, fallos 5xx (`errors`), rechazos 4xx (`clientErrors`), conexiones cerradas, peticiones lentas, llamadas al proveedor/fallos, tiempo acumulado, conflictos de revisión, rechazos por cola, concurrencia actual y pico. `routes` desglosa recuentos y tiempos por rutas normalizadas. La media es duración total/peticiones. Desde v31.0.2.6, cada ruta incluye `buckets`, `maxMs`, `p50UpperMs` y `p95UpperMs`: son límites superiores aproximados del percentil, calculados con intervalos de 50 ms a 65 s y un intervalo final abierto (`null` en `bucketUpperMs`). No son percentiles exactos. El máximo observado acota el intervalo final. Se mantienen en memoria por instancia; no se promedian percentiles entre instancias. La herramienta de resumen siguiente conserva los totales generales, no combina histogramas. Un 409 por compra de una oferta ya agotada puede ser normal.

Exportar el periodo de logs a un archivo y ejecutar localmente:

```sh
node _dev/operations/summarize.cjs /ruta/render.log
```

La herramienta toma el último resumen acumulado por instancia. No sumar muestras sucesivas de la misma instancia. Sin resumen no equivale a cero errores. Para estudiar un periodo, comparar diferencias de muestras de la misma instancia o usar sus registros individuales; un resumen acumulado aislado también incluye actividad anterior al periodo.

## Criterios de revisión iniciales

- Un fallo de pago o premio: buscar su referencia y recuperar el recibo antes de repetir con otro identificador. Los reintentos deben conservar el identificador original.
- 5xx sostenidos durante varios resúmenes, o rechazos de cola repetidos: revisar disponibilidad de Supabase, latencia y recursos de Render. No confundir conflictos 409 de ofertas con una caída del servicio.
- Conflictos frecuentes: comparar instancias y latencias. La cola serializa escrituras económicas dentro de cada instancia, no sustituye las comprobaciones SQL entre instancias.
- Esperas sostenidas de varios segundos: medir por ruta antes de aumentar la audiencia. El servicio actual usa cómputo de pago: no atribuir automáticamente una espera al reposo del plan gratuito. Revisar ruta, cola y proveedor antes de cambiar el plan.

## Límites y recuperación

Una escritura activa y hasta 64 esperando por instancia; máximo 8 segundos esperando para empezar. Al agotarse capacidad/espera, respuesta 503 `ECONOMY_BUSY` con `Retry-After: 1`: no se ejecuta el trabajo descartado y el cliente conserva la operación. Las lecturas sin mantenimiento y `/health` no esperan esa cola. Cinco intentos de revisión con pausa creciente para conflictos entre instancias. El SQL sigue protegiendo saldos/inventarios y la exclusión de recibos duplicados.

No realizar carga destructiva contra cuentas reales. La prueba reproducible usa dos instancias HTTP, autenticación controlada y PostgreSQL PGlite aislado:

```sh
NODE_PATH=/ruta/node_modules node --test tests/online/operations-load.test.cjs
```

PGlite ejecuta sus llamadas SQL secuencialmente. Se intercalan lecturas y confirmaciones reales de dos instancias para provocar revisiones obsoletas, pero no se reproduce la contención de locks de varias conexiones PostgreSQL. Las cifras locales no certifican capacidad de Render, latencia móvil ni un número de jugadores soportados. Antes de aumentar mucho la audiencia queda medir un entorno de staging equivalente con PostgreSQL de varias conexiones y supervisar producción. No se elimina el JSON global del Mercado en esta corrección.

## Diagnóstico voluntario del cliente

Ayuda → Si una conexión tarda → Diagnóstico de conexión permite descargar tiempos agregados de la sesión. No guarda cuentas, URL, marcas de tiempo ni contenido; no persiste tras recargar y no se envía automáticamente. Cuenta interrupciones por separado de fallos. Para investigar una demora real, el jugador puede decidir aportar ese archivo y describir la operación. No sustituye una medición de producción ni registra analítica de uso.
