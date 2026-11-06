# Revisión documental de la reserva francesa

Fecha: 05-11-2026. Revisión del contenido preparado hasta el commit `f77451c`: 100 propuestas, 99 retratos generados y 249 candidatas bilingües para 83 perfiles. No hay cromos franceses nuevos integrados o activados. Las candidatas conservan pendiente la revisión editorial del tono.

Se han contrastado `legal/documents.json`, `js/legal-documents.js`, `legal/index.html`, `docs/fuentes-frases-actuales.json`, `fuentes/index.html`, los generadores de documentos y fuentes, el registro SQL de la versión legal vigente y los registros de investigación y arte de esta reserva.

## Resultado para esta entrega

Los textos públicos vigentes ya describen la metodología utilizada. No se necesita modificar las condiciones ni su huella de aceptación para guardar esta preparación en el repositorio. La versión documental continúa siendo `2026-10-29.2`, con SHA-256 `13fb255ccbbebd0c18595f37be4a39c438626631a0c0dd1485ea21fa82c5798e`.

| Materia | Cobertura actual y resultado |
| --- | --- |
| Independencia | El aviso excluye afiliación, patrocinio y respaldo de personas, partidos, instituciones y fuentes. También alcanza a los nuevos perfiles franceses. |
| Retratos | El apartado «Ilustraciones generadas mediante IA» explica su generación con prompts, el uso de referencias visuales documentadas y que no son fotografías ni pruebas de situaciones reales. La orientación de la mirada no cambia esa explicación. |
| Traducciones y adaptaciones | «Frases, humor y contexto» y «Contenido y estrategia» distinguen fragmentos, traducciones y adaptaciones, incluida la omisión o sustitución de menciones. Los originales franceses y las traducciones editoriales se conservan por separado en la reserva. |
| Ataques y pasivas | Las capacidades y resultados son reglas ficticias; no se atribuyen cualidades reales, conductas ni declaraciones dirigidas al rival. |
| Derechos y reclamaciones | Se advierte que citar una fuente o representar a una persona no equivale a obtener autorización. Se mantiene el canal de reclamación de contenido. |
| Privacidad y almacenamiento | Esta entrega añade archivos de desarrollo, sin introducir en el juego nuevos datos de jugadores, proveedores, finalidades o mecanismos de seguimiento. La preparación no exige por sí misma cambiar esos documentos. |
| Fuentes y créditos públicos | Continúan correspondiendo a los 120 oradores activos y sus 360 frases. Los recuentos no deben incorporar propuestas todavía ausentes del juego. |

## Trazabilidad y alcance de la publicación

`primera-100/arte-generacion.json` conserva para los 99 retratos la referencia visual, su hash, los rasgos revisados, el prompt, el resultado y el historial de correcciones. Las referencias visuales se distinguen de las fuentes de las frases. Las fotografías y las transcripciones completas consultadas no se incluyen en esta entrega de Git.

`frases-originales.json` conserva el fragmento francés, traducción propia, fecha, fuente, hash y comprobación del hablante. Las 54 candidatas anteriores obtenidas de prensa española siguen separadas: no se presentan como originales franceses ni como traducciones propias verificadas del francés. Las palabras de una declaración común leída por un orador mantienen esa explicación contextual.

La comprobación de texto, autoría y hash no establece una licencia de reutilización ni una autorización de imagen. Tampoco el carácter breve de un fragmento o su traducción acredita por sí solo una excepción legal. Las condiciones de las fuentes y los derechos aplicables a cada uso deben formar parte de la revisión de publicación; no se atribuye una autorización que no está documentada.

La reserva queda fuera del catálogo y de Pages mediante `_config.yml`. **Oculto en el juego no significa confidencial en GitHub**: los archivos enviados serán accesibles a quienes puedan consultar el repositorio. El usuario autorizó expresamente el envío de `f77451c` y solicitó esta revisión documental; no se presenta `_dev` como un control de acceso.

## Al activar la ampliación

