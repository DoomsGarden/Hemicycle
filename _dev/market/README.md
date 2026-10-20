# Mercado de Hemiciclo

El juego estático permite vender repetidos a la máquina usando el guardado local.
Las operaciones entre jugadores se prueban con un servidor independiente y
datos de demostración. El servidor no importa ni modifica el guardado real.

## Arranque

Requiere Node.js 24 con `node:sqlite`; no necesita instalar paquetes para el
servidor ni para las pruebas de reglas. Desde la raíz del repositorio:

```sh
node _dev/market/server.cjs --demo --port 8022 --db /tmp/hemicycle-market-demo.sqlite
```

El proceso escucha solo en la interfaz local. Sirve el juego y la API en el
mismo origen. `/health` confirma la disponibilidad. El parámetro `--demo` es
obligatorio: este servidor está preparado para pruebas, no para cuentas reales.

Cada perfil de navegador obtiene una identidad distinta mediante una cookie
HttpOnly. Abre dos perfiles o dos contextos de Playwright para probar un acuerdo.
Cada cuenta recibe 6000 FS y una colección de prueba con repetidos. Las
colecciones varían para poder ensayar el filtro de cromos que faltan.
Identidades, inventario, reservas y operaciones se conservan en SQLite al
reiniciar con el mismo archivo.

El botón «Actualizar» recoge las nuevas ofertas y el estado de los intercambios.
Cuando no hay servidor, el juego muestra la venta local a la máquina y explica
que las operaciones entre jugadores necesitan conexión. Nunca presenta cuentas
simuladas como jugadores conectados a Internet.

## Economía

| Rareza | Referencia del sobre | Compra de la IA | Venta entre jugadores |
| --- | ---: | ---: | ---: |
| Común | 75 FS | 15 FS | 18 FS |
| Raro | 150 FS | 30 FS | 36 FS |
| Especial | 350 FS | 70 FS | 84 FS |
| Legendario | 580 FS | 116 FS | 140 FS |

La referencia respeta el valor esperado de los sobres existentes: 390 FS en el
común de 400, 800 en el raro de 800, 1380 en el legendario de 1500 y 2900 en el
mítico de 2900. La IA paga el 20 % de esa referencia. El precio entre jugadores
es **el precio de compra de la IA × 1,20**, redondeado hacia arriba.
Vender a la máquina el contenido de cualquier sobre comprado recupera menos
FS de los que costó; no permite obtener beneficio abriendo y revendiendo sobres.

El suplemento para subir una rareza se calcula como
`techo((precio IA superior − precio IA inferior) × 1,20)`:
18 FS de común a raro, 48 de raro a especial y 56 de especial a legendario.
El suplemento se transfiere al dueño del cromo superior; no es una comisión
adicional cobrada por el servidor.

También se permite entregar dos cromos de la rareza inmediatamente inferior
por uno superior, sin suplemento. Pueden ser dos copias del mismo cromo o dos
cromos distintos. Se muestran los valores de ambos lados para que el jugador
pueda comparar esta alternativa. No se permiten diferencias de dos rarezas.

Solo se venden o intercambian copias repetidas. Se conserva una copia de cada
cromo; el inventario reservado deja de estar disponible para otras operaciones.

## Revisión y ejecución

- Ventas y compras muestran cantidad, destinatario e importe en una sola ventana.
  El tick central tiene inicialmente el aspecto de Cancelar; al pulsarlo se pone
  verde y habilita la acción final. Marcarlo no cobra ni reserva nada.
- Cambiar la cantidad de compra elimina la marca del tick y exige revisar de
  nuevo el importe. La API comprueba el presupuesto antes de ejecutar la compra.
- Cada jugador acepta un intercambio una sola vez desde esa misma ventana.
  El proponente reserva su parte al enviar; la aceptación del otro jugador
  verifica y reserva su parte y completa ambas entregas en una transacción.
  Las propuestas anteriores también pueden aceptarse desde la nueva interfaz.
- Cancelar o dejar caducar la propuesta devuelve las reservas. El límite es de
  quince minutos. Los reintentos no duplican cobros, entregas o devoluciones.
- La API determina las cantidades, los precios y la propiedad. Sus respuestas
  privadas llevan `no-store` y el service worker no intercepta la API.

## Comprobaciones

```sh
node --test tests/*.test.cjs
node _dev/market/browser-check.cjs
node _dev/checks/gold-browser.cjs
node _dev/checks/pwa-v30.2.56.cjs
```

La comprobación de navegador necesita Playwright y Chromium. En el entorno
de nube ambos están disponibles; `CHROMIUM_PATH` permite elegir el ejecutable
del navegador para `browser-check.cjs`. Las comprobaciones de animación
requieren que el servidor esté activo en el puerto 8022. Los resultados de la
revisión actual se conservan en `_dev/reports/v30.2.56/`.

`_dev` se excluye de GitHub Pages. El alojamiento público de la API y la unión
con las cuentas y el inventario autoritativo del futuro juego online siguen
pendientes; publicar el sitio estático no convierte el servidor de pruebas en
un servicio online.
