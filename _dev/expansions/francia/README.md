# Francia · primera tanda de 100 en preparación

[Revisión privada con arte y frases](revision.html) · [Listado](listado.md) · [CSV](censo.csv) · [Datos](censo.json) · [Método de traducción](metodo-frases.md).

[Revisión legal del 05-11-2026](revision-legal.md): los avisos vigentes describen esta metodología; se documentan la trazabilidad y las actualizaciones necesarias al activar la ampliación. La reserva está oculta en el juego y excluida de Pages; los archivos de desarrollo enviados a GitHub son consultables según la visibilidad del repositorio.

La [ampliación autorizada de 340](ampliacion-340/README.md) exige actividad documentada en 2010–2026 y está en preparación. Tras su arte se revisarán conjuntamente tiers, pasivas y efectos del zasca normal de los nuevos franceses. La primera tanda conserva durante ese trabajo sus tiers actuales. El objetivo de esta fase es de 443 franceses, sin cerrar el censo del país.

Estado de investigación: **5 de noviembre de 2026**. Todo permanece en `_dev`, excluido de Pages y del catálogo jugable. No se ha cambiado la versión pública ni se han anunciado estos cromos en el changelog.

| Parte | Preparado | Pendiente |
| --- | --- | --- |
| Identidades | 100 nombres nuevos, sin duplicados con los 120 activos ni los 339 españoles reservados | Preparar los 340 adicionales de 2010–2026; el censo definitivo sigue abierto |
| Tiers y mecánicas | Propuesta para los 100, con estadísticas, efecto básico y doctrina existentes | Ajuste global tras el arte de los 440 nuevos de esta fase; no por cuotas de tanda |
| Perfiles | 100 páginas consultadas; homónimo de Bruno Bernard resuelto al político | Contraste integral de trayectoria, afiliación y etapa representada |
| Arte | 100 retratos provisionales en 25 atlas originales, todos con cabeza y ojos fuera de cámara | Revisión final de identidad y vestuario |
| Frases bilingües | 252 fragmentos para 84 perfiles, con original y hablante cotejados en 115 fuentes | 48 selecciones adicionales; revisión del tono para las 252 candidatas |
| Prensa española | 54 candidatas previas para 23 perfiles, cotejadas en 22 noticias | No se consideran originales franceses verificados ni se suman como frases finales |
| Cromos terminados e integrados | 0 | Completar la preparación antes de incorporarlos a una reserva de prueba |

Se excluyen **Emmanuel Macron, Christine Lagarde y Marine Le Pen**, ya presentes en el catálogo. Con los 100 nuevos se prevén 103 franceses; no es el total definitivo del país. `countryCensusComplete` permanece en `false` y `finalFrenchCount` en `null`.

La ventana comprende **5-11-1986 a 5-11-2026**, priorizando 2010–2026. Un mandato anterior no excluye a quien continuó activo durante la ventana: Giscard d’Estaing se incluye por su representación europea y la Convención Europea; Badinter por el Consejo Constitucional y el Senado. Los resúmenes no afirman que las personas conserven sus cargos hoy. Las afiliaciones son referencias de etapas pendientes de contraste.

La distribución propuesta sigue siendo 40 comunes, 30 raros, 20 especiales y 10 legendarios. Es provisional. El ajuste conjunto se hará tras completar a todos los integrantes de la selección francesa, revisando también las estadísticas y el vestuario que cambien de tier. Las asignaciones de efectos y pasivas son mecánicas ficticias del juego.

## Material de revisión

