"use client";

// src/components/BookingApp.tsx
// Une calendario + panel del día.
//
// Responsive: en móvil/tablet va apilado (calendario arriba, panel abajo).
// En desktop (lg+) cambia a dos columnas lado a lado, que es donde tiene
// sentido ver el mes completo y el detalle a la vez.

import { useState } from "react";
import { Calendar } from "./Calendar";
import { BookingPanel } from "./BookingPanel";
import type { ReservationDTO } from "@/actions/reservations";

type BookingAppProps = {
  reservations: ReservationDTO[];
};

export function BookingApp({ reservations }: BookingAppProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const bookedCountByDate: Record<string, number> = {};
  for (const r of reservations) {
    bookedCountByDate[r.date] = (bookedCountByDate[r.date] ?? 0) + r.blocks.length;
  }

  const reservationsForDay = selectedDate
    ? reservations.filter((r) => r.date === selectedDate)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
      <Calendar
        bookedCountByDate={bookedCountByDate}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <BookingPanel dateKey={selectedDate} reservationsForDay={reservationsForDay} />
    </div>
  );
}
