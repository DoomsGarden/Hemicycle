# Guía y revisión de habilidades — v31.0.2.8

Ayuda → Habilidades del básico incluye un desplegable con ejemplos de las 14 habilidades. La ficha y el selector explican Letra pequeña como un punto que atraviesa la reducción de la defensa del 50 %, diferenciándolo de curación, Zasca base, fuerte y absorción de Argumentario plastificado.

La [revisión de funcionamiento y reparto](../../../docs/balance/revision-habilidades-v31.0.2.8.md) describe los estados y propone alternativas para los portadores defensivos de menor Aguante. Las propuestas **no se asignan**. No se modifican reglas, estadísticas, costes, escaños, doctrinas, fuerte ni Elo.

## Validación

- [224 pruebas relevantes](tests.log): selección de habilidades, recuperación de ataques rechazados, apoyo directo, prioridad de estados, compatibilidad y aleatoriedad verificada. No se repite la suite completa por cambios de explicación y presentación.
- [Revisión de datos](review.json): las 14 habilidades y sus 120 portadores, con Aguante base y de líder. `_dev/balance/ability-guide-review.cjs` genera también el documento de revisión. No es una simulación del reparto propuesto.
- Letra pequeña se ejecuta en ambos motores con Z2/4/7/8, con/sin defensa y con/sin preparación. Con defensa: **1→2, 2→3, 4→5 y 4→5**, respectivamente. Sin defensa no suma daño. Se verifica el consumo. Los ejemplos de combinación con absorción, vulnerabilidad y fuerte están cubiertos por las pruebas existentes.
- [Navegador](after.json): 14 ejemplos visibles en Ayuda, fichas de Feijóo y Ana Pastor con la explicación de Letra pequeña, cuatro tamaños y dos escalas. Sin desbordamiento ni errores, progreso idéntico. Ejemplo: [guía al 116 %](guide-116.png).
- Renderizado del menú a DPR3, cuatro portadas y ocho pares de tamaño/escala: [antes](before.json) / [después](after.json). Las dimensiones y posiciones del cromo y de su bloque inferior no varían; diferencia máxima medida 0 px. Se conservan las capturas de referencia y revisión.
- [PWA](pwa/pwa.json): actualización desde `f22db8d`, caché `hemiciclo-v31.0.2.8-guide1`, 155 recursos, ayudas disponibles sin conexión y progreso conservado.
- Motor offline reproducible y hash legal sin cambios. El motor sigue en basic3/offline6 y no requiere SQL.

La publicación conserva v31.0.2.8 y su etiqueta original, con las ramas de Pages y Render sincronizadas. No se espera ni comprueba el despliegue de Pages.
