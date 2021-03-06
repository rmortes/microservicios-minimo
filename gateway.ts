`
Esta API ata los otos dos microservicios (la BD decoches y la BD del banco)
para permitir a un cliente del banco comprar un coche. Las APIs deben de
estar encendidas en sus puertos (3001, 3002) para que gateway funcione
/comprar?matricula&cuenta -> 200
`

import express from "express";
import fetch from "node-fetch";
import { Coche, Transacción } from "./types";

const app = express();
const port = 3000;

app.get('/comprar', async (req, res) => {
  // Extrae los parámetros matricula y cuenta de la request
  const { matricula, cuenta } = req.query;
  console.log(`[GATEW] /comprar para matricula ${matricula} y cuenta ${cuenta}`)

  // Asegura que los parámetros se envíen
  if (Object.is(matricula, undefined) || Object.is(cuenta, undefined)) {
    console.error(`[GATEW] matricula o cuenta eran undefined. Asegurate de llamar /comprar?matricula=XXXX&cuenta=123`)
    return res.status(400).end('No se han enviado la matricula y la cuenta necesarios');
  }

  // Abrimos las transacciones necesarias, en este caso con la API 1
  console.log(`[GATEW] Solicitando transacción para coche ${matricula}`)
  let transaccion1promesa = fetch(`http://localhost:3001/solicitar?matricula=${matricula}`);

  // Esperamos a que nos devuelvan todas las transacciones
  const [ transaccion1 ] = await Promise.all([transaccion1promesa]);
  console.log(`[GATEW] Transacciones solicitadas`)
  
  // Tratamos posibles errores en las transacciones
  switch(transaccion1.status) {
    case 200: break;
    default: {
    console.error(`[GATEW] Ha habido algún error abriendo la transacción. Mira la respuesta para más info`)
    return res.status(transaccion1.status).end(await transaccion1.text());
    }
  }
  console.log(`[GATEW] Transacciones correctas`)

  // Si no hay errores, convertimos la respuesta en un json
  const t1body = await transaccion1.json();
  const coche = t1body.coche as Coche;

  // Llamamos a los servicios que pueden anular estas transacciones
  console.log(`[GATEW] Solicitando pago para cuenta ${cuenta}`)
  let servicio1promesa = fetch(`http://localhost:3002/cobrar?cuenta=${cuenta}&dinero=${coche.precio}`);

  // Esperamos las respuestas
  const [ servicio1 ] = await Promise.all([servicio1promesa]);
  console.log(`[GATEW] Pago solicitado`)

  // Tratamos las posibles respuestas, resolviendo las transacciones conforme podamos
  const respuestasTransacciones = [];
  switch(servicio1.status) {
    case 200: {
      // Hay dinero suficiente para pagar, por lo tanto, se compra el coche
      respuestasTransacciones.push(fetch(`http://localhost:3001/confirmar?transaccion=${t1body.id}`));
      break;
    };
    default: {
      // Ha ocurrido algún error, cancelamos la transacción
    console.error(`[GATEW] Ha habido algún error durante el pago. Mira la respuesta para más info`)
    console.error(`[GATEW] Cancelando transacción`)
    fetch(`http://localhost:3001/cancelar?transaccion=${t1body.id}`); // Nota: Dependiendo del caso, merece la pena valorar
                                                                        //       si queremos tratar errores que pueda dar el
                                                                        //       cancelar una transacción. En este caso, no
      // Devolvemos el error que nos ha dado el servicio
      return res.status(servicio1.status).end(await servicio1.text());
    }
  }
  console.log(`[GATEW] Pago ejecutado correctamente. Coche comprado`)
  
  res.send('OK');
})


app.listen(port, () => {
  console.log("Gateway corriendo en http://localhost:"+port) 
})