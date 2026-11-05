> **Revisión vigente — 5-11-2026:** los tiers y el vestuario de todas las tandas se revisaron juntos. Consulta la [revisión global de 339](../reserva-espana/revision-global/README.md), la [galería de esta tanda](revision.html) y la [validación actual](../espana-83-06/README.md). El contenido que sigue y sus QA conservan la instantánea histórica anterior; sus repartos por tanda ya no son los vigentes.

# España · Segunda tanda: 60 cromos reservados

Preparada el 04-11-2026 para **v31.0.2.13**, con activación deshabilitada. [Revisión visual, efectos y fuentes](revision.html) · [Lista CSV](cromos.csv).

## Contenido

60 identidades nuevas respecto de los 120 oradores activos y los 20 ya reservados: 16 perfiles de la composición del Gobierno publicada por La Moncloa y 44 del historial XV del Senado. Entre sus trayectorias hay también responsabilidades autonómicas, locales, ministeriales anteriores y de partidos. Los cargos históricos no se presentan como vigentes. Las próximas tandas pueden incluir otros ámbitos del [censo general](../espana/README.md).

| Rareza | Nuevos | Estadísticas base |
|---|---:|---|
| Común | 24 | 1–2 TdP · Z 2 · A 4–5 · 2 escaños |
| Raro | 18 | 2–3 TdP · Z 4 · A 6–7 · 3 escaños |
| Especial | 12 | 3–4 TdP en esta tanda · Z 5–6 · A 8 · 4 escaños |
| Legendario | 6 | 4–5 TdP · Z 7 · A 11–14 · 5 escaños |

Cada valor concreto se toma de `statsFor` del catálogo existente. La proporción queda en 40/30/20/10 %. En la vista conjunta de 200 oradores hay 80 comunes, 60 raros, 40 especiales y 20 legendarios. La selección de rareza es editorial, según trayectoria y responsabilidad documentadas, con los cupos de esta tanda; no describe el valor o las capacidades reales de una persona.

Cada ficha incluye un efecto de básico de los **14 actuales** y una doctrina pasiva de las **6 actuales**, con diez nuevos oradores por doctrina. El básico mantiene las condiciones, destinatario, duración y recarga de su definición vigente. La pasiva se corresponde con la doctrina del líder: requiere su presencia y respeta el contrarresto rival. No se añaden habilidades inventadas ni reglas distintas.

## Frases y fuentes

[frases.json](frases.json) contiene **180 fragmentos**, tres por persona: normal, fuerte y apoyo compartido por defensa y curación. Son diferentes entre sí y de las 420 frases anteriores, como máximo de 47 caracteres. Se seleccionan de diarios oficiales del Congreso o Senado, con original, contexto breve, cabecera del orador, fecha, página física del PDF, URL y hash SHA-256. En esta tanda no se necesitan traducciones ni sustituciones de nombres: los recortes elegidos no contienen nombres personales de terceros.

Se revisó el contexto y se descartaron candidatos que reproducían palabras de terceros o perdían su sentido al recortarse. Los PDF pueden unir cabeceras sin espacios o cambiar de página dentro de una intervención: se comprobaron esas fronteras al identificar al hablante, y la página corresponde al fragmento, no al sumario inicial. No se afirma que una expresión común haya sido acuñada exclusivamente por quien la pronuncia. La elección de una frase para atacar o apoyar es una asociación ficticia del juego.

La verificación reproducible coteja las 180 frases con los bytes de **56 PDF oficiales**, sus hashes y sus páginas físicas: [resultado](qa/source-verification.json). Puede repetirse con `python _dev/expansions/espana-60-02/verify-sources.py` (Python estándar y `pdftotext`). Ese cotejo automático comprueba texto, hash y página; la atribución y el contexto se revisaron aparte.

## Arte

60 retratos nuevos en 15 atlas de cuatro cuadrantes 3:4, conservados sin recortes destructivos. Las referencias individuales de identidad y su hash están en [propuesta.json](propuesta.json). Se usaron fotografías de las fichas institucionales de La Moncloa y el Senado para orientar rasgos, cabello, gafas y barba; el arte existente de Trump y el prompt aportado para Cristina Fernández guían el acabado de ilustración TCG.

Varían pose, ángulo, luz, manos y presencia de uno o dos micrófonos. Los fondos representan entornos parlamentarios o ministeriales y acentos del grupo documentado, con hemiciclo, tribuna, comisiones, biblioteca y salas institucionales; no se usa una bandera nacional genérica. No se deduce militancia a partir de un ministerio o de un grupo mixto. [Prompts de referencia](prompts-arte.json), [registro de generación](generacion.json) y [hashes y dimensiones del arte](art/manifest.json).

## Reserva e integración

La [reserva conjunta](../reserva-espana/prepare.cjs) integra estos 60 con los 20 anteriores: **80 reservados**, 200 oradores en la vista interna y 600 frases. Incluye catálogo, países, rarezas, asignación de básicos, doctrinas, maestría de los nuevos legendarios, contexto documental y registro combinado de fuentes. Preserva las definiciones previas de los 140 oradores.

```sh
node _dev/expansions/reserva-espana/prepare.cjs --preview /tmp/hemicycle-reserva
node _dev/expansions/reserva-espana/preview-server.cjs
node --test _dev/expansions/reserva-espana/reserve.test.cjs
```

La vista completa escucha en `127.0.0.1:8097`, con origen de almacenamiento distinto, sin service worker ni conexión a las API remotas. El materializador solo escribe en `/tmp` o `_dev`. La integración sigue siendo una reserva de desarrollo: `enabled:false` y `releaseReady:false`. Su activación exige la entrega coordinada y la preservación de las reglas offline históricas que ya se documentó en la primera tanda.

El juego público permanece en **120 oradores y 360 frases**. Sobres, búsquedas, colección, IA, servicio online, fuentes, contadores y caché no incorporan los nuevos IDs ni el arte. Todo reside bajo `_dev`, excluido de Pages. El repositorio Git conserva los archivos de desarrollo; esa exclusión no equivale a confidencialidad en un repositorio público. No se modifica el número de versión ni el changelog del parche.

La metodología sigue cubierta por las explicaciones actuales de ilustraciones mediante IA, fragmentos y uso ficticio del combate. Los términos y su hash de aceptación permanecen intactos. Al activar el contenido habrá que publicar sus referencias y créditos junto al catálogo, sin presentar las fuentes como autorizaciones de imagen, marcas o derechos.

## Verificación

804 pruebas de la reserva conjunta: conservación de las 140 fichas anteriores, proporciones, estadísticas, 600 frases distintas, 15 atlas nuevos con hash y tamaño, exclusión pública y las cuatro acciones de los 80 reservados en ambos bandos. Se comprueba que cada básico dispara su efecto con requisitos válidos y que las pasivas requieren al líder y respetan el contrarresto. También se conserva la suite de 164 pruebas de la primera reserva. Las evidencias visuales y los resultados están en `qa/`.

[968 pruebas aprobadas en la ejecución conjunta](qa/final-tests.log) y [revisión de navegador](qa/browser.json) de los 80 retratos internos, las 60 fichas y las 180 frases, con filtros y anchos de 320, 393, 768 y 1200 px.

Actualización 05-11-2026: la [cuarta tanda](../espana-60-04/README.md) amplía la reserva conjunta a 200 cromos y 960 frases en 320 oradores internos. Los 16 retratos pendientes de la tercera tanda ya están completos. Los resultados y cifras anteriores describen la entrega original de esta segunda tanda.
