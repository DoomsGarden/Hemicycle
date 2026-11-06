# Francia · revisión conjunta de 440 nuevos oradores

Revisión editorial completada el **06-11-2026** para los 100 iniciales y los 340 adicionales. Las 440 ilustraciones están completas. Se han ajustado conjuntamente rarezas, estadísticas, pasivas y efectos del zasca normal. **La selección y atribución de las 1.320 frases está completa. La [reserva de prueba](../../prepare.cjs) permanece desactivada y fuera del catálogo público.** Los tres franceses activos conservan sus datos.

[Galería de 440](revision.html) · [CSV](ajuste.csv) · [Antes y después](ajuste.json) · [Decisiones](decisiones.json) · [Propuestas previas](antes.json) · [Registro de cargos](preparacion-cargos.json).

## Rarezas y responsabilidad representada

La distribución global es de **176 comunes, 132 raros, 88 especiales y 44 legendarios**. No hay cupos por tanda: los 100 iniciales pasan a 32 comunes, 13 raros, 24 especiales y 31 legendarios. Se comparan responsabilidad institucional, alcance, continuidad, duración y combinación de cargos, además de trayectorias nacionales documentadas. El orden es una decisión editorial para el juego, no una medida objetiva del valor personal.

Los 44 máximos incluyen presidencias de la República y del Gobierno, presidencias parlamentarias de mayor continuidad, responsabilidades constitucionales y económicas internacionales y determinadas trayectorias nacionales prolongadas. Se documentan también las candidaturas y el liderazgo nacional sostenido de Mélenchon, Jean-Marie Le Pen y Ségolène Royal; la combinación de ministerios soberanos de Alliot-Marie, Bruno Le Maire, Le Drian y Chevènement, y la continuidad y reformas culturales y educativas de Jack Lang. Una presidencia parlamentaria breve, como la de François de Rugy, se valora conjuntamente con su trayectoria y queda en especial.

La clasificación distingue ministerios plenos de delegados o interinos, vicepresidencias de cámara de las de un grupo y presidencias territoriales de funciones delegadas. Las responsabilidades privadas o asociativas no bastan para justificar actividad política. La duración de mandatos solapados no se suma dos veces. Las estadísticas y variantes de coste proceden de la función de estadísticas del catálogo existente.

Los 340 adicionales acreditan actividad entre **05-11-2010 y 05-11-2026**; la primera selección conserva su ventana de 40 años. Un cargo anterior puede informar la relevancia de una trayectoria admitida, siempre con su fecha histórica. El límite de una captura no certifica la vigencia posterior de un mandato. Se corrigieron los resúmenes de Lecornu y Ferrand con sus nombramientos de 2025; esto no equivale a una auditoría integral de todas las afiliaciones y biografías.

## Pasivas, efectos y arte

Se utilizan las **seis doctrinas y los catorce efectos básicos existentes**, sin modificar las reglas públicas. Las afinidades parten de funciones documentadas: finanzas, justicia, seguridad, cuidados, cultura, diplomacia, gestión territorial, actividad parlamentaria o ejecutiva y continuidad. La asignación reduce concentraciones globales y por rareza y combinaciones repetidas, conservando una relación documentada con el cargo. Cada ficha guarda la justificación de ambas mecánicas. Son efectos ficticios; no atribuyen conductas reales a las personas representadas.

La pasiva se propone como **doctrina del líder**, con los requisitos y contrarrestos del juego; no es una habilidad permanente adicional de cada orador. La reserva de prueba comprueba para los 440 oradores las cuatro acciones en ambos lados, los efectos del zasca normal y la activación y contrarresto de la doctrina del líder.

Los 440 retratos se revisaron con cabeza y ojos fuera de cámara. Los 44 máximos tienen una revisión de vestuario formal vinculada al hash de su atlas en `vestuario-revisado.json`. Se corrigieron las vestimentas de Bruno Le Maire, Jean-Pierre Chevènement y Jean-Yves Le Drian. Josette Borel-Lincertin y Daniel Zaïdani completan el atlas 85 con referencias institucionales verificadas. Los registros de generación conservan prompts, versiones y fuentes; las fotografías originales no se redistribuyen.

## Trazabilidad y comprobaciones

`preparacion-cargos.json` conserva 440 biografías y 3.131 intervalos extraídos, incluidos algunos profesionales o asociativos; es evidencia de investigación, no una clasificación política automática. `prepare-decisions.py` reproduce la clasificación y la propuesta editorial. `review-mechanics.cjs` aplica las decisiones y conserva el estado previo; su opción `--check` comprueba los datos sin modificarlos. No debe reexportarse una selección antigua sobre esta revisión.

```sh
PYTHONDONTWRITEBYTECODE=1 python _dev/expansions/francia/ampliacion-340/revision-global/test_role_classification.py
node _dev/expansions/francia/ampliacion-340/revision-global/review-mechanics.cjs --check
node _dev/expansions/francia/ampliacion-340/revision-global/verify-review.cjs
node _dev/expansions/francia/ampliacion-340/revision-global/build-review.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/expansions/francia/ampliacion-340/revision-global/browser-review.cjs
```

Los controles verifican unicidad, cargos enlazados a la investigación, distribución, estadísticas y textos canónicos, hashes del arte, conservación de la propuesta anterior y de siete archivos públicos. El navegador comprueba 440 imágenes, filtros de rareza, pasiva y efecto, las dos últimas identidades y pantallas de 320, 393, 768 y 1200 píxeles. La documentación legal pública mantiene su versión; el alcance y las tareas antes de publicar se documentan en [la revisión legal de la reserva](../../revision-legal.md).
