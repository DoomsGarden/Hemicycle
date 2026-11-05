# España · Tercera tanda: 60 fichas reservadas

Preparadas entre el 04 y el 05-11-2026 para **v31.0.2.13**, con activación deshabilitada. [Revisión visual, efectos y fuentes](revision.html) · [Lista CSV](cromos.csv).

Las **60 identidades, estadísticas, básicos, pasivas y 180 frases están preparadas**. Se recibieron **44 retratos nuevos** en 11 atlas; **16 retratos siguen pendientes** tras rechazos/interrupciones del generador de imágenes. La tanda no se presenta como terminada de arte ni lista para publicar. Las fichas pendientes muestran «Arte pendiente» y conservan sus referencias individuales, rasgos y prompts.

## Selección y rareza

Son 60 identidades nuevas respecto de los 120 oradores activos y los 80 ya reservados. Todas se cruzaron con el historial XV del Senado, con trayectorias que incluyen gobiernos autonómicos, parlamentos, direcciones de partidos, ayuntamientos y otras instituciones. La pertenencia al Senado es una fuente de identidad, no un requisito del proyecto. Los cargos históricos no se presentan como vigentes.

| Rareza | Fichas nuevas | Estadísticas base |
|---|---:|---|
| Común | 24 | 1–2 TdP · Z 2 · A 4–5 · 2 escaños |
| Raro | 18 | 2–3 TdP · Z 4 · A 6–7 · 3 escaños |
| Especial | 12 | 3–4 TdP · Z 5–6 · A 8 · 4 escaños |
| Legendario | 6 | 4–5 TdP · Z 7 · A 11–14 · 5 escaños |

Cada valor sigue `statsFor` del catálogo vigente. Se mantiene la proporción 40/30/20/10 %. Los seis legendarios son Uxue Barcos, Ander Gil, Manuel Cruz, Guillermo Fernández Vara, Jesús Aguirre y María Jesús Álvarez; sus responsabilidades históricas fundamentan la selección. En las demás fichas se documentan funciones parlamentarias concretas y el cupo relativo de la tanda. La rareza es una decisión editorial del juego, no una medida de capacidad o valor personal.

Cada ficha utiliza uno de los **14 básicos existentes** y una de las **6 doctrinas de líder**, con diez perfiles nuevos por doctrina. Se mantienen sus requisitos, destinatarios, recargas, duración y contrarrestos. Las cuatro acciones se prueban en ambos bandos y no se añaden mecánicas nuevas.

## Frases y fuentes

[frases.json](frases.json) contiene 180 fragmentos: normal, fuerte y apoyo compartido por defensa y curación. Son distintos entre sí y de los 600 anteriores, de un máximo de 47 caracteres. Se conserva el texto original del diario, contexto breve, cabecera del hablante, fecha, página física del PDF, URL y SHA-256. Los fragmentos de juego no contienen nombres personales de terceros; en esta tanda no se necesitaron sustituciones creativas de nombres.

Se revisaron la atribución y el sentido del recorte, descartando palabras citadas de otra persona, apoyos irónicos y fragmentos que alteraban el sentido de una negación. En intervenciones multilingües, el texto castellano puede corresponder a la traducción recogida por el diario oficial. La coincidencia con el diario no implica autoría exclusiva de una expresión común. Su asociación al combate es ficticia.

La verificación reproducible coteja las **180 frases con 70 PDF oficiales**, incluidos hash, página física y texto literal: [resultado](qa/source-verification.json). Requiere Python estándar y `pdftotext`:

```sh
python _dev/expansions/espana-60-03/verify-sources.py
```

La verificación automática comprueba los bytes y el fragmento; la atribución y el contexto se revisaron aparte. Las fuentes empleadas están dentro del periodo prioritario 2010–2026.

## Arte recibido y pendiente

