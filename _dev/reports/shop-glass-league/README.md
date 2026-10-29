# Paneles al 70 % y cabecera de Liga — corrección de v31.0.2.8

Los paneles de sobres gratuitos y de pago usan fondos con alfa 0,7. Las filas de cromos del Mercado y sus editores desplegados de compra/venta tienen el mismo nivel de opacidad. Se aplica al fondo: el contenedor, las ilustraciones y los textos conservan opacidad 1. Los controles mantienen sus estados habilitado/deshabilitado.

La clasificación tenía 8 px de relleno por encima de las celdas fijas. Las filas podían dibujarse en esa franja al desplazar la tabla. Se elimina solo ese relleno en el panel de Liga, se separa el modelo de bordes sin añadir separación y se da a las celdas de cabecera una capa propia con fondo opaco. Se conservan el relleno horizontal, el marco y el desplazamiento de la tabla.

## Comprobación visual y funcional

[`shop-glass-league-browser.cjs`](../../checks/shop-glass-league-browser.cjs) reproduce la versión publicada `5dfb9f3` con `--before` y verifica la corrección sin ese argumento. Trabaja con estado local aislado, respuestas de Mercado simuladas y solicitudes externas bloqueadas; no envía compras ni ventas.

| Caso | Evidencia |
|---|---|
| 320×640, 393×851, 768×1024 y 844×390, al 100/116 % | [Antes](before.json) / [después](after.json). Ocho pares de tamaño/escala, sin desbordamiento del documento. |
| Fondos | Gradientes de sobres y editores con alfa 0,7; filas del Mercado con alfa 0,7. Opacidad del panel y su contenido igual a 1. |
| Controles | Selector de cinco sobres actualiza a 2000 FS; abrir/cerrar la selección de compra y venta conserva sus controles en el propio panel. |
| Liga | En siete posiciones por tamaño/escala, el hueco de cabecera pasa de **8 px a 0 px**. El punto situado inmediatamente bajo el marco pertenece a la cabecera fija; su fondo es opaco y no deja pasar las filas. |
| Guardado | Perfil y temporada permanecen idénticos al recorrer las pantallas. |
| PWA | [Actualización desde 5dfb9f3](pwa/pwa.json): 155 recursos, caché `hemiciclo-v31.0.2.8-glass1`, recursos nuevos precargados, acceso sin conexión y progreso conservado. |

Ejemplos: [Tienda](shop-100.png), [Mercado](market-100.png), [Liga desplazada al 116 %](league-116.png), [Liga anterior](before-league-116.png).

Se comprueba también la generación reproducible del motor offline y de los documentos legales. No se modifican reglas de juego, compras, inventarios, tablas de datos, premios, Elo ni SQL; no se vuelve a ejecutar la suite de combate por estos cambios de presentación. Se publican `main` y `codex/online-actions-foundation` sin mover la etiqueta original de v31.0.2.8. No se espera ni se comprueba el despliegue de Pages.
