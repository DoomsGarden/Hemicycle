> **Revisión vigente — 5-11-2026:** los tiers y el vestuario de todas las tandas se revisaron juntos. Consulta la [revisión global de 343](../reserva-espana/revision-global/README.md), la [galería de esta tanda](revision.html) y la [validación actual](../espana-83-06/README.md). El contenido que sigue y sus QA conservan la instantánea histórica anterior; sus repartos por tanda ya no son los vigentes.

# España · Cuarta tanda: 60 cromos reservados

Completada el **05-11-2026** para **v31.0.2.13**, con activación deshabilitada. [Galería, efectos y fuentes](revision.html) · [Lista CSV](cromos.csv).

Se prepararon **60 identidades nuevas, 60 retratos, 180 frases con fuentes, estadísticas, básicos y pasivas**. En esta misma entrega se completaron los [16 retratos pendientes de la tercera tanda](../espana-60-03/reintento-arte-2026-11-05.json). La reserva conjunta suma 200 cromos y no tiene arte pendiente.

## Selección y reglas

Los perfiles se cruzaron con los 120 oradores activos y los 140 ya reservados, reutilizando las identidades del censo y comprobando nombres completos y fichas institucionales. La selección incluye trayectorias de gobiernos autonómicos e insulares, alcaldías, parlamentos y direcciones de partidos; el historial XV del Senado aporta la fuente de identidad común de esta tanda. No se afirma que todos mantengan un escaño o su cargo anterior.

Los seis legendarios son Ximo Puig, Luis Tudanca, Juan Lobato, Jesús Julio Carnero, José Manuel Baltar y Pedro Martín. Las responsabilidades que fundamentan su selección figuran en cada ficha. Las rarezas son una asignación editorial relativa dentro de los cupos del juego, no una medida de valor o capacidad personal.

| Rareza | Nuevos | Estadísticas base |
|---|---:|---|
| Común | 24 | 1–2 TdP · Z 2 · A 4–5 · 2 escaños |
| Raro | 18 | 2–3 TdP · Z 4 · A 6–7 · 3 escaños |
| Especial | 12 | 3–4 TdP · Z 5–6 · A 8 · 4 escaños |
| Legendario | 6 | 4–5 TdP · Z 7 · A 11–14 · 5 escaños |

Todos los valores coinciden con `statsFor` del catálogo vigente. Se mantiene la proporción 40/30/20/10 %. La vista interna conjunta tiene 128 comunes, 96 raros, 64 especiales y 32 legendarios en 320 oradores.

Se utilizan los **14 efectos de básico y las 6 doctrinas actuales**, con diez perfiles nuevos por doctrina. Se conservan condiciones, destinatarios, duración, recarga, presencia del líder y contrarrestos. Los efectos pertenecen al combate ficticio; no describen a las personas reales. La ampliación conserva las definiciones y asignaciones de básico de los 260 oradores de la vista anterior.

## Frases y documentación

[frases.json](frases.json) recoge 180 fragmentos diferentes entre sí y de los 780 anteriores, de un máximo de 47 caracteres. Cada persona tiene una frase normal, una fuerte y una compartida por defensa y curación. Se incluyen original del diario, contexto breve, cabecera del hablante, fecha, URL, página física y SHA-256.

Las frases de juego no contienen nombres personales de terceros. Se descartaron citas atribuidas a otra persona, apoyos irónicos y recortes que cambiaban el sentido de una negación. En intervenciones multilingües, el castellano puede corresponder a la traducción recogida por el diario. No se afirma autoría exclusiva de expresiones comunes. Las fuentes utilizadas están dentro del intervalo prioritario 2010–2026.

El [cotejo reproducible](qa/source-verification.json) verifica **180 frases contra 86 PDF oficiales**, con hash, página física y coincidencia del fragmento. La atribución y el contexto se revisaron por separado. Requiere Python estándar y `pdftotext`:

```sh
python _dev/expansions/espana-60-04/verify-sources.py
```

