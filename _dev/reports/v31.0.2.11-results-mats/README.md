# v31.0.2.11 · Tapetes, hitos y pies de acciones

Clásico y Mármol azul usan nuevas ilustraciones de la propuesta aprobada, tanto en Perfil y su combinación como en las bancadas. Las dos imágenes suman 501.704 bytes y se preparan antes del combate. Los identificadores de selección no cambian; la IA sigue usando Clásico y los jugadores mantienen sus aspectos independientes.

El resultado identifica Tú y Rival y conserva siempre el orden local, sin sufijo votos. El vs queda alineado con los números estáticos. Una derrota por rendición con marcador igualado sigue mostrando su resultado real. El pie de resultados, prácticas, avisos y sobres (incluido Cortar y revelar) utiliza una disposición centrada por fila y el marco/material elegido. La vista horizontal adapta los cromos y controles al espacio disponible.

General conserva todas las claves y premios anteriores. Victorias parlamentarias añade hitos intermedios y mantiene el máximo de 100.000 (21 pasos). Debates disputados se amplía hasta 10.000 (18 pasos). Los hitos nuevos de partidas superiores a 500 siguen el cálculo limitado de victorias; no se cambian los premios antiguos. La lógica nueva es compartida entre cliente y servicio de economía; las reglas históricas descargadas siguen congeladas.

## Comprobaciones

- **2.005 pruebas aprobadas, 0 fallos**. Batería completa: `NODE_PATH=/workspace/.hemicycle-tools/node_modules node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs`.
- `node _dev/build-offline.cjs --check`: motores históricos intactos.
- `hitos-resultados-v11.cjs`: **432 disposiciones** (6 menús × 4 tamaños × 2 escalas de texto × 9 escenarios). Verifica Tú/Rival, ausencia del sufijo, alineación de vs, centrado de cada fila, marco correcto y botones dentro del viewport. Incluye derrota a 3–3 por rendición, sobres pagados, gratuitos, de desafíos, lotes y sin abrir.
- `battle-indicators-v11.cjs`: **48 disposiciones adicionales** con los seis tapetes, cuatro tamaños y dos escalas. Indicadores activos/inactivos opacos, también en oradores usados, pulso sin pérdida de opacidad, TdP disponible/gastado y símbolo idéntico en el coste de apoyo. Comprueba mano opaca atenuada por coste o mesa llena, aspecto normal cuando vuelve a ser jugable, y giro de 180° exclusivo del fondo rival, su zoom independiente del 20 % y el respaldo oscuro de la barra TdP.
- Perfil y mesa comprueban que Clásico/Mármol comparten la misma imagen y que el rival IA conserva su Clásico.
- Prueba de progresión: los hitos anteriores siguen presentes, sus premios y reclamaciones se conservan; los nuevos tramos conceden FS/XP una vez y con límites.
- `hitos-resultados-v11-pwa.cjs`: actualización desde `ea5606e`, **215 recursos**, progreso y selección conservados y funcionamiento sin conexión.

Capturas y `browser.json` muestran estas comprobaciones con datos locales de prueba. La procedencia y los hashes de las dos ilustraciones están en `_dev/design/classic-marble-mats.json`.

Caché: `hemiciclo-v31.0.2.11-mats3`. No requiere ejecutar SQL en Supabase. Sin cambios de Elo, ligas ni reglas de combate. Esta primera colección sigue disponible; los futuros paquetes/pases y desbloqueos se mantienen fuera de esta corrección.

Los estados tienen fondo opaco y un halo independiente de su símbolo. Las cartas se atenúan por filtros sin revelar el tapete a través de ellas. Los cristales dorados de la barra y los costes comparten dibujo y los huecos gastados siguen diferenciados. El giro rival se limita a la capa de fondo y mantiene el separador central.
