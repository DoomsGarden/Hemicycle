# Distribución horizontal · v32.0.0.2

Se activa una composición propia a partir de 560 px de ancho en orientación
horizontal. La composición vertical mantiene sus estilos. La adaptación utiliza
el ancho completo hasta 1440 px y los cuatro márgenes seguros del dispositivo.

- Navegación lateral permanente y cabecera en una fila.
- Inicio con escena a la izquierda y accesos, colección y juego a la derecha.
- Tienda con portada y compra junto a ella; desplazamiento para todas las secciones.
- Colección con controles y gabinete a la izquierda y galería independiente a la derecha.
- Preparación con resumen y selección junto a los ocho oradores en una galería desplazable.
- Combate con dos bancadas grandes y controles laterales. La mano y el reverso del mazo
  permanecen debajo de la separación entre terrenos, siempre en el terreno propio.
- El límite de mano sigue siendo dos oradores y una acción. No se cambian las reglas
  de robo ni se añaden huecos. Las capturas definitivas utilizan ese límite real.
- Frases y acciones se abren en la columna de controles sin ocultar los objetivos.
- Opciones, perfil, tabla de loot y demás ventanas permiten leer y cerrar con poca altura.
- Rotar recoloca los paneles y conserva la partida, sus selecciones y recursos.

La consulta de acciones y el menú de frases se reposicionan sin volver a iniciar
el combate. Los nuevos contenedores de la colección conservan su desplazamiento
al editar. La versión visible y el manifest siguen en v32.0.0.2, con orientación
`any`; cambia la caché a `hemiciclo-v32.0.0.2-landscape1` y las URLs modificadas.
La nota de corrección está disponible en español, inglés y francés.
No se modifican proveedores, datos personales, textos legales, guardados,
premios, reglas del servidor ni SQL.

## Verificación

158 pruebas automatizadas existentes superadas: battle (68), battle-actions (59),
action-state-visuals (6), metadata (3), stabilization-cache (2), changelog (5),
menu-navigation (3), cabinets (4) y pack-interface (8).

`functional.cjs` realiza pulsaciones y comprueba posiciones en 568×320, 667×320,
844×390, 915×412 y 1024×768, al 100 % y al 116 %. Verifica navegación, modalidades,
perfil, opciones, tienda, loot, filtros, gabinete y preparación, mano real de dos
oradores y una acción en terreno propio, mazo en terreno propio, acciones,
frases, acta, giro con una selección activa y un ataque real. Se prueban márgenes
laterales y de gestos simulados. Los controles tienen que recibir el hit-test;
no basta con que exista un rectángulo dentro del viewport.

`additional.cjs` comprueba los idiomas es/en/fr, Liga con sus 30 filas, las cuatro
secciones de Mercado y salida de su guía, buzón, detalle y zoom, compra y apertura
de un sobre con sus cinco cromos, opciones en 844×260 y giro de la colección
tras desplazarla en vertical. Usa un perfil invitado aislado, sin operaciones de
cuentas reales. Estas pruebas son de Chromium emulado, no de un Poco F7 físico.

`browser.cjs --baseline` conserva la distribución anterior desde `2ec3915:index.html`,
con el mismo escenario de mano real. El modo normal captura la nueva distribución.
La primera prueba exploratoria utilizaba una mano extendida de estrés; se sustituyó
tras la observación del usuario y no se utiliza como representación del juego real.

Ejecución: servir la raíz del repositorio en `127.0.0.1:8042` y lanzar los scripts
con Playwright disponible en NODE_PATH y `/usr/bin/chromium`.
