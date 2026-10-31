# Opciones compactas y tipografías · v31.0.2.11

Opciones conserva los controles a la vista con texto e iconos al 116 %. El panel anterior necesitaba hasta unos 900 píxeles de contenido en un móvil de 320×568. Sonido comparte dos filas por ajuste: nombre y porcentaje arriba, deslizador e interruptor al pie. Lectura agrupa sus dos ajustes y conserva la explicación para lectores de pantalla incluso en la disposición compacta. Los accesos secundarios usan etiquetas breves y Cerrar comparte el pie con la versión.

En horizontal, Sonido y Lectura se colocan en dos columnas y los accesos secundarios en tres. La disposición más baja reduce espacios y conserva controles de al menos 24 píxeles, sin recortar contenido. Los mensajes de preparación sin conexión también caben. El selector de modos usa dos columnas en horizontal para no salir por encima de la pantalla.

Clásica pasa a Cinzel y Orbital a Orbitron, frente a Inter (Clara) y Lora (Editorial). Se mantienen los identificadores y preferencias existentes. Todas las muestras usan «Ágora»; Del estilo representa la fuente propia del menú, independientemente de la elegida. [Procedencia, licencias y compatibilidad](fonts.md).

## Comprobaciones

- [240 configuraciones principales](browser.json) y [120 en móviles pequeños en horizontal](browser-short.json): seis estilos, cinco opciones de fuente, texto al 100 y 116 %, iconos al 116 %. Tamaños 320×568, 393×851, 768×1024, 844×390, 568×320 y 667×375. Se mide ausencia de desbordamiento, visibilidad de controles y alineación de nombres/porcentajes. También se prueban Inicio, selector de modos y confirmación; volumen, interruptores, aviso de riesgo, guardado, teclado y regreso desde Legal.
- [16 perfiles y selectores](typefaces.json): las fuentes se cargan antes de seleccionarlas; el perfil que cabía al 100 % sigue cabiendo al 116 %. Se conservan Inter en las fuentes documentales y textos legales, e Impact/Anton en Iniciar.
- [80 resultados y sobres](completion.json): los controles siguen visibles y los menús que cabían sin desplazamiento lo siguen haciendo al ampliar el texto, con las cuatro fuentes explícitas.
- [12 arranques y navegación](navigation/startup.json): fuentes retrasadas, ventanas antes de navegar, redimensionado y regreso a la app; se conserva la alineación inicial de la barra.
- 2.005 pruebas del proyecto aprobadas. Ocho comprobaciones de presentación/preferencias repetidas tras ajustar la etiqueta de riesgo, también aprobadas. Sintaxis JavaScript y motor offline comprobados.
- [Actualización PWA](pwa/pwa.json) desde `ed23c2c`: 219 recursos, sustitución de caché, progreso y preferencias conservados, carga sin conexión y selección de las fuentes nuevas sin red.

Capturas finales: [móvil pequeño/Papiro](options-final-320.png), [Orbital en móvil](options-final-393.png), [Libro en horizontal](options-final-844.png) y [comparación de tipografías](typefaces-orbital.png).

Caché `hemiciclo-v31.0.2.11-options5`. No requiere SQL ni modifica reglas, colección, XP, FS o Elo.
