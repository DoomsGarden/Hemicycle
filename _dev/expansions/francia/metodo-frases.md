# Frases de Francia · original, traducción y adaptación

Cada cromo tendrá tres frases, igual que los actuales: ataque normal, ataque fuerte y una frase compartida por defensa y curación. El texto jugable estará en español; el original francés se conservará sin alteraciones en el registro de fuentes. No se atribuirán al político citas ajenas que esté leyendo o mencionando.

## Registro obligatorio por frase

- Texto original francés, autor, fecha de intervención y contexto suficiente para comprobar el sentido.
- URL realmente consultada, editor, fecha de comprobación, hash y página física o localizador cuando exista.
- Traducción española fiel, identificada como traducción editorial. No convertir una negación, hipótesis o cita de un tercero en una afirmación propia.
- Texto final de juego, con máximo de 47 caracteres y comprobación de legibilidad dentro del recorrido de la animación.
- Tratamiento: `traduccion` si solo se traduce; `traduccion_y_adaptacion` si también se recorta o sustituye una mención.
- Lista de sustituciones, con el nombre francés original, expresión española elegida y justificación. El cargo debe corresponder a la fecha de la intervención y tener fuente; si no puede acreditarse, usar una expresión neutra que no atribuya un cargo inexistente.

## Menciones de terceros

Se prioriza sustituir nombres personales por el cargo que ostentaban entonces. Si el puesto no está claro, se usa un término neutro adecuado al contexto, como «su interlocutor» o «la oposición», siempre que el sentido de la intervención lo permita. No se sustituye automáticamente a cualquier persona por «el presidente» o «el ministro». Se registra el cambio y se distingue el texto adaptado de una cita literal.

Cuando una traducción fiel no cabe en 47 caracteres, se busca otro fragmento completo y comprensible de la misma intervención o de otra fuente. No se inventa un eslogan ni se atribuye una paráfrasis creativa como literal. La repetición se comprueba con el catálogo público, las reservas conservadas y las demás frases francesas; los nombres extranjeros y los acentos no deben ocultar duplicados.

## Evidencia y control

Primero se consultarán transcripciones institucionales y archivos de discursos; después, declaraciones claramente atribuidas en prensa. Wikiquote y Wikipedia servirán para localizar referencias, no sustituirán por sí solos la comprobación de la fuente. Una página inaccesible seguirá marcada como pendiente, aunque se conozca una frase popular de memoria.

El uso como ataque, defensa o curación es una asignación ficticia del juego. Ninguna frase se integrará en el catálogo privado de prueba hasta tener original, traducción y fuente comprobados. Las frases y cambios se mostrarán en la futura galería de revisión, manteniendo todo oculto al jugador hasta una activación coordinada.

## Investigación complementaria en prensa española

Para avanzar mientras no se accede a las fuentes francesas, se conservan candidatas en `frases-candidatas.json` obtenidas de declaraciones atribuidas por Europa Press. Se verifica el texto publicado en español y quién lo dice. No se inventa un original francés mediante traducción inversa ni se presenta la versión periodística como traducción propia.

`originalFR` e `originalSpeechLanguage` siguen en `null`: una intervención de una persona francesa en Barcelona o Madrid también podría haber sido en español o catalán. La fecha `published` corresponde a la publicación de la noticia, no necesariamente al día en que se pronunció la declaración.

Estas candidatas son material de investigación, no frases finales ni cromos integrados. Se distinguen los fragmentos literales del texto periodístico de las adaptaciones: por ejemplo, «El Gobierno de Bayrou ya es historia» pasa a «El Gobierno del primer ministro ya es historia», con el cargo acreditado en la misma noticia de septiembre de 2025. El original publicado se conserva y el cambio no se oculta.

Algunas noticias se descartan para seleccionar frases porque solo contienen palabras de familiares, portavoces, jueces u otros políticos. Se puede haber localizado una noticia sobre un orador sin encontrar ninguna declaración propia adecuada.

## Primera selección bilingüe

`frases-originales.json` incorpora 252 fragmentos cotejados para 84 perfiles. Se identifican como candidatas bilingües y conservan pendiente la revisión del tono para cada acción. Los nombres personales fuera del fragmento elegido no se trasladan a la frase animada; no ha sido necesario sustituir nombres dentro de estos 252 fragmentos.

Se ha comprobado expresamente el turno de respuesta en entrevistas, la sección firmada de Badinter frente al texto previo de Toubon, las respuestas de Borne frente a las preguntas de las senadoras y el día exacto de la entrevista de Rocard dentro de una ficha que reúne varias fechas. Se retiró una candidata de Barnier que citaba a Pierre Mendès France. Las explicaciones emergentes del glosario de la web se eliminan antes del cotejo: no son palabras del orador.

Las nuevas fuentes del Senado conservan el turno explícito y la fecha de la sesión, no solo la semana indicada en la URL. Los nombres en las búsquedas no prueban autoría: se excluyó al ejecutivo de Cisco homónimo de Bruno Bernard. En las nuevas entrevistas se han separado las preguntas y los fragmentos citados de terceros. Una declaración común leída por Lisnard se identifica como tal; no se presenta como una intervención individual escrita exclusivamente por él.

El perfil de Bruno Bernard en Lyon Capitale aporta citas directas en francés y una referencia visual identificada. Se conserva su fecha de publicación (`publishedOn`) y `spokenOn: null`, porque la noticia no confirma el día de la conversación. La galería muestra explícitamente esa diferencia. No se confunden las citas del entrevistado con las palabras del periodista o de otra persona citada en el perfil.
