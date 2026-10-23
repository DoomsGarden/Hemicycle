# Hemicycle: primera propuesta de sonido

Abre `escuchar.html` en un navegador para comparar las 54 muestras sin conexión. Se incluye el audio dentro del HTML. No hay reproducción automática, peticiones de red, voces ni grabaciones de terceros. Los tres MP3 `muestra-a`, `muestra-b` y `muestra-c` sirven para una escucha rápida con las acciones en el mismo orden. Los tiempos de cada resumen están en `manifest.json`.

- A: Hemiciclo solemne. Madera, campanas discretas y armonías sobrias.
- B: Sátira ligera. Pizzicatos, percusión ligera y pequeños gestos cómicos.
- C: Duelo moderno. Pulsos electrónicos y avisos más precisos.

Cada estilo incluye 15 efectos, una música de menú, una música de combate y un ambiente de sala abstracto. Son bocetos originales de síntesis, generados con `generate.py`; no son una banda sonora definitiva ni grabaciones de una orquesta o un parlamento. Ningún sonido revela logros ocultos. Las cifras de pico y RMS del manifiesto corresponden a la señal anterior a la codificación MP3.

Propuesta inicial: menú y recompensas de A; probar ataques de B o C. Mantener la música muy baja. El ambiente es una alternativa: no superponerlo automáticamente a la música. Al integrar, añadir controles independientes de música/efectos/ambiente y un botón de silencio, conservar todos los avisos visuales, iniciar audio tras un gesto del usuario, suspenderlo al pasar a segundo plano y priorizar efectos para evitar ruido en acciones simultáneas. El reloj solo avisaría al final del turno y los botones no sonarían al hacer hover. La muestra de moneda debe sincronizarse con su animación real antes de integrarse. Se ajustarían duración, volumen y formato de bucle en esa fase.

Estas muestras y el reproductor están en `_dev`, excluido de GitHub Pages. El juego, su versión, caché y changelog no se han modificado para esta propuesta. No se publica ni se integra audio hasta revisar las preferencias del propietario.

Para regenerar: Python con NumPy y SciPy, y FFmpeg con libmp3lame. Ejecuta `python3 _dev/audio/proposals-v1/generate.py` desde el repositorio.

Los generadores y sus plantillas se conservan en Git. Los catálogos completos y sus reproductores de escucha se generan localmente; la selección publicada está en `audio/`, evitando duplicar los archivos de audio en el historial.
