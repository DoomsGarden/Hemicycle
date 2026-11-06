# Francia · cierre editorial de frases

Estado del **06-11-2026**: **1320 frases revisadas para 440 de los 440 nuevos oradores**. **No quedan perfiles ni frases pendientes**. La primera tanda tiene 100 de 100 perfiles revisados; los adicionales, 340 de 340. El cierre editorial está completo y la reserva de prueba permanece desactivada, con cero cromos nuevos integrados en el catálogo público.

[Galería de los 440 perfiles](revision.html) · [CSV](frases.csv) · [Registro revisado](frases-validees.json) · [Estado](estado.json) · [Comprobación de fuentes](qa/verification.json) · [Estado de accesos](qa/source-access.json) · [Sin perfiles pendientes](pendientes-fuentes.json).

## Selección y atribución

Cada perfil revisado tiene un zasca normal, uno fuerte y un texto compartido por defensa y curación. Cada texto guarda el fragmento francés continuo, su traducción editorial española, acción, autor, fuente consultada, hash y localizador. Los nombres de terceros quedan fuera de los fragmentos elegidos. Las traducciones tienen un máximo de 47 caracteres y se comparan con las frases francesas revisadas, el catálogo activo y la reserva española.

La elección de acción es una función ficticia del juego: una réplica o afirmación de posición puede ser un zasca, una contrarréplica o declaración firme uno fuerte, y el compromiso, la cooperación, la protección o la confianza un apoyo. La intensidad de la animación no describe una conducta real del orador.

Los 340 adicionales acreditan actividad política entre 2010 y 2026. Sus frases pueden proceder también de su trayectoria anterior dentro de la ventana de 40 años acordada, con la fecha histórica conservada. Cuando la prensa no confirma el día de la declaración se registra la publicación y `spokenOn: null`; tampoco se asigna la fecha de publicación a una declaración antigua citada retrospectivamente. Los casos de Roussel y Briois explican ese contexto expresamente.

La comprobación del hablante contempla turnos con guion, etiquetas sin guion de la Asamblea, nombres seguidos de salto de línea en ruedas de prensa y respuestas explícitas de entrevistas. Una mención a un diputado dentro de una respuesta no cambia al hablante. Se distinguen homónimos por identidad completa y se excluyen pies de página, resultados de votación editoriales y títulos de informes citados. Las cursivas de préstamos como *lobbying* u *open bar* se mantienen dentro de una intervención propia.

La auditoría reforzada corrigió diez atribuciones de intervenciones ajenas y descartó cuatro anotaciones editoriales o títulos que se habían tomado como palabras personales. El [historial de correcciones](decisions-attribution-corrections.json) identifica explícitamente las entradas anteriores como inválidas. El registro `frases-validees.json` contiene sus reemplazos comprobados. Además se corrigieron tres citas de homónimos y se fijaron pruebas explícitas de cargo para François Bonneau, Philippe Martin, Bruno Bernard, Maurice Leroy y Jean-Christophe Lagarde. Se reemplazaron también tres fragmentos procedentes de resúmenes indirectos con nombres en negrita. Los archivos de decisiones conservan el historial de trabajo; el registro actual y las correcciones deben consultarse conjuntamente.

Se corrigieron también [20 fechas de intervenciones](decisions-session-date-corrections.json): una fecha de ley o referencia histórica en el título temático no es la fecha de la audiencia. El verificador utiliza el encabezado explícito del día de sesión y comprueba cada pasaje.

La última selección se conserva en [decisiones de prensa](decisions-press-07.json) y [decisiones de documentos oficiales](decisions-documents-01.json). Los discursos en PDF de Harold Martin y Philippe Germain se comprueban contra los bytes originales, la página exacta, el encabezado de autor y fecha y el enlace desde el portal oficial. Las actas antiguas de la Asamblea conservan su codificación declarada; una interrupción cambia al hablante. En las intervenciones presididas por Tony Dreyfus se comprueba además el encabezado de presidencia, sin atribuirle los discursos a los que concede la palabra. En la entrevista de Paul Quilès se diferencian las respuestas que llevan su nombre de las preguntas y del entrevistador que también figura en los metadatos.

Las fechas de publicación se leen de metadatos explícitos del editor, del artículo estructurado o de la fecha visible. En el antiguo portal de Nueva Caledonia se conserva la fecha original `dc:date`: el metadato social de 2016 puede corresponder a la migración del sitio. Cuando la noticia confirma el día de la intervención, se guarda también el pasaje que lo acredita. Nunca se infiere una fecha a partir de la dirección de la página.

