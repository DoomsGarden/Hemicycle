# Fuentes de los oradores y aclaración editorial

29-10-2026. Preparado sobre v31.0.2.6, commit f088e40. La página y los documentos están listos; antes de publicar en main se necesita registrar la versión documental 2026-10-29.2 en Supabase mediante el SQL aditivo incluido. No se ha ejecutado contra producción.

## Qué se incluye

- Página pública `fuentes/`, con identidad visual de Hemiciclo, 120 fichas desplegables y las 360 frases del catálogo actual. No es una tabla. Búsqueda por orador, frase o dominio; filtros de traducción, adaptación y referencia parcial; enlaces directos por identificador de orador. Consulta básica sin JavaScript ni cuenta.
- Se muestran 336 fragmentos documentados, 23 traducciones y una adaptación de nombre por cargo. Para Aznar se distingue «Váyase, señor presidente» de la referencia «Váyase, señor González». No se han cambiado las frases del juego, reglas ni estadísticas.
- Las fuentes son las 154 URLs del registro actual, no una mezcla de todos los documentos de propuestas antiguas. Las fichas explican el tratamiento, original cuando difiere, alcance y fecha de la comprobación registrada. El enlace en Información legal → Fuentes y créditos funciona desde el juego y desde legal/; abre otra pestaña para conservar una aceptación en curso.
- Se explican el contexto ficticio de los combates, la finalidad de entretenimiento y las ilustraciones realistas generadas mediante IA según declaración del creador. Las referencias de frases no se presentan como fuentes de imágenes ni como autorizaciones. No se afirma que todas las frases sean adaptadas, ni que no contengan ninguna referencia a terceros.

## Verificación y límites

El enlace de ChatGPT compartido por Dooms (`6ae33f6b-1628-83eb-b594-5c97b56c6374`) no pudo abrirse: la política de red del entorno bloquea chatgpt.com con HTTP 403 en CONNECT. No se ha leído ese historial ni se han inventado referencias procedentes de él. El chat de creación no se publica ni se presenta como prueba de una declaración histórica. La procedencia por IA se atribuye a la declaración de Dooms, sin inferir datos de entrenamiento, autorización de imagen o trazabilidad individual que no estén documentados.

El registro inicial es del 22-10-2026, cotejado con las 360 frases actuales. Se hicieron comprobaciones puntuales nuevas:

- RTVE / Feijóo: expresión localizada en la página enlazada.
- EFE / Sánchez: «Como un cohete» localizado en párrafos de la noticia. Se actualiza su anotación, que antes solo tenía un fragmento de buscador.
- laSexta / Aznar: referencia original localizada en párrafos y titular, normalizando puntuación y mayúsculas. La primera búsqueda de cadena exacta no la encontraba por la coma; `paragraph-checks.json` documenta la comprobación posterior.
- VOX / Abascal: acceso HTTP 403; no se certifica una lectura actual.

Quedan **cinco frases** apoyadas solo en titular o fragmento indexado del registro previo, identificadas como referencias parciales: Macron (normal), Milei (normal y apoyo), Erdoğan (normal) y Abascal (fuerte). No se ha revalidado todo el conjunto de 154 enlaces ni todas las grabaciones primarias. Citar la fuente y describir el arte como IA no sustituye la revisión de derechos de imagen o de contenidos. No se ofrece una garantía de protección jurídica.

## Versión legal y activación

`legal/documents.json` y su derivado `js/legal-documents.js` pasan de 2026-10-29.1 a **2026-10-29.2**. SHA-256: `13fb255ccbbebd0c18595f37be4a39c438626631a0c0dd1485ea21fa82c5798e`.

El servidor solo acepta recibos para versiones/hashes registrados en `hemicycle_legal_documents`; por eso el responsable debe ejecutar `_dev/legal/20261029_sources_release.sql` en el SQL Editor de Supabase antes de publicar los archivos en main. El entorno no dispone de una conexión autenticada a su Supabase. El script solo inserta la nueva versión, es repetible y rechaza reutilizar su número con otro hash. Conserva las versiones y aceptaciones anteriores y no toca partidas, usuarios, Elo ni inventarios. No requiere nuevas tablas, claves o variables.

Después de registrarlo, publicar esta rama en main como corrección de v31.0.2.6. La nueva aceptación aparecerá al entrar por la comparación de versión y hash ya existente, sin casilla premarcada. Un fallo de sincronización no convierte el aviso en pérdida de progreso; conserva la elección local para reintentar.

## Pruebas

- Suite completa: 623 pruebas correctas. Tras la actualización puntual de la referencia EFE, se repiten las seis pruebas de catálogo y fuentes: correctas.
- Navegador: 120 fichas, 360 frases, filtros 23/1/5, búsqueda con tildes normalizadas, restauración, referencias originales, enlaces profundos, enlace legal y tres tamaños (320×568, 393×851, 844×390) al 116 %. Sin errores de página. Consulta sin JavaScript comprobada.
- PWA: actualización desde f088e40 / caché v31.0.2.6 a caché v31.0.2.6-sources1. Se vuelve a solicitar aceptación sin premarcar; 146 URLs preparadas; fuentes, documentos legales y licencias funcionan offline sin reemplazar el documento principal. Partida, Liga y caché ajena preservadas.
- SQL aislado con PGlite: versión inicial conservada, script nuevo repetido sin duplicar y hash actual correcto.
- Generadores legal/fuentes y escala tipográfica correctos; validadores históricos intactos.

Reproducir: `node _dev/legal/build-sources.cjs --check`; `node _dev/legal/build.cjs --check`; suite Node habitual; `node _dev/checks/orator-sources.cjs`; `node _dev/checks/orator-sources-pwa.cjs`. Playwright y Chromium local, servidor en 8055. La comprobación del chat no puede reproducirse como lectura del contenido mientras el host siga bloqueado.
