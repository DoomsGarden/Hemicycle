# Marcos, centrado y controles de Inicio · v31.0.2.11

El perfil muestra el número dentro del emblema, sin «Nivel» superpuesto, y retira el aviso permanente del máximo bajo la barra. El nombre accesible del emblema sigue indicando el nivel. La XP y sus límites no cambian; se verifica el caso de nivel 28 con 18/168 XP y el de nivel 500.

En la versión anterior (`5317aaa`), el editor medía 377,27 píxeles dentro de un espacio de 369 en un móvil de 393×851: su centro quedaba 4,13 píxeles a la derecha. La ventana se limita ahora al ancho real disponible y la pista del contenedor puede encoger. El sobre tenía un botón centrado de 172,91 píxeles, con un dibujo de 227,33 alineado con su borde izquierdo: el dibujo se desplazaba 27,21 píxeles. Botón y dibujo comparten ahora tamaño, proporción y centro.

Las miniaturas y la combinación separan la escena interior del marco. La escena queda recogida dentro del borde y el emblema queda por encima. Las URL se resuelven contra la página antes de utilizarlas en las variables CSS, también para la carga sin conexión. La ficha de Mercado y su editor utilizan el mismo bisel de 20 píxeles, independiente de la altura del panel.

Los controles de Inicio utilizan el marco ilustrado y un material propio de cada tema. La botonera lateral incorpora un soporte que acompaña su despliegue: papel en Senado y Papiro, cuero en Libro y superficies metálicas o luminosas en los demás. En pantallas bajas se compacta y, en horizontal, los botones adicionales salen a un lado para dejar accesible Jugar. Se mantienen el estado accesible, el foco, las notificaciones y el movimiento reducido. Perfil, novedades, ayuda, desafíos, Jugar y Jugadores comparten materiales; la barra inferior conserva su brillo y selección.

Las etiquetas de Mercado pasan debajo de sus iconos en móvil para acomodar las fuentes más anchas y el texto ampliado.

## Validación

- [24 configuraciones completas](browser.json): seis temas a 320×568, 393×851, 768×1024 y 844×390, con Orbital y texto/iconos al 116 %. Se prueban las posiciones reales y la accesibilidad de los botones, el centrado de Perfil, Editor, Opciones y confirmaciones, los indicadores de XP y el bisel del Mercado al seleccionar y deseleccionar.
- 144 portadas de sobres: Común, Raro, Legendario, Mítico, Diario y Semanal en las 24 configuraciones. Desviación del centro inferior a medio píxel CSS; botón y dibujo coinciden. La revelación conserva los cinco cromos del recibo de prueba.
- Las capturas de los bordes de miniaturas y combinación se comparan con y sin su escena interior: la escena no cambia los píxeles exteriores del marco. No se detectan recursos cosméticos ausentes ni errores JavaScript.
- [Animación](animation.json): seis soportes con interpolación real de apertura, cierre, estado `inert` y apertura inmediata con movimiento reducido.
- [16 disposiciones de Mercado](market-labels.json): cuatro fuentes, dos tamaños de texto y dos anchos móviles; las etiquetas caben dentro de los botones.
- 2.005 pruebas aprobadas; sintaxis JavaScript y reproducción del motor offline comprobadas.
- [Actualización PWA](pwa/pwa.json) desde `5317aaa`: 219 recursos, progreso y preferencias conservados, sustitución de caché y uso sin conexión de las miniaturas nuevas.

Capturas: [perfil](profile-hologram.png), [miniaturas](editor-book.png), [sobre centrado](pack-centered.png), [Mercado expandido](market-hologram.png), [papel desplegado](tools-parchment.png), [Senado](tools-senate.png) y [Holográfico](tools-hologram.png).

Caché `hemiciclo-v31.0.2.11-frames6`. No requiere SQL y no modifica reglas, colección, FS, XP, Elo ni preferencias guardadas.
