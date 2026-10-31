# v31.0.2.11 · Pulido de perfil y mesa

Corrección dentro de la misma versión; caché `hemiciclo-v31.0.2.11-polish1`. No requiere migración SQL.

- Perfil: escena arquitectónica, cabecera centrada, emblema según menú, miniaturas ilustradas y desplazamiento interior con marco fijo.
- Editor: imágenes decodificadas y fuentes locales preparadas antes de aplicar; conserva ventana, foco y desplazamiento. La última selección de cada categoría prevalece y un fallo conserva la anterior.
- Mesa: solo el tapete/reverso propios se toman de las preferencias locales. El servidor conserva los dos identificadores públicos del rival humano; IA y salas anteriores sin metadatos usan Clásico. La moneda es local al espectador, sin alterar sorteo ni animación.
- Reverso del mazo sin textos superpuestos; contador y recuperación fuera del dibujo.
- Liga: marco exterior fijo y tabla desplazable interior, sin filas delante de los bordes. Desafíos y venta siguen el material seleccionado.
- Tipografía del menú extendida a controles y navegación; selector de frases y contexto documental conservan la fuente de lectura.
- Se evita enviar presentaciones sin TdP suficiente. Los avisos explican la jugada y no la llaman «partida descargada».

## Verificación

- **2.003 pruebas completas aprobadas**, 0 fallos: `NODE_PATH=/workspace/.hemicycle-tools/node_modules node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs`.
- `node _dev/build-offline.cjs --check`: motores históricos intactos.
- `profile-polish-v11.cjs`: 48 combinaciones de editor/perfil (320×568, 393×851, 768×1024 y 844×390; texto 100/116 %; seis menús), persistencia, seis tapetes, controles de mesa dentro del viewport y cabecera de Liga tras desplazar. Selecciones solapadas y recurso fallido conservan el resultado esperado y el mismo nodo de ventana.
- `profile-polish-v11-pwa.cjs`: actualización desde `3e6e2a0`, 219 recursos, carga sin conexión y conservación de progreso y elecciones. Doce disposiciones de Mercado.
- Pruebas SQL reales: ambos participantes conservan estilos distintos después de reiniciar y de repetir una operación; solo se publican `mat` y `back`. IA siempre clásica.
- Moneda: una sola moneda para cada espectador y estilo; resultado y duración de 2 segundos conservados.
- `art.json`: los cinco emblemas nuevos tienen la abertura central transparente para el nivel dinámico.

`browser/browser.json`, `pwa/pwa.json` y las capturas adjuntas documentan estas comprobaciones con perfiles locales de prueba.

## Recursos

Ocho WebP nuevos, generados para el juego: tres escenas (hemiciclo, archivo y sala orbital) y cinco emblemas. Compresión desde los originales de generación; sin incorporaciones de imágenes de terceros. Lora y Rajdhani se incluyen con sus respectivas licencias SIL OFL en `fonts/` y no requieren peticiones de fuentes externas.
