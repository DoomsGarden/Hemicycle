# v31.0.2.3 — Botonera de Inicio e historial por modos

Opciones y Buzón permanecen visibles. La flecha inferior despliega/recoge Logros e Historial con transición, sin cambiar la geometría de las cartas de portada o Jugar. La botonera tiene prioridad visual sobre los elementos del menú. Los botones ocultos quedan inertes para teclado. Si hay logros sin reclamar, la flecha recogida tiene brillo de respiración (estático con movimiento reducido); Logros conserva su señal propia al desplegar.

Historial conserva acceso desde Perfil y añade acceso directo desde Inicio. Se separa en Normal, Clasificatoria, Liga y Rápida, con cuatro botones en una fila y selección por ratón/tacto o flechas/Inicio/Fin. La etiqueta Clasif. se abrevia a menos de 360 px y mantiene el nombre accesible completo. Se conserva el desplazamiento por modo, la selección y el foco durante las actualizaciones de recibos. Exportar balance sigue usando todos los modos, con la misma eliminación de datos personales.

Las nuevas partidas rápidas locales se registran como Rápida incluso si el resultado contiene el modo base Normal. No se reclasifican registros antiguos sin datos suficientes. Las guías explican el desplegable sin pasos adicionales, y restauran su estado previo al terminar.

## Verificación

- 594 pruebas automatizadas correctas.
- Chromium a 320×568, 393×851 y 844×390, texto 116 %: botones iniciales, inactividad de extras recogidos, transición, geometría de portada/Jugar idéntica antes/después, apertura desde Inicio, cuatro modos en una fila y retorno de foco al cerrar.
- Datos locales controlados: un registro por modo; la exportación incluye los cuatro aunque solo uno esté visible. Dos registros repetidos de una rápida generan una sola entrada nueva en Rápida, no en Normal.
- Logros pendientes: aviso visible en flecha y animación según movimiento reducido. Sin cambios al perfil económico al navegar.
- Guías completas de menú y combate, sin cambios de premios.
- PWA desde 1e80ecf: 113 recursos, actualización y navegación offline, progreso/Liga/audio conservados. Build offline y diff correctos.

Los datos son de pruebas locales. No se consulta una cuenta privada ni se modifica la economía o la base de producción. No requiere SQL ni reinicio de cuentas.
