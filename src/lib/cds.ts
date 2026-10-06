// src/lib/cds.ts
// Las cuatro CDs del dropdown. Agregar una es agregar una línea acá
// más el valor en el enum CD de prisma/schema.prisma.
import { CD } from "@prisma/client";

export const CDS: { value: CD; label: string }[] = [
  { value: "ZACAPA", label: "CD Zacapa" },
  { value: "PROGRESO", label: "CD Progreso" },
  { value: "ESCUINTLA", label: "CD Escuintla" },
  { value: "BARBERENA", label: "CD Barberena" },
];

export function cdLabel(value: CD): string {
  return CDS.find((s) => s.value === value)?.label ?? value;
}
