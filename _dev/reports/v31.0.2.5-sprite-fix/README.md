# v31.0.2.5 — Sprites, lectura y marco de navegación

Corrección acumulada del 28 de octubre de 2026. Sin migración SQL ni cambios del servidor.

## Cambios

- Los doce oradores utilizan piernas con una malla continua y rodillas curvadas, en lugar de recortes rectangulares independientes. Manos y chaqueta permanecen en el torso; se limpian fragmentos desconectados y sombras residuales del atlas al preparar los sprites. La caminata se suaviza al arrancar y detenerse.
- Las poses comparten un anclaje en las piernas. La transición de 180 ms se compone fuera de pantalla para conservar la opacidad del cuerpo compartido.
- El personaje y su frase completa permanecen 900 ms después de terminar el texto, antes de iniciar la salida.
- La barra inferior es siempre el contenedor de posicionamiento de su resaltado. Antes solo lo era en las vistas con Senado: en resultados y sobres, el marco podía terminar sobre la cabecera.
- Caché `hemiciclo-v31.0.2.5-sprites1`; versión visible y notas anteriores conservadas.

## Comprobaciones

- Revisión visual sobre blanco de los doce personajes: `before-white-*.png` y `after-white-*.png`, con reposo, habla y ambas fases extremas de caminata.
- 288 fotogramas de caminata, 24 por personaje, en `cycle-*.png`. Ningún componente desconectado supera 8 píxeles de origen con alfa ≥100. Es un umbral de detección de fragmentos, no una afirmación de igualdad píxel a píxel.
- La malla en reposo conserva la silueta original: pérdida de píxeles opacos inferior al 0,25 %, tolerando el suavizado de bordes.
- Mezclas al 25 %, 50 % y 75 %: más de 17.000 píxeles interiores comunes por personaje; ninguno cae por debajo de alfa 230. La comprobación exige una intersección real y detectaría la transparencia de componer ambas poses directamente sobre el fondo.
- Las 36 frases conservan el texto completo durante 900 ms y ocultan el bocadillo al comenzar la salida.
- Inicio, sobre cerrado, sobre abierto, resultados y ayuda en 320×568, 393×851 y 844×390, con texto al 116 %. Una sonda absoluta comprueba el contenedor real del marco; no se observan desbordamientos horizontales ni errores JavaScript. Guardado sin cambios.
- Gestos táctiles nativos y ratón: ambas direcciones, extremos, formularios, listas horizontales, ventanas, cancelaciones y movimiento reducido; fondo y perfil conservados.
- Tutoriales completos de menú y combate; incorporación independiente de Mercado conservada.
- Actualización desde `ee67361`: 128 recursos precargados, sustitución de caché, arranque sin conexión, perfil, Liga y preferencias de audio conservados.
- 11 pruebas unitarias de escena, navegación y changelog; comprobación de escala de texto, precarga y diferencias sin errores.

Resultados detallados: `diagnostic.json` y `verification.json`. La medición local de 120 envíos de dibujo dio una mediana de 0,4 ms y percentil 95 de 0,7 ms en Chromium del entorno; no mide la presentación final ni representa el rendimiento de un móvil físico.

## Reproducción

Con el servidor estático en el puerto 8055, sirviendo `/workspace`, y Playwright disponible mediante `NODE_PATH`:

```sh
node --test tests/menu-senate.test.cjs tests/menu-navigation.test.cjs tests/changelog.test.cjs
node _dev/checks/v31.0.2.5-sprite-white.cjs
node _dev/checks/v31.0.2.5-sprite-fix.cjs
node _dev/checks/v31.0.2.5-sprite-swipe.cjs
node _dev/checks/v31.0.2.5-sprite-guides.cjs
node _dev/checks/v31.0.2.5-sprite-pwa.cjs
python _dev/scale-ui-text.py --check
node _dev/build-offline.cjs --check
```

Se sube la corrección sin esperar ni consultar el despliegue de Pages, por petición de Dooms.
