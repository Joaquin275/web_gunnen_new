import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  // Buscar reservas CONFIRMED sin attendanceToken
  const missing = await prisma.reservation.findMany({
    where: {
      status: "CONFIRMED",
      attendanceToken: null,
    },
    select: { id: true, firstName: true, lastName: true, reservationDate: true },
  });

  console.log(`Reservas CONFIRMED sin attendanceToken: ${missing.length}`);

  for (const r of missing) {
    const token = randomBytes(32).toString("hex");
    await prisma.reservation.update({
      where: { id: r.id },
      data: { attendanceToken: token },
    });
    console.log(`  ✓ ${r.firstName} ${r.lastName} (${r.reservationDate.toISOString().slice(0, 10)}) → token generado`);
  }

  console.log("Listo.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
