# Entrega para Codex — Hemicycle: ediciones legendarias de confeti

## Repositorio y material

Repositorio público: https://github.com/DoomsGarden/Hemicycle

Esta entrega se prepara para una PR en borrador con la rama `codex/legendary-confetti-mastery`. Incluye código, pruebas y muestras visuales. No se ha publicado en Pages.

Base comprobada: `2f69ab9d1167558245271df2bf59049ff593c3f0`, v31.0.1.1. Antes de integrar, actualizar `main` y revisar si hay trabajo posterior; conservarlo.

## Cómo incorporar los cambios

Consultar la PR y esta guía, descargar su rama y revisar los cambios frente al `main` actual:

```sh
git fetch origin
git switch --track origin/codex/legendary-confetti-mastery
```

Si la rama ya existe localmente, cambiar a ella y revisar el estado antes de actualizarla. Si `main` avanzó, integrar esta propuesta sobre su estado actual y resolver conflictos sin reemplazar todo `index.html` o borrar cambios ajenos. No hacer force push sobre `main`.

## Funcionalidad incluida

- Doce ediciones para todos los legendarios actuales, incluido Trump normal. Conservar retratos originales inmóviles, encuadre 3:4 y overlays del juego.
- Reutilizar exactamente el confeti de `CardConfetti.TRUMP`: 95 partículas, semilla, paleta y ciclo de seis segundos. Capa transparente compartida, 30 fps, visibilidad con IntersectionObserver, pausa en segundo plano y decoración estática con movimiento reducido.
- Cada edición se reclama una sola vez a las **250 victorias con ese político como líder**, permanece desbloqueada y puede equiparse o desactivarse. Los nuevos aspectos no cambian estadísticas.
- Cómputo de nuevas victorias; no contar tutoriales, derrotas ni dos veces el cierre de una misma partida. No inventar victorias históricas por líder.
- Progreso en `profile.leaderMastery`: `wins`, `unlocked`, `active`. Validación y conservación en respaldos/nube. Escritura atómica al reclamar y equipar.
- Trump normal con confeti es independiente del dorado animado. Las ediciones son mutuamente excluyentes al equiparlas. Conservar las bonificaciones ya existentes del dorado; no extenderlas al confeti normal.
- **Magnate Dorado sigue oculto y con sus reglas actuales de 10 victorias.** El propietario prevé endurecerlo en el lanzamiento oficial; no modificarlo ahora ni inventar el nuevo umbral.
- Actualmente el progreso y las acciones se muestran en la ficha del legendario. La ventana general de logros todavía no existe en este parche.

Código: `js/legendary-mastery.js`, `js/legendary-confetti.js`, `css/legendary-confetti.css`, integración en `index.html`, respaldo y caché. Recursos de desarrollo en `_dev`; conservar su exclusión de Pages.

## Comprobaciones ya ejecutadas

- 307 pruebas Node pasan, incluidas catálogo completo, umbral 249/250, reclamación única, persistencia, datos inválidos, contador por líder, secreto de diez victorias y estadísticas sin cambios.
- Nueva prueba cloud con RPC simulado: subida de maestría, recuperación en segundo dispositivo y cambios posteriores de equipamiento, conservando desbloqueos y victorias. No es una prueba sobre Supabase real.
- Renderer probado con DOM/lienzos simulados: doce cartas comparten una composición, reutilización, movimiento reducido y segundo plano.
- Scripts inline y archivos nuevos compilan. `git diff --check` correcto. Los 66 recursos de precarga existen.
- Muestras renderizadas con el compositor real y originales del repositorio. Hoja de contacto de los doce legendarios inspeccionada. Muestra de Trump normal: seis segundos, 180 fotogramas, WebP con repetición infinita.
- No se ha ejecutado un navegador real en esta sesión: no hay Chromium instalado. No se ha publicado ni tocado cuentas reales.

## Lo que Codex debe comprobar antes de publicar

1. Ejecutar `node --test tests/*.test.cjs` tras integrar. Revisar código y conflictos.
2. Chromium en 320×568, 393×851, 851×393 y 1280×900. Comprobar ficha, colección, zoom, premios y combate; evitar desbordamientos del panel nuevo y superposición sobre nombres/estadísticas.
3. Usar perfiles aislados de prueba para 249 → 250 victorias, reclamar, recargar, equipar/desactivar y confirmar que no se conceden copias ni FS adicionales. No manipular cuentas reales para probarlo.
4. Alternar Trump clásico → confeti → dorado → clásico. El normal sigue inmóvil; el dorado mantiene su animación original. Revisar botones activos, estadísticas y ausencia de dos efectos superpuestos.
5. Verificar seis segundos de continuidad, vista sin canvas disponible, movimiento reducido, cambios de pestaña, desplazamiento de la colección y varias cartas simultáneas.
6. Probar exportación/restauración, copia cloud con entorno simulado/local y recuperación en otro dispositivo. Verificar que perfiles anteriores siguen funcionando y que no se pierde `dtWins`/`dtGoldUnlocked`.
7. Comprobar actualización PWA y funcionamiento sin conexión con los recursos ya descargados. No afirmar que todos los retratos se precargan: mantienen su política de descarga bajo demanda.
8. Preparar versión y novedades coherentes con el `main` vigente. Si todo pasa y existe autorización para publicar en ese chat, integrar y desplegar. Verificar versión pública, hashes y conservación del progreso. Informar de fallos o límites reales, sin presentar pruebas simuladas como pruebas de producción.

## Diseño acordado para la siguiente fase: desafíos y logros generales

Este apartado documenta el contexto; **el sistema completo aún no está implementado** en el paquete de confeti.

- Desafíos: 7 diarios (3 fáciles, 2 normales, 1 difícil, 1 raro), 10 semanales (3/3/2/2), 16 mensuales (4/4/4/4). Objetivos variados, adecuados a la colección y alcanzables sin compras obligatorias ni azar bloqueante.
- Una barra por periodo: cada misión completada aporta un segmento, independientemente de reclamar sus FS. Progreso simultáneo entre misiones y logros.
- Diario 7/7: sobre con contenido del gratuito diario. Semanal 10/10: contenido del gratuito semanal. Mensual 8/16: sobre raro; 16/16: sobre legendario adicional. No alterar las esperas de los gratuitos de la tienda.
- Reclamar cada recompensa una vez; conservar recompensas ganadas al cambiar de periodo. Reinicios por día, lunes y primer día del mes en Europe/Madrid, separados de las temporadas clasificatorias.
- Logros permanentes por secciones: General, Clasificatorias, Colección, Gabinetes/doctrinas y Liga. Cadenas en una sola entrada, barra con hitos y reclamaciones únicas. Las cadenas de líder que entregan confeti terminan en 250, no en 500.
- Logros ocultos: no mostrar entradas, interrogantes, siluetas, pistas, próximos tramos ni contadores que revelen cuántos faltan. La sección Secretos no aparece hasta descubrir uno. Magnate Dorado ya conseguido debe conservarse.
- Menú: Desafíos junto al bloque compacto del contador de colección, alineado con la columna de accesos; Logros debajo del buzón. Distintivos de recompensas pendientes.
- Adaptar tutorial del menú sin gastos, premios reales ni descubrimiento de secretos en las demostraciones. Miniguía de novedades para quienes ya completaron la guía; conservar la guía completa en Ayuda.

No confundir esa fase de producto con la funcionalidad terminada del paquete actual. El módulo de maestría debe reutilizarse al conectar las cadenas de logros, sin reiniciar sus contadores ni recompensas.
