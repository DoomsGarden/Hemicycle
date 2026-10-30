# v31.0.2.10 — Claridad y estrategia

Rama de preparación `codex/claridad-v10`. Alcance autorizado por Dooms: las nueve propuestas seleccionadas, corrección de raros a coste máximo 3 y mejoras de rendimiento. Se mantienen 120 oradores, 12 acciones, 14 habilidades, fórmula/ciclo del fuerte, doctrinas, escaños, Elo y escalafones. [Notas](../../releases/v31.0.2.10.md) y [reparto completo](../../../docs/balance/habilidades-v31.0.2.10.md).

## Validación del funcionamiento

- **1.979 pruebas correctas, cero fallos/omitidas**, [suite completa](tests.log). Incluye SQL y liquidación, ataque, datos privados, estado, compatibilidad, UI, economía y progresión.
- **865 pruebas focalizadas**, [registro](focused.log): 840 combinaciones de habilidad / estado rival / defensa / básico-fuerte comparan la previsión pura con el ataque real, sin modificar el estado o consumir azar. Casos adicionales cubren desvío, Aforado gastado, reflexión, estados propios, límites de utilidades, huecos, colección, IA y consultas sin repintado. La proyección solo envía los recuentos del propio jugador.
- Los doce raros de coste 4 pasan a 3; los otros 108 costes y todas las estadísticas, identidades y habilidades se mantienen. Quedan 12 raros de coste 2 y 24 de coste 3.
- La revisión de riesgo autentica la cuenta y consulta su colección canónica sin escribir economía. Valida gabinete y muestra el mismo conjunto de transferencia que la liquidación; incluye protección de últimos cinco únicos, repetidos y acciones.
- [Navegador: funciones nuevas](features/features.json): ocho pares de tamaño/escala —320/393/768/844, 100/116 %—, ataque real que coincide con la previsión, lectura de gabinete, contexto, resultados, riesgo antes de entrar y exportación voluntaria de ficha humana. Los 120 contextos están presentes. [Previsión](features/forecast-393-116.png), [riesgo](features/risk.png).
- [Navegador: habilidades](ui/browser.json): las 120 fichas, 14 ejemplos, ocho layouts, utilidades reales, límites compartidos y explicación de partidas históricas.
- [Recuperación](recovery/after.json): rechazo libera la interacción, apoyo posterior, dos atacantes al mismo rival y objetivo desaparecido sin convertirlo en hueco.
- [IndexedDB](offline-client.json): reanuda offline7 con catálogo balance-v2; conserva y liquida recibos pendientes; descarga y reanuda offline8/balance-v3. Aislamiento de cuentas conservado.
- [PWA](pwa/pwa.json): actualización desde `84fc30b`, 167 recursos, caché `hemiciclo-v31.0.2.10`, progreso/Liga/aceptación legal conservados y funcionamiento offline. Carga diferida de offline7 estando sin conexión: Mónica García conserva coste 4 en la partida antigua y coste 3 en el catálogo nuevo. La ficha de comprensión también abre sin conexión.
- SQL probado dos veces en PostgreSQL aislado: conserva guardados y tickets, solo admite servidor, mantiene función antigua y liquida offline7/offline8 una sola vez. Los siete motores descargados previos permanecen byte a byte idénticos.

## Iniciativa e IA

[4.320 partidas](simulations.json), 2.160 pares de v9/v10, todos los oradores como foco, cruces favorable/desfavorable/espejo, semillas 11/29/71 y ambas iniciativas. Se completan todas y respetan mano, TdP y Aguante. Mediana de nueve rondas en ambas versiones; medias 8,724 / 8,891. Victorias de quien empieza 54,6 % / 55,8 % en esta muestra. Se cambia coste y política a la vez: no se atribuye causalmente la diferencia a uno de ellos ni se infiere un porcentaje de PvP humano.

La IA nueva utiliza defensa y curación cuando permiten sobrevivir y contempla más objetivos; en la muestra se registran 18.467 defensas. No hay bonificaciones ocultas ni cambio de compensación o Elo. El benchmark histórico de doctrinas conserva su política anterior para aislar las fórmulas; la política táctica nueva tiene esta comparación separada. La prueba humana aún es necesaria para valorar comprensión y comportamiento real.

## Rendimiento

- [Carga inicial](performance.json): siete scripts de motores pasan a uno. Se aplaza la ejecución de 821.796 bytes históricos; el nuevo motor ocupa alrededor de 310 KiB. Los recursos anteriores siguen en la caché para reanudar offline. No se promete una reducción equivalente del total descargado. Las peticiones simultáneas del mismo motor comparten carga y se rechazan versiones desconocidas.
- Tres pares de ejecuciones locales en Chromium observaron una mediana de tiempo de scripts de 240,157 ms frente a 145,030 ms. Son observaciones de este entorno, no una promesa de latencia de producción o de rendimiento en todos los teléfonos.
- [Decisión táctica](ai-performance.json): 2.161 estados de 24 partidas conservan exactamente la misma elección tras retirar validaciones clonadas redundantes de ataques. Las simulaciones clonadas internas pasan de 11.460 a 4.998; tiempos locales acumulados de 1.567 a 745 ms. La validación final real de la jugada se mantiene.
- Cincuenta consultas de una misma revisión no reconstruyen la mesa; una revisión nueva sí la actualiza. Se mantienen identidad, selección, reloj y estado ocupado/reintento. No se reducen consultas a costa de perder jugadas ni se toca la música o la animación del Senado.

## Documentación y prueba humana

Los 120 contextos tienen fuente y atribución. Se incluyen 118 extractos CC BY-SA 4.0 de Wikipedia, una síntesis factual de una noticia reconsultada y una contextualización del registro previo con limitación visible. La referencia de Pablo Montesinos no ha podido reconsultarse; no se presenta como biografía verificada. [Registro](context-sources.json) y [criterio editorial](../../../docs/contexto-oradores.md).

Dooms organizará 5–8 jugadores nuevos. El [protocolo](../../../docs/pruebas/comprension-v31.0.2.10.md), la [ficha](../../../pruebas/index.html) y su exportación están preparados. **La sesión humana no se ha realizado**; no se sustituye por bots ni se suma al total de pruebas. Sin nombres, correos, cuentas, fechas de nacimiento o envíos automáticos. No se añade analítica externa. La ampliación de colección queda para después del cierre de interfaces y funcionamiento.

## Activación pendiente

Ejecutar [`20261030_clarity_balance_v10.sql`](../../online/20261030_clarity_balance_v10.sql) en Supabase → SQL Editor. Este entorno no dispone de acceso administrativo de producción. La migración solo amplía las versiones admitidas a offline8; no reescribe datos ni premios. Después de la confirmación se publicarán `main`, `codex/online-actions-foundation` y la etiqueta v31.0.2.10, conservando `codex/claridad-v10` para revisión. No se comprueba el despliegue de Pages.

## Reproducir

```sh
NODE_PATH=/workspace/.hemicycle-tools/node_modules node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs
node _dev/build-offline.cjs --check
node _dev/balance/clarity-v10-sample.cjs
node _dev/balance/clarity-v10-report.cjs
node _dev/checks/clarity-v10-ai-performance.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/clarity-v10-performance.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/clarity-v10-features.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/clarity-v10-browser.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/clarity-v10-client.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/clarity-v10-pwa.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/clarity-v10-recovery.cjs
```

Los controles de UI usan el servidor estático del workspace en el puerto 8055. Los de PWA, carga y cliente levantan su servidor temporal. Los datos de pruebas son fixtures, sin acceso a perfiles o partidas de producción.
