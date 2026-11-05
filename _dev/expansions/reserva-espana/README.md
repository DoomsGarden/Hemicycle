# Reserva conjunta de España

Revisión vigente: 5 de noviembre de 2026. Hay **343 cromos reservados**, 339 con retrato y **cuatro pendientes por rechazo del generador**. La vista interna reúne 463 oradores y 1.389 frases. El catálogo publicado conserva 120 oradores y 360 frases.

La [última tanda de 83](../espana-83-06/README.md) completa las identidades pendientes en las listas del Gobierno y del historial XV del Senado ya censadas. No completa todos los políticos españoles de los últimos 40 años: el [censo general](../espana/README.md) sigue abierto a otras instituciones y etapas.

Los tiers de las seis tandas se han revisado juntos: **137 comunes, 103 raros, 69 especiales y 34 legendarios**. No hay cupo de legendarios por tanda. La [revisión global](revision-global/README.md) documenta los cambios, el criterio institucional y las 97 variantes de vestuario. La [galería conjunta](revision-global/revision.html) muestra los 343 y las galerías de cada tanda reflejan sus estadísticas actuales.

`batches.cjs` registra todas las tandas. La factoría `create-reserve.cjs` prepara copias privadas de los módulos; no sobrescribe cliente, economía, backend, fuentes ni motores offline públicos. `preview-server.cjs` sirve el render real en un origen local separado, sin service worker. El material `_dev` está excluido de Pages.

La activación sigue deshabilitada. Los cuatro retratos pendientes tienen marcador propio y no reutilizan el de otra persona. El manifiesto exige completarlos y revisar la versión coordinada de reglas, fuentes, arte, progresión y economía antes de una futura activación. No existe activación por URL ni localStorage.

Validación vigente: [3.599 pruebas](../espana-83-06/qa/final-tests.log), [navegador](../espana-83-06/qa/browser.json) y [249 frases verificadas](../espana-83-06/qa/source-verification.json). Los informes de QA de las tandas anteriores describen sus instantáneas históricas, anteriores a la revisión global.

```sh
node --test _dev/expansions/reserva-espana/reserve.test.cjs _dev/expansions/espana-20/reserve.test.cjs
node _dev/expansions/reserva-espana/build-review.cjs
node _dev/expansions/espana/build-census.cjs
node _dev/expansions/reserva-espana/preview-server.cjs
```
