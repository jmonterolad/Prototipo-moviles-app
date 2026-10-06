"use client";

// src/components/BookingPanel.tsx
// Panel del día seleccionado: muestra los 4 bloques con su estado, deja
// elegir uno o varios (o usar los atajos "toda la mañana" / "toda la tarde")
// y luego pide los datos del formulario.

import { useState, useTransition } from "react";
import {
  TIME_BLOCKS,
  MORNING_BLOCK_IDS,
  AFTERNOON_BLOCK_IDS,
  blockLabel,
  formatDateLong,
} from "@/lib/slots";
import { CDS, cdLabel } from "@/lib/cds";
import { createReservation, cancelReservation } from "@/actions/reservations";
import type { ReservationDTO } from "@/actions/reservations";
import type { CD } from "@prisma/client";

type BookingPanelProps = {
  dateKey: string | null;
  reservationsForDay: ReservationDTO[];
};

export function BookingPanel({ dateKey, reservationsForDay }: BookingPanelProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [requesterName, setRequesterName] = useState("");
  const [cd, setCd] = useState<CD>("ZACAPA");
  const [salesPoint, setSalesPoint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!dateKey) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center
        dark:border-neutral-700 dark:bg-neutral-800">
        <p className="text-neutral-500 dark:text-neutral-400">
          Elegí un día en el calendario para ver los horarios disponibles.
        </p>
      </div>
    );
  }

  // Qué bloques están tomados, y por quién
  const takenBy = new Map<string, ReservationDTO>();
  for (const r of reservationsForDay) {
    for (const b of r.blocks) takenBy.set(b, r);
  }

  function toggle(blockId: string) {
    if (takenBy.has(blockId)) return;
    setSuccess(false);
    setError(null);
    setSelected((prev) =>
      prev.includes(blockId) ? prev.filter((b) => b !== blockId) : [...prev, blockId]
    );
  }

  function selectPreset(ids: string[]) {
    const free = ids.filter((id) => !takenBy.has(id));
    setSuccess(false);
    setError(null);
    // Si ya estaban todos seleccionados, deselecciona (funciona como toggle)
    const allSelected = free.length > 0 && free.every((id) => selected.includes(id));
    setSelected(allSelected ? [] : free);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createReservation({
        date: dateKey!,
        blocks: selected,
        requesterName,
        cd,
        salesPoint,
      });

      if (result.ok) {
        setSuccess(true);
        setSelected([]);
        setRequesterName("");
        setSalesPoint("");
      } else {
        setError(result.error);
      }
    });
  }

  function handleCancel(id: string, ownerName: string) {
    startTransition(async () => {
      const who = window.prompt(
        `¿Quién está cancelando la reserva de ${ownerName}? (escribí tu nombre)`
      );
      if (who === null) return;
      const result = await cancelReservation(id, who);
      if (!result.ok) setError(result.error);
    });
  }

  const morningFree = MORNING_BLOCK_IDS.some((id) => !takenBy.has(id));
  const afternoonFree = AFTERNOON_BLOCK_IDS.some((id) => !takenBy.has(id));
  const canSubmit =
    selected.length > 0 && requesterName.trim() !== "" && salesPoint.trim() !== "" && !pending;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-5
      dark:border-neutral-700 dark:bg-neutral-800">
      <h2 className="font-semibold text-neutral-800 capitalize mb-1 dark:text-neutral-100">
        {formatDateLong(dateKey)}
      </h2>
      <p className="text-sm text-neutral-500 mb-4 dark:text-neutral-400">
        Seleccioná el horario que necesitás
      </p>

      {/* Atajos */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => selectPreset(MORNING_BLOCK_IDS)}
          disabled={!morningFree}
          className="flex-1 text-sm rounded-lg border border-neutral-300 py-2 px-3 text-neutral-700
            hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed
            dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Toda la mañana
        </button>
        <button
          onClick={() => selectPreset(AFTERNOON_BLOCK_IDS)}
          disabled={!afternoonFree}
          className="flex-1 text-sm rounded-lg border border-neutral-300 py-2 px-3 text-neutral-700
            hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed
            dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Toda la tarde
        </button>
      </div>

      {/* Bloques de 2 horas */}
      <div className="space-y-2 mb-5">
        {TIME_BLOCKS.map((block) => {
          const taken = takenBy.get(block.id);
          const isSelected = selected.includes(block.id);

          return (
            <div key={block.id}>
              <button
                onClick={() => toggle(block.id)}
                disabled={!!taken}
                className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors
                  ${
                    taken
                      ? "border-amber-200 bg-amber-50 cursor-not-allowed dark:border-amber-900/50 dark:bg-amber-950/30"
                      : isSelected
                        ? "border-neutral-800 bg-neutral-800 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                        : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-400"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{block.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full
                      ${
                        taken
                          ? "bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                          : isSelected
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }`}
                  >
                    {taken ? "Reservado" : isSelected ? "Seleccionado" : "Libre"}
                  </span>
                </div>

                {taken && (
                  <p className="text-xs text-neutral-600 mt-1 dark:text-neutral-400">
                    {taken.requesterName} · {cdLabel(taken.cd)} → {taken.salesPoint}
                  </p>
                )}
              </button>

              {taken && (
                <button
                  onClick={() => handleCancel(taken.id, taken.requesterName)}
                  className="mt-1 text-xs text-red-600 hover:underline pl-1 dark:text-red-400"
                >
                  Cancelar esta reserva
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Formulario */}
      {selected.length > 0 && (
        <div className="border-t border-neutral-100 pt-4 space-y-3 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Vas a reservar:{" "}
            <span className="font-medium text-neutral-800 dark:text-neutral-100">
              {selected.map(blockLabel).join(" · ")}
            </span>
          </p>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1 dark:text-neutral-300">
              ¿Quién va a usar la móvil?
            </label>
            <input
              type="text"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-neutral-800
                dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100
                dark:focus:ring-neutral-400 dark:focus:border-neutral-400
                dark:placeholder:text-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1 dark:text-neutral-300">
              CD
            </label>
            <select
              value={cd}
              onChange={(e) => setCd(e.target.value as CD)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-neutral-800
                dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100
                dark:focus:ring-neutral-400 dark:focus:border-neutral-400"
            >
              {CDS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1 dark:text-neutral-300">
              ¿A qué punto de venta la van a llevar?
            </label>
            <input
              type="text"
              value={salesPoint}
              onChange={(e) => setSalesPoint(e.target.value)}
              placeholder="Ej: Despensa Familiar zona 3"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-neutral-800
                dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100
                dark:focus:ring-neutral-400 dark:focus:border-neutral-400
                dark:placeholder:text-neutral-500"
            />
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full rounded-lg bg-neutral-800 text-white py-2.5 text-sm font-medium
              hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors
              dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {pending ? "Reservando…" : "Confirmar reserva"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2
          dark:text-red-300 dark:bg-red-950/30 dark:border-red-900/50">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2
          dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900/50">
          Reserva confirmada.
        </p>
      )}
    </div>
  );
}
