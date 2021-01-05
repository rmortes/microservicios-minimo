`
Esta API se encarga de administrar un banco
/cobrar?cuenta&dinero -> 200 | 400 | 403 | 404
`

import express from "express";
import fs from "fs";
import bd from "./bd-2.json";
import { Usuario } from "./types"

const app = express();
const port = 3001;

app.get('/cobrar', (req, res) => {
  // Extrae los parámetros cuenta y dinero de la request (?cuenta=xxx&dinero=123)
  const { cuenta, dinero } = req.query;
  console.log(cuenta,dinero)

  // Asegura que los parámetros se envíen
  if (Object.is(cuenta, undefined) || Object.is(dinero, undefined)) {
    res.status(400).end('No se han enviado la cuenta y el dienero necesarios');
  }

  // Convierte el dinero a Number y busca el usuario
  const dineroNumber = Number(dinero);
  const usuario = bd.usuarios[cuenta as string] as Usuario;

  // Se asegura de que el usuario existe
  if (Object.is(usuario, undefined)) {
    res.status(404).end('No se encuentra el usuario');
  }

  // Se asegura de que se puede realizar la transacción
  if (usuario.dinero - dineroNumber < 0) {
    res.status(403).end('No hay suficiente efectivo');
  }

  // Realiza la transacción
  usuario.dinero -= dineroNumber;
  
  // Sincroniza la base de datos con disco
  fs.writeFileSync("./bd-2.json", JSON.stringify(bd));

  res.send('OK');
})


app.listen(port, () => {
  console.log("Api 2 (banco) corriendo en http://localhost:"+port) 
})