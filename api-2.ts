`
Esta API se encarga de administrar un banco
/cobrar?cuenta&dinero -> 200 | 400 | 403 | 404
`

import express from "express";
import fs from "fs";
import bd from "./bd-2.json";
import { Usuario } from "./types";

const app = express();
const port = 3002;

app.get('/cobrar', (req, res) => {
  // Extrae los parámetros cuenta y dinero de la request (?cuenta=xxx&dinero=123)
  const { cuenta, dinero } = req.query;
  console.log(`[API-2] /cobrar para cuenta ${cuenta} con dinero ${dinero}`)

  // Asegura que los parámetros se envíen
  if (Object.is(cuenta, undefined) || Object.is(dinero, undefined)) {
    console.error(`[API-2] cuenta o dinero eran undefined. Asegurate de llamar /cobrar?cuenta=XXXX&dinero=123`)
    return res.status(400).end('No se han enviado la cuenta y el dinero necesarios');
  }

  // Convierte el dinero a Number y busca el usuario
  const dineroNumber = Number(dinero);
  console.log(`[API-2] Buscando el usuario ${cuenta}`)
  const usuario = bd.usuarios[cuenta as string] as Usuario;

  // Se asegura de que el usuario existe
  if (Object.is(usuario, undefined)) {
    console.error(`[API-2] No existe el usuario ${cuenta}`)
    return res.status(404).end('No se encuentra el usuario');
  }

  // Se asegura de que se puede realizar la transacción
  if (usuario.dinero - dineroNumber < 0) {
    console.error(`[API-2] El usuario ${cuenta} no tiene suficiente dinero (Tiene ${usuario.dinero}, le cobran ${dineroNumber})`)
    return res.status(403).end('No hay suficiente efectivo');
  }

  // Realiza la transacción
  usuario.dinero -= dineroNumber;
  console.log(`[API-2] Se le han cobrado ${dineroNumber} a ${cuenta}`)
  
  // Sincroniza la base de datos con disco
  fs.writeFileSync("./bd-2.json", JSON.stringify(bd));
  console.log(`[API-2] BD sincronizada`)

  res.send('OK');
})


app.listen(port, () => {
  console.log("Api 2 (banco) corriendo en http://localhost:"+port) 
})