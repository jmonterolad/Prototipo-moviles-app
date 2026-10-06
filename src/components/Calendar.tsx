"use client";

// src/components/Calendar.tsx
// Calendario mensual. Los días que no cumplen los 5 días de anticipación
// salen deshabilitados y con un tono apagado, para que se entienda a
// simple vista por qué no se pueden tocar.

import { useState } from "react";
import {
  toDateKey,
  isDateBookable,
  monthLabel,
  ALL_BLOCK_IDS,
} from "@/lib/slots";

type CalendarProps = {
  /** Mapa dateKey -> cantidad de bloques ya reservados ese día */
  bookedCountByDate: Record<string, number>;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
};

export function Calendar({
  bookedCountByDate,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay(); // 0 = domingo

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function goPrev() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const totalBlocks = ALL_BLOCK_IDS.length;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goPrev}
          aria-label="Mes anterior"
          className="h-9 w-9 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50
            dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          ‹
        </button>
        <h2 className="font-semibold text-neutral-800 capitalize dark:text-neutral-100">
          {monthLabel(viewYear, viewMonth)}
        </h2>
        <button
          onClick={goNext}
          aria-label="Mes siguiente"
          className="h-9 w-9 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50
            dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-neutral-400 py-1 dark:text-neutral-500"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} />;

          const dateKey = toDateKey(new Date(viewYear, viewMonth, day));
          const bookable = isDateBookable(dateKey);
          const bookedCount = bookedCountByDate[dateKey] ?? 0;
          const full = bookedCount >= totalBlocks;
          const isSelected = selectedDate === dateKey;

          const disabled = !bookable || full;

          return (
            <button
              key={dateKey}
              disabled={disabled}
              onClick={() => onSelectDate(dateKey)}
              title={
                !bookable
                  ? "Requiere 5 días de anticipación"
                  : full
                    ? "Todos los horarios de este día ya están reservados"
                    : bookedCount > 0
                      ? `${bookedCount} de ${totalBlocks} horarios reservados`
                      : "Disponible"
              }
              className={`relative aspect-square rounded-lg text-sm font-medium transition-colors
                ${
                  isSelected
                    ? "bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : disabled
                      ? "bg-neutral-50 text-neutral-300 cursor-not-allowed dark:bg-neutral-900 dark:text-neutral-700"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
            >
              {day}
              {/* Punto indicador: ámbar = parcialmente ocupado, rojo = lleno */}
              {bookable && bookedCount > 0 && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full
                    ${full ? "bg-red-400" : "bg-amber-400"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500
        dark:border-neutral-700 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Parcialmente reservado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Día completo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-neutral-100 border border-neutral-200
            dark:bg-neutral-900 dark:border-neutral-700" /> No disponible
        </span>
      </div>
    </div>
  );
}
