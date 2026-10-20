# Material de animación (herramientas excluidas de Pages)

El primer fotograma se obtiene del cromo normal `cards/donald-trump.webp`, reducido a 420 × 560. El último vuelve al mismo fotograma. `smile-source.png` es un fotograma completo generado a partir del retrato de referencia, conservando el encuadre y solicitando sonrisa victoriosa y una ligera elevación coherente de hombros y pecho. No contiene partículas. La hoja de seis imágenes descartada no se usa: cambiaba el encuadre.

Se interpolan los retratos completos; no existe un recorte facial superpuesto. El confeti lo dibuja `js/card-confetti.js`, con su reloj continuo independiente. El archivo WebP también contiene el regreso a la postura original; el reproductor ya no invierte toda la secuencia.

## Reproducción de la codificación

Desde la raíz, crea un directorio temporal con `anchors`, `frames` y `webp`. Convierte con FFmpeg el cromo normal y `smile-source.png` a PNG de 420 × 560. Copia los PNG como `anchors/00.png`…`06.png` en este orden: normal, normal, sonrisa, sonrisa, normal, normal, normal.

```
ffmpeg -framerate 1 -i anchors/%02d.png -vf 'minterpolate=fps=25:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=none' -threads 2 frames/%04d.png
ffmpeg -framerate 25 -i frames/%04d.png -c:v libwebp -quality 84 -compression_level 5 -threads 2 webp/%04d.webp
node _dev/animation/v30.2.58/mux.cjs /ruta/temporal/webp
```

`mux.cjs` conserva fotogramas completos e independientes y combina las pausas idénticas consecutivas. Resultado: 51 fotogramas, 5.040 ms, 780.314 bytes, bucle infinito. En el juego se conserva el solapamiento fijo de 100 ms entre dos pausas neutrales idénticas. El cartel estático coincide exactamente con el primer fotograma codificado. Las diferencias frente al original reducido corresponden a la compresión WebP.

La animación completa requiere aproximadamente 46 MiB de superficies decodificadas en el reproductor; se comparte entre todas las instancias del cromo. Conviene medir dispositivos reales antes de aumentar la resolución o el número de fotogramas.

No enlazar este directorio desde la aplicación ni incluir el contenido oculto en las notas públicas de versión.
