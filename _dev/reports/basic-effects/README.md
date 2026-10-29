# Prueba de habilidades de ataques básicos

Preparación sobre `19abdb4` (v31.0.2.7). No se ha modificado ni inspeccionado la base de datos de producción. La activación queda pendiente del SQL indicado en la [nota de versión](../../releases/v31.0.2.8.md).

| Comprobación | Evidencia y alcance |
|---|---|
| Suite completa | 701 pruebas, 701 correctas: `NODE_PATH=/workspace/.hemicycle-tools/node_modules node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs`. |
| [simulations.json](simulations.json) | 5.760 parejas, 11.520 partidas; todos los oradores, líderes/miembros, cruces de doctrina favorables/desfavorables/espejo, 0/2 acciones y ambas iniciativas. Reproducir con `node _dev/balance/basic-effects-sample.cjs`. |
| [ui/browser.json](ui/browser.json) | 120 fichas, seis estados en cada tamaño y escala 100/116 %, posiciones dentro del cromo sin tapar nombres, teclado y movimiento reducido. `_dev/checks/basic-effects-browser.cjs`. |
| [ui/states-393-116.png](ui/states-393-116.png) | Ejemplo de los seis iconos en combate, con texto ampliado. Escena local aislada, sin cuenta real. |
| [offline-client.json](offline-client.json) | IndexedDB real: reanudación de offline3, premios anteriores conservados, nueva partida offline4, reanudación y aislamiento por cuenta. `_dev/checks/basic-effects-client.cjs`. Transporte simulado; la liquidación se prueba también con PostgreSQL real aislado. |
| [pwa/pwa.json](pwa/pwa.json) | Actualización de caché desde v31.0.2.7, 150 recursos y progreso conservado. `_dev/checks/basic-effects-pwa.cjs`. |
| [guides/browser.json](guides/browser.json) | Práctica breve y guía completa, invitados y adultos, opciones al 116 % en tres tamaños y progreso conservado. `_dev/checks/basic-effects-guides.cjs`. |

Las reglas se prueban en los dos motores, incluidos daño periódico sin reflexión ni uso de defensa, crédito de expulsión con el origen ya fuera de mesa, límite de Aguante, consumo y caducidad, Aforado, estados con acciones y daños fuertes, y recuperación de habilidad. Las pruebas del SQL ejecutan la migración dos veces, comprueban permisos y liquidan versiones anteriores/nuevas de forma idempotente.

En la simulación solo cambia la activación global del conjunto de efectos; estadísticas, gabinetes, semillas y política de IA coinciden. La mediana permanece en 9 rondas y la media pasa de 8,494 a 8,535. Los datos por carta reflejan también a los compañeros y al rival: no aíslan una habilidad individual. No se infiere equilibrio humano ni retención a partir de estas muestras.

Los motores offline1/2/3 no se regeneran. Una prueba compara offline3 con su versión publicada en `19abdb4`; las comprobaciones históricas anteriores protegen offline1/2 y la progresión clasificatoria. No se modifican documentos legales ni el consentimiento guardado.
