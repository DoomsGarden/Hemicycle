> **Revisión vigente — 5-11-2026:** los tiers y el vestuario de todas las tandas se revisaron juntos. Consulta la [revisión global de 343](../reserva-espana/revision-global/README.md), la [galería de esta tanda](revision.html) y la [validación actual](../espana-83-06/README.md). El contenido que sigue y sus QA conservan la instantánea histórica anterior; sus repartos por tanda ya no son los vigentes.

# Reserva de España · 20 cromos

Revisión: 4 de noviembre de 2026. **Estado: reservado, desactivado en el juego publicado.**

## Consulta

- [Revisión de retratos, frases, originales y fuentes](revision.html).
- [Segunda tanda de 60 cromos](../espana-60-02/README.md), [tercera tanda de 60 fichas](../espana-60-03/README.md), [cuarta tanda de 60](../espana-60-04/README.md), [quinta tanda de 60](../espana-60-05/README.md) y [reserva conjunta de 260](../reserva-espana/README.md), con todos sus retratos completos.
- [Lista de las 60 frases](lista-frases.md) y [registro documental](frases.json).
- [Censo del Senado en CSV](senado/censo.csv) y [JSON con fuentes y estado temporal](senado/censo.json).
- [Censo general de políticos españoles y alcance de siguientes tandas](../espana/README.md): Gobierno, Congreso, Senado, partidos y otros ámbitos institucionales.
- [Propuesta original de identidad, estadísticas, relevancia y arte](../../proposals/espana-1986-2026/propuesta.json).
- [Comparación del arte y criterios para siguientes tandas](direccion-arte.md).
- [Revisión de metodología y documentación legal](revision-legal.md).

Se conservan las 20 ilustraciones aprobadas: no se han regenerado. Las variantes futuras de pose o micrófonos mantienen el mismo ID de persona. La distribución añade 8 comunes, 6 raros, 4 especiales y 2 legendarios: 40/30/20/10 %, igual que el catálogo activo. Costes, Zasca, Aguante y escaños proceden de los tiers actuales; las habilidades pertenecen a las 14 ya existentes. Rareza y doctrina son decisiones de diseño, no valoraciones sobre las capacidades reales de esas personas.

## Frases

Cada persona tiene tres frases, como el juego actual: Zasca, Zasca fuerte y apoyo compartido por defensa/curación. Las 60 son distintas entre sí y de las 360 activas, tienen como máximo 47 caracteres y proceden de intervenciones identificadas en PDF oficiales del Congreso. Se conservan el original, un contexto breve, el enlace a la intervención, la fecha, la página física del PDF, el hash SHA-256 y el tratamiento editorial. No se han inventado reformulaciones para rellenar acciones. El recorte puede tener un sentido lúdico distinto de la materia del debate; el registro conserva ese contexto.

Dos adaptaciones autorizadas sustituyen nombres de terceros por su cargo: Armengol, «señor Conde» → «señor diputado»; Rosa Díez, «señor Rajoy» → «señor candidato» en la investidura de 2011. Se marcan con † en la revisión. Las demás frases conservan sus palabras con normalización de caja, tildes y puntuación. Las fechas seleccionadas están entre el 04-11-1986 y el 04-11-2026. Para Fraga se usa una intervención del 12-02-1987, evitando la investidura de julio de 1986 que queda fuera del intervalo exacto. Se contrastó el facsímil porque el OCR escribe FRACA.

Se revisaron los límites de intervención: la presidenta Armengol se distingue de las ministras con cargo de vicepresidenta y el discurso de Bono termina antes del del rey. No se atribuyen al orador las interjecciones o citas ajenas presentes en su turno.

## Integración reservada

La herramienta de esta carpeta conserva la vista original de 20. Para revisar los 260 cromos reservados se usa `../reserva-espana/prepare.cjs` y su servidor de vista interna, con 380 oradores en total y todos los retratos completos.

`prepare.cjs` integra los datos en una copia del catálogo, las asignaciones de habilidades, la maestría de los dos nuevos legendarios, el contexto documental y el registro de fuentes. Conserva exactamente las 120 fichas anteriores. La vista interna contiene 140 oradores y 420 frases. `preview-server.cjs` utiliza el render real del juego y los cuadrantes de los cinco atlas originales mediante CSS, sin modificar las ilustraciones.

