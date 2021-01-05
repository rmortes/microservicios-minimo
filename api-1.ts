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

  // Asegura que los parámetros se envíen
  if (Object.is(matricula, undefined)) {
    return res.status(400).end('No se han enviado la matricula necesaria');
  }

  // Busca el coche
  const coche = bd.coches[matricula as string] as Coche;

  // Se asegura de que el coche existe
  if (Object.is(coche, undefined)) {
    return res.status(404).end('No se encuentra el coche');
  }

  // Crea la transacción

  const id = Math.random().toString().substr(2, 8);
  const transaccion = {
    estado: "ABIERTA",
    coche: matricula,
  } as Transacción;

  bd.transacciones[id] = transaccion;
  
  // Sincroniza la base de datos con disco
  fs.writeFileSync("./bd-1.json", JSON.stringify(bd));

  res.send(JSON.stringify({
    id,
    ...transaccion,
    coche,
  }));
})

app.get('/confirmar', (req, res) => {
  // Extrae el parametro de la request
  const { transaccion } = req.query;

  // Asegura que los parámetros se envíen
  if (Object.is(transaccion, undefined)) {
    return res.status(400).end('No se han enviado la matricula necesaria');
  }

  // Busca la transaccion
  const trans = bd.transacciones[transaccion as string] as Transacción;

  // Se asegura de que la transaccion existe
  if (Object.is(trans, undefined)) {
    return res.status(404).end('No se encuentra la transacción');
  }

  // Se asegura de que la transacción sigue abierta
  if (trans.estado !== "ABIERTA") {
    return res.status(403).end('La transacción no está abierta');
  }

  // Completa la transacción
  trans.estado = "COMPLETADA";
  bd.transacciones[transaccion as string] = trans; // Honestamente, no se si esto hace falta. Tampoco molesta, pero

  // Elimina el coche
  delete bd.coches[trans.coche as string];

  // Sincroniza la base de datos con disco
  fs.writeFileSync("./bd-1.json", JSON.stringify(bd));

  res.send('OK');
})

app.get('/cancelar', (req, res) => {
  // Extrae el parametro de la request
  const { transaccion } = req.query;

  // Asegura que los parámetros se envíen
  if (Object.is(transaccion, undefined)) {
    return res.status(400).end('No se han enviado la matricula necesaria');
  }

  // Busca la transaccion
  const trans = bd.transacciones[transaccion as string] as Transacción;

  // Se asegura de que la transaccion existe
  if (Object.is(trans, undefined)) {
    return res.status(404).end('No se encuentra la transacción');
  }

  // Se asegura de que la transacción sigue abierta
  if (trans.estado !== "ABIERTA") {
    return res.status(403).end('La transacción no está abierta');
  }

  // Completa la transacción
  trans.estado = "CANCELADA";
  bd.transacciones[transaccion as string] = trans; // Honestamente, no se si esto hace falta. Tampoco molesta, pero

  // Sincroniza la base de datos con disco
  fs.writeFileSync("./bd-1.json", JSON.stringify(bd));

  res.send('OK');
})


app.listen(port, () => {
  console.log("Api 1 (coches) corriendo en http://localhost:"+port) 
})