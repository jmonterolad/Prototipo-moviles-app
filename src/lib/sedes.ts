// src/lib/sedes.ts
// Las cuatro sedes del dropdown. Agregar una es agregar una línea acá
// más el valor en el enum Sede de prisma/schema.prisma.
import { Sede } from "@prisma/client";

export const SEDES: { value: Sede; label: string }[] = [
  { value: "ZACAPA", label: "Sede Zacapa" },
  { value: "PROGRESO", label: "Sede Progreso" },
  { value: "ESCUINTLA", label: "Sede Escuintla" },
  { value: "BARBERENA", label: "Sede Barberena" },
];

export function sedeLabel(value: Sede): string {
  return SEDES.find((s) => s.value === value)?.label ?? value;
}
