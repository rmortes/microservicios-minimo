# Mínimo de Microservicios
Una (**muy**) pequeña demo de microservicios que me he montado en un rato

## Como ejecutar
Si estás usando npm:

Para instalar
```bash
npm install
```

Para ejecutar
- API 1 (coches): `npm run api-1`
- API 2 (banco): `npm run api-2`
- Gateway: `npm run gateway`

---

Si estás usando yarn:

Para instalar
```bash
yarn install
```

Para ejecutar
- API 1 (coches): `yarn run api-1`
- API 2 (banco): `yarn run api-2`
- Gateway: `yarn run gateway`

> Nota: Las dos APIs deben  de estar activas para que el gateway funcione correctamente.
> No es necesario ejecutarlas antes del gateway, pero tampoco hace daño hacerlo

## Método de funcionamiento
Esta pequeña demo está montada de forma que sea relativamente sencilla hacerle una vivisección a cada parte.
Los tres archivos de código están modestamente comentados, de forma que se pueda entender todo con un conocimiento
mínimo de Express.js, y la consola ofrece logs y errores bien sintácticos. Además, las "bases de datos" se sincronizan con las contrapartes de cada api en disco (`db-1.json` y `db-2.json`) para poder ver en directo que está pasando y por qué.

En esta demo se presenta el siguiente escenario: Un servidor central (`gateway`) conectado a una base de datos de coches (`api-1`) y a una pasarela de pago conectada a un banco (`api-2`). Mediante las rutas, el usuario puede proveer un ID del banco y la matrícula del coche que quiere comprar.

Si todo va bien, el servidor entonces le pide a la base de datos de coches que abra una transacción de compra. Con la transacción abierta y conociendo el precio que tiene que cobrar, el servidor solicita a la pasarela de pago que le confirme la transferencia. Cuando se confirma la transferencia, el servidor le confirma la transacción a la base de datos de coches.

Pero este proceso puede ir mal, y pueden haber errores por el camino que se tratan en el código.

## Restaurar las bases de datos
A menos que la líe, las bases de datos en el repositorio deberían de ser congruentes. Por lo tanto, si por algún motivo durante las pruebas, se rompen las bases de datos, siempre puedes restaurarlas al último commit con
```bash
git restore bd-2.json bd-1.json
```

O restaurarlas al estado que tienen en master con
```bash
git checkout origin/master -- bd-2.json bd-1.json
```