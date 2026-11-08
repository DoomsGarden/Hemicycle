# Opción A: acabado, legibilidad y Confundido

Revisión solicitada el 8 de noviembre de 2026. Corrección de v32.0.0.2. El usuario confirmó el SQL y autorizó publicarla tras revisar el acabado. El usuario ha elegido A, ha pedido mejorar su acabado y medir la composición real antes de la publicación.

## Presentación

- Catorce auras con materiales SVG, gradientes, luz, partículas y siluetas diferentes. Llamas con desplazamiento de textura, protección de vidrio, armadura de láminas curvas, luz regeneradora, agua para Sosiego, ceniza, ligaduras, papeletas, lente de precisión y bloqueo de despliegue.
- Confundido no lleva signo de interrogación. Su emblema usa una corriente desorientada.
- Catorce emblemas del zasca con acabado de materiales; se reutilizan en cartas, consulta de habilidades, frases y previsiones. Los dos efectos instantáneos no inventan un estado persistente.
- Auras en z=3, lectura inferior en z=5 e icono del estado básico en z=9, con base opaca. El tamaño del indicador responde a la preferencia de iconos; el contador responde al texto. Los elementos decorativos no reciben pulsaciones.
- Los apoyos manuales conservan `supportMarkup()` y `support()` y sus animaciones anteriores. Limpieza, disipación y refuerzo de las acciones adoptan una llegada visual coherente con A.
- En horizontal compacto, el selector presenta las tres frases en paralelo y mantiene visibles ataque normal, fuerte, defensa y curación, incluso con el aviso de Confundido.
- Opciones en horizontal tiene pestañas Sonido/Lectura/Idioma/Otros; cabecera y cierre permanecen fuera del contenido desplazable. En vertical se ven todas las secciones.

## Confundido en nuevas partidas

Un único sorteo al confirmar un ataque válido normal o fuerte: 50 % al objetivo elegido, 25 % al propio orador y 25 % a otro aliado, escogido uniformemente. Si no hay aliados, su probabilidad pasa al autoataque. Se consume al atacar y también puede caducar por duración. Defender y curar mantienen su disponibilidad, recuperación y coste, sin sorteo ni consumo de Confundido. Las previsiones muestran incertidumbre, no un resultado sorteado ni una expulsión garantizada.

El daño se aplica al destinatario real con su defensa y modificadores. El fuerte paga su coste una vez. El fuego amigo no activa la habilidad adicional del básico ni Foco, ni concede votos al atacante. Una expulsión por confusión concede los escaños al rival. La animación de la frase termina en el destinatario real, incluido el propio atacante. Las intercepciones de básicos rivales se conservan; un autoataque o fuego amigo no se redirige mediante Yo respondo.

## Compatibilidad y publicación

Las nuevas partidas llevan `actionEffectsVersion:2` y las descargas nuevas usan `offline11`. La generación comprueba las huellas de los veinte archivos de motores anteriores y del módulo congelado. Las salas con la versión anterior se resuelven en `legacy-actions1.cjs`, congelado desde offline10. Los archivos originales de offline10 no se han modificado. Los motores anteriores siguen registrados o disponibles mediante carga por versión para reanudar y validar registros pendientes.

Secuencia de publicación:

1. `_dev/online/20261108_confusion_actions2.sql` amplía la lista de versiones aceptadas por la función existente y conserva sus permisos. El usuario confirmó su aplicación correcta en Supabase el 8 de noviembre de 2026.
2. Desplegar el servidor y el cliente compatibles tras revisar esta muestra visual.
3. Verificar el resultado de Pages y la revisión del servidor. La publicación está autorizada; su resultado se registra en `qa/deployment-verification.json`.

No hay nuevos datos personales, proveedores ni compras. Manifest mantiene la identidad y orientación actuales; no se modifica la edición legal. Se actualizan ayuda, README, notas y traducciones ES/EN/FR de las reglas nuevas.

## Verificación

- Pruebas de combate local/servidor, límites del sorteo, compañeros, autoataque, costes, apoyos, curación en recuperación, expulsión única, Aforado, previsiones sin azar y reglas históricas.
- PostgreSQL aislado: migración idempotente, conservación del cuerpo previo del RPC y permisos exclusivos de servicio.
- Repetición determinista de una partida completa offline11 y disponibilidad del motor offline10.
- `node _dev/build-offline.cjs --check` comprueba la reproducción y las huellas de los motores históricos.
- `browser.cjs` usa partidas de prueba sin cuenta real. Mide 320×568, 412×915, 568×320, 844×390 y 1024×768, texto e iconos al 100/116 %, y tres grupos que cubren las catorce auras: 60 configuraciones. Comprueba capa, encuadre y pulsación del indicador y su contador. Incluye los cuatro paneles de Opciones en 844×260, apoyos manuales, trayectoria de autoataque y movimiento reducido.
- Resultados en `qa/browser.json`, capturas y vídeo de revisión. Los controles y las capturas no afirman que se haya aplicado el SQL en producción.

La grabación muestra estados y resultados forzados solo en el fixture de revisión. No representa una partida de una cuenta real ni anticipa el sorteo del jugador.
