# v31.0.2.4 — Mercado con desplegables junto al cromo

Elegir abre la cantidad y el destino de venta inmediatamente debajo del cromo. Comprar despliega cantidad, vendedor, precio total y revisión en la misma oferta. Solo se mantiene un panel abierto por sección; abrirlo anima su altura durante 240 ms y desplaza la lista únicamente si necesita espacio. Cerrar devuelve el foco al botón de esa fila. El movimiento reducido evita la animación.

Comprar mantiene el presupuesto y la validación del servidor antes del pago. Editar la cantidad o actualizar un precio/stock invalida el tick; un presupuesto distinto se rechaza y actualiza la oferta sin comprar. Vender mantiene su confirmación final. Se actualiza la guía sin añadir pasos y se conserva el historial del changelog.

## Comprobaciones

- 26 pruebas de Mercado, servidor de Mercado y changelog: correctas (`tests.log`).
- Navegador Chromium a 320×640, 393×851 y 844×390 con texto al 116 %: ambos desplegables debajo de la fila, desplazamiento y foco conservados, un panel abierto, cantidades/totales, revisión obligatoria, rechazo de presupuesto distinto, compra y venta simuladas, cromos de acción, movimiento reducido y ausencia de errores JS (`browser.json`, `browser.log`).
- PWA: actualización desde bf4f37a, 113 recursos precargados, sustitución de caché, acceso sin conexión y conservación del perfil, Liga y audio; cuatro pestañas a tres anchos (`pwa.log`, `pwa/pwa.json`).
- Escalado de texto, motor offline generado y `git diff --check`: correctos.

Las transacciones del navegador usan respuestas locales controladas; no se realizaron compras ni ventas en producción. No se cambia SQL, reglas ni saldos. Capturas: `sell-open.png` y `buy-open.png`.
