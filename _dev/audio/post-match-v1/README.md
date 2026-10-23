# Remates de pantalla de resultados

Dos composiciones originales, cortas y sin bucle, relacionadas con «Duelo de tribunas»: victoria (5,3 s, fanfarria en re mayor) y derrota (5,1 s, corno inglés y cuerda en re menor). Comparten el pulso de 112 BPM y el gesto melódico de la música de combate. Los últimos segundos incluyen la caída natural de la reverberación.

`escuchar.html` incluye ambos MP3 para comparar sin conexión. Los Ogg están disponibles para una futura integración. No se ha modificado el juego, su versión ni su changelog. Al integrarlos deberán sonar una sola vez al entrar en los resultados y relevar la música de combate; respetarán el volumen y el silencio del jugador. La derrota tiene un nivel inferior y no usa sonidos de burla.

Instrumentos virtuales renderizados con FluidSynth y TimGM6mb. Procedencia y atribución del banco: [NOTICES.md](../combat-v2/NOTICES.md). Los timbres no son grabaciones propias ni se redistribuye el banco SF2. Las partituras se han creado para esta propuesta.

Regeneración: `python3 _dev/audio/post-match-v1/generate.py`; requiere NumPy, libfluidsynth, TimGM6mb y FFmpeg.

Los generadores y sus plantillas se conservan en Git. Los catálogos completos y sus reproductores de escucha se generan localmente; la selección publicada está en `audio/`, evitando duplicar los archivos de audio en el historial.
