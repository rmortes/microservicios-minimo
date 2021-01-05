`
Esta API se encarga de administrar una base de datos de coches.
/solicitar/?matricula -> Transacción
/confirmar/?transaccion -> 200 | 400 | 403 | 404
/cancelar/?transaccion -> 200
`

import express from "express";
import fs from "fs";
import bd from "./bd-1.json";
import { Coche, Transacción } from "./types";

const app = express();
const port = 3001;

app.get('/solicitar', (req, res) => {
  // Extrae el parametro de la request
  const { matricula } = req.query;
  console.log(`[API-1] /solicitar con matrícula ${matricula}`)

  // Asegura que los parámetros se envíen
  if (Object.is(matricula, undefined)) {
    console.error(`[API-1] matricula era undefined. Asegurate de llamar /solicitar?matricula=0001`)
    return res.status(400).end('No se han enviado la matricula necesaria');
  }

  // Busca el coche
  console.log(`[API-1] Buscando el coche con matricula ${matricula}`)
  const coche = bd.coches[matricula as string] as Coche;

  // Se asegura de que el coche existe
  if (Object.is(coche, undefined)) {
    console.error(`[API-1] No existe un coche con matrícula ${matricula}`)
    return res.status(404).end('No se encuentra el coche');
  }

  // Crea la transacción
  const id = Math.random().toString().substr(2, 8);
  const transaccion = {
    estado: "ABIERTA",
    coche: matricula,
  } as Transacción;

  bd.transacciones[id] = transaccion;
  console.log(`[API-1] Creada transacción ${id} para el coche con matrícula ${matricula}`)
  
  // Sincroniza la base de datos con disco
  fs.writeFileSync("./bd-1.json", JSON.stringify(bd));
  console.log(`[API-1] BD sincronizada`)

  res.send(JSON.stringify({
    id,
    ...transaccion,
    coche,
  }));
})

app.get('/confirmar', (req, res) => {
  // Extrae el parametro de la request
  const { transaccion } = req.query;
  console.log(`[API-1] /confirmar para transacción ${transaccion}`)

  // Asegura que los parámetros se envíen
  if (Object.is(transaccion, undefined)) {
    console.error(`[API-1] transaccion era undefined. Asegurate de llamar /confirmar?transaccion=XXXXXXXX`)
    return res.status(400).end('No se han enviado la transaccion necesaria');
  }

  // Busca la transaccion
  console.log(`[API-1] Buscando la transacción ${transaccion}`)
  const trans = bd.transacciones[transaccion as string] as Transacción;

  // Se asegura de que la transaccion existe
  if (Object.is(trans, undefined)) {
    console.error(`[API-1] No existe la transacción ${transaccion}`)
    return res.status(404).end('No se encuentra la transacción');
  }

  // Se asegura de que la transacción sigue abierta
  if (trans.estado !== "ABIERTA") {
    console.error(`[API-1] La transacción ${transaccion} no está abierta`)
    return res.status(403).end('La transacción no está abierta');
  }

  // Completa la transacción
  trans.estado = "COMPLETADA";
  bd.transacciones[transaccion as string] = trans; // Honestamente, no se si esto hace falta. Tampoco molesta, pero
  console.log(`[API-1] La transacción ${transaccion} ha sido completada`)

  // Elimina el coche
  delete bd.coches[trans.coche as string];
  console.log(`[API-1] El coche con matrícula ${trans.coche} ha sido comprado y eliminado`)

  // Sincroniza la base de datos con disco
  fs.writeFileSync("./bd-1.json", JSON.stringify(bd));
  console.log(`[API-1] BD sincronizada`)

  res.send('OK');
})

app.get('/cancelar', (req, res) => {
  // Extrae el parametro de la request
  const { transaccion } = req.query;
  console.log(`[API-1] /cancelar para transacción ${transaccion}`)

  // Asegura que los parámetros se envíen
  if (Object.is(transaccion, undefined)) {
    console.error(`[API-1] transaccion era undefined. Asegurate de llamar /cancelar?transaccion=XXXXXXXX`)
    return res.status(400).end('No se han enviado la transaccion necesaria');
  }

  // Busca la transaccion
  console.log(`[API-1] Buscando la transacción ${transaccion}`)
  const trans = bd.transacciones[transaccion as string] as Transacción;

  // Se asegura de que la transaccion existe
  if (Object.is(trans, undefined)) {
    console.error(`[API-1] No existe la transacción ${transaccion}`)
    return res.status(404).end('No se encuentra la transacción');
  }

  // Se asegura de que la transacción sigue abierta
  if (trans.estado !== "ABIERTA") {
    console.error(`[API-1] La transacción ${transaccion} no está abierta`)
    return res.status(403).end('La transacción no está abierta');
  }

  // Completa la transacción
  trans.estado = "CANCELADA";
  bd.transacciones[transaccion as string] = trans; // Honestamente, no se si esto hace falta. Tampoco molesta, pero
  console.log(`[API-1] La transacción ${transaccion} ha sido cancelada`)

  // Sincroniza la base de datos con disco
  fs.writeFileSync("./bd-1.json", JSON.stringify(bd));
  console.log(`[API-1] BD sincronizada`)

  res.send('OK');
})


app.listen(port, () => {
  console.log("Api 1 (coches) corriendo en http://localhost:"+port) 
})