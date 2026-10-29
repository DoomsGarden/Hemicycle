# Segunda tanda de habilidades — añadido de v31.0.2.8

Ocho habilidades nuevas cubren los 53 oradores pendientes; los 120 tienen una asignación y se conservan las 67 anteriores. [Reparto completo](../../../docs/balance/oradores-con-habilidades-v31.0.2.8.md) y [reglas](../../../docs/balance/segunda-tanda-propuestas.md).

## Ajuste inicial

- Comunes de coste 1: utilidad propia condicionada —Letra pequeña o reserva de un TdP—. Comunes de coste 2: control leve de votos, coste de apoyo o ataques a huecos.
- Raros de coste 2 y legendarios de coste 4: Letra pequeña o Debate encarrilado, sin daño ni Aguante permanentes. Raros de coste 3: control o protección de compañeros.
- Especiales: protección o utilidades de equipo; solo tres reciben robo y tres recuperación de acciones. Las estadísticas y los escaños aprobados no cambian.
- Una plaza de estado por cromo, sin renovación o sustitución, y recuperación de dos turnos propios. Los efectos instantáneos dejan una marca hasta cerrar el turno. Si no hay candidato válido no gastan recuperación.
- Ventanilla rápida elige **al azar** entre las cartas de acción de apoyo elegibles del mazo, con al menos dos turnos de espera restantes. Adelanta una en un turno, una vez por jugador y partida. No afecta a la curación de la tercera frase. La elección descargada usa el generador con semilla del registro verificado.

## Evidencias

| Comprobación | Resultado |
|---|---|
| Suite completa | 913 pruebas correctas; [registro](tests.log). Incluye 14×14 bloqueos, turnos, reserva, límites de mano, costes, redirección sin cadenas, defensa/vulnerabilidad/absorción, objetivos, ataques fuertes y partidas antiguas. |
| Simulaciones | [5.760 parejas / 11.520 partidas](simulations.json). Los 120 oradores como líderes/miembros; doctrinas favorables/desfavorables/espejo, 0/2 acciones de apoyo, dos semillas y ambas iniciativas. Se compara la primera tanda con ambas tandas, manteniendo estadísticas y política de IA. |
| Ritmo | Mediana 9 → 9 rondas, media 8,608 → 8,670. Victorias de quien empieza 58,99 % → 58,13 %. Ventanilla se activa en 1.515 de las 5.760 partidas nuevas de la muestra. |
| Iconos e interfaz | [Resultados](ui/after.json): 120 fichas y frases; 320/393/768/844 px a 100/116 %. Los 14 símbolos se consultan en el orador afectado. Coste de Papeles visible y apoyos desactivados sin TdP; huecos bloqueados por Debate sin perder el cierre. Conservación visual de estados basic1. |
| Ejemplos | [Papeles y coste](ui/paperwork-cost.png), [Yo respondo](ui/escort.png), [Ventanilla](ui/fasttrack.png), [selector a 116 %](ui/phrases-393-116.png). |
| Regresión de bloqueo | [Recuperación](recovery/after.json): rechazo de ataque, apoyo posterior sin reiniciar, varios atacantes al mismo rival y objetivo desaparecido. |
| Guías | [Invitado/adulto](guides/browser.json): práctica de 8 pasos, guía completa de 36 y opciones al 116 %, sin cambiar progreso. |
| IndexedDB real | [Compatibilidad](offline-client.json): reanuda offline4/basic1, conserva y liquida premios pendientes, renueva el lote a offline5/basic2, reanuda el nuevo y separa cuentas. |
| PWA | [Actualización desde e5667e8](pwa/pwa.json): 153 recursos, caché wave2, carga sin conexión y progreso conservado. |
| Replay | Partidas completas con Ventanilla coinciden jugada por jugada entre navegador y servidor. Las dos ramas de elección con dos acciones elegibles se verifican explícitamente. |
| PostgreSQL | Migración nueva aplicada dos veces en PGlite, sin cambiar guardados ni tickets previos. Descarga y liquidación offline4/offline5 con idempotencia y acceso solo de servidor. |

La muestra de IA es exploratoria. No demuestra equilibrio definitivo de PvP ni aísla el beneficio de un cromo: ambos equipos reciben efectos nuevos y los emparejamientos son pequeños por individuo. Conviene contrastarla con partidas reales, especialmente el robo, la redirección y su interacción con doctrinas.

## Compatibilidad y activación

`offline1/2/3/4` permanecen byte a byte intactos. Las salas basic1 se ejecutan mediante el motor anterior; los estados y asignaciones antiguos se presentan con sus definiciones originales. Las nuevas partidas usan basic2 y las descargas verificadas offline5. No se alteran Elo, estadísticas, escaños, fórmula/ciclo del fuerte ni textos legales.

**Pendiente de ejecución manual en producción:** [`20261029_basic_effects_wave2.sql`](../../online/20261029_basic_effects_wave2.sql). El entorno no tiene acceso al SQL Editor de Supabase de producción. La rama está preparada para revisión; el cliente no se activa en `main` antes de confirmar esa actualización para evitar rechazar nuevas descargas. No se ha comprobado el despliegue de Pages.
