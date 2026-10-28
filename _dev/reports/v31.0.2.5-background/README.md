# Fondo continuo y cabecera — v31.0.2.5, 2026-10-28

El Senado se monta una sola vez como capa fija de la aplicación, fuera de la pantalla y sus zonas desplazables. La misma instancia y el mismo reloj sobreviven a la navegación entre Inicio, Colección, Tienda, Liga y Mercado, además de las páginas de consulta y preparación. Fuera de Inicio se aplica una capa oscura al 70 % y no aparecen el rótulo, el abanico ni los bocadillos. Los combates, aperturas y resultados mantienen sus escenas. Los diálogos y el movimiento reducido conservan sus pausas.

La cabecera utiliza los trazados del nombre de la pantalla de entrada como SVG independiente, sin subtítulo ni versión. La versión procede de la constante del juego y se muestra al pie de Opciones, también en horizontal. V/D y Elo ocupan columnas propias; las cifras pueden partirse en líneas para conservar el tamaño elegido y no invadir otras casillas.

Comprobaciones:
- 80 combinaciones: cinco pestañas, cuatro tamaños (320×568, 393×851, 560×900, 844×390), texto al 100 y al 116 %, cifras 330/33/3233 y 99999/99999/9999999.
- Los rectángulos del fondo permanecen idénticos entre pestañas y cambios de texto; el lienzo y el reloj se conservan. Desplazar Colección vertical u horizontalmente no mueve el fondo.
- Todas las cifras quedan dentro de sus casillas. Logo cargado, sin versión ni subtítulo en la cabecera. Versión de Opciones visible y menor de 12 px en móvil pequeño, móvil normal y horizontal.
- Perfil y Opciones pausan la escena y no contienen lienzos propios. Se conserva el perfil y se respeta el movimiento reducido.
- Ocho pruebas de unidad de escena y changelog; guías completas de menú y combate; actualización PWA desde 52f4195 con 126 recursos y carga sin conexión, conservando perfil y Liga.

Por petición de Dooms, se sube la corrección a main sin esperar ni consultar la finalización del despliegue público de Pages.
