// src/app/page.tsx
// Página principal: el calendario de reserva de la móvil.

import { BookingApp } from "@/components/BookingApp";
import { getActiveReservations } from "@/actions/reservations";
import { ADVANCE_DAYS } from "@/lib/slots";
import Link from "next/link";

// La página consulta la base en cada visita, no se prerenderiza.
export const dynamic = "force-dynamic";

export default async function Home() {
  const reservations = await getActiveReservations();

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
            Reserva de la móvil
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5 dark:text-neutral-400">
            Guatemala · Las reservas se hacen con {ADVANCE_DAYS} días de anticipación
          </p>
        </div>
        <Link
          href="/historial"
          className="text-sm text-neutral-600 hover:text-neutral-900 whitespace-nowrap
            border border-neutral-200 rounded-lg px-3 py-1.5 hover:bg-white
            dark:text-neutral-300 dark:hover:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Historial
        </Link>
      </header>

      <BookingApp reservations={reservations} />
    </main>
  );
}