La activación deberá acompañarse de las fuentes y créditos correspondientes a los cromos realmente publicados: original, traducción, adaptación y sustituciones documentadas, contexto y procedencia visual. Antes deben completarse las selecciones y su revisión de atribución, sentido, etapa y derechos; esta revisión de coherencia no declara terminados los 100 cromos ni autorizados todos sus usos.

Si la activación cambia materialmente la metodología o las condiciones, habrá que versionar los documentos, regenerar la huella y sincronizar su registro legal. Si solo amplía fuentes y créditos dentro de lo ya descrito, debe revisarse ese contenido sin atribuir automáticamente a la ampliación un cambio contractual. No se modifica ni ejecuta SQL en esta entrega.

## Comprobaciones realizadas

- `node _dev/legal/build.cjs --check`: fuente y documento generado coinciden, versión publicada sin apartados incompletos detectados por el generador.
- `node _dev/legal/build-sources.cjs --check`: página pública coherente con el catálogo de 120 oradores, 360 frases, 154 referencias y cinco referencias parciales identificadas.
- `node _dev/expansions/francia/verify-list.cjs`: 100 identidades distintas; 99 retratos con revisión de mirada; reserva sin activar.
- Registro SQL `20261029_sources_release.sql`: versión y hash coinciden con los documentos vigentes; no se conecta ni se modifica la base de datos.

Es una revisión de coherencia entre documentos, contenido y preparación técnica, no un dictamen sobre todos los derechos implicados ni una auditoría de la configuración real de los proveedores.

Actualización documental del 05-11-2026, posterior al estado de `f77451c`: el atlas 25 ya incluye a Bruno Bernard y se añaden tres fragmentos directos de Lyon Capitale con traducción propia, sin menciones personales de terceros. El estado pasa a 100 retratos y 252 candidatas para 84 perfiles. Se registra la publicación del artículo por separado del día no confirmado de la conversación. Se mantiene la separación entre fuente fotográfica y fuente de frases, y las fotografías consultadas no se distribuyen en Git. Esta preparación no cambia los textos públicos ni su versión o huella.

Actualización documental del 06-11-2026: la ampliación de 340 adicionales conserva el método anterior y exige actividad política o institucional documentada entre el 05-11-2010 y el 05-11-2026. Hay 338 ilustraciones adicionales revisadas (438 junto a las 100 iniciales); Josette Borel-Lincertin y Daniel Zaïdani siguen pendientes de referencia visual verificable. La reserva no está activada. Se conservan las fuentes visuales, hashes de la imagen exacta revisada y correcciones; los paneles vacíos no se cuentan como retratos. Las 252 candidatas bilingües anteriores no han aumentado ni se presentan como frases finales. El ajuste conjunto de tiers, pasivas y efectos del zasca normal permanece pendiente hasta completar el arte. Esta ampliación de la preparación no introduce una metodología nueva ni cambios en datos de jugadores; se mantienen los documentos públicos, su versión y su huella.

Actualización del 06-11-2026 tras habilitar las dos fuentes pendientes: los 440 retratos nuevos están completos y la revisión conjunta asigna rarezas, estadísticas, seis doctrinas y catorce efectos básicos existentes. Se documentan criterios, fuente y fechas del cargo, antes/después y correcciones de vestuario. Estos parámetros siguen siendo reglas ficticias; no se incorporan al catálogo público ni se activan. Las frases continúan pendientes de cierre editorial. Se conservan los textos públicos y su huella: la revisión no cambia el método de ilustración, traducción o tratamiento de datos de jugadores.

Actualización del 06-11-2026: el registro de cierre incorpora 1137 fragmentos franceses y traducciones españolas para 379 perfiles, con fuentes y localizadores. Mantiene separadas publicación y fecha de declaración, identifica los reemplazos tras auditar los hablantes y excluye anotaciones editoriales de las citas personales. La reserva continúa desactivada y excluida de Pages; quedan 61 perfiles por cerrar y la revisión previa a una futura activación sigue siendo necesaria. Los documentos legales públicos conservan su versión.
