# Corrección visual v31.0.2.5 — 2026-10-28

- Salida del orador 180 ms después de terminar su propia frase, en las 36 intervenciones del ciclo; regreso de 3,3 segundos. Se conserva la alternancia de lados.
- 48 recortes medidos sobre los componentes completos del atlas, evitando fragmentos de la fila anterior y pies cortados. Se revisaron las poses de los doce oradores en `all-speakers.png` y varias fases de Puigdemont.
- Público de 32 personajes más pequeños, ordenados por profundidad. El único recorte de cada busto sigue la línea de su mesa; no hay cajas laterales que corten los brazos.
- Rótulo original en dos filas con volumen, WebP animado de 48 fotogramas y halo blanco/dorado que gira hacia la derecha y se desvanece antes de los cromos. Póster estático para pausas y movimiento reducido. Los bocadillos quedan separados del rótulo.
- Panel de Jugar compacto con el mismo fondo oscuro al 50 % que las barras, separado del abanico. Se elimina la línea de catálogo solo en Inicio.

Validación: 606 pruebas automatizadas; comprobación de todos los recortes; navegador Chromium en 320×568, 393×851, 768×1024 y 844×390 con texto al 100 % y al 116 %. Los controles siguen accesibles y no hay desbordamiento horizontal ni cartas cubiertas por el panel. Pausas, sonido, música y perfil conservan su comportamiento. Guías de menú y combate completadas. Actualización PWA desde 6266886, 125 recursos disponibles sin conexión y conservación de perfil y Liga. Los resultados detallados y capturas están en esta carpeta.

Las pruebas online de la batería son locales y simuladas; esta corrección no cambia el servidor ni acredita medidas de latencia en producción.
