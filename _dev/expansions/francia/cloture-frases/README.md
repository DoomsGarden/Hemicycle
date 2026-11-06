# Francia · cierre editorial de frases

Estado del **06-11-2026**: **1137 frases revisadas para 379 de los 440 nuevos oradores**. Quedan **61 perfiles y 183 frases por cerrar**. La primera tanda tiene 100 de 100 perfiles revisados; los adicionales, 279 de 340. Francia sigue en preparación y la reserva permanece desactivada, con cero cromos integrados en el juego.

[Galería de los 440 perfiles](revision.html) · [CSV](frases.csv) · [Registro revisado](frases-validees.json) · [Estado](estado.json) · [Comprobación de fuentes](qa/verification.json) · [Estado de accesos](qa/source-access.json).

## Selección y atribución

Cada perfil revisado tiene un zasca normal, uno fuerte y un texto compartido por defensa y curación. Cada texto guarda el fragmento francés continuo, su traducción editorial española, acción, autor, fuente consultada, hash y localizador. Los nombres de terceros quedan fuera de los fragmentos elegidos. Las traducciones tienen un máximo de 47 caracteres y se comparan con las frases francesas revisadas, el catálogo activo y la reserva española.

La elección de acción es una función ficticia del juego: una réplica o afirmación de posición puede ser un zasca, una contrarréplica o declaración firme uno fuerte, y el compromiso, la cooperación, la protección o la confianza un apoyo. La intensidad de la animación no describe una conducta real del orador.

Los 340 adicionales acreditan actividad política entre 2010 y 2026. Sus frases pueden proceder también de su trayectoria anterior dentro de la ventana de 40 años acordada, con la fecha histórica conservada. Cuando la prensa no confirma el día de la declaración se registra la publicación y `spokenOn: null`; tampoco se asigna la fecha de publicación a una declaración antigua citada retrospectivamente. Los casos de Roussel y Briois explican ese contexto expresamente.

La comprobación del hablante contempla turnos con guion, etiquetas sin guion de la Asamblea, nombres seguidos de salto de línea en ruedas de prensa y respuestas explícitas de entrevistas. Una mención a un diputado dentro de una respuesta no cambia al hablante. Se distinguen homónimos por identidad completa y se excluyen pies de página, resultados de votación editoriales y títulos de informes citados. Las cursivas de préstamos como *lobbying* u *open bar* se mantienen dentro de una intervención propia.

La auditoría reforzada corrigió diez atribuciones de intervenciones ajenas y descartó cuatro anotaciones editoriales o títulos que se habían tomado como palabras personales. El [historial de correcciones](decisions-attribution-corrections.json) identifica explícitamente las entradas anteriores como inválidas. El registro `frases-validees.json` contiene sus reemplazos comprobados. Además se corrigieron tres citas de homónimos y se fijaron pruebas explícitas de cargo para François Bonneau, Philippe Martin, Bruno Bernard y Maurice Leroy. Los archivos de decisiones conservan el historial de trabajo; el registro actual y las correcciones deben consultarse conjuntamente.

Se corrigieron también [20 fechas de intervenciones](decisions-session-date-corrections.json): una fecha de ley o referencia histórica en el título temático no es la fecha de la audiencia. El verificador utiliza el encabezado explícito del día de sesión y comprueba cada pasaje.

## Fuentes y accesos

Se cotejaron 624 fuentes distintas para las 1137 frases actuales. Las capturas completas y los documentos de investigación se conservan fuera de Git:

- Investigación inicial: `/workspace/.hemicycle-tools/state/france-research`.
- Cierre actual: `/workspace/.hemicycle-tools/state/france-quote-closure`.

La investigación descargada o una coincidencia de palabras no valida automáticamente una cita. Las candidatas extraídas conservan su estado sin revisar hasta comprobar autor, contexto, sentido y traducción. Los artículos completos y las fotografías de referencia no se redistribuyen en el repositorio.

El usuario publicó el entorno y se comprobó la política de acceso aplicada, revisión 20. La entrevista de RTES y fuentes alternativas de Le Figaro permiten cerrar a Jeanne Barseghian, Pierre Hurmic y François Asselineau; los 100 perfiles iniciales tienen sus tres frases. Algunas URL antiguas de otras fuentes devuelven 404 o un error de acceso y requieren referencias alternativas. Solo parte de los 96 perfiles restantes depende de esos accesos; los demás necesitan continuar su cierre editorial.

## Comprobaciones y continuación

```sh
PYTHONDONTWRITEBYTECODE=1 python _dev/expansions/francia/cloture-frases/test_attribution.py
PYTHONDONTWRITEBYTECODE=1 python _dev/expansions/francia/cloture-frases/verify-closure.py --cache /workspace/.hemicycle-tools/state/france-quote-closure --initial-cache /workspace/.hemicycle-tools/state/france-research
node _dev/expansions/francia/cloture-frases/build-review.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/expansions/francia/cloture-frases/browser-review.cjs
```

El generador de la galería exige un informe de verificación vigente que coincida con los hashes del registro, del verificador y del detector de hablantes. La opción `--require-complete` del verificador rechaza el cierre del país mientras falte algún perfil. Las comprobaciones del navegador revisan las 440 imágenes, la asociación de cada texto con su autor y fuente, los filtros, el apoyo compartido y pantallas de 320, 393, 768 y 1200 píxeles.

Para continuar, se reconstruye la investigación con el detector actualizado, se revisan los originales y se congela una selección explícita antes de traducirla. `apply-parliament-decisions.py` exige `--reviewed-fragments` con estado `originals_manually_reviewed_and_frozen`; una lista automática de candidatas no puede importarse directamente. Después se coteja todo el registro y se regenera la galería. Los lotes descartados de la carpeta de investigación no se reutilizan sin volver a comprobar la pareja original-traducción.

Los retratos, tiers, estadísticas, pasivas y efectos permanecen como en la revisión conjunta anterior. El trabajo se limita a Francia; los logros, sobres y cromos de acción quedan para después, tal como ha indicado el usuario.
