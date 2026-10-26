# v31.0.2.3 — Cierre de revisión leve

Corrección acumulativa posterior a dda8ab5. No requiere SQL ni reinicia cuentas, inventario, FS, Elo, Liga o temporada. El changelog anterior se conserva.

## Correcciones finales

Mercado conserva el foco tras reconstruir filtros y botones de cantidad, y mantiene el desplazamiento interno. Si un control de cantidad se desactiva al llegar al límite, el foco pasa al control contrario disponible. Las pestañas responden a izquierda/derecha (con vuelta), Inicio y Fin. Se refuerza el foco visible de Mercado, Opciones y prácticas. Las gemas dejan de animarse con movimiento reducido.

## Estado de las recomendaciones del informe

| Área | Entrega y estado |
| --- | --- |
| Fiabilidad D1–D4 | Corregida en la primera revisión; actualización atómica, preparaciones compatibles, cola recuperable y cierre de Nube. Ver informe base. |
| Perfil pequeño D5 | Corregido; desplazamiento interno y cierre accesible. |
| Aprendizaje de acciones | Réplica y Receso gratuitas si faltan; tres ejercicios tácticos cortos, repetibles y sin alterar la economía. |
| Lectura táctica | Estados consultables, fuente e iconos propios, duración legible, efectos secuenciados y sorteo visible. |
| Colección preparada | Filtro de país, tipos, copias de acciones y catálogo extraído con validación, conservando IDs y estadísticas. |
| Arte y peso | Encuadre y tratamiento CSS de retratos uniformes; escenas de resultado un 47 % más ligeras y reutilización de medios en PWA. No es una sustitución de las ilustraciones. |
| Accesibilidad leve | Texto 100–116 %, Opciones agrupadas, navegación inferior adaptable, foco y teclado de Mercado, movimiento reducido. |
| Mantenimiento | Catálogo compartido por app/herramientas, módulos de Mercado y prácticas separados; no se declara una reescritura completa del HTML. |

## Comprobaciones de esta revisión

593 pruebas automatizadas correctas. Chromium: 320×568, 393×851, 844×390, lectura al 116 %, Opciones, venta/compra por tipo, ampliación y cierre, teclado de pestañas con vuelta, foco al alcanzar el máximo de cantidad y conservación del scroll. Los tres retos se completan mediante sus controles reales (4, 5 y 7 pasos), sin cambiar el perfil económico. Se comprueban sorteo canónico, estados SVG y ausencia de animación de gemas con movimiento reducido.

PWA desde dda8ab5: sustitución de la caché polish1 por polish2, 113 recursos completos, arranque offline y preservación de progreso/Liga/audio. Motor offline comprobado sin cambios de reglas. Las ofertas remotas se simulan; no se ejecutan compras reales.

## Seguimientos que permanecen abiertos

- Balance: muestras humanas y decisiones posteriores; las simulaciones no prueban equilibrio de todas las combinaciones.
- Producción: medir capacidad y latencias antes de ampliar audiencia. Render/Supabase no accesibles directamente desde este entorno.
- Cuenta Gmail: reintento del jugador, pendiente por acuerdo con Dooms; no se aprueban migraciones reales automáticamente.
- Expansión del catálogo, campaña extensa y renovación completa de arte: desarrollo futuro, sin incorporarlos implícitamente a una corrección leve ni alterar el criterio de lanzamiento.

Referencias: informe base `../v31.0.2.3/README.md`, supervisión `../v31.0.2.3-operations/README.md`, prioridades medias `../v31.0.2.3-medium/README.md`, copias de acciones `../v31.0.2.3-action-copies/README.md` y legibilidad/aprendizaje `../v31.0.2.3-polish/README.md`.
