# Francia · censo inicial de propuestas

[Listado completo de 100 candidatos](listado.md) · [CSV](censo.csv) · [Datos y propuestas de efectos](censo.json) · [Método de traducción](metodo-frases.md) · [Revisión con las candidatas](revision.html).

El listado inicial propone **40 comunes, 30 raros, 20 especiales y 10 legendarios**. Se valora todo el conjunto, sin cupo por tanda. El creador ha autorizado empezar por estos 100. Los tiers serán provisionales durante la preparación: el ajuste global se hará después de completar la selección francesa, como se hizo con España. En ese momento se revisarán también las estadísticas y el vestuario que cambien de tier. Los enlaces por persona están marcados expresamente como pendientes de consulta; no son pruebas de verificación.

Se excluyen **Emmanuel Macron, Christine Lagarde y Marine Le Pen**, ya presentes en el catálogo. Se contrastaron los nombres e identificadores con los 120 activos y los 339 españoles reservados. Una nueva pose o cambio de cargo no crea una segunda identidad.

La ventana es 5-11-1986 a 5-11-2026, priorizando 2010–2026. Un mandato anterior no excluye a quien continuó activo durante la ventana: Giscard d’Estaing se incluye por su representación europea y la Convención Europea; Badinter por el Consejo Constitucional y el Senado. Los resúmenes no afirman que las personas conserven sus cargos hoy. Las afiliaciones son referencias de etapas a documentar, no militancia actual deducida de un cargo.

## Preparado y pendiente

Preparados: 100 nombres, resumen de trayectoria, tier propuesto, estadísticas de los tiers existentes, efecto del básico y doctrina pasiva propuestos, pautas de vestuario, mirada y fondo. Las mecánicas son asignaciones ficticias y provisionales.

Pendientes: contraste documental individual, **300 frases** (normal, fuerte y apoyo), traducciones al español, sustituciones justificadas de menciones a terceros y referencias visuales. No se han inventado ni rellenado las frases finales. Sí se ha avanzado en la investigación: **58 noticias consultadas y 54 candidatas en español para 23 perfiles**, de los cuales 14 tienen tres candidatas. Son declaraciones contrastadas en el texto periodístico; los originales franceses siguen pendientes. Tampoco se han generado retratos ni añadido estas propuestas al registro de reserva o al juego.

`frases-candidatas.json` conserva atribución, contexto, URL, fecha de publicación, hash y una sustitución documentada de nombre por cargo. `fuentes-consultadas.json` distingue los textos leídos de las imágenes solo localizadas. Las candidatas no se consideran 54 frases finales ni completan 23 cromos. La revisión muestra su estado y sus fuentes.

Las fuentes francesas del Elíseo, Senado, Asamblea Nacional y Vie publique devolvieron denegación de destino al consultarlas desde este entorno. El borrador de ampliación de dominios está guardado para revisión y publicación en la configuración del entorno. Incluye ahora también `img.europapress.es`: los artículos sí se pueden consultar, pero ese dominio de fotografías devuelve denegación y no se han podido verificar sus rasgos. Guardar ese borrador no activa la red ni publica el juego. Hasta que el acceso esté aplicado, el estado de las frases seguirá siendo pendiente.

Primera fase autorizada: completar estos 100. Con los tres cromos franceses existentes, esta fase dejaría 103 franceses preparados o activos; no es el total definitivo del país ni el número actual del catálogo jugable. `countryCensusComplete` sigue en `false` y `finalFrenchCount` en `null`. Después se ampliará el censo por tandas de 60, manteniendo el criterio de tiers sobre el censo completo y sin elevar un perfil a legendario solo para completar su tanda. Los fondos variarán según la institución y formación de la etapa; no se usará una bandera francesa común. Predominarán poses con cabeza y ojos orientados hacia un interlocutor. La vestimenta será más formal en los tiers altos y progresivamente más cómoda en los bajos.

El material permanece en `_dev`, excluido de Pages. La versión pública, el manifest, las fuentes públicas y los términos conservan su estado actual.

## Comprobaciones de investigación

```sh
node _dev/expansions/francia/verify-list.cjs
python _dev/expansions/francia/verify-candidates.py --offline
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/expansions/francia/browser-candidates.cjs
```

El cotejo offline requiere los bytes ya descargados en `/tmp/hemicycle-france-press-cache`. Los textos completos y las fotografías de prensa no se redistribuyen. La comprobación valida literalidad o adaptación registrada, atribución contextual guardada y hashes de los artículos; no valida un original francés inaccesible ni todos los hechos del artículo.
