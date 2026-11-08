# Resuelto en la corrección de distribución horizontal

El usuario informa el 8 de noviembre de 2026 de que no puede jugar ni gestionar
los menús de forma utilizable en horizontal. Pide publicar primero las auras de
las acciones y abordar después este problema. La corrección de auras no incluye
una adaptación nueva del modo horizontal.

Las comprobaciones de geometría de las auras en 844×390 no demuestran que todos
los controles, menús, ventanas y flujos completos sean utilizables en esa
orientación. Al retomarlo, reproducir navegación, configuración, colección,
tienda, preparación y combate, incluidos teclado, escalas de texto, zonas
seguras y altura disponible de una PWA móvil. Comprobar acceso a los controles y
desplazamiento real, además de ausencia de desbordamiento horizontal.


Implementación y comprobaciones: [revisión de distribución horizontal](../revisions/20261108-landscape/README.md). La adaptación incorpora navegación lateral, galería amplia y combate reorganizado. Las nuevas pruebas comprueban pulsaciones y recorridos completos, además de la posición de mano y mazo en terreno propio.
