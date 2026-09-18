import { prisma } from "@/lib/prisma";
import GiftCardsClient from "./GiftCardsClient";

export const dynamic = "force-dynamic";

export default async function AdminGiftCardsPage() {
  const giftCards = await prisma.giftCard.findMany({
    where: {
      // Solo mostrar bonos con pago completado — los PENDING_PAYMENT son intentos abandonados
      status: { not: "PENDING_PAYMENT" },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = giftCards.map((g) => ({
    id: g.id,
    code: g.code,
    amount: Number(g.amount),
    numberOfPeople: g.numberOfPeople || 1,
    harmonyNone: g.harmonyNone || 0,
    harmonyVino: g.harmonyVino || 0,
    harmonyNolo: g.harmonyNolo || 0,
    buyerName: g.purchaserName,
    buyerEmail: g.purchaserEmail,
    recipientName: g.recipientName || g.purchaserName,
    recipientEmail: g.recipientEmail,
    message: g.message || "",
    status: g.status,
    menuName: g.menuName || "",
    sendDate: g.sendDate.toISOString().split("T")[0],
    redeemedAt: g.redeemedAt?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
  }));

  return <GiftCardsClient initialGiftCards={serialized} />;
}
