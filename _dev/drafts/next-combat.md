> Borrador histórico: sustituido por v31.0.0.5. El ajuste final de Foco a 2 y el audio están validados en `_dev/releases/v31.0.0.5.md`; los resultados siguientes conservan la evolución anterior.

# Borrador: fuerte cíclico, 90 segundos y cinco gabinetes

El propietario aceptó la idea de un fuerte que caduque, ciclo de tres turnos y coste de 1 Aguante con mínimo 2. Pidió un icono de tres secciones dentro de la frase del pop-up, 90 segundos de turno y cinco favoritos editables desde Colección. Preguntó por propuestas de defensa/curación: el propietario ha aprobado e incorporado las restricciones de apoyo descritas abajo.

## Preparado

- Entrada T: fuerte en T+2, T+5, T+8… La disponibilidad caduca aunque no se use. Tras usarlo, su espera indica tres turnos propios; el siguiente empieza con una sección cargada. El icono del pop-up distingue una, dos y tres secciones y muestra el coste.
- El motor exige 2 Aguante y cobra 1 al ejecutar un ataque válido. Seleccionar/cancelar y un objetivo inválido no cobran. El coste directo no consume el escudo; una represalia posterior sí puede expulsar al atacante. La IA respeta las mismas reglas y predice la próxima ventana del rival.
- 90 segundos reales por turno, incluida navegación a otro menú. El tutorial sigue sin límite y enseña el coste y la ventana del fuerte.
- Cinco favoritos. Colección permite editar cromos y líder, guardar, cancelar, elegir al azar y vaciar. Antes del combate solo se seleccionan; Rápida genera un equipo transitorio sin modificar favoritos. Los perfiles antiguos reciben una vista inicial con sus cinco primeros cromos distintos, sin escribirla hasta que se guarda o usa. Si faltan cromos de un favorito, se conserva la composición y se pide repararla.
- Favoritos opcionales en el perfil y respaldo: cinco slots validados, selección, IDs y líder. Las copias antiguas siguen siendo compatibles. Se verificó el transporte mediante funciones PostgreSQL locales y SDK oficial; no requiere migración SQL.

## Apoyo aprobado e implementado

- Defensa: reduce a la mitad un único golpe positivo recibido durante el turno actual o el rival. Si no se consume, caduca al comenzar el siguiente turno propio. No se acumula.
- Curación activa: conserva la mitad del Aguante perdido, redondeo hacia arriba, mínimo 3 y máximo del cromo. Curarse en T bloquea la curación en T+1 y vuelve a permitirla en T+2. Cada cromo lleva su propio descanso; puede atacar o defender mientras descansa. La curación pasiva de Foco permanece intacta.
- Validación en motor, IA y botón del pop-up; una curación rechazada no consume la acción. Expulsión y reentrada limpian los efectos transitorios. Ayuda y tutorial explican las dos restricciones.

## Validación

269 tests pasan y falla el existente de equilibrio de pasivas. Con ambas restricciones, la batería de 3456 casos emparejados da Verborrea 45,1042 %, Guardia 55 %, Aforado 44,6875 %, Giro 44,4792 %, Foco 57,0833 % y Viperina 53,6458 %. Todos conservan su ventaja y debilidad circular; Foco excede ligeramente el margen agregado de 43–57 %. Se conservan los umbrales y se registra el fallo. No es una estimación de todos los jugadores o gabinetes posibles.

El informe anterior al ajuste de apoyo sigue archivado en balance-current.json: Guardia 57,8125 % y Aforado 37,2917 %. El informe actual es balance-support.json.

Una alternativa diagnóstica que salva Aforado con 2 en vez de 1 Aguante se probó exclusivamente dentro de una máquina virtual: solo eleva su agregado a 39,0625 %, por lo que tampoco se propone como arreglo suficiente. El juego conserva Aforado con 1 y las demás pasivas intactas.

Comprobaciones funcionales: ocho partidas completas (cuatro modos y ambos primeros turnos), 18 cierres inmediatos, dos inactividades a 90 segundos con comprobación de que a 60 sigue en curso, 360 frases en cuatro tamaños, tres tutoriales completos de 32 pasos, teclado, movimiento reducido y cancelación. Favoritos en tres tamaños, líder, guardado, cancelación, recarga, selección sin edición en precombate, reparación de cromo ausente y descarga del respaldo. Nube con favoritos en SDK/PostgreSQL local, conflicto entre dispositivos y reconexión. Actualización y 34 assets sin conexión, con perfil y Liga conservados.

## Pendiente de decisión

Revisar la ligera desviación agregada de Foco antes de publicar el conjunto. Se mantiene sin cambios la versión pública v31.0.0.4. La caché local del borrador se llama hemiciclo-v31.0.0.5-draft; la versión visible no se incrementa ni se modifica el changelog hasta preparar la publicación.

Se verificaron además los botones de apoyo en tres tamaños con las transiciones reales de turno: curación deshabilitada durante el descanso, defensa caducada al siguiente turno propio y curación de nuevo disponible después del descanso. Pruebas del motor para ambos bandos y compatibilidad con Foco.

Informes: _dev/reports/next-combat/. Capturas: _dev/previews/next-combat/.

Ajuste visual solicitado: botones favoritos compactos de 44 px, identificados solo por 1–5, puntos gris/verde conservados y sin el párrafo explicativo del panel de Colección. Se mantienen los nombres accesibles con número y estado. Verificado en 320×568, 393×851 y 851×393, incluidos edición, guardado/cancelación y selección precombate.
