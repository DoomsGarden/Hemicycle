> **Ampliación v32.0.0:** estos cromos se incorporan al catálogo público. La documentación y verificaciones de reserva que siguen describen la fase anterior. La integración conserva su base de 120 en `../activation-v32/baseline`; no se debe volver a anexar una reserva ya activada.

# Reserva conjunta de España

Revisión vigente: 5 de noviembre de 2026. Hay **339 cromos reservados, todos con retrato completo**; los cuatro perfiles que carecían de arte fueron omitidos por decisión del creador. La vista interna reúne 459 oradores y 1.377 frases. El catálogo publicado conserva 120 oradores y 360 frases.

La [última tanda de 83](../espana-83-06/README.md) completa las identidades pendientes en las listas del Gobierno y del historial XV del Senado ya censadas. No completa todos los políticos españoles de los últimos 40 años: el [censo general](../espana/README.md) sigue abierto a otras instituciones y etapas.

Los tiers de las seis tandas se revisaron juntos. Tras omitir cuatro perfiles se conservan **135 comunes, 102 raros, 69 especiales y 33 legendarios**. No hay cupo de legendarios por tanda. La [revisión global](revision-global/README.md) documenta los cambios, el criterio institucional y las 97 variantes de vestuario. La [galería conjunta](revision-global/revision.html) muestra los 339 y las galerías de cada tanda reflejan sus estadísticas actuales.

`batches.cjs` registra todas las tandas. La factoría `create-reserve.cjs` prepara copias privadas de los módulos; no sobrescribe cliente, economía, backend, fuentes ni motores offline públicos. `preview-server.cjs` sirve el render real en un origen local separado, sin service worker. El material `_dev` está excluido de Pages.

La activación sigue deshabilitada. Los cuatro omitidos se conservan en un archivo de trazabilidad fuera del catálogo de prueba y del plan de trabajo. No queda arte pendiente en la reserva; una futura activación exige revisar la versión coordinada de reglas, fuentes, arte, progresión y economía. No existe activación por URL ni localStorage.

Validación vigente: [3.559 pruebas](../espana-83-06/qa/final-tests.log), [navegador](../espana-83-06/qa/browser.json) y [237 frases verificadas](../espana-83-06/qa/source-verification.json). Los informes de QA de las tandas anteriores describen sus instantáneas históricas, anteriores a la revisión global.

```sh
node --test _dev/expansions/reserva-espana/reserve.test.cjs _dev/expansions/espana-20/reserve.test.cjs
node _dev/expansions/reserva-espana/build-review.cjs
node _dev/expansions/espana/build-census.cjs
node _dev/expansions/reserva-espana/preview-server.cjs
```
