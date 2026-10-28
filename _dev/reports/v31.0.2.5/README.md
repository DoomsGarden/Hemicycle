# v31.0.2.5 — El Senado cobra vida

Integración de la maqueta `Hemiciclo-senado-revision-v3.html` aportada por Dooms. Se extrae únicamente la escena: el juego conserva su código, catálogo, controles, cuentas y reglas actuales.

## Presentación

- Escenario con 32 asistentes colocados según las sillas y mesas originales. Doce oradores alternan lado y frases del catálogo actual, con llegada, intervención y regreso.
- Todos comparten un ciclo de piernas alternas con muslo y rodilla articulados. Los personajes conservan sus proporciones al cambiar la orientación de la pantalla.
- Un único lienzo persistente cubre también el fondo de las barras superior e inferior. Ambas mantienen una capa oscura al 50 % y sus controles por encima de la escena.
- Solo las frases usan la fuente local VT323, de estilo RPG 2D. El texto completo reserva su altura mientras se revela progresivamente.
- Balbuceos vocales sintéticos, sin palabras inteligibles: excitación vocal con dos formantes, distintos tonos y timbres por orador, sincronizados con las letras. Se conectan al canal de efectos existente y respetan volumen, silencio y desactivación de efectos. No reinician la música.
- Dibujo limitado a 30 fps y densidad de píxel de 1,5. Las ventanas, guías y ocultación de la página pausan la escena; el movimiento reducido conserva una vista estática. Al salir de Inicio se detienen el lienzo y sus observadores.
- PNG originales de la escena: 6.617.400 bytes. WebP equivalentes: 1.330.272 bytes. Se conservan las transparencias y posiciones. Los cuatro recursos y la fuente quedan en la caché offline.

## Respuesta online

Se corrigen dos esperas observables en el cliente, sin cambiar autenticación, SQL ni reglas:

1. Una consulta periódica de combate cede ante una jugada del usuario. Su respuesta tardía no puede sobrescribir el estado más reciente. Una escritura pendiente nunca se cancela para enviar otra y mantiene el mismo identificador al reintentar.
2. Aceptar una invitación abre la preparación inmediatamente tras la confirmación del servidor, sin esperar directorio, presencia y otra consulta de sala. En las actualizaciones de una sala pendiente, presencia y sala se consultan en paralelo; una presencia ya visible evita otra consulta redundante del directorio.

Las pruebas locales verifican orden y número de peticiones, no la latencia real de Render/Supabase. El recorrido del servidor sigue validando la sesión y confirmando cada jugada de forma autoritativa. Los datos aportados por Dooms corresponden a una instancia Compute de 1 CPU / 2 GB; la revisión no atribuye toda la demora al plan.

## Comprobaciones

- **605 pruebas automáticas**, todas correctas (`tests.log`).
- Inicio en 320×568, 393×851, 768×1024 y 844×390, con texto al 100 % y al 116 %. Accesos alcanzables, barras al 50 %, doce oradores y sus dos sentidos de marcha, lienzo persistente, fuentes acotadas al diálogo, efectos de voz, pausa de ventanas y segundo plano, datos y música conservados (`menu.json`, `menu.log`).
- Un atlas ausente mantiene el menú funcional; vuelve a intentarse al recuperar conexión (`menu.json`).
- Invitación aceptada sin consultas redundantes; sala y presencia en paralelo (`online-response.json`). Una lectura lenta deja pasar una jugada; su respuesta antigua se ignora. Las escrituras en curso y los reintentos conservan la operación (`online-ui.log`).
- Guías completas de menú y combate, sin premios ni cambios de perfil (`guides/`).
- PWA desde 86ea2d0: **123 recursos**, nueva caché, escena/fuente sin conexión y perfil, Liga y audio conservados (`pwa/`).
- Sintaxis, escalado de texto, motores offline generados y `git diff --check`: correctos.

Sin SQL ni reinicios de progreso. Fuente VT323 distribuida con su licencia SIL OFL en `fonts/VT323-OFL.txt`; procedencia: https://github.com/google/fonts/tree/main/ofl/vt323 .
