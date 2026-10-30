# v31.0.2.9 — Debug y equilibrio

Preparación de la nueva versión. El código implementa las 46 reasignaciones aprobadas, las dos utilidades revisadas y explicaciones sencillas. Se conservan estadísticas, costes, escaños, doctrinas, fuerte y Elo. [Reparto completo](../../../docs/balance/habilidades-v31.0.2.9.md).

## Evidencia

- **1.127 pruebas correctas, cero fallos/omitidas**, [suite completa](tests.log). Incluye límites compartidos independientes, recuperación individual, candidatos, selección aleatoria, empate por orden del mazo, mano, ausencia de comunes, privacidad, prioridad de estados, economía y premios.
- **477 pruebas focalizadas**, [registro](focused.log), comparan combate local y servidor, conservación de versiones anteriores y replay determinista navegador/servidor. Los motores offline1–6 y fuentes basic3 coinciden byte a byte con lo publicado. offline7 se genera de forma reproducible.
- **5.808 partidas simuladas con el código definitivo**, [datos](simulations.json) y [registro](simulations.log): 2.880 pares recorren los 120 oradores como líder/miembro, tres cruces de doctrina, cero/dos apoyos y ambas iniciativas; otros 24 pares usan gabinetes sin comunes. Se completan todas, respetando mano/TdP/Aguante. Mediana de nueve rondas antes/después; media 8,576/8,577. Llamada registra 59 activaciones en la muestra sin comunes frente a cero antes. Una semilla por escenario e IA fija: exploración, no garantía de equilibrio humano. Se mantienen documentadas las limitaciones de los raros de coste 4 y los casos que requieren seguimiento.
- **Navegador**, [resultados](ui/browser.json): los 120 cromos muestran su asignación y explicación correctas; 14 ejemplos, cuatro tamaños —320/393/768/844— y escalas 100/116 %. Ataques reales activan Llamada/Ventanilla y muestran el límite del turno. La explicación de una partida basic3 conserva la regla anterior. [Ayuda](ui/help-393-116.png), [Llamada aplicada](ui/summon-applied.png), [Ventanilla aplicada](ui/fasttrack-applied.png).
- **IndexedDB real**, [resultados](offline-client.json): reanuda offline6/basic3, conserva y liquida sus dos recibos pendientes con las reglas originales; descarga offline7/basic4 y reanuda la nueva partida. Separación de cuentas conservada.
- **PWA**, [resultados](pwa/pwa.json): actualización desde `2d8319a`, 157 recursos, caché `hemiciclo-v31.0.2.9`, guardado/Liga/aceptación legal conservados, carga sin conexión y Mercado en tres tamaños. Cero errores de página.
- **Regresión del bloqueo de ataques**, [resultados](recovery/after.json): un rechazo libera el combate; permite defensa posterior, dos atacantes contra el mismo rival y cancela un objetivo desaparecido sin convertirlo en hueco ni exigir reiniciar.
- **PostgreSQL aislado**, en la suite: SQL aplicado dos veces, permisos exclusivos de servidor, guardados y tickets anteriores conservados; premios offline6/offline7 liquidados una sola vez. La función antigua sin versión continúa en offline1. Se rechaza offline8.

## Activación pendiente

La migración [20261030_debug_balance_v9.sql](../../online/20261030_debug_balance_v9.sql) solo amplía la admisión de nuevas partidas a offline7. Este entorno no tiene acceso administrativo a Supabase de producción. La rama `codex/debug-equilibrio-v9` queda preparada para revisión; `main`, la rama de Render y la etiqueta nueva se publicarán después de que el responsable confirme la ejecución del SQL. No se comprueba el despliegue de Pages.

## Reproducir

```sh
NODE_PATH=/workspace/.hemicycle-tools/node_modules node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs
node _dev/build-offline.cjs --check
node _dev/balance/debug-balance-v9-sample.cjs
node _dev/balance/debug-balance-v9-report.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/debug-balance-v9-browser.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/debug-balance-v9-client.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/debug-balance-v9-pwa.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/debug-balance-v9-recovery.cjs
```

Los controles de navegador y recuperación usan el servidor local del workspace en el puerto 8055. PWA e IndexedDB levantan su propio servidor temporal. Los registros contienen fixtures de prueba; no se accede a partidas o perfiles de producción.
