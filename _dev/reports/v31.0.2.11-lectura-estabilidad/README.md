# Lectura y estabilidad visual · v31.0.2.11

Corrección de los cuatro defectos de las capturas 47298, 47299 y 47315:

- Materiales claros: tinta oscura para información de mercado y revisión de desafíos, opciones, perfil, tienda, diálogos, consejos, historial, nube, jugadores y gabinete. Los controles y áreas con fondo oscuro mantienen texto claro.
- Botonera de Inicio: ancho total del marco 44 px, igual a Desafíos, una columna y sin marcos por botón. Relleno a 0,7; iconos y marco opacos.
- Selector de partida: actualización del DOM local, sin reconstruir el héroe ni sus animaciones. Foco sin desplazar ancestros y límite de altura del desplegable en pantallas cortas.
- Consejo pospartida: cerrado al entrar, altura natural al abrirse y cromo situado debajo. Horizontal compacto con dos columnas desde 500 px de ancho.

## Evidencia

`browser.json`: 150 comprobaciones agrupadas: seis temas × cuatro tamaños, 116 % de texto e iconos, cuatro modos, Escape y clic exterior, mismo nodo de escena y misma animación conservada a mitad de fase, medidas de botonera e interacción, consejos abiertos/cerrados con premio o pérdida. Incluye el primer recorrido de contraste.

`contrast.json`: 30 grupos adicionales sobre ambos temas claros, tras terminar los ajustes de nube y jugadores. Textos examinados con contraste ≥ 4,5:1, utilizando como fondo conservador el material crema compuesto sobre negro; controles oscuros examinados sobre su propio color. Las capturas complementan las medidas; no es una auditoría exhaustiva de accesibilidad de toda la aplicación.

`unit-tests.log`: 13 pruebas de presentación de resultados, historial y navegación.

`pwa/pwa.json`: actualización real desde 805f57d (edge8 → polish9), 219 recursos, progreso y preferencias conservados, funcionamiento sin conexión.

Las cuentas y resultados usados por el navegador son datos locales de prueba; se bloquean las conexiones HTTPS. Los accesos a nube/directorio se prueban en modo invitado/ejemplo sin escribir a servicios externos. Sin cambios de servidor o SQL.
