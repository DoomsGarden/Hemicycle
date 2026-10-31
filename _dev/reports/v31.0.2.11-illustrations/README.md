# v31.0.2.11 · Ilustraciones, lectura y recompensas

La colección utiliza las artes finales en la galería, la combinación y el combate: seis reversos y doce caras de moneda. Se recrearon individualmente tomando la lámina aprobada como referencia. Los WebP conservan transparencia y detalle; ocupan 2.057.476 bytes en conjunto. El manifiesto y la referencia están en `_dev/design/`. `node _dev/build-cosmetics.cjs` verifica firmas, tamaños y hashes; ya no regenera iconos planos sobre el arte activo. Los SVG anteriores permanecen disponibles para clientes antiguos.

Tipografía es independiente del menú: Del estilo, Clara, Clásica, Editorial y Orbital. Se guarda en las preferencias de lectura de este dispositivo, junto a texto e iconos. La biografía y fuentes documentales del orador, el changelog y los textos legales conservan Hemicycle UI; Iniciar mantiene Impact/Anton y las frases de combate, Senate Dialogue. Las fuentes se preparan antes de aplicar la selección.

El Mercado reserva margen para el bisel y distribuye precio y selección en filas distintas. Las tarjetas de desafíos y logros se compactan con la barra debajo del título y el botón alineado por su borde inferior. Los rellenos verde, gris y amarillo quedan dentro del marco, con margen para FS y XP. El contador se mantiene bajo la barra.

Los desafíos usan su dificultad existente: bronce, azul, morado y oro. Los logros carecen de dificultad formal; el color señala el tramo relativo del hito inicial/intermedio/avanzado/superior. Solo se filtra la capa ornamental; el botón conserva el color de su estado. No cambian hitos, objetivos ni recompensas.

## Verificación

- **2.004 pruebas aprobadas**, 0 fallos: `NODE_PATH=/workspace/.hemicycle-tools/node_modules node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs`.
- `node _dev/build-offline.cjs --check`: motores históricos intactos.
- `cosmetic-illustrations-v11.cjs`: 48 combinaciones de Mercado y recompensas (seis menús, cuatro tamaños, texto 100/116 %), márgenes de marco, separación entre precio y botón, rellenos interiores, alineación compacta y cuatro filtros de dificultad distintos. Cinco fuentes independientes, persistencia, excepciones documentales y marca de entrada.
- Las dieciocho ilustraciones se decodifican con transparencia exterior e interior opaco. Los seis reversos aparecen sin texto en mesa y cada estilo muestra una sola moneda con el arte correcto, manteniendo el sorteo.
- La comprobación rápida adicional captura los logros compactos y comprueba su alineación y el tramo de hito. `layouts.json` conserva las 48 combinaciones; `smoke.json`, la comprobación posterior.
- `cosmetic-illustrations-v11-pwa.cjs`: actualización desde `a905996`, 213 recursos, conservación de progreso y selecciones, carga sin conexión y Mercado en doce disposiciones.

Caché: `hemiciclo-v31.0.2.11-art2`. No requiere SQL ni cambios en Supabase. Los identificadores de las cuatro preferencias visuales de cuenta se conservan.
