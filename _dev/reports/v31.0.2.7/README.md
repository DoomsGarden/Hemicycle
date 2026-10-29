# Comprobaciones del ajuste de oradores

Preparación local de v31.0.2.7 sobre el catálogo publicado en `3a00b45`. No se ha comprobado ni modificado el SQL de producción: queda por ejecutar la migración indicada en la [nota de versión](../../releases/v31.0.2.7.md).

| Evidencia | Resultado |
|---|---|
| `NODE_PATH=/workspace/.hemicycle-tools/node_modules node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs` | 633 pruebas, 633 correctas. |
| [balance-comparison.json](balance-comparison.json), `node _dev/balance/compare.cjs` | 3.456 partidas, 1.728 parejas, todas terminadas. Mediana total 8 → 9 rondas; avanzados 7 → 8. |
| [offline-client.json](offline-client.json), `_dev/checks/balance-v3-client.cjs` | IndexedDB real, reanudación, premios antiguos conservados, nuevo motor y aislamiento de cuentas. Transporte de servidor simulado; su verificación real se cubre con las pruebas SQL. |
| [pwa/pwa.json](pwa/pwa.json), `_dev/checks/balance-v3-pwa.cjs` | Actualización de caché desde la versión publicada, 148 recursos, juego offline y guardado conservado; Mercado en tres anchuras. |
| [guides/browser.json](guides/browser.json), `_dev/checks/balance-v3-guides.cjs` | Práctica de 8 pasos, guía de 38 pasos, menús según edad y opciones al 116 % en tres tamaños; progreso conservado. |
| [protected-hashes.json](protected-hashes.json) | Escalafones, reglas locales extraídas, acciones y motores históricos sin modificaciones. |

El catálogo anterior se conserva en [`catalog-before.json`](../../balance/catalog-before.json) y la prueba lo contrasta con Git. No se ha regenerado un motor histórico para hacerlo coincidir con las nuevas estadísticas.

Las simulaciones mantienen la misma política de IA y comparan únicamente la revisión del catálogo. No prueban equilibrio general, duración en minutos ni retención. Las seis propuestas de estados están documentadas y no intervienen en las partidas ni en estas métricas.
