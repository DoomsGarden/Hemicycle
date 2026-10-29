# Prioridad de estados — corrección de v31.0.2.8

La habilidad que beneficia al atacante solo modifica al atacante. El estado del rival se conserva cuando no ha consumido su efecto ni ha caducado. Al aplicar un negativo al rival, ese negativo puede sustituir su beneficio activo. Sigue existiendo una sola plaza por orador.

## Diagnóstico y regla final

La versión publicada bloqueaba cualquier aplicación sobre una plaza ocupada; un negativo no podía sustituir un beneficio como Café parlamentario. La prueba directa de beneficio propio ya conservaba los estados rivales: no se ha reproducido un borrado indiscriminado. Argumentario plastificado consume su absorción al recibir el básico y Micrófono indiscreto consume su vulnerabilidad al amplificarlo; ese consumo forma parte del golpe y se mantiene. Los pulsos, caducidades y expulsiones también conservan sus reglas.

| Estado que llega | Estado existente al resolver la aplicación | Resultado |
|---|---|---|
| Beneficio propio | Cualquier estado propio activo | Lo conserva; no limpia ni renueva. Puede activarse si el estado previo se consumió durante el ataque. |
| Beneficio propio | Estado del rival | No lo modifica. El rival puede haber consumido su absorción o vulnerabilidad durante el golpe. |
| Negativo al rival | Beneficio rival | Lo sustituye, con la duración y el origen del nuevo negativo; gasta la recuperación normal de la habilidad atacante. |
| Negativo al rival | Negativo rival que siga activo | Lo conserva sin renovar duración ni gastar recuperación de la habilidad bloqueada. |
| Cualquier habilidad | Sin estado | Aplica las condiciones habituales de daño, supervivencia, recuperación y candidato válido. |

Quitar Dietas guardadas elimina su reserva pendiente, sin devolver ni crear TdP. Quitar una marca de Llamada al suplente o Ventanilla rápida no revierte el robo o la recuperación ya realizados, y no restaura la activación por partida. No se modifica la recuperación del orador objetivo al sustituir su estado.

La selección de frases distingue beneficios reemplazables y negativos bloqueados según las reglas de esa partida. La ayuda recoge la prioridad una sola vez; no se añaden párrafos repetidos en cada cromo.

## Comprobaciones

- **1.111 pruebas correctas** en la [suite completa](tests.log). Los 14×14 casos de plaza única comprueban la prioridad. Incluyen 112 combinaciones de beneficio propio/estado rival, 48 de negativo/beneficio y 30 de conservación de negativos que no se consumen al recibir el golpe.
- [207 pruebas focalizadas finales](focused.log): conservación, sustitución, duración, origen, recuperación, reserva, utilidades inmediatas, daño cero, fuerte, supervivencia, información previa y motores históricos. Se comprueba también la descripción de bloqueo de partidas anteriores.
- [Navegador](ui/after.json): 120 cromos y sus frases, 14 iconos, 320/393/768/844 px a 100/116 %. Cuatro ataques reales desde los botones verifican estados y recuperación, además del coste de apoyo, huecos y presentación de reglas antiguas. Ejemplos: [beneficio propio frente a Café](ui/toni-canto-vs-coffee.png), [beneficio frente a Hemeroteca](ui/toni-canto-vs-archive.png), [negativo sobre Café](ui/nacho-alvarez-vs-coffee.png), [negativo ya activo](ui/nacho-alvarez-vs-archive.png).
- [IndexedDB](offline-client.json): reanuda offline5/basic2, conserva y liquida sus premios pendientes, descarga offline6/basic3, reanuda el nuevo y mantiene la separación de cuentas.
- [PWA](pwa/pwa.json): actualización desde `7365f5e`, 155 recursos, caché `hemiciclo-v31.0.2.8-states1`, progreso conservado y uso sin conexión.
- [Regresión de ataques](recovery/after.json): un rechazo no deja el combate ocupado; permite apoyo posterior, varios atacantes contra el mismo rival y cancela objetivos desaparecidos.
- PostgreSQL aislado: la migración se aplica dos veces, mantiene guardados y tickets previos, admite offline6 solo al servidor y liquida resultados offline5/offline6 una sola vez.
- Generación reproducible de offline6 y cinco motores anteriores byte a byte intactos. Las salas basic1/basic2 conservan aplicación, preparación y proyección con sus versiones originales. El hash legal no cambia.

No se cambian asignaciones, costes, estadísticas, escaños, fórmula/ciclo del fuerte ni Elo. Esta es una corrección de interacción entre estados, no una nueva calibración de estadísticas. Las simulaciones de la segunda tanda documentan el reparto anterior; no se presentan como mediciones de esta nueva prioridad.

## Activación

**Activación confirmada por el responsable:** Dooms comunicó `Success` tras ejecutar [`20261029_basic_state_priority.sql`](../../online/20261029_basic_state_priority.sql). Este entorno no ha inspeccionado su editor de producción. La nueva prioridad conserva offline5 y añade offline6; la migración solo amplía las versiones admitidas, sin reescribir partidas, inventarios, guardados ni premios. La corrección se publica en `main` y `codex/online-actions-foundation`, conservando `codex/basic-state-priority`, dentro de v31.0.2.8 y sin mover su etiqueta original. No se comprueba el despliegue de Pages.