```sh
node _dev/expansions/espana-20/prepare.cjs --preview /tmp/hemicycle-es20
node _dev/expansions/espana-20/preview-server.cjs
node --test _dev/expansions/espana-20/reserve.test.cjs
```

La vista interna escucha solo en `127.0.0.1:8096`, con almacenamiento de otro origen, sin service worker ni acceso a las API remotas. El juego publicado no importa estas herramientas. Su catálogo, sobres, colección, búsquedas, IA, fuentes y recursos de instalación mantienen los 120 oradores actuales; el backend rechaza los 20 IDs reservados. No existe una opción pública, parámetro de URL ni clave de localStorage para activarlos. `_dev` está excluido de GitHub Pages. **Esto los oculta de la aplicación y de Pages, pero no hace confidencial su presencia en un repositorio Git público.**

La reserva está implementada y probada en el motor local, pero **no se presenta como un lanzamiento de 140 oradores listo para producción**. Su activación requerirá una versión nueva de reglas que preserve las reproducciones offline anteriores y una publicación coordinada de catálogo, backend, arte y fuentes. El materializador solo escribe en `/tmp` o `_dev` y deja `releaseReady:false`; no puede sobrescribir el juego por accidente. Las futuras pruebas de economía y partidas descargadas deben ejecutarse sobre esa versión activada antes de publicarla. Las pruebas actuales verifican que nada de la reserva entra en producción.

## Senado como parte del censo general

El alcance de la ampliación comprende políticos de los distintos partidos e instituciones, incluidos ministros, dirigentes y portavoces en gobierno u oposición, Congreso, Senado, gobiernos y parlamentos autonómicos, ámbito local/insular/provincial y representantes españoles en instituciones europeas. Una persona con varios cargos conserva un solo cromo. La prioridad de Mesa y portavocías que se describe abajo organiza únicamente la fuente del Senado; la selección de próximas tandas se hará entre todos los ámbitos según el [criterio general](../espana/cobertura.json).

El sitio oficial informa de la disolución de las Cámaras el 06-10-2026 y anuncia su constitución el 23-12-2026. Por eso se separan:

- **311 personas** que aparecen en el historial de la XV legislatura, incluidas altas, bajas y sustituciones. No son escaños simultáneos.
- **71 integrantes** de la Diputación Permanente en su listado oficial: 5 de Mesa, 32 titulares y 34 suplentes.
- **4 personas ya catalogadas**: Javier Maroto, Juan Espadas, Susana Díaz y María Jesús Montero. Se reutiliza su ID; no se proponen cromos duplicados. La investigación inicial dejó 307 identidades pendientes. La segunda tanda reservó 44, la tercera, la cuarta y la quinta otras 60 cada una: quedan **83 pendientes de preparar** en esta fuente, sin afirmar que todas sigan siendo senadores actuales. Los 16 retratos pendientes de la tercera tanda ya están completos.

Se consultaron 292 fichas XML y 19 fichas HTML cuando el exportador XML no devolvía datos. Se guardan fuente y hash, sin copiar fechas de nacimiento ni datos familiares. Las fechas de baja vacías del XML no certifican un cargo vigente. La pertenencia actual a la Diputación Permanente procede de la lista específica del órgano.

La cola prioriza su Mesa, portavocías documentadas y miembros de Diputación Permanente, después el resto del historial reciente. Se revisaron alias completos para evitar falsos duplicados: José Manuel Baltar Blanco y José Fernández Blanco no son José Blanco López. Las siguientes tandas deben centrarse en 2010–2026; después se ampliará hasta 1986, siempre cotejando las identidades activas y todas las tandas del registro de reserva. Los cupos de cada nueva tanda deben conservar el reparto de rarezas antes de asignar estadísticas; el censo no inventa frases ni rarezas para personas todavía no investigadas.

## Validación

164 pruebas de reserva: conservación del catálogo previo, proporciones, estadísticas, fuentes, adaptaciones, aislamiento público, censo y las cuatro acciones de cada orador en ambos bandos del motor local. [Vista real de los 20 cromos](qa/render-20.png) y [verificación de navegador](qa/browser.json). La revisión de frases se comprobó a 393 y 768 px y con búsqueda por persona.
