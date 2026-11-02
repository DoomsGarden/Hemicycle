# Lectura de frases · Corrección de v31.0.2.12

La corrección anterior redujo el recorrido a 300–380 ms y retiraba la frase a los 520 ms; con movimiento reducido podía durar solo 200 ms. Además, la siguiente frase eliminaba la anterior. El tiempo era insuficiente para leer.

El recorrido dura ahora 560 ms, con aceleración suave y el crecimiento existente al 120 % en su mitad. Una frase individual permanece 1,5 segundos antes de desaparecer suavemente durante otros 160 ms. El modo de movimiento reducido conserva el tiempo de lectura y presenta el texto estático. El cálculo permite más tiempo para textos extensos.

Las frases tienen una cola de presentación independiente de Aguante, retirada y disponibilidad de controles. Una intervención posterior espera su turno de texto y conserva al menos 1,2 segundos de lectura de la anterior. No se superponen ni se cortan. La espera completa se usa para la escena final; la IA y los controles conservan la espera corta de la jugada. No cambian el reloj, reglas, estadísticas, inventario ni premios.

## Verificación

- 24 combinaciones: ataque normal/fuerte, defensa/curación; pantallas de 320 × 568, 393 × 851 y 844 × 390; movimiento normal/reducido, cubriendo ambas perspectivas.
- A los 1.000 ms, la frase sigue visible y opaca dentro de la pantalla y la mesa ya permite interacción. Desde la perspectiva propia se envía una jugada válida durante ese tiempo de lectura.
- Cadena rápida de ataque, defensa y curación: texto en el orden correcto, una sola frase a la vez y duración mínima respetada. La espera de los controles termina antes que la cola de lectura.
- Finales online y descargado: esperan a la última frase. Ocultar la página retira el texto y libera las esperas.
- 48 configuraciones de selector en seis temas y 17 flujos de combate con respuestas encadenadas y ambos modos de movimiento. [Resultado](full/browser.json).
- 165 pruebas unitarias de combate, apoyos, orden de presentación, tiempos de lectura y resultados. [Registro](tests.log).
- Actualización PWA desde `88e1f9c`, 227 recursos, progreso y preferencias conservados, recursos y código nuevos disponibles sin conexión. [Resultado](pwa/pwa.json).

[Mediciones de lectura e interacción](browser.json). Scripts: [lectura](../../checks/frases-lectura-v12.cjs), [flujos completos](../../checks/frases-lectura-v12-full.cjs), [PWA](../../checks/frases-lectura-v12-pwa.cjs).

![La frase continúa visible después de liberar los controles](readable-after-unlock.png)

Se mantiene v31.0.2.12. Revisión de recursos y caché `hemiciclo-v31.0.2.12-lectura2`. Sin SQL ni cambios de servidor. Las pruebas usan datos locales de demostración y bloquean conexiones a servicios de jugadores.
