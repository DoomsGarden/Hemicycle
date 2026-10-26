# v31.0.2.3 — Corrección de prioridades altas

## Resultado

Se añade supervisión estructurada en logs de Render, referencias de consulta en errores económicos y pruebas de concurrencia del servicio. Se conservan las novedades previas de v31.0.2.3; no hay SQL nuevo ni reinicio de progreso, temporada o reglas.

## Fallos corregidos

1. Una excepción de red al consultar Supabase acababa como HTTP 409 en la ruta económica. El cliente podía interpretarla como definitiva y retirar su operación pendiente. Ahora devuelve 503, sin revelar el mensaje interno; saturación, caída de autenticación y respuestas incompletas también mantienen su carácter temporal.
2. Dos instancias calculando la misma operación aleatoria podían confirmar una sola escritura, pero devolver cálculos distintos: el SQL reconoce el identificador duplicado y devuelve `true` a ambos. Ahora el servicio recupera el recibo canónico después de confirmar. Incluye compra de sobres, liquidación offline y cromo ganado/perdido en Clasificatoria.
3. Las escrituras simultáneas competían por la revisión global sin una cola limitada. Se serializan por instancia, con capacidad/espera limitadas, pausas entre conflictos de otras instancias y 503 recuperable si no se puede atender. Las lecturas sin mantenimiento y salud siguen disponibles.

## Supervisión

Resúmenes por instancia cada minuto y al cierre normal; recuentos por ruta, errores, duración, concurrencia, llamadas al proveedor, conflictos y rechazos de cola. Registros individuales para errores, esperas lentas y conflictos, correlacionados con el UUID mostrado al jugador. No se registran claves ni datos personales. Herramienta local para resumir logs exportados y guía en `_dev/operations/README.md`. No se añade una base histórica ni alertas automáticas.

## Comprobaciones

- Batería final completa: 580 pruebas correctas, incluidas la herramienta de resumen, el identificador de instancia y la recuperación del recibo canónico en Clasificatoria.
- Dos servidores HTTP, 25 cuentas sintéticas, 145 peticiones sobre funciones SQL reales en PGlite: venta idempotente con reintentos cruzados, 24 compradores compitiendo por una unidad, ocho carreras aceptar/cancelar intercambio, sobre aleatorio repetido en instancias distintas, respuesta perdida después de confirmar y recompensa offline liquidada una sola vez. Saldos y cantidades conservados según cada operación; ningún doble abono.
- Cola: capacidad agotada, espera vencida, recuperación tras fallo y `/health` disponible durante saturación. El cliente conserva y reenvía el mismo identificador al recuperarse.
- Privacidad: normalización de rutas arbitrarias, ausencia de cuentas/claves/cuerpos en registros, cierres y lentitud contados una vez.
- Chromium: actualización desde 5e314ba, 106 recursos precargados, progreso/Liga/audio conservados, navegación sin red y Mercado a 320/393/768 px. Sin errores de página.

## Qué queda abierto dentro de prioridad alta

Los registros quedan disponibles al desplegar Render y deben observarse en uso real. La política de red de este entorno no permite consultar Render/Supabase de producción. No se ha probado carga contra cuentas reales. PGlite serializa llamadas SQL: no certifica contención de locks con varias conexiones PostgreSQL, ni capacidad de Render gratuito. Antes de ampliar significativamente la audiencia sigue pendiente una prueba de staging equivalente y medición en producción. La estructura JSON global del Mercado permanece; esta corrección limita la presión y mide conflictos, no promete escalabilidad ilimitada.

El caso particular de Gmail sigue fuera de alcance por acuerdo con Dooms. No se incluyen cambios de balance, arte ni retos de aprendizaje en esta revisión.
