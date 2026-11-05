# Revisión global de tiers y vestuario · 339 reservados conservados

[Galería conjunta](revision.html) · [Lista completa](cromos.csv) · [Antes/después y criterio](tiers.csv) · [Datos de tiers](tiers.json) · [Vestuario](vestuario.json).

Se revisan todas las tandas como una sola colección. El alcance institucional de los cargos y la trayectoria pública pesan por encima de la fecha en que se creó el cromo. El reparto global aproximado 40/30/20/10 queda en **135 comunes, 102 raros, 69 especiales y 33 legendarios**. Las cuotas antiguas por tanda dejan de aplicarse.

El máximo tier prioriza presidencias estatales, autonómicas o de las Cortes, vicepresidencias, ministerios de gran alcance y trayectorias estatales o europeas destacadas. El especial reúne otras responsabilidades ministeriales, ejecutivas autonómicas, direcciones parlamentarias y presidencias territoriales relevantes. Raro y común consideran la experiencia documentada, mandatos, responsabilidad ejecutiva local, representación autonómica y funciones parlamentarias. La división es una decisión editorial para esta colección; no es una medición objetiva de capacidad, mérito personal o afinidad política. Dentro de un tier no se establece una clasificación personal.

Para resolver los tiers intermedios se contrastaron las fichas y responsabilidades de Mesa, portavocía, representación autonómica, Congreso y gobiernos locales. Se revisaron también excepciones que el texto de la ficha no resumía adecuadamente, entre ellas las antiguas consejerías de Ibarrola, Santamaría y Campoy, la representación internacional de Pons y la trayectoria autonómica de Oblaré. Las fuentes institucionales por persona están enlazadas en los datos. Los cargos son históricos cuando corresponde; no se deduce su vigencia actual.

Ejemplos de corrección: Bolaños y Salgado ascienden desde común a legendario por su trayectoria ministerial/vicepresidencia; Rollán, Arenas y Monago pasan al máximo tier por presidencia del Senado, vicepresidencia del Gobierno y presidencia autonómica, respectivamente. Ninguna persona conserva un legendario solo por haber ocupado uno de los seis huecos de su tanda.

Se recalcularon coste, Zasca, Aguante y escaños con los tiers actuales del juego. Las 260 identidades anteriores conservan sus frases, efecto del básico y doctrina pasiva. `antes.json` conserva la referencia al commit `80ef141` para verificar estas invariantes; `tiers.json` recoge el resultado vigente.

## Vestuario y dirección de arte

97 variantes generadas, conservando los originales en sus carpetas de procedencia y registrando la sustitución en `artBeforeGlobalReview`. Máximo tier: traje formal y corbata en los hombres, conjuntos formales en las mujeres. Especial: vestimenta profesional; raro: prendas profesionales más suaves y cuello abierto; común: polos, punto, cárdigan o blusa relajada. Se conserva la identidad y se favorecen cabeza y mirada fuera de cámara. No se uniforma el fondo con símbolos de España ni se inventa militancia a partir del grupo o del ministerio.

Las 25 láminas son PNG originales intactos del generador. `generacion.json` conserva las incidencias y repeticiones sin cambios; todos los ajustes de vestuario terminaron generados. `prompts-vestuario.json` enlaza fotos institucionales y sus hashes. Los cuadrantes están asignados por identidad, no por el orden posterior del ranking. Las fotografías de referencia no se redistribuyen.

La revisión original abarcó 343 perfiles. El creador indicó después omitir a los cuatro que carecían de arte; se conservan 339, todos ilustrados, y no se promueve a nadie para cubrir su hueco. `originalReviewScope` y la referencia histórica de cada ficha conservan el alcance de la revisión original. Las 97 variantes completadas no cambian. La reserva sigue desactivada y excluida de Pages.

Validación actual: [3.559 pruebas](../../espana-83-06/qa/final-tests.log), [navegador y render real](../../espana-83-06/qa/browser.json), [fuentes nuevas](../../espana-83-06/qa/source-verification.json). Los QA anteriores son históricos.
