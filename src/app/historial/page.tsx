// src/app/historial/page.tsx
// El audit log. Sin login, esto es lo único que da rastro de quién
// reservó primero y quién canceló qué.

import { getAuditLog } from "@/actions/reservations";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  const entries = await getAuditLog();

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6">
      <header className="mb-5">
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          ‹ Volver al calendario
        </Link>
        <h1 className="text-xl font-semibold text-neutral-800 mt-2 dark:text-neutral-100">
          Historial de movimientos
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Cada reserva y cancelación queda registrada acá, en orden.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="text-neutral-500 text-sm rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center
          dark:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">
          Todavía no hay movimientos.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-neutral-200 bg-white p-3 flex gap-3 items-start
                dark:border-neutral-700 dark:bg-neutral-800"
            >
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap
                  ${
                    e.action === "CREATED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  }`}
              >
                {e.action === "CREATED" ? "Reservó" : "Canceló"}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{e.detail}</p>
                <p className="text-xs text-neutral-400 mt-0.5 dark:text-neutral-500">
                  {new Date(e.createdAt).toLocaleString("es-GT", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
