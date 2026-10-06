// Seed del demo: unas cuantas reservas de ejemplo para que el calendario
// no se vea vacío cuando se lo mostrés al cliente.
import { PrismaClient, Sede, AuditAction } from "@prisma/client";
import { MORNING_BLOCK_IDS, AFTERNOON_BLOCK_IDS, toDateKey } from "../src/lib/slots";

const prisma = new PrismaClient();

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

async function main() {
  // Limpiamos para que el seed se pueda correr varias veces
  await prisma.auditLog.deleteMany();
  await prisma.reservation.deleteMany();

  const samples = [
    {
      date: daysFromNow(7),
      blocks: MORNING_BLOCK_IDS,
      requesterName: "Carlos Méndez",
      sede: Sede.ZACAPA,
      salesPoint: "Despensa Familiar zona 3",
    },
    {
      date: daysFromNow(9),
      blocks: [AFTERNOON_BLOCK_IDS[0]],
      requesterName: "Ana Lucía Ramírez",
      sede: Sede.ESCUINTLA,
      salesPoint: "Super Barato Centro",
    },
    {
      date: daysFromNow(12),
      blocks: [...MORNING_BLOCK_IDS, ...AFTERNOON_BLOCK_IDS],
      requesterName: "Jorge Batres",
      sede: Sede.BARBERENA,
      salesPoint: "Feria municipal de Barberena",
    },
  ];

  for (const s of samples) {
    const r = await prisma.reservation.create({
      data: {
        date: s.date,
        blocks: s.blocks.join(","),
        requesterName: s.requesterName,
        sede: s.sede,
        salesPoint: s.salesPoint,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: AuditAction.CREATED,
        actorName: s.requesterName,
        reservationId: r.id,
        detail: `${s.requesterName} reservó ${s.date} — destino: ${s.salesPoint}`,
      },
    });
  }

  console.log(`Seed listo: ${samples.length} reservas de ejemplo creadas.`);
  console.log("Una de ellas ocupa el día completo, para que se vea el estado 'lleno'.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