## Fuentes y accesos

Se cotejaron 707 direcciones de fuentes para las 1320 frases actuales. Las capturas completas y los documentos de investigación se conservan fuera de Git:

- Investigación inicial: `/workspace/.hemicycle-tools/state/france-research`.
- Cierre actual: `/workspace/.hemicycle-tools/state/france-quote-closure`.

La investigación descargada o una coincidencia de palabras no valida automáticamente una cita. Las candidatas extraídas conservan su estado sin revisar hasta comprobar autor, contexto, sentido y traducción. Los artículos completos y las fotografías de referencia no se redistribuyen en el repositorio.

El usuario publicó el entorno y se comprobó la política de acceso aplicada, revisión 24. RTES y fuentes alternativas de Le Figaro permitieron cerrar los 100 perfiles iniciales. Quedan 0 perfiles y 0 frases por cerrar. El [estado de pendientes](pendientes-fuentes.json) confirma el cierre de los 440 perfiles. Macaire se cerró con tres publicaciones firmadas en su blog y una identificación independiente de su cargo y del enlace al blog. La reserva está preparada para pruebas internas y permanece desactivada.

## Comprobaciones y continuación

```sh
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s _dev/expansions/francia/cloture-frases -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python _dev/expansions/francia/cloture-frases/verify-closure.py --cache /workspace/.hemicycle-tools/state/france-quote-closure --initial-cache /workspace/.hemicycle-tools/state/france-research
node _dev/expansions/francia/cloture-frases/build-review.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/expansions/francia/cloture-frases/browser-review.cjs
```

El generador de la galería exige un informe de verificación vigente que coincida con los hashes del registro, del verificador, de los detectores de hablantes y del lector de fechas. Las 29 pruebas de regresión cubren también cambios de presidencia, interrupciones y fechas originales frente a migraciones o barras laterales. La opción `--require-complete` del verificador rechaza el cierre del país mientras falte algún perfil. Las comprobaciones del navegador revisan las 440 imágenes, la asociación de cada texto con su autor y fuente, los filtros, el apoyo compartido y pantallas de 320, 393, 768 y 1200 píxeles.

Para continuar, se reconstruye la investigación con el detector actualizado, se revisan los originales y se congela una selección explícita antes de traducirla. `apply-parliament-decisions.py` exige `--reviewed-fragments` con estado `originals_manually_reviewed_and_frozen`; una lista automática de candidatas no puede importarse directamente. Después se coteja todo el registro y se regenera la galería. Los lotes descartados de la carpeta de investigación no se reutilizan sin volver a comprobar la pareja original-traducción.

Los retratos, tiers, estadísticas, pasivas y efectos permanecen como en la revisión conjunta anterior. El trabajo se limita a Francia; los logros, sobres y cromos de acción quedan para después, tal como ha indicado el usuario.

## Reserva interna completa

Los [tres textos escritos de Macaire](decisions-documents-02.json) completan las 1.320 frases. Su fecha es la publicación del artículo firmado, no una supuesta intervención oral. Se cotejan el identificador exacto de cada entrada, su autor, el cuerpo sin comentarios y una referencia independiente que vincula su cargo con el blog. Las citas de su trayectoria anterior conservan su fecha; la actividad política entre 2010 y 2026 se acredita por separado.

[prepare.cjs](../prepare.cjs) combina los 440 retratos, las mecánicas revisadas y este registro en una reserva interna de 560 cromos, incluidos los 120 activos. Las propuestas originales conservan separados sus huecos de frases como historial: el preparador utiliza exclusivamente el registro revisado y exige hashes de verificación vigentes. No modifica el cliente, el servidor, el catálogo, las fuentes ni los archivos de instalación publicados. La reserva continúa desactivada; no se añade al inventario, sobres, tienda o IA públicos.

```sh
node --test _dev/expansions/francia/reserve.test.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/expansions/francia/browser-reserve.cjs
node _dev/expansions/francia/prepare.cjs --preview /tmp/hemicycle-reserva-francia
node _dev/expansions/francia/preview-server.cjs
```

La vista de prueba escucha únicamente en localhost. El informe [reserve-gameplay.json](qa/reserve-gameplay.json) registra las 3.520 acciones comprobadas y los 880 casos de presencia y contrarresto del líder. La activación pública y sus tareas de publicación quedan separadas de este cierre.
