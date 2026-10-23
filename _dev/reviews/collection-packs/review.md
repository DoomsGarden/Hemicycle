# Colección, gabinetes y sobres — revisión del 23 de octubre de 2026

Base inspeccionada: `264e508` (main), v31.0.0.5 con el ajuste de Opciones. No había pull requests abiertos al iniciar la revisión. GitHub indica un push el 23 de octubre; la fecha del 22 de octubre del encargo ya no era la más reciente.

## Recursos presentes y adecuación TCG

- 120 políticos en el catálogo ejecutable y 120 retratos WebP correspondientes, sin rutas ausentes. El conjunto de retratos ocupa 11.695.556 bytes. Hay además un marco WebP y dos recursos dorados de Trump; no son personajes adicionales.
- 118 retratos son de 1086×1448 (3:4 exacto). Mónica García y Rafael Hernando son de 1087×1447, una desviación mínima que el contenedor 3:4 recorta. Marco: 768×1024. Ambas imágenes doradas de Trump: 420×560, por debajo de la resolución del resto.
- Inspección de una hoja de contacto de los 120 retratos: estilo pictórico consistente, encuadre de busto, colores de partido y ambiente institucional. Existen poses tranquilas y gestos visibles. La hoja de contacto no permite certificar parecido facial, ausencia de recortes o micrófonos pequeños en cada original; esas comprobaciones requieren ver los originales y referencias reales.
- Varios fondos contienen letras, emblemas y banderas cerca de las esquinas. El hueco superior e inferior para coste, rareza, nombre y estadísticas no tiene una zona segura documentada. La presencia de un archivo no implica que su composición sea óptima con todos los overlays.
- Ya había cinco gabinetes persistentes, un visor con zoom/deslizamiento y sonido de sobres. Faltaban imágenes de sobres, una presentación previa al revelado y acceso al visor desde las recompensas.

## Implementación propuesta

- Colección con tres columnas para aumentar legibilidad de arte y nombres; filtros y metal de favoritos coherentes con los menús azul/oro existentes.
- Cinco botones numerados de ancho adaptable y cinco retratos del gabinete activo debajo. Estrella de líder, huecos vacíos y nombres accesibles. Guardar, cancelar, azar y vaciar siguen disponibles durante la edición; tocar un retrato permite quitarlo del borrador. Sin cambios al esquema de favoritos, respaldo o nube.
- Gratis en bloque separado, diario y semanal. Contadores con días/horas, horas/minutos, minutos/segundos o segundos, sin tres unidades simultáneas; actualización inmediata y al vencer. Sin cambiar periodicidad ni probabilidades.
- Seis ilustraciones SVG de sobres sellados: diario, semanal, común, raro, legendario y mítico. Recurso vectorial nativo con metal, lacre y símbolo de hemiciclo; no usa imágenes ni identidad visual de Rush Royale. Se distinguen por color y sello.
- Confirmación de adquisición existente seguida de presentación del sobre cerrado, transición breve al revelado y entrada escalonada de cinco premios. Movimiento reducido revela directamente. Las cartas se guardan antes de la animación: salir de ella no pierde premios ni vuelve a cobrarlos.
- Cada premio abre el detalle y zoom existentes, con navegación limitada al conjunto de políticos de ese sobre. Los repetidos se muestran individualmente en la cuadrícula de cinco premios y una vez por político en el visor. Volver al sobre conserva el resultado, sin comprar o reclamar otra vez.
- Los nuevos recursos de sobres se precargan en una nueva caché del service worker. Los retratos existentes siguen descargándose bajo demanda.

## Siguiente bloque, por impacto

| Prioridad | Trabajo concreto | Criterio de aceptación |
| --- | --- | --- |
| 1 | Validación visual y de interacción de esta propuesta en 320×568, 393×851 y 851×393 | Sin desbordamiento horizontal; favoritos/editado y líder usables; seis sobres legibles; transición, teclado y movimiento reducido; detalle/zoom solo entre los premios; retorno sin recobro; actualización de caché sin perder perfil |
| 2 | Plantilla de zonas seguras para los 120 retratos y auditoría con los overlays reales | Máscara 3:4 documentada; coste/rareza/nombre no ocultan cara o mano importante; lista de retratos que requieren reposicionar o regenerar |
| 3 | Mejorar Trump dorado y normalizar las dos dimensiones atípicas | Fuentes de calidad comparable al catálogo; mantener animación y transparencia/recorte; evitar prometer 8K a partir de reescalado |
| 4 | Revisión de parecido por lotes de 10, empezando por los retratos corregidos antes | Comparar Jaime de Olano, Ana Botella y Cayetana con fotos reales; registrar referencia, pose, mano y presencia de micrófono antes de generar sustituciones |
| 5 | Política de descarga de retratos para modo sin conexión | Optar por precarga o descarga explícita, con presupuesto de unos 11,7 MB para la edición actual; conservar fallback y no bloquear el arranque |

## Validación y límites

Se añaden pruebas ejecutables de límites temporales, navegación aislada de premios, conservación de navegación normal, reclamación única y precarga de recursos. Los scripts inline completos se compilan con `vm.Script`.

La comprobación visual en Chromium no está completada: no hay navegador instalado y el servidor de descarga devuelve un archivo no válido. La propuesta debe permanecer como borrador hasta completar el primer bloque. No se ha publicado en Pages ni cambiado datos de cuentas reales. No se han generado sustituciones de retratos ni se ha certificado parecido facial individual.
