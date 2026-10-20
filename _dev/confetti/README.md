# Confeti de los cromos

- `original.txt` conserva sin ejecutar el código aportado por el autor del juego,
  incluidos los envoltorios de su entorno de origen.
- `index.html` es el calibrador local adaptado, sin servicios externos ni acceso
  al almacenamiento del juego. Permite cargar una imagen o un vídeo local,
  ajustar partículas, copiar la configuración y grabar un ciclo.
- `../../js/card-confetti.js` es el generador compartido con el juego.
  El ajuste `CardConfetti.TRUMP` es el mismo en ambos sitios.

Para abrirlo, sirve la raíz del repositorio con
`python3 -m http.server 8015 --bind 127.0.0.1` y visita
`http://127.0.0.1:8015/_dev/confetti/`.

El directorio `_dev` está excluido de GitHub Pages mediante `_config.yml`.
No hay enlaces al calibrador en el juego ni se incluye en la caché de la PWA.
El repositorio público sigue permitiendo leer los archivos de desarrollo.

El movimiento del confeti depende del tiempo absoluto transcurrido, en
milisegundos. No se debe pasar el tiempo del recorrido de ida y vuelta del
retrato. Las partículas caen con velocidad vertical positiva y reaparecen
por arriba cuando ya han salido del lienzo por abajo.

Las unidades se adaptan al tamaño del lienzo; `speed` multiplica la velocidad,
`size` el tamaño y `drift` la deriva lateral. `loopSeconds` controla el ciclo
de partículas, independiente del ciclo del rostro. Para otra carta se puede
usar `CardConfetti.create({...CardConfetti.TRUMP, count:70, seed:12345})`.
La paleta opcional contiene ternas de colores hexadecimales para luz, base
y sombra. El generador no controla cartas, logros, recursos ni recompensas.
