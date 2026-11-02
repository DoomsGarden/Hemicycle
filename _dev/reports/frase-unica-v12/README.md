# Una sola frase · Corrección de v31.0.2.12

El texto fijo era la fase final de la propia frase: su movimiento terminaba a los 560 ms, pero el elemento permanecía visible hasta completar la lectura. En defensa y curación quedaba cerca de TdP; en los ataques, en el campo rival.

La reproducción comprobó que solo había una copia visible, cuya animación ya constaba como `finished`. Ahora el movimiento ocupa todo el tiempo de lectura (1.500 ms para las frases actuales) y después se desvanece. No hay una pausa fija al llegar. Las intervenciones encadenadas respetan ese recorrido completo. El bloqueo de controles y las reglas no cambian.

Verificación:

- 16 casos: defensa, curación, ataque normal y fuerte; ambas perspectivas; movimiento normal y reducido.
- Una sola copia visible en cada caso. En movimiento normal continúa desplazándose entre las muestras de 650 y 850 ms, con la mesa ya interactiva; al terminar no queda texto residual.
- Movimiento reducido: un único texto estático accesible, sin copia animada adicional.
- 165 pruebas unitarias. [Registro](tests.log).
- Actualización PWA desde `94e0a64`: caché `hemiciclo-v31.0.2.12-frase3`, 227 recursos, progreso conservado y nueva presentación disponible sin conexión. [Resultado](pwa/pwa.json).

[Mediciones](browser.json), [reproducción anterior](before.log) y [script de navegador](../../checks/frase-unica-v12.cjs).

![Una sola frase de defensa en movimiento](guard-moving.png)

Se mantiene v31.0.2.12 y su etiqueta. Sin SQL ni cambios de servidor, premios, inventario o reloj.
