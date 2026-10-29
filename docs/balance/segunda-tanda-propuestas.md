# Segunda tanda — reglas de la prueba

Implementación solicitada tras revisar las propuestas: ocho efectos nuevos para los 53 oradores restantes. Se conservan los seis efectos anteriores, sus asignaciones y todas las estadísticas base. El reparto completo está en [Oradores por habilidad](oradores-con-habilidades-v31.0.2.8.md).

## Fuera del acta

Tras causar daño con un básico, el rival que sobreviva aporta 1 voto pasivo menos en su próximo turno. No cambia sus escaños de expulsión ni los 3 votos base.

## Papeles traspapelados

Tras causar daño con un básico, la próxima defensa o curación voluntaria del rival que sobreviva cuesta 1 TdP. Caduca al terminar su siguiente turno. No afecta a cartas de acción.

## Yo respondo

Tras causar daño con un básico a un orador, desvía hacia sí el próximo básico dirigido a otro compañero, una sola vez. Caduca al terminar su siguiente turno. No atrae fuertes, acciones ni ataques a huecos.

## Letra pequeña

Tras causar daño con un básico a un orador, su siguiente básico recupera 1 punto del daño evitado por una defensa del 50 %, sin superar el daño sin defensa. Se consume aunque no haya defensa y caduca al terminar su siguiente turno.

## Dietas guardadas

Tras causar daño con un básico a un orador, reserva 1 TdP sobrante al cerrar el turno y lo devuelve al comenzar el siguiente. Una reserva por bancada, tope de 8 TdP. Se pierde si sale el portador; no crea recursos.

## Llamada al suplente

Tras causar daño con un básico a un orador, roba un común de tu propio mazo si tienes menos de dos oradores en mano. No crea copias ni rescata expulsados. Hay que pagar su coste para presentarlo.

## Ventanilla rápida

Tras causar daño con un básico a un orador, adelanta 1 turno la recuperación de una carta de acción de apoyo del mazo a la que le queden al menos 2 turnos. Si hay dos elegibles, escoge una al azar. Una activación por jugador y partida. No afecta a la curación del orador.

## Debate encarrilado

Tras causar daño con un básico, el rival que sobreviva no puede dirigir su próximo básico a un hueco para retirar votos. Puede atacar oradores o usar apoyos y fuertes. Caduca al terminar su siguiente turno.

## Límites compartidos

Un estado básico por orador: no se sustituye, acumula ni renueva. Una activación cada dos turnos propios; los intentos bloqueados o sin objetivo elegible no gastan la recuperación. Los efectos inmediatos dejan un icono hasta cerrar el turno y ocupan la misma plaza. Solo se activan al causar daño con un básico a un orador; atacante y, para estados negativos, objetivo deben sobrevivir. No se altera el fuerte.

Letra pequeña y Debate encarrilado son las utilidades condicionales de los raros de coste 2 y legendarios de coste 4, ya eficientes. Llamada al suplente y Ventanilla rápida quedan en tres especiales cada una. Yo respondo ocupa una plaza sin añadir Aguante; se desvía un básico una sola vez, sin encadenar protectores.

Ventanilla rápida afecta a cartas de acción de apoyo —curación, defensa o mejora— en el mazo, con al menos dos turnos de recuperación restantes. No acorta la curación de la tercera frase ni devuelve una intervención al orador. A petición de Dooms, si hay dos candidatas se elige una al azar; en partidas descargadas ese azar usa la semilla verificada. Una por jugador y partida, aunque el portador salga y vuelva a entrar.

## Comprobación y alcance

Se verifican los 14 × 14 bloqueos entre estados y las interacciones con defensa, vulnerabilidad, absorción, reflejos, expulsión y votos. La comparación exploratoria incluye 11.520 partidas con los 120 oradores como líderes y miembros, cruces favorables/desfavorables/espejo, 0/2 acciones y ambas iniciativas. No demuestra equilibrio definitivo entre jugadores humanos ni atribuye a una sola habilidad los cambios de victoria: ambos equipos reciben los añadidos.

Las partidas anteriores conservan sus motores originales. Para las nuevas partidas verificadas se incorpora offline5 sin sobrescribir offline1/2/3/4. La migración solo amplía la descarga admitida; no modifica inventarios, guardados, Elo ni premios.