Los 44 retratos recibidos están en 11 PNG originales de cuatro cuadrantes 3:4, sin edición ni recortes destructivos. Se contrastaron los rasgos con las fotografías de las fichas institucionales del Senado. El arte existente de Trump y el prompt aportado para Cristina Fernández orientan el acabado de ilustración TCG. Se varían cámara, iluminación, pose y presencia de micrófonos; los fondos representan hemiciclo, tribuna, biblioteca, comisiones y salas parlamentarias, con acentos del grupo documentado. No se deduce militancia de un grupo mixto ni se usa una bandera española genérica.

Están pendientes los atlas solicitados `03-04` a `03-07`, correspondientes a:

- María José García-Pelayo, José Manuel Rey Varela, Ana Beltrán y Mar Caballero.
- Javier Remírez, Francisco Bernabé, Luis Uribe-Etxebarria y Dolores Etxano.
- Joan Bagué, Idurre Bideguren, Laura Castel e Igotz López.
- Jordi Gaseni, Teresa Pallarès, Javier Armas y Paloma Martín.

El generador devolvió rechazos `moderation_blocked / public-figure`; una solicitud conjunta se interrumpió sin recibir las otras imágenes. Se registran esos resultados sin eludir el bloqueo ni inventar entregas. [Prompts y referencias](prompts-arte.json), [registro de generación](generacion.json), [dimensiones y hashes](art/manifest.json). Las referencias visuales y sus hashes permanecen en [propuesta.json](propuesta.json); las fotografías originales no se incorporan al juego.

## Reserva, aislamiento y pendientes

La [reserva conjunta](../reserva-espana/README.md) reúne **140 fichas reservadas**, 260 oradores internos y 780 frases: 104 comunes, 78 raros, 52 especiales y 26 legendarios. Hay 124 retratos reservados recibidos y 16 pendientes. Se preservan las definiciones de los 200 oradores de la vista anterior.

```sh
node _dev/expansions/reserva-espana/prepare.cjs --preview /tmp/hemicycle-reserva
node _dev/expansions/reserva-espana/preview-server.cjs
node --test _dev/expansions/reserva-espana/reserve.test.cjs _dev/expansions/espana-20/reserve.test.cjs
```

La vista completa escucha en `127.0.0.1:8097`, con almacenamiento de otro origen, sin service worker ni conexión a API remotas. El materializador solo escribe en `/tmp` o `_dev`. Su manifiesto cuenta los retratos pendientes y exige completarlos antes de activar; mantiene `enabled:false` y `releaseReady:false`, junto con los requisitos de entrega coordinada y compatibilidad offline histórica.

El juego público conserva **120 oradores y 360 frases**. Sobres, colección, IA, búsquedas, backend, fuentes y caché no incorporan los nuevos IDs ni el arte. Todo el trabajo está bajo `_dev`, excluido de Pages. Esa exclusión no hace confidencial un repositorio público. Se conserva el parche v31.0.2.13, sin retocar su etiqueta, versión ni changelog público.

El [censo actual](../espana/README.md) sigue teniendo 440 identidades españolas: **97 activas, 140 reservadas y 203 por preparar**. Los 16 retratos pendientes están contados aparte entre las reservadas. El censo sigue abierto: quedan instituciones por incorporar sistemáticamente, por lo que 203 no es un total exhaustivo de todos los políticos españoles del periodo.

Se mantiene la metodología legal existente de ilustración mediante IA, fragmentos documentados y combate ficticio. No cambian los términos ni su hash de aceptación. Antes de activar deberán completarse el arte, los créditos y las fuentes del nuevo catálogo; las referencias no equivalen a una autorización de imagen o marcas.

## Verificación

[1.569 pruebas aprobadas](qa/final-tests.log): 1.405 de la reserva conjunta y 164 de la primera tanda. Incluyen los cuatro movimientos de los 140 reservados en ambos bandos, básicos, pasivas, conservación de las 200 fichas anteriores, proporciones, 780 frases diferentes, arte recibido, marcadores pendientes y exclusión pública. El censo distingue los 203 perfiles por preparar de los 16 retratos pendientes.

La [revisión en Chromium](qa/browser.json) comprueba 124 retratos internos y 16 marcadores explícitos, los 60 artículos y 180 frases de la galería, filtros y ausencia de desbordamiento en 320, 393, 768 y 1200 px, sin registrar service workers.
