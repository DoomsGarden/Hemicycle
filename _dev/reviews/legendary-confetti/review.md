# Ediciones legendarias de confeti — propuesta preparada

Base: `2f69ab9`, v31.0.1.1. No se publica en Pages con esta propuesta.

## Alcance

Las doce cartas legendarias conservan sus retratos originales inmóviles. Una capa transparente usa exactamente `CardConfetti.TRUMP`: 95 partículas, misma paleta, semilla, movimiento y periodo continuo de seis segundos. No se han regenerado rostros, recortado originales ni creado doce vídeos pesados. La capa se comparte entre las cartas visibles, funciona en colección, ficha, zoom, premios y combate cuando esos componentes emplean el arte del jugador. Los retratos pequeños del gabinete conservan su vista estática.

La edición de Trump usa `donald-trump.webp`, no el personaje animado del dorado. Ambas ediciones son independientes y mutuamente excluyentes al equiparlas. El confeti no cambia estadísticas; el dorado conserva las bonificaciones que ya tenía.

`HemicycleMastery` registra victorias nuevas con cada legendario como líder. El hito final es de 250 victorias, sin reinicios y con reclamación única y equipamiento reversible. No se inventa progreso histórico por líder: el guardado anterior no lo registraba para todos los políticos. Tutoriales y derrotas no avanzan la maestría; el cierre de una misma partida no cuenta dos veces. El estado viaja dentro del perfil validado por respaldo/nube. No se modifica SQL ni se actúa sobre cuentas reales.

El logro oculto Magnate Dorado mantiene exactamente sus reglas actuales: diez victorias en los modos que ya computaba. No se revela antes de obtenerlo, no se traslada a 250 y no se modifica su umbral de lanzamiento por anticipado. El nuevo contador de maestría es independiente del antiguo `dtWins`.

## Integración pendiente del sistema de logros

La ventana general de logros y las misiones diarias/semanales/mensuales siguen siendo un diseño acordado, no una funcionalidad implementada en esta rama. Esta entrega ofrece el módulo de progreso y el premio final para enlazarlos posteriormente. Mientras tanto, la ficha de cada legendario permite consultar el progreso, reclamar la edición a 250 y equiparla. Las reclamaciones y cambios de aspecto nuevos usan escritura atómica para informar de fallos de almacenamiento sin fingir una recompensa guardada.

La cadena propuesta para estos logros debe terminar en 250; cualquier referencia anterior a un tramo final de 500 queda sustituida para las cadenas de líder que entregan esta edición. Las recompensas intermedias se integrarán con el sistema general de logros.

## Recursos de revisión

- `_dev/previews/legendary-confetti/index.html`: las doce ediciones con el renderer real; servir desde la raíz del repositorio. No altera el guardado.
- `legendarios-confeti.png`: hoja de contacto de las doce ediciones, inspeccionada visualmente.
- `trump-normal-confeti.webp`: muestra de seis segundos, 180 fotogramas, retrato normal inmóvil y confeti del compositor real.
- `_dev/checks/render-legendary-confetti.cjs`: regeneración de las muestras con canvas y FFmpeg; solo herramienta de desarrollo.

## Validación

Pruebas de catálogo, límite 249/250, reclamación única, edición permanente, equipamiento, respaldo, datos corruptos, aislamiento del logro oculto, cómputo de partidas y estadísticas sin bonificación. Pruebas del renderer: compositor compartido, reutilización de lienzos, segundo plano y movimiento reducido. La batería existente de confeti comprueba la continuidad de su ciclo. Scripts completos compilados y diff sin errores de espacios.

No se ha verificado esta interfaz integrada en un navegador real en esta sesión. Antes de publicar hay que revisar ficha/zoom con ambos aspectos de Trump, pantallas pequeñas, reclamación, copia cloud y efectos simultáneos en combate. La propuesta se entrega mediante PR en borrador; no se han fusionado cambios ni publicado en Pages.
