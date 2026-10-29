# Corrección de ataques y lectura de habilidades — v31.0.2.8

Se reproduce el bloqueo contra la versión publicada `0a86e59`. Se realizan dos ataques válidos a huecos, se agota el límite compartido de 3 votos y se envía un tercero con otro orador listo. El motor rechaza la jugada; el cliente descargado devuelve el estado antes de que `sendRemoteBattle` termine y este vuelve a fijar `networkBusy=true`. Cerrar el aviso no desbloquea las acciones.

La corrección establece la ocupación antes de llamar al transporte, respeta una devolución de estado síncrona y revierte rechazos inmediatos. El cliente descargado difiere la ejecución y restaura su estado antes de mostrar errores. Las frases y los huecos previenen la selección sin objetivos al alcanzar el límite. Un objetivo desaparecido no se convierte en un hueco.

| Comprobación | Evidencia |
|---|---|
| Fallo anterior reproducido | [before.json](before.json), `_dev/checks/attack-target-recovery-browser.cjs --before`. |
| Recuperación tras rechazo | [after.json](after.json): defensa tras error sin reiniciar, ataques de dos oradores al mismo rival y objetivo desaparecido sin retirada de votos ni envío sustitutivo a un hueco. Mismo script sin `--before`. |
| Iconos y disponibilidad | [ability-preview.json](ability-preview.json): seis habilidades, tres estados de disponibilidad, cuatro tamaños al 100/116 %, 120 fichas concisas y listado de 67 oradores en Ayuda. `_dev/checks/ability-preview-browser.cjs`. |
| Ejemplo de selección | [phrases-393-116.png](phrases-393-116.png): nombre, icono, efecto y bloqueo contextual en la frase del básico; el ataque fuerte mantiene su presentación propia. |
| PWA | [pwa/pwa.json](pwa/pwa.json): actualización desde `0a86e59`, caché `hemiciclo-v31.0.2.8-targets1`, 151 recursos, modo offline y progreso conservado. `_dev/checks/attack-target-recovery-pwa.cjs`. |
| Tutorial y menús | [guides/browser.json](guides/browser.json): práctica breve y guía completa, invitados/adultos, tres tamaños y opciones al 116 %, sin modificar progreso. `_dev/checks/attack-target-recovery-guides.cjs`. |
| Suite completa | 711 pruebas, 711 correctas. El nuevo archivo `tests/attack-target-recovery.test.cjs` cubre ocupación síncrona, rechazo, excepción, espera válida y disponibilidad de habilidades sin modificar el combate. |

Los escenarios del navegador usan cuentas ficticias y transporte aislado, con validación real del motor offline4. No envían solicitudes ni alteran cuentas de producción. Se mantienen las estadísticas, las asignaciones de habilidades, los escaños, el fuerte, las doctrinas, el Elo y los cuatro motores históricos. `node _dev/build-offline.cjs --check` sigue pasando; esta corrección no necesita SQL nuevo.

Las reglas compartidas se explican una vez en Ayuda → Habilidades del básico. Cada ficha conserva el nombre y el efecto específico, y los cromos sin habilidad lo indican sin un párrafo repetido. Las advertencias de la selección son contextuales y no impiden atacar si la habilidad no puede activarse.

Feijóo no tiene habilidad adicional en el reparto de v31.0.2.8. Su doctrina de líder sigue siendo Vieja Guardia; no se le asigna una habilidad nueva para resolver una duda de interfaz. [Listado completo por habilidad](../../../docs/balance/oradores-con-habilidades-v31.0.2.8.md).
