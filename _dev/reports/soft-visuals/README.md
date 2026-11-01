# Tapetes completos, paleta suave y sexta tipografía

## Cambios

- Los seis tapetes se adaptan en nueve zonas: esquinas con proporción estable, bordes completos y centro flexible. Se eliminan el recorte por cover y el aumento adicional del rival. Se conserva la orientación de 180° del rival, la coloración de bancada para los cuatro diseños adaptables y los colores originales de Jardín/Gatitos.
- Los indicadores siguen en su propia capa opaca y pulsable, con sombra y fondo. Los cristales TdP mantienen su forma, color y contraste. Las cartas no jugables conservan su opacidad.
- Jardín del consenso cambia la luna por un emblema botánico de hojas y flor. Arte generado a partir del reverso anterior; empaquetado WebP sin recorte. Gatitos conserva su luna.
- Archivo holográfico cambia a azul acero, con menos cian, brillo decorativo y saturación en marco, controles, títulos y emblema. Dimensiones del marco: 1254 × 1254; centro transparente. La fracción de píxeles clasificados como cian luminoso baja aproximadamente un 61 % (`frame-palette.json`); esta medida describe el recurso, no una evaluación médica.
- Los tiers azul, morado y dorado reducen saturación e intensidad; mantienen su identidad. La paleta bronce conserva sus valores.
- Sexta tipografía **Gatitos**: Delius, trazo redondeado, independiente del menú y guardada en el dispositivo. Fuente oficial de Google Fonts, sin modificaciones, con licencia SIL OFL incluida en `fonts/Delius-OFL.txt`. Los textos largos, fuentes documentales, changelog, legales, frases de combate e Iniciar conservan sus excepciones.

## Comprobaciones

`indicators.json`: 48 escenarios (6 tapetes × 4 tamaños × texto 100/116 %), letra Gatitos e iconos al 116 %, ambos lados, orientación rival, iconos opacos y dentro del tablero, áreas de consulta pulsables, cristales, estados activos/inactivos, orador usado y mano sin transparencia. Se usa el frontend real con un combate local de prueba y HTTPS bloqueado.

`ui.json`: 36 escenarios (6 menús × 3 tamaños × texto 100/116 %), sexta letra, persistencia, opciones sin nuevo scroll, botones de selección completos y excepciones de lectura. Capturas de menú, reverso y tiers.

`tests.log`: 24 pruebas de presentación, respaldos, XP y preferencias. `pwa/pwa.json`: actualización desde 42f7312, 221 recursos, reemplazo del arte antiguo comprobado por SHA-256, nueva letra y arte sin conexión, progreso y preferencias conservados.

## Publicación

Se mantiene v31.0.2.11; caché `hemiciclo-v31.0.2.11-soft11`. Las URLs de las dos imágenes cambiadas llevan revisión propia y se descargan durante la instalación de la actualización. No hay SQL, cambios de reglas ni modificaciones de recursos del jugador.
