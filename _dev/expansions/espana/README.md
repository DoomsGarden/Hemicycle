# Censo general de políticos españoles

[CSV](censo.csv) · [Datos y fuentes por persona](censo.json) · [Criterios de cobertura](cobertura.json).

Estado de trabajo del 5 de noviembre de 2026: **440 identidades españolas distintas: 97 activas y 343 reservadas**. No quedan personas pendientes de investigación en las listas actualmente cubiertas. **Cuatro reservados siguen pendientes de retrato**, por rechazo del generador, y se cuentan aparte en `reservadosPendientesArte`.

Se han cruzado el catálogo español público, las seis tandas reservadas, las 311 identidades del historial XV del Senado y los 22 registros de la página del Gobierno consultada. El historial incluye altas y bajas; no equivale a 311 escaños simultáneos ni describe una cámara actual. Se conservan las fechas de consulta y la situación de cada fuente, sin convertirlas en afirmaciones de vigencia posterior.

La cobertura general sigue abierta: resto del Congreso, partidos, gobiernos y parlamentos autonómicos, ámbito municipal/provincial/insular, representación europea y gobiernos históricos dentro del intervalo de 40 años. Se prioriza actividad en 2010–2026. La oposición y los antiguos cargos también forman parte del alcance. El Senado es una fuente de identidades, no un requisito de admisión.

Se conserva un cromo por persona, aunque reúna cargos en varias instituciones. Los alias completos se contrastan con las fuentes; compartir apellidos no fusiona identidades. José Fernández Blanco, José Blanco López y José Manuel Baltar Blanco permanecen separados. Partido, grupo parlamentario y cargo no se consideran equivalentes; un ministerio no acredita militancia.

La [última tanda de 83](../espana-83-06/README.md) cierra los pendientes de estas listas. Los 343 reservados se han [revisado conjuntamente](../reserva-espana/revision-global/README.md): 137 comunes, 103 raros, 69 especiales y 34 legendarios. La procedencia por tanda se conserva, pero no determina la rareza. Los 23 internacionales del catálogo público no se incluyen en este censo español.

Todo permanece en `_dev`, excluido de Pages y del catálogo jugable. Para regenerar el censo desde los registros guardados:

```sh
node _dev/expansions/espana/build-census.cjs
```
