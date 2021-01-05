export default interface Transaccion {
  estado: "ABIERTA" | "COMPLETADA" | "CANCELADA",
  coche: string,
}