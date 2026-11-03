# Ataques de solo ida · Corrección de v31.0.2.12

El desplazamiento tiene solo dos fotogramas clave: origen y destino. La escala se aplica a un elemento interior, con crecimiento al 120 % en la mitad y vuelta al tamaño original al llegar. La opacidad utiliza una animación independiente. Las tres comparten los 1.500 ms existentes.

El punto final coincide con el centro del orador enemigo seleccionado. El ancho del texto se adapta a la distancia de ambos extremos a los laterales de la pantalla, conservando visibles las palabras durante el crecimiento. Las animaciones ejecutan una iteración en dirección normal; el desplazamiento conserva el destino hasta la retirada del nodo.

## Verificación

- 36 casos: móvil de 320 × 568 y 393 × 851 y horizontal de 844 × 390; ataque normal y fuerte; ambas perspectivas; origen y destino en distintas columnas.
- 61 muestras por caso: la distancia al destino disminuye continuamente, sin ningún tramo de vuelta; el centro final coincide con el del cromo elegido con menos de un píxel de diferencia.
- Una sola iteración normal, duración de 1.500 ms, escala interior de 1 → 1,2 → 1, texto dentro de la pantalla y opacidad cero al terminar.
- Reproducción natural: duración entre 1,4 y 1,8 segundos y controles liberados antes de 800 ms.
- 48 configuraciones del selector y 17 flujos de combate, incluidos apoyos, movimiento reducido, respuestas encadenadas y finales online/descargados. [Resultado](full/browser.json).
- 165 pruebas unitarias. [Registro](tests.log).
- Actualización PWA desde `df40a0d`: caché `hemiciclo-v31.0.2.12-ida5`, 227 recursos, progreso conservado y recursos nuevos disponibles sin conexión. [Resultado](pwa/pwa.json).

[Coordenadas y tiempos medidos](browser.json). [Script del recorrido](../../checks/frases-solo-ida-v12.cjs).

![Frase de ataque durante su recorrido hacia el orador elegido](one-way-normal.png)

Se mantiene v31.0.2.12 y su etiqueta. No cambian reglas, daño, reloj, inventario ni premios; no requiere SQL.
