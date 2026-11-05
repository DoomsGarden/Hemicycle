> **Revisión vigente — 5-11-2026:** los tiers y el vestuario de todas las tandas se revisaron juntos. Consulta la [revisión global de 343](../reserva-espana/revision-global/README.md), la [galería de esta tanda](revision.html) y la [validación actual](../espana-83-06/README.md). El contenido que sigue y sus QA conservan la instantánea histórica anterior; sus repartos por tanda ya no son los vigentes.

# España · Quinta tanda: 60 cromos reservados

Completada el **05-11-2026** en la reserva de **v31.0.2.13**, con activación deshabilitada. [Galería con arte, efectos y fuentes](revision.html) · [Lista CSV](cromos.csv).

**60 identidades nuevas, 60 retratos, 180 frases documentadas, estadísticas de tier, efectos de básico y pasivas del líder.** La reserva conjunta suma **260 cromos**, sin retratos pendientes. Quedan **83 perfiles por preparar en el censo actual**, que sigue abierto a otras instituciones.

## Identidad y selección

Se cotejaron nombres completos, alias y fichas institucionales con los 120 oradores activos y los 200 ya reservados. Cada persona reutiliza un único ID del censo. El historial XV del Senado aporta la identidad común de esta tanda; las trayectorias documentadas incluyen Congreso, gobiernos autonómicos, partidos, ayuntamientos, diputaciones y cabildos. No se afirma que un cargo histórico siga vigente.

Los seis legendarios son **Gonzalo Robles, Pere Joan Pons, Teresa Mallada, Melania Álvarez, Carmen Pobo y Pilar Zamora**. Las responsabilidades que fundamentan la selección figuran en cada ficha. En Melania Álvarez se priorizan las fechas expresas de sus cargos frente al texto biográfico sin actualizar. Javier Jiménez Santamaría se identifica por la ficha de Soria, sin mezclarlo con homónimos.

Adolfo Lander y Rafael Granados tienen pasos fechados por el Grupo Vasco y el Grupo Socialista en sus fichas. Se conservan el historial y el partido documentados por separado. Las intervenciones seleccionadas se atribuyen según su cabecera y fecha; pertenecer temporalmente al grupo no se interpreta como militancia en el PNV. El arte utiliza arquitectura institucional, sin logos atribuidos por inferencia.

## Estadísticas y mecánicas

| Rareza | Nuevos | Estadísticas base |
|---|---:|---|
| Común | 24 | 1–2 TdP · Z 2 · A 4–5 · 2 escaños |
| Raro | 18 | 2–3 TdP · Z 4 · A 6–7 · 3 escaños |
| Especial | 12 | 3–4 TdP · Z 5–6 · A 8 · 4 escaños |
| Legendario | 6 | 4–5 TdP · Z 7 · A 11–14 · 5 escaños |

Se mantiene el reparto 40/30/20/10 y los valores de `statsFor` del catálogo vigente. La rareza es una decisión editorial relativa dentro de los cupos, no una medida de capacidad personal. La vista conjunta contiene 152 comunes, 114 raros, 76 especiales y 38 legendarios.

Los **14 efectos de básico y las seis doctrinas existentes** conservan sus condiciones, objetivos, duración, presencia del líder y contrarrestos. Hay diez perfiles nuevos por doctrina. Se preservan las 320 definiciones y asignaciones anteriores; los efectos pertenecen al combate ficticio.

## Frases

[frases.json](frases.json) contiene tres fragmentos por persona: Zasca, Zasca fuerte y apoyo compartido por defensa/curación. Los 180 son distintos entre sí y de los 960 anteriores, tienen como máximo 47 caracteres y proceden de intervenciones propias dentro del intervalo prioritario 2010–2026.

Cada fragmento conserva original, contexto, cabecera del hablante, fecha, página física, URL y SHA-256. Las frases de juego no incluyen nombres personales de terceros. Se descartaron citas atribuidas a otros autores, apoyos irónicos y recortes que alteraban el sentido de una negación. El castellano puede corresponder a la traducción parlamentaria recogida en un diario multilingüe. No se atribuye autoría exclusiva de expresiones comunes.

