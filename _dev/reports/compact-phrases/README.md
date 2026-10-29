# Selector compacto de frases — corrección de v31.0.2.8

Las frases sustituyen a los rótulos de ataque y usan la fuente local del diálogo del Senado. La tercera conserva un marco completo: dentro aparecen su frase y dos botones pequeños, centrados y repartidos por igual, con escudo/50 % y cruz/cantidad de curación. El apoyo se ejecuta directamente, sin submenú.

El icono de habilidad se consulta por separado sin gastar una intervención. No se muestran sus párrafos en el botón de ataque. Los símbolos de apoyo proceden de la misma función que genera las animaciones del tablero; mantienen un movimiento suave al estar habilitados y se detienen con movimiento reducido. Se conservan nombres accesibles y motivos de indisponibilidad sin añadir rótulos visibles.

El selector y el Acta comparten un fondo de cristal con alfa 0,58–0,64, manteniendo texto e iconos opacos. La posición del selector compara el solapamiento con los cromos y busca una zona que deje visible la mesa; puede colocarse debajo del orador.

| Verificación | Evidencia |
|---|---|
| Suite completa | **714 pruebas correctas**. `node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs`, con las dependencias de pruebas en `NODE_PATH`. Incluye apoyo directo, recuperación, una sola intervención y consulta de habilidad sin gasto. |
| Antes/después | [before.json](before.json), [after.json](after.json). `_dev/checks/compact-phrases-browser.cjs --before` captura la versión publicada `c5d325c`; sin el argumento comprueba la nueva. |
| Selector | 120 cromos con sus tres frases, cuatro tamaños —320/393/768/844 px— y escalas 100/116 %, botones dentro del marco y alineados, sin denominaciones visibles y apoyo directo. Ejemplo: [phrases-393-116.png](phrases-393-116.png). |
| Ocupación | En la escena de comprobación a 320 px y 116 %, la altura baja de 302,8 a 249,4 px; el área media de cromos cubierta pasa del 65,4 al 33,3 %. A 393 px y 116 % baja de 255,4 a 249,4 px y deja libre la mesa. Son medidas de esa escena, no una promesa para todo dispositivo. |
| Acta | [journal.json](journal.json), [acta-393.png](acta-393.png). Fondo translúcido, texto con opacidad 1. |
| Tutorial | [guides/browser.json](guides/browser.json). Práctica breve de 8 pasos y guía completa de 36, invitados/adultos, progreso conservado y opciones al 116 % en tres tamaños. Se retiran los dos pasos del submenú de apoyo que ya no existe. |
| Recuperación de ataques | [recovery/after.json](recovery/after.json). Rechazo de hueco al llegar a 3 votos, recuperación sin reiniciar, apoyo directo posterior, dos atacantes al mismo rival y objetivo desaparecido. |
| PWA | [pwa/pwa.json](pwa/pwa.json). Actualización desde `c5d325c`, 151 recursos, caché `hemiciclo-v31.0.2.8-phrases1`, acceso offline y progreso conservado. |

Los escenarios usan estado local aislado y bloquean solicitudes a producción. Se mantienen las reglas, las 67 asignaciones de habilidades, los 53 cromos sin habilidad, Elo, estadísticas y los motores descargados. La generación offline y el hash legal siguen sin cambios. No hace falta ejecutar SQL.

La [segunda tanda de habilidades](../../../docs/balance/segunda-tanda-propuestas.md) es únicamente una propuesta de diseño solicitada durante esta revisión: no está implementada ni asignada.
