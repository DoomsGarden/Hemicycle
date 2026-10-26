# v31.0.2.3 — Legibilidad, Mercado y aprendizaje

Corrección acumulativa de la misma versión, sin migración SQL ni reinicio de progreso.

## Cambios

Texto configurable entre 100 y 116 %, navegación inferior con etiquetas gradualmente ocultas e iconos accesibles, Opciones agrupadas, fuente local e iconos SVG para apoyos. Sorteo visual basado en el resultado real y consulta persistente; no modifica azar ni reloj.

Mercado separa oradores y acciones en compra/venta, muestra miniaturas completas, permite ampliar y distingue Elegir de Comprar. Tres prácticas locales de 4, 5 y 7 pasos usan el motor real sin premios ni cambios económicos. Las guías existentes conservan su longitud. Catálogo compartido validado, con los mismos 120 oradores y estadísticas; tratamiento CSS uniforme de retratos.

## Comprobaciones

- 593 pruebas automatizadas correctas.
- Chromium real: 320×568, 393×851 y 844×390; Mercado, Opciones al 116 %, ampliación, filtros y los 16 pasos prácticos completos.
- Combate al 116 %: 320×568, 320×640, 393×851 y 844×390; selección real con puntero, estados y resultados.
- Tutoriales generales y de combate completos; progreso económico conservado.
- Actualización PWA desde 1eb3379, reemplazo de caché, 113 recursos precargados y navegación offline con progreso conservado.
- Bundle offline comprobado sin cambios de reglas.

## Límites

Las ofertas remotas de Mercado se simularon en navegador: no se efectuaron operaciones económicas de producción. Render y Supabase no se probaron directamente en producción desde este entorno. La incidencia del jugador Gmail sigue pendiente de su prueba personal. El equilibrio con personas y la capacidad bajo carga siguen requiriendo observación. El tratamiento de retratos es CSS; no se han repintado las ilustraciones. Los retos guardan su finalización localmente, sin recompensas de cuenta.
