# Recuperación de resultados confirmados — v32.0.0.2

9 de noviembre de 2026. El usuario aporta el rechazo específico de operación
reutilizada con otros datos, con un resultado todavía pendiente. La corrección
anterior conservaba la operación y detenía los reintentos, pero no recuperaba un
recibo de partida ya confirmado cuando la petición difería de la almacenada.
No se conoce qué campo difiere en su dispositivo: no se ha leído su IndexedDB ni
se han obtenido sus registros privados del servidor.

## Corrección

Ante ese rechazo, y solo para una liquidación de partida cuyo identificador de
operación coincide con el de su preparación, el servicio consulta la preparación
vinculada a la cuenta autenticada mediante el RPC de contexto existente. La lectura
no proporciona un identificador de operación, por lo que recupera la preparación y
su resultado persistido sin intentar escribir ni sustituir la petición anterior.
Solo devuelve un recibo de resultado con formato válido perteneciente a esa misma
preparación. No concede otra recompensa ni recalcula el resultado. Las compras y
las demás operaciones mantienen su comprobación estricta de petición e ID.

Si no existe ese recibo confirmado, se distingue `OFFLINE_RECEIPT_CONFLICT`. El
cliente conserva el registro y su preparación completos en los resultados para
revisión, disponibles para exportar, y continúa con los siguientes. Un error de
conexión durante la lectura sigue siendo transitorio: no se retira el pendiente ni
se clasifica como conflicto definitivo.

Las selecciones de gabinete y las jugadas se copian al registrarlas; al finalizar
se usa una instantánea y, si ya existe un pendiente para la misma preparación, se
reutiliza ese registro persistido. El servicio ejecuta las reglas sobre una copia
de la petición para que el cálculo no altere los datos que compara y almacena.
Son medidas preventivas contra referencias mutables; no prueban cuál fue la
diferencia concreta del dispositivo del usuario.

La retirada del pendiente sigue ocurriendo únicamente después de recibir el
resultado y reconciliar la copia canónica. No se borra ningún registro sin
confirmación o conservación para revisión. No se ha accedido al inventario real.

## Verificación

72 pruebas pasan en siete archivos, incluyendo HTTP con SQL real en PGlite y todas
las migraciones actuales: una partida se liquida una vez, los reintentos con reloj
o jugadas distintos devuelven su recibo original, otra cuenta no puede obtenerlo,
un ID que corresponde a otra operación no se acepta y los recursos no cambian.
Se cubren recibos ausentes, malformados y con saldo incorrecto, errores de lectura,
la sincronización automática y las reglas antiguas congeladas.

En Chromium, con IndexedDB real y la configuración extraída de `boot()`, se prueba
que mutar el gabinete o una jugada después de enviarlos no cambia el registro;
que la verificación y el envío automático comparten un recibo; que un registro sin
confirmación se conserva para revisar mientras el siguiente se sincroniza; y que
fallar al reconciliar mantiene el pendiente sin duplicar el abono al reintentar.
Se mantienen las comprobaciones de pantalla, texto ampliado y tres idiomas.

Pasan la comprobación de motores congelados y `git diff --check`. La publicación
mantiene v32.0.0.2 y actualiza el caché a `cloud2`. Usa los RPC ya instalados: no
requiere SQL nuevo ni cambios en el manifest o en el tratamiento de datos descrito
en los textos legales.
