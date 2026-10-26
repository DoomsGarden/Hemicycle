# v31.0.2.3 — Colección plegable

Los favoritos muestran inicialmente sus cinco números con el estado gris/verde. El botón a la derecha despliega los cinco integrantes y dos acciones. Tocar un número inicia la edición y abre sus controles; plegar no descarta el borrador. Los filtros de búsqueda, país, rareza y doctrina comienzan ocultos y conservan sus valores al plegar, con aviso de filtros activos. Ambas vistas de Colección comparten el funcionamiento. No se alteran los selectores prepartida ni las reglas.

Botones metálicos con chevrón, foco visible y aria-expanded/aria-controls. A 320 px el botón de gabinete conserva el chevrón y el nombre accesible. La guía explica los desplegables sin añadir pasos y mantiene visibles los controles durante la demostración.

## Verificación

- Chromium a 320×568, 393×851 y 844×390, texto 116 %: estados iniciales plegados, expansión/contracción, filtros y resultados conservados, borrador conservado y cancelación sin cambios en el perfil; selector prepartida intacto; sin errores de página.
- Guías generales de menú y combate completas, sin cambios económicos.
- Pruebas de gabinetes y accesibilidad correctas (ver tests.log).
- PWA desde b267ca8: 113 recursos, reemplazo de caché, arranque offline y conservación de progreso/Liga/audio.
- Build offline y diff comprobados. No requiere SQL ni reinicia datos.

Las pruebas se realizaron en navegador local, sin operaciones económicas o acceso a cuentas de producción.
