# Navegación lateral — añadido leve v31.0.2.5, 2026-10-28

Arrastrar a izquierda o derecha recorre el orden de la barra inferior: Tienda, Cromos, Inicio, Liga y Mercado. No hay retorno circular: los extremos ofrecen una resistencia corta y vuelven a su posición. Los movimientos cortos no navegan. Un gesto vertical sigue desplazando la lista; las filas horizontales, selectores, campos, ventanas y la edición de un gabinete conservan su interacción.

El controlador no transforma ni remonta el Senado. La transición afecta solo al contenido y a la barra inferior: halo deslizante y ajuste suave de posición/tamaño de los iconos, tanto al pulsar como al arrastrar. Se respeta el movimiento reducido. Los arrastres consumidos no producen clics sobre cromos o botones al soltar; una actualización de la pantalla durante el gesto lo cancela. Las pestañas conservan sus nombres y aria-current.

La guía menciona el gesto en su primer paso, más breve y sin añadir pasos. El añadido se acumula en el changelog del mismo parche.

Validación:
- 11 pruebas de unidad de navegación, escena y notas acumuladas.
- Entrada táctil nativa de Chromium mediante CDP: recorrido completo en ambos sentidos, bloqueo de extremos y movimientos cortos.
- Desplazamiento vertical real de Colección y horizontal de filtros, también en su límite. Campos, desplegables y ventanas no navegan accidentalmente. Una edición de gabinete se mantiene hasta guardar o cancelar.
- Actualización en mitad de un arrastre con suelta retrasada: no cambia de menú ni abre el cromo. Arrastre con ratón y perfil conservado.
- Halo e iconos animados y alineados en 320×568, 393×851 y 844×390, con texto ampliado. Sin desbordamiento. Movimiento reducido sin animaciones de entrada.
- El mismo lienzo, rectángulo y reloj del Senado sobreviven a todos los cambios de pestaña.
- Guías completas de menú y combate. Actualización PWA desde 9acf6f9, 128 recursos disponibles sin conexión y conservación de perfil y Liga.

No se modifican reglas, partidas, recompensas ni servicios online. Por petición de Dooms, se sube a main sin esperar ni consultar el despliegue público de Pages.
