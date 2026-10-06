"use server";

// src/actions/reservations.ts
//
// Reglas que se aplican acá (y no solo en la interfaz — el botón
// deshabilitado no es seguridad, cualquiera puede forzar la petición):
//
// 1. Mínimo 5 días de anticipación (ADVANCE_DAYS en src/lib/slots.ts).
// 2. Un bloque de horario ya reservado no se puede volver a reservar,
//    porque hay una sola móvil.
// 3. Toda creación y cancelación queda en el audit log.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  areValidBlocks,
  isDateBookable,
  ADVANCE_DAYS,
  blockLabel,
  formatDateLong,
} from "@/lib/slots";
import { sedeLabel } from "@/lib/sedes";
import { AuditAction, ReservationStatus, Sede } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type ReservationDTO = {
  id: string;
  date: string;
  blocks: string[];
  requesterName: string;
  sede: Sede;
  salesPoint: string;
  createdAt: string;
};

function parseBlocks(raw: string): string[] {
  return raw.split(",").filter(Boolean);
}

export async function createReservation(input: {
  date: string; // "YYYY-MM-DD"
  blocks: string[];
  requesterName: string;
  sede: Sede;
  salesPoint: string;
}): Promise<ActionResult> {
  const requesterName = input.requesterName.trim();
  const salesPoint = input.salesPoint.trim();

  if (!requesterName) {
    return { ok: false, error: "Escribí el nombre de quien va a usar la móvil." };
  }
  if (!salesPoint) {
    return { ok: false, error: "Escribí a qué punto de venta la van a llevar." };
  }
  if (!areValidBlocks(input.blocks)) {
    return { ok: false, error: "Seleccioná al menos un horario." };
  }
  if (!isDateBookable(input.date)) {
    return {
      ok: false,
      error: `La reserva se tiene que hacer con ${ADVANCE_DAYS} días de anticipación como mínimo.`,
    };
  }

  // Bloques ya ocupados ese día (una sola móvil → cualquier coincidencia choca)
  const sameDay = await prisma.reservation.findMany({
    where: { date: input.date, status: ReservationStatus.ACTIVE },
    select: { blocks: true },
  });

  const taken = new Set(sameDay.flatMap((r) => parseBlocks(r.blocks)));
  const conflict = input.blocks.filter((b) => taken.has(b));

  if (conflict.length > 0) {
    const labels = conflict.map(blockLabel).join(", ");
    return {
      ok: false,
      error: `Ese horario ya está reservado (${labels}). Elegí otro bloque o otro día.`,
    };
  }

  const reservation = await prisma.reservation.create({
    data: {
      date: input.date,
      blocks: input.blocks.join(","),
      requesterName,
      sede: input.sede,
      salesPoint,
      status: ReservationStatus.ACTIVE,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: AuditAction.CREATED,
      actorName: requesterName,
      reservationId: reservation.id,
      detail:
        `${requesterName} (${sedeLabel(input.sede)}) reservó ${formatDateLong(input.date)} — ` +
        `${input.blocks.map(blockLabel).join(", ")} — destino: ${salesPoint}`,
    },
  });

  revalidatePath("/");
  return { ok: true };
}

export async function cancelReservation(
  reservationId: string,
  cancelledBy: string
): Promise<ActionResult> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation || reservation.status !== ReservationStatus.ACTIVE) {
    return { ok: false, error: "Esa reserva no existe o ya fue cancelada." };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: ReservationStatus.CANCELLED, cancelledAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      action: AuditAction.CANCELLED,
      actorName: cancelledBy.trim() || "(sin nombre)",
      reservationId: reservation.id,
      detail:
        `${cancelledBy.trim() || "Alguien"} canceló la reserva de ` +
        `${reservation.requesterName} del ${formatDateLong(reservation.date)}`,
    },
  });

  revalidatePath("/");
  return { ok: true };
}

/** Reservas activas desde hoy en adelante, para pintar el calendario. */
export async function getActiveReservations(): Promise<ReservationDTO[]> {
  const rows = await prisma.reservation.findMany({
    where: { status: ReservationStatus.ACTIVE },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    blocks: parseBlocks(r.blocks),
    requesterName: r.requesterName,
    sede: r.sede,
    salesPoint: r.salesPoint,
    createdAt: r.createdAt.toISOString(),
  }));
}

export type AuditEntryDTO = {
  id: string;
  action: AuditAction;
  actorName: string;
  detail: string;
  createdAt: string;
};

export async function getAuditLog(limit = 50): Promise<AuditEntryDTO[]> {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    actorName: r.actorName,
    detail: r.detail,
    createdAt: r.createdAt.toISOString(),
  }));
}
