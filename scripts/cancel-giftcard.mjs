import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CODE = process.argv[2] || "GUNNEN-7AUC-3XPU";

const card = await prisma.giftCard.findUnique({ where: { code: CODE } });
if (!card) {
  console.log(`No existe el bono ${CODE}`);
  await prisma.$disconnect();
  process.exit(1);
}

if (card.status === "CANCELLED") {
  console.log(`${CODE} ya estaba anulado.`);
  await prisma.$disconnect();
  process.exit(0);
}

if (card.status === "REDEEMED") {
  console.log(`${CODE} ya está canjeado; no se anula.`);
  await prisma.$disconnect();
  process.exit(1);
}

await prisma.giftCard.update({
  where: { code: CODE },
  data: { status: "CANCELLED" },
});

console.log(`Anulado: ${CODE} (${card.purchaserName} → ${card.recipientEmail}) · ${Number(card.amount)}€`);
await prisma.$disconnect();
