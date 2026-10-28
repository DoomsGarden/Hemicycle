# Rótulo del menú — 2026-10-28

`menu-title.png` es arte original generado con image_gen para Hemicycle: «Toma» y «la palabra» en dos filas, con caras marfil y doradas, biseles y extrusión azul oscuro. La referencia aportada por el usuario se usó para explicar el volumen de las letras; no se incorporan sus símbolos, escudo, cinta ni logotipo.

`NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/build-senate-title.cjs` compone el halo blanco/dorado en sentido horario, aplica el desvanecimiento radial, superior y lateral y exporta `assets/menu-senate/title-loop.webp` y `title-still.webp`. Requiere Playwright, Chromium y ffmpeg; no se ejecuta durante la partida.

El título y el abanico comparten una sola animación CSS. Las ventanas, la aplicación oculta y el movimiento reducido seleccionan la variante estática. Su ancho queda limitado al 68 % de la pantalla y su borde inferior es transparente para mantener el brillo fuera de los cromos.
