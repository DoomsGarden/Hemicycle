# Corrección de arte y avisos · v32.0.0.2

Se preparan retratos individuales de proporción 3:4 y la recuperación de los avisos de recompensas. La generación, revisión visual y publicación del conjunto se registran en `_dev/revisions/20261107-hotfix/individual-portraits.json`; los estados pendientes no equivalen a arte publicado. Los cuatro reemplazos de retratos originales se registran por separado.

La corrección no añade proveedores, pagos reales ni categorías de datos personales. Los retratos siguen siendo ilustraciones generadas mediante IA, con referencias visuales documentadas y sin presentar autorizaciones o afiliaciones que no constan.

Se ha detectado una cifra obsoleta en los créditos legales: «360 frases utilizadas por el catálogo actual». Se elimina únicamente esa cifra para remitir al catálogo vigente sin fijar un total que pueda volver a quedar desfasado. Los restantes textos se conservan.

Aunque el cambio es editorial, el contenido aceptado tiene una huella completa. Por ello se prepara la edición documental `2026-11-07.1`, sin sobrescribir la edición anterior ni sus recibos. Antes de publicar el cliente, registrar `_dev/legal/20261107_art_correction_release.sql` en Supabase. El SQL es idempotente, conserva las ediciones anteriores y se ha probado dos veces sobre la infraestructura legal existente. La versión visible del juego sigue siendo **v32.0.0.2**.

El usuario confirmó «Success» al aplicar el SQL en Supabase el 7 de noviembre de 2026. Las ilustraciones pendientes siguen sin considerarse terminadas ni publicadas.

El usuario ha aprobado conservar provisionalmente sólo el arte anterior de Renaud Muselier con el encuadre mostrado y ha autorizado la publicación. El resto de la ampliación incluye 778 retratos individuales nuevos; también se sustituyen cuatro retratos de la colección original que compartían lámina. La excepción y su prueba de aislamiento quedan documentadas por separado de las nuevas generaciones.
