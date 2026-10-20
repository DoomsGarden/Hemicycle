# Reconstrucción del gesto original (material privado en Pages)

Referencia: animación completa conservada en `5a3a785:cards/donald-trump-golden.webp`. Se excluye la apertura sin retrato y se leen sus 46 fotogramas útiles, cada uno de 56 ms. Las poses principales se toman de los índices 0, 7, 13, 20, 26, 33, 39 y 45: t = 0, 392, 728, 1.120, 1.456, 1.848, 2.184 y 2.520 ms. Se conserva la sonrisa de boca cerrada, el cierre de ojos y el movimiento vertical de cabeza/hombros. No se usa el fotograma de sonrisa con dientes de v30.2.58.

`clean-motion-keys.png` es la hoja 4×2 de esas poses limpiada con edición de imagen: se retiraron las partículas incorporadas manteniendo el gesto y el encuadre de cada pose. Es una reconstrucción por poses clave, no una copia idéntica de todos los píxeles originales. Cada celda es de 384×512 y se codifica a 420×560. La primera pose se sustituye por el cromo normal reducido, como se solicitó.

Para reproducir el movimiento se crea un concat de las poses con las separaciones originales indicadas arriba (392/336/392/336/392/336/336 ms), usando `option framerate 125` por PNG. Se añade dos veces la última pose, con pausas de 1 s, para proporcionar contexto temporal al interpolador. El filtro FFmpeg es:

```
minterpolate=fps=125:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=none,select='not(mod(n,7))'
```

Con `-fps_mode vfr -frames:v 46` produce una ida con paso de 56 ms. Se construye el ciclo completo con los índices de ida 0…45, vuelta 44…2 y finalmente 0: 90 fotogramas. Se usa el retrato normal en el cierre para hacer idénticos el primer y último fotograma. Se codifica cada PNG con `libwebp -quality 84 -compression_level 5` y se empaqueta con `node _dev/animation/v30.2.60/mux.cjs /directorio/webp`.

Resultado: 90 fotogramas completos a 56 ms, 5.040 ms, 1.215.698 bytes. El reproductor conserva el solapamiento fijo de 100 ms y periodo de 4.940 ms, igual que el motor original. La ida ya no concentra todo el gesto en un segundo entre pausas largas, como ocurría en v30.2.58.

El WebP contiene el movimiento completo de ida y vuelta. El motor no vuelve a invertirlo. Los 46 retratos distintos se decodifican una sola vez y se comparten al volver (unos 41,3 MiB de superficies, más el lienzo y las instancias visibles). `readGoldFrames` verifica la igualdad byte a byte para compartir fotogramas sin riesgo de colisiones de hash. El confeti sigue usando un reloj absoluto independiente y siempre desciende.

Este directorio no se enlaza ni se precarga desde el juego. La modificación de contenido oculto no aparece en las notas públicas.
