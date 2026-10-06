// src/lib/slots.ts
//
// FUENTE ÚNICA DE VERDAD de los horarios y la regla de anticipación.
// Si el cliente te dice otros horarios, cambiás TIME_BLOCKS acá y todo
// lo demás (calendario, formulario, validaciones) se acomoda solo.

/** Días mínimos de anticipación para poder reservar. */
export const ADVANCE_DAYS = 5;

export type Period = "AM" | "PM";

export type TimeBlock = {
  id: string;
  label: string;
  period: Period;
};

/**
 * Bloques de 2 horas. "Toda la mañana" = todos los AM, "toda la tarde" =
 * todos los PM, así que no hay que definirlos aparte.
 *
 * OJO: estos horarios son un supuesto (8–12 y 1–5). Ajustalos cuando
 * te confirmen la jornada real de la móvil.
 */
export const TIME_BLOCKS: TimeBlock[] = [
  { id: "08-10", label: "8:00 – 10:00 AM", period: "AM" },
  { id: "10-12", label: "10:00 AM – 12:00 MD", period: "AM" },
  { id: "13-15", label: "1:00 – 3:00 PM", period: "PM" },
  { id: "15-17", label: "3:00 – 5:00 PM", period: "PM" },
];

export const MORNING_BLOCK_IDS = TIME_BLOCKS.filter((b) => b.period === "AM").map((b) => b.id);
export const AFTERNOON_BLOCK_IDS = TIME_BLOCKS.filter((b) => b.period === "PM").map((b) => b.id);

export const ALL_BLOCK_IDS = TIME_BLOCKS.map((b) => b.id);

export function blockLabel(id: string): string {
  return TIME_BLOCKS.find((b) => b.id === id)?.label ?? id;
}

/** Valida que todos los ids existan en TIME_BLOCKS. */
export function areValidBlocks(ids: string[]): boolean {
  return ids.length > 0 && ids.every((id) => ALL_BLOCK_IDS.includes(id));
}

// ---------------------------------------------------------------------------
// Fechas — todo se maneja como string "YYYY-MM-DD" para no pelear con
// zonas horarias. Guatemala es UTC-6 y un Date mal construido puede
// correr el día completo, que es un bug muy fácil de notar en un demo.
// ---------------------------------------------------------------------------

/** Hoy en formato "YYYY-MM-DD", según la hora local del servidor. */
export function todayKey(): string {
  return toDateKey(new Date());
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convierte "YYYY-MM-DD" a un Date local (mediodía, para evitar corrimientos). */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/** La primera fecha que ya cumple los 5 días de anticipación. */
export function minBookableDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + ADVANCE_DAYS);
  return toDateKey(d);
}

/** ¿Este día cumple la regla de anticipación? */
export function isDateBookable(dateKey: string): boolean {
  return dateKey >= minBookableDateKey(); // comparación de strings YYYY-MM-DD funciona
}

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const DAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function formatDateLong(dateKey: string): string {
  const d = fromDateKey(dateKey);
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_ES[month]} ${year}`;
}

export { MONTHS_ES, DAYS_ES };