## Arte

60 retratos nuevos en 15 atlas PNG originales, con cuatro cuadrantes 3:4 y sin recortes destructivos. Las fotografías institucionales individuales orientan los rasgos; sus URL y hashes están en [propuesta.json](propuesta.json). El arte existente de Trump y el prompt aportado para Cristina Fernández orientan el acabado de ilustración TCG.

Varían pose, cámara, iluminación y presencia de uno o dos micrófonos. Los fondos representan entornos parlamentarios, salas de comisiones, tribunas, biblioteca y arquitectura institucional, con acentos del grupo documentado. No se deduce militancia a partir de un grupo mixto ni se utiliza una bandera española genérica. Las fotografías consultadas no se incorporan al juego.

[Prompts y referencias](prompts-arte.json) · [Registro de generación y reintento](generacion.json) · [Dimensiones y hashes](art/manifest.json). Un atlas de esta tanda requirió repetir la misma solicitud; el registro conserva el rechazo inicial y la imagen finalmente recibida. Los cuatro atlas pendientes de la tercera tanda también se recibieron con sus mismos prompts y referencias.

## Reserva e integración

La [reserva conjunta](../reserva-espana/README.md) reúne **200 cromos con 200 retratos completos**, 320 oradores internos y 960 frases. El juego público mantiene sus **120 oradores y 360 frases**. Los nuevos IDs, imágenes y fuentes no entran en sobres, colección, búsquedas, IA, backend, páginas públicas ni caché.

```sh
node _dev/expansions/reserva-espana/prepare.cjs --preview /tmp/hemicycle-reserva
node _dev/expansions/reserva-espana/preview-server.cjs
node --test _dev/expansions/reserva-espana/reserve.test.cjs _dev/expansions/espana-20/reserve.test.cjs
```

La vista completa escucha en `127.0.0.1:8097`, en otro origen de almacenamiento, sin service worker ni acceso a las API remotas. El materializador solo escribe en `/tmp` o `_dev`, confirma cero retratos pendientes y mantiene `enabled:false` y `releaseReady:false`. La activación futura conserva los requisitos de publicación coordinada y compatibilidad con las reglas offline históricas.

Todo reside bajo `_dev`, excluido de Pages. Esa exclusión no hace confidencial un repositorio público. No se cambia la versión pública, el changelog ni la etiqueta v31.0.2.13. Los términos y su hash de aceptación permanecen intactos; al activar deberán publicarse las fuentes y créditos del nuevo catálogo. Las referencias documentales no equivalen a una autorización de imagen o marcas.

El [censo actual](../espana/README.md) conserva 440 identidades españolas: **97 activas, 200 reservadas y 143 pendientes de preparar**. No quedan retratos pendientes. El censo sigue abierto a otras instituciones y etapas del periodo de 40 años; los 143 no constituyen un total exhaustivo de todos los políticos españoles.

## Verificación

[2.169 pruebas aprobadas](qa/final-tests.log): 2.005 de la reserva conjunta y 164 de la primera tanda. Cubren las cuatro acciones y las pasivas de los 200 reservados en ambos bandos, conservación de los 260 oradores anteriores, proporciones, 960 frases distintas, hashes del arte, censo e aislamiento público. Se conserva expresamente la distinción entre José Manuel Baltar Blanco, José Fernández Blanco y José Blanco.

Las revisiones de Chromium de [esta tanda](qa/browser.json) y de la [tercera ya completa](../espana-60-03/qa/browser.json) verifican 200 retratos internos sin marcadores pendientes, 60 artículos y 180 frases por galería, filtros y ausencia de desbordamiento en 320, 393, 768 y 1200 px, sin registrar service workers.

Actualización posterior: la [quinta tanda](../espana-60-05/README.md) eleva la reserva a 260 cromos y deja 83 pendientes en el censo actual. Las cifras y evidencias anteriores describen el cierre de esta cuarta tanda.
