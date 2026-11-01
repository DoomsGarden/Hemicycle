# Capturas y presentación de Hemiciclo

Edición del 01-11-2026, basada en v31.0.2.11 con el encuadre mat12. Preferencia de Dooms: siete capturas en español, estilo épico sobrio, azul y dorado; sin pantallas legales. También se crea README.md en la raíz, con portada, galería, acceso al juego y ayuda.

## Composición

- `docs/media/screenshots/`: siete capturas originales 786×1702 del navegador, viewport 393×851 a escala 2. La interfaz se renderiza con el código actual del juego y datos locales de demostración. No se inicia ninguna cuenta ni se modifican recursos de producción.
- `docs/media/marketing-background.webp`: fondo editorial derivado mediante generación de imagen de `assets/menu-senate/chamber.webp`. No contiene interfaces ni personas. La interfaz se coloca como captura original en el HTML, sin pedir a la IA que la reconstruya.
- `promo.html` y `slides.js`: maquetación y titulares editables. El encuadre incluye todo el contenido de la captura original. Se usan Inter y el wordmark existentes.
- `press/google-play/es-ES/`: siete PNG RGB de 24 bits sin transparencia, 1080×1920. Cada uno pesa menos de 8 MiB. Titulares, captura y pie tienen áreas propias; se comprueban sus límites antes de exportar.
- `docs/media/promos/`: siete vistas pequeñas JPEG para que GitHub no cargue los PNG completos al abrir el README.
- `docs/media/readme-banner.jpg` y `capturas-resumen.jpg`: portada y vista conjunta.
- `press/hemiciclo-capturas-es.zip`: siete PNG, LEEME y manifiesto de hashes/dimensiones. No contiene datos personales ni archivos de guardado.

Los saldos, inventarios, estado de combate y clasificación son fixtures de presentación. No representan resultados de una cuenta real ni prometen recompensas o cartas iniciales. La imagen de Mercado muestra la venta local a la máquina; el texto de la ayuda explica los requisitos de las funciones entre jugadores.

## Regenerar

Requiere Node, Playwright, Chromium en `/usr/bin/chromium`, ImageMagick (`magick`) y Python 3. Desde la raíz del repositorio, con el servidor local de su directorio padre disponible en `http://127.0.0.1:8055/Hemicycle/`:

```sh
node _dev/marketing/capture-game.cjs
node _dev/marketing/render-promos.cjs
python3 _dev/marketing/package-promos.py
node _dev/marketing/check-readme.cjs
```

El fondo ya está incluido; no es necesario volver a generarlo. La captura usa un contexto de navegador nuevo, almacenamiento local aislado, aceptación de prueba y servicios remotos bloqueados. La guía de Mercado se marca vista para la identidad de ese fixture. Las escenas se preparan mediante una inyección servida solo en el navegador de captura: el HTML y JavaScript del juego publicado no cambian. Los oradores destacados de Inicio pueden variar conforme a su selección normal. Se actualizan además las dos capturas de Perfil y Editor, con Archivo holográfico suavizado y las seis tipografías. La escena de combate usa Gatitos y un rival Clásico, con sus encuadres calculados independientemente.

`captures.json` y `exports.json` registran los archivos y límites comprobados. El empaquetador comprueba los encabezados PNG, dimensiones, ausencia de alfa, tamaño, hashes y descompresión íntegra del ZIP. Se inspeccionan visualmente las siete piezas, el banner y la vista conjunta.

El README enlaza las imágenes mediante rutas relativas y mantiene las funciones de cuenta y guardado diferenciadas. Las reglas resumidas se contrastan con la ayuda actual. Las herramientas de marketing no modifican el juego ni sus servicios; esta renovación acompaña al arreglo de encuadre y sombras documentado en el informe `mat-proportions`. El material se publica en GitHub; no crea por sí solo una ficha en una tienda.
