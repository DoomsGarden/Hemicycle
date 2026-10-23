# Música adaptativa de combate · segunda propuesta

Abre `escuchar.html` para escuchar cada pieza y cambiar los votos propios o del rival. El HTML incluye las seis capas Ogg y funciona sin conexión. No modifica el juego ni su versión. Los MP3 `*-demostracion` permiten escuchar los cambios sin usar el reproductor; `GUIA.md` indica los tiempos.

Tres composiciones originales, con 16 compases y dos estados cada una:

- A · Duelo de tribunas: orquesta de aventura en re menor, 4/4, 112 negras por minuto.
- B · La mayoría avanza: marcha luminosa en do mayor, 4/4, 120 negras por minuto.
- C · El pulso de la cámara: impulso orquestal en mi menor, 6/8, 168 corcheas por minuto (56 negras con puntillo).

Desde el primer compás hay melodía, movimiento de cuerdas y percusión. Se utilizan instrumentos sampleados con articulaciones, panorámica, pequeñas variaciones de ataque/velocidad y reverberación de sala; siguen siendo maquetas virtuales, no grabaciones de una orquesta real.

La condición exacta es `Math.max(votosPropios, votosRival) > 50`. A 50 sigue normal; a 51 entra el estado glorioso. Solo se vuelve al normal si ambos están a 50 o menos. Los cambios usan una rampa de 1,5 segundos: la base continúa y se añade o retira una segunda capa sincronizada de metales, cuerdas altas y percusión. No se cambia el tempo ni se reinicia el tema. El estado glorioso no anuncia victoria de ningún jugador.

Los archivos Ogg de base y refuerzo comparten longitud y rejilla. El navegador los decodifica y arranca juntos, con bucle en el mismo instante de AudioContext. Se ha renderizado la vuelta central de tres repeticiones para conservar las colas de los instrumentos al enlazar. Los MP3 completos normal/glorioso son para comparar; los Ogg separados son los candidatos para una integración posterior. La coda final de los resúmenes es ilustrativa y no decide cómo sonarán victoria y derrota.

No se han integrado disparadores, cargadores ni controles en el juego. La integración requerirá la selección del propietario, ajustar volumen bajo los efectos, terminar la música al cerrarse la partida y respetar silencio/segundo plano. El reproductor de prueba se detiene al salir de la pestaña, no reproduce automáticamente y permite controlar el volumen. Las señales visuales seguirían siendo necesarias con el sonido apagado.

Para regenerar: Python, NumPy, libfluidsynth, FFmpeg (libmp3lame/libvorbis) y el banco indicado en `NOTICES.md`. Ejecutar `python3 _dev/audio/combat-v2/compose.py`.

Los generadores y sus plantillas se conservan en Git. Los catálogos completos y sus reproductores de escucha se generan localmente; la selección publicada está en `audio/`, evitando duplicar los archivos de audio en el historial.
