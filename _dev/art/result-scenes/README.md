# Escenas realistas de resultado

Arte generado para Hemicycle, preparado el 25 de octubre de 2026. No representa una grabación de una cámara legislativa real.

- `victory.png`: hemiciclo ceremonial, luz cálida, banderas azules/doradas y confeti.
- `defeat.png`: la misma arquitectura y encuadre, iluminación nocturna, banderas en reposo y sin confeti.

Los originales permanecen fuera de Pages. `node _dev/build-result-scenes.cjs` genera los WebP finales en `assets/results/`, con movimiento gradual de cámara, luz sutil y un bucle de aproximadamente 4,8 s, además de una imagen estática para movimiento reducido. El navegador añade partículas de confeti en la victoria.

La interfaz mantiene Siguiente bloqueado durante la comprobación de partida/guardado y el ciclo inicial. No simula una confirmación cuando hay un error. El paso a resultados exige pulsar Siguiente después de verificarse.
