# v31.0.2.3 — Estados compactos y envoltorios vectoriales

## Cambios

Los estados de los oradores en mesa usan iconos propios: cruz verde con prohibición para la recuperación de curación, Z con flecha y brillo radial para el apoyo temporal de Zasca, escudo para defensa. Se sitúan en una fila bajo coste, líder y rareza con un mínimo de separación vertical. La recuperación parpadea lentamente; las dos animaciones se detienen con movimiento reducido. Tocar los iconos conserva la explicación de estado y duración. El marcador de intervención utilizada pasa de texto a una pequeña confirmación visual separada. No aparece en cartas de la mano.

Desafíos usa la misma fila compacta de Logros: barra y valor a la izquierda, recompensa a la derecha. No cambian las cabeceras, los sobres ni su progreso. Se conserva el mecanismo de scroll y reclamación existente.

Los seis envoltorios incorporan título y rareza como trazados SVG del tipo Anton incluido (OFL), sin texto HTML ni dependencia de fuentes al renderizar. Los trazados se limitan al área imprimible y quedan debajo del retrato. No cambian retratos semanales, rarezas, probabilidades ni apertura. `_dev/build-pack-lettering.py` reproduce los trazados con fontTools a partir de la fuente incluida.

## Verificación

- Chromium, texto al 116 %, 320×568, 320×640, 393×851 y 844×390: iconos separados entre sí y de coste/rareza/líder, consulta por puntero, desaparición al caducar, animaciones activas/estáticas según movimiento reducido y controles de combate accesibles.
- Instantánea online canónica con defensa, apoyo y recuperación; no cambia el motor ni los plazos. Ambas escenas de resultado decodifican y respetan la verificación.
- Logros y desafíos en los cuatro tamaños con barra/botón en la misma fila; sobres presentes. Los seis SVG cargan y contienen trazados sin elementos text. Capturas en esta carpeta.
- 593 pruebas automatizadas correctas: regresión de objetivos, premios únicos, sobres, estados y manos recicladas. Ver registros adjuntos.
- Actualización PWA desde 1b27b1e: 113 recursos, precache de los envoltorios nuevos, progreso/Liga/audio preservados y navegación offline.
- Build offline y diff comprobados. No requiere SQL ni reinicio de datos.

Pruebas locales sin entrar en cuentas de producción ni reclamar premios reales. El componente online se comprueba mediante proyecciones canónicas del motor, no mediante una partida contra una persona en producción.
