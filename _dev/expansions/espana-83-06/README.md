# Última tanda española · 79 conservados y cuatro omitidos

79 identidades distintas, con estadísticas de su tier, efecto del básico, pasiva del líder y tres frases para las cuatro acciones actuales. Ataque y ataque fuerte usan frases distintas; defensa y curación comparten la tercera. [Galería](revision.html) · [CSV](cromos.csv).

Esta tanda cierra los 83 perfiles de investigación que quedaban en las listas ya documentadas del Gobierno y del historial XV del Senado. La reserva queda en 339; el censo general conserva 440 identidades españolas: 97 activas, 339 reservadas y cuatro descartadas. No se declara terminado el universo de políticos españoles ni se presenta el historial de la XV como composición actual.

Los tiers se asignaron mediante la [revisión conjunta de los 343](../reserva-espana/revision-global/README.md), no mediante cuotas independientes para estos 83. Las estadísticas se recalcularon con `statsFor` del catálogo vigente; los efectos y las doctrinas usan el motor existente.

## Frases y fuentes

237 fragmentos literales y distintos de las 1.140 frases previas: 210 proceden de 110 PDF oficiales del Senado y 27 de 12 noticias de Europa Press con atribución propia. Cada registro conserva original, contexto, fecha y hash; los PDF añaden página física y cabecera del orador. Se distingue expresamente la fuente de prensa del diario oficial. Las traducciones oficiales de intervenciones multilingües se toman tal como están publicadas. No se atribuyen citas de autores mencionados dentro de una intervención al político que las recita.

Las frases seleccionadas no contienen nombres personales de terceros. No ha sido necesario sustituirlos en esta tanda. Su asignación a una acción es una adaptación funcional del juego; no indica el objetivo original de la declaración. [Cotejo de fuentes](qa/source-verification.json).

```sh
python _dev/expansions/espana-83-06/verify-sources.py
# --offline usa los bytes previamente conservados en /tmp/hemicycle-quote-pdfs.
```

El hash identifica los bytes consultados; si una noticia cambia, se debe revisar de nuevo su contenido antes de actualizar el hash. Las fuentes completas no se redistribuyen.

## Arte y pendientes reales

79 retratos nuevos generados en 20 PNG originales, con fotografías institucionales como guía de rasgos y arte existente como guía de estilo. Se preservan los PNG; las galerías recortan los cuadrantes mediante CSS. El vestuario de siete de estos retratos fue ajustado de nuevo en la revisión global. Predominan la cabeza y la mirada hacia el hemiciclo, no hacia el espectador; los fondos son institucionales variados y no una bandera española común.

**Cuatro perfiles omitidos por decisión del creador:** Estela Darocas, Javier Bermúdez, Javier Iglesias y Javier Lambán. El 5-11-2026 se indicó dejarlos fuera tras los rechazos del generador. Su investigación se conserva en `descartados.json` como archivo excluido de la reserva, sin volver a contarlos como pendientes ni preparar otro retrato bajo su identidad. No existe `art/06-07.png`. Las 79 fichas conservadas sí tienen ilustración completa.

`generacion.json`, `prompts-arte.json` y `art/manifest.json` documentan resultado, referencias y hashes. No quedan dependencias de rutas temporales en los datos de propuesta.

## Validación y publicación

[3.559 pruebas](qa/final-tests.log): estadísticas, invariantes públicos, 260 identidades previas con sus mismas frases, efectos y doctrinas, combate real en ambos lados, las cuatro acciones, pasivas y contrarrestos. [Navegador](qa/browser.json): 339 reservados, 339 retratos y cero pendientes; galerías, fuentes, filtros y anchuras 320/393/768/1200. Las láminas `qa/contact-*.jpg` son únicamente material de revisión interna.

Todo permanece en `_dev`, excluido de Pages y del catálogo jugable. No se modifica versión, changelog, términos legales ni etiqueta pública. Los nuevos perfiles y el arte siguen la metodología editorial existente; cualquier activación futura sigue requiriendo la revisión de publicación completa.