El [cotejo reproducible](qa/source-verification.json) comprueba **180 frases contra 85 PDF oficiales**, con hash, página física y coincidencia literal. La atribución y el contexto se revisaron aparte. Requiere Python estándar y `pdftotext`:

```sh
python _dev/expansions/espana-60-05/verify-sources.py
```

## Arte y miradas

Se aplica la preferencia del usuario: **56 retratos con mirada fuera de cámara y cuatro frontales**, distribuidos entre las distintas rarezas. Se alternan lados, alturas de mirada, gestos y uno o dos micrófonos; 30 retratos llevan micrófono y 30 no. Las fotografías institucionales orientan los rasgos, sin imponer su pose frontal. No se regeneran los 200 retratos anteriores.

Son 15 atlas PNG originales de cuatro cuadrantes 3:4, recibidos y copiados intactos. Los fondos varían entre hemiciclo, biblioteca, tribuna, comisiones, salas institucionales y ambientes de debate, con acentos de los grupos documentados y sin bandera española genérica. Se mantienen el acabado TCG y las referencias de estilo de Trump y del prompt aportado para Cristina Fernández.

[Prompts y referencias](prompts-arte.json) · [Registro de generación](generacion.json) · [Dimensiones y hashes](art/manifest.json) · [Revisión visual](qa/art-review.json). Las fotografías de referencia no se incorporan al repositorio ni al juego. Sus URL y hashes quedan en [propuesta.json](propuesta.json).

## Integración reservada

La [reserva conjunta](../reserva-espana/README.md) permite revisar **380 oradores y 1.140 frases**. El juego público conserva **120 oradores y 360 frases**. Los nuevos IDs, fuentes e imágenes permanecen fuera de sobres, colección, búsquedas, IA, backend y caché pública. Todo reside bajo `_dev`, excluido de Pages; el repositorio conserva la documentación de desarrollo.

```sh
node _dev/expansions/reserva-espana/prepare.cjs --preview /tmp/hemicycle-reserva
node _dev/expansions/reserva-espana/preview-server.cjs
node --test _dev/expansions/reserva-espana/reserve.test.cjs _dev/expansions/espana-20/reserve.test.cjs
```

La vista local escucha en `127.0.0.1:8097`, en otro origen de almacenamiento, sin service worker ni API remota. El materializador solo escribe en `/tmp` o `_dev`, mantiene `enabled:false` y `releaseReady:false` y exige la publicación coordinada y compatibilidad de reglas offline antes de activar.

Se conservan versión pública, changelog, etiqueta v31.0.2.13, términos y hash de aceptación. La revisión documental mantiene el criterio de la [primera tanda](../espana-20/revision-legal.md): las fuentes no equivalen a autorización de imagen o marcas; al activar habrá que publicar las fuentes y créditos del catálogo ampliado.

## Validación

[2.769 pruebas aprobadas](qa/final-tests.log): 2.605 de la reserva conjunta y 164 de la primera tanda. Comprueban las cuatro acciones y las pasivas de los 260 reservados en ambos bandos, preservación de las definiciones anteriores, proporciones, estadísticas, 1.140 frases distintas, hashes del arte, censo e aislamiento público.

La [revisión de Chromium](qa/browser.json) carga los 260 retratos internos desde 65 atlas, sin imágenes pendientes. Comprueba los 60 artículos y 180 frases de esta galería, filtros, búsqueda, ausencia de desbordamiento a 320, 393, 768 y 1200 px, cero service workers y cero errores de página. Se revisaron visualmente los tres paneles del render real: [1](qa/render-1.png), [2](qa/render-2.png), [3](qa/render-3.png).

El [censo general](../espana/README.md) mantiene 440 identidades españolas: **97 activas, 260 reservadas y 83 pendientes**. Este último número corresponde al censo documentado hasta ahora, no al total de todas las personas políticas españolas del periodo de 40 años.