- `frases-originales.json`: fragmento francés continuo, traducción editorial española, fecha, URL consultada, hash y comprobación del turno de palabra. Sus 252 traducciones tienen un máximo de 47 caracteres y no duplican las 1377 frases del catálogo activo y la reserva española. El encaje del tono en ataque, ataque fuerte o apoyo permanece pendiente; todavía no son frases finales del juego.
- `fuentes-francesas.json`: 294 registros de investigación en 285 documentos físicos distintos. Se distingue la disponibilidad del texto de su atribución: una ficha puede incluir periodistas, varios oradores, citas ajenas o carecer de transcripción. No todas sus frases se han revisado.
- `perfiles-consultados.json`: URL y hash de los 100 perfiles, y fotografías localizadas cuando las hay. Una URL de imagen localizada no implica descarga ni inspección visual. Bruno Bernard no debe confundirse con el fotógrafo ni el tipógrafo homónimos; su página política no contiene retrato utilizable.
- `primera-100/arte-generacion.json`: nombres y orden de los cuadrantes, referencia visual inspeccionada, rasgos, pose, vestuario, fondo, prompt y hash de los 25 atlas generados. Las fotografías de referencia no se redistribuyen.
- `frases-candidatas.json` y `fuentes-consultadas.json`: investigación previa en prensa española. Se ha repetido el cotejo de sus 54 candidatas con las capturas recuperadas, conservando los hashes anteriores en el historial de las fuentes. La sustitución de Bayrou por su cargo sigue documentada.

Ningún retrato de esta selección debe mirar a cámara: tanto la cabeza como los ojos se orientan hacia un interlocutor o el hemiciclo fuera del encuadre. Se han revisado visualmente los 100 generados y corregido cuatro retratos anteriores que resultaban demasiado frontales; el historial de generación conserva sus versiones anteriores. Las futuras tandas siguen la misma regla, sin excepciones. Se mantienen fondos institucionales o de partido variados y micrófonos en algunos retratos. Los tiers altos llevan vestuario formal; los raros usan también chaquetas más cómodas y cuellos abiertos. No se aplica una bandera francesa uniforme.

## Accesos y continuación

Los accesos iniciales a Vie publique, Elíseo, Senado, Asamblea Nacional, Wikipedia francesa y fotografías de Europa Press funcionan. Se han recuperado transcripciones mediante navegación normal cuando la descarga directa no entregaba el texto. Se conservan el proxy y la verificación TLS del entorno.

Los accesos a **`thumb.wikimedia.org`** y **`www2.assemblee-nationale.fr`** ya se aplicaron. Las miniaturas se descargaron con una identificación descriptiva del cliente y se inspeccionaron antes de generar los retratos.

La configuración para Lyon Capitale, RTL, Le Figaro, Le Monde, Libération, Franceinfo, France 3, L’Humanité y Sud Ouest ya está publicada y aplicada, comprobado el 05-11-2026. Son editores de referencias localizadas para los perfiles restantes; el permiso de red no equivale a haber consultado ni verificado cada referencia. Los nombres exactos y el estado están en `qa/network-access.json`.

[Bruno Bernard](bruno-bernard.md) ya tiene su retrato en el cuarto cuadrante del atlas 25 y tres candidatas bilingües. Se verificaron la foto y las citas directas del perfil de Lyon Capitale publicado el 12-03-2020, distinguiéndolo de otros homónimos. La fecha de publicación no se presenta como día confirmado de la entrevista. No quedan ilustraciones por generar en esta tanda. Faltan 48 selecciones bilingües para 16 perfiles y la revisión editorial de las 252 existentes.

## Comprobaciones

```sh
node _dev/expansions/francia/verify-list.cjs
python _dev/expansions/francia/verify-originals.py --cache /tmp/hemicycle-france
python _dev/expansions/francia/verify-candidates.py --offline
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/expansions/francia/browser-candidates.cjs
```

El cotejo de originales requiere las capturas HTML externas del directorio de investigación indicado. La comprobación de prensa usa `/tmp/hemicycle-france-press-cache`. Las copias de trabajo se preservan también fuera del repositorio en `/workspace/.hemicycle-tools/state/`; los textos íntegros y fotografías de prensa no se distribuyen en Git. Una restauración que no conserve las capturas necesitará recuperarlas y volver a cotejarlas: no debe darse por verificado un hash distinto.

El control del navegador levanta y cierra su propio servidor HTTP de revisión en la interfaz local. Comprueba los 100 perfiles, los 100 retratos cargados, las 252 candidatas bilingües, los filtros, las fuentes y el ajuste a pantallas de 320, 393, 768 y 1200 píxeles. Los controles no equivalen a una validación final de la selección editorial ni del equilibrio de los cromos.
