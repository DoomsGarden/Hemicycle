# Censo general de políticos españoles

El alcance incluye Gobierno, Congreso, Senado, partidos, instituciones autonómicas, ámbito local/insular/provincial y representantes políticos españoles en instituciones europeas. También comprende a la oposición y a antiguos cargos activos dentro de los últimos 40 años. Se prioriza 2010–2026. El Senado es una parte del trabajo, no la condición para crear un cromo.

Los criterios completos están en [cobertura.json](cobertura.json). La lista consolidada se consulta en [censo.csv](censo.csv) o [censo.json](censo.json). Es un censo de trabajo abierto: no afirma estar completo para todos los ámbitos ni que todas las personas mantengan un cargo actual.

La consolidación reúne los 97 oradores españoles activos, los 20 reservados, el historial XV del Senado ya documentado y la composición del Gobierno consultada en La Moncloa. Cada persona conserva un solo registro y puede reunir distintos cargos y fuentes. Un cargo nuevo no crea un segundo cromo. Se mantienen aparte partido, grupo parlamentario y cargo institucional; no se deduce militancia a partir del ministerio que ocupa.

La primera consolidación contiene **440 personas únicas**: 97 activas, 20 reservadas y 323 pendientes de investigación. La página de La Moncloa consultada aporta 22 registros y permite identificar 16 candidatos adicionales al cruzarlos con lo ya documentado. Es una instantánea de lo que publica esa página, no una reconstrucción de todos los nombramientos o ceses. También se incorporan los cargos ministeriales o de Secretaría de Estado identificados en las cabeceras de las intervenciones ya verificadas, con su fecha histórica. Los ámbitos vacíos de otras fichas significan que esa clasificación todavía no se ha documentado en esta consolidación.

Con la [cuarta tanda de 60](../espana-60-04/README.md), el censo conserva las **440 identidades**, con **97 españolas activas, 200 reservadas y 143 pendientes de preparar**. Los 16 retratos pendientes de la tercera tanda ya se han completado y `reservadosPendientesArte` vale cero. Los 23 oradores internacionales activos quedan fuera de este censo de España. Se distinguen `reserva20`, `reserva60`, `reserva60-03` y `reserva60-04` para seguir la procedencia de cada ficha. Las tandas mantienen el reparto 24 comunes, 18 raros, 12 especiales y 6 legendarios. Los 143 pendientes pertenecen al censo actual, que sigue abierto a las demás instituciones.

Las próximas tandas se elegirán entre todos los ámbitos según relevancia documentada, actividad reciente y calidad de fuentes. La prioridad de Mesa y portavocías usada en el listado del Senado es interna a esa fuente; no desplaza automáticamente a ministros, presidentes, dirigentes de partido ni representantes de otras instituciones. El reparto por rareza seguirá siendo 40/30/20/10, con las estadísticas de los tiers actuales.

Los 20 reservados ya incluyen trayectorias ministeriales, por ejemplo Rubalcaba, Borrell, Robles, Solbes, Salgado y Bolaños, además de presidencias parlamentarias y portavoces. Su arte y las 60 frases se conservan en la [revisión de la primera tanda](../espana-20/revision.html).

Pendiente de ampliar sistemáticamente: resto del Congreso, direcciones de partidos, gobiernos y parlamentos autonómicos, ámbito local/insular/provincial, representantes en Europa y gobiernos históricos dentro del intervalo. Los enlaces de los distintos censos documentan el cargo o la identidad; las frases y el arte requieren su investigación específica antes de completar cada cromo.

Todo este material es de desarrollo, excluido de Pages. Esta ampliación del alcance no activa cromos ni modifica la versión pública.

Para regenerar los archivos a partir de las fuentes documentales guardadas: `node _dev/expansions/espana/build-census.cjs`.
