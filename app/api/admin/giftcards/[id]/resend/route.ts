import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendGiftCard } from "@/lib/email";

function isInventoryEmail(email: string) {
  return !email || email.includes("inventario@gunnen.local");
}

/**
 * POST /api/admin/giftcards/[id]/resend
 * Reenvía el bono PDF al destinatario (y copia al comprador si es distinto).
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const giftCard = await prisma.giftCard.findUnique({ where: { id } });

  if (!giftCard) {
    return NextResponse.json({ error: "Bono no encontrado" }, { status: 404 });
  }
  if (giftCard.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Solo se puede reenviar un bono activo" },
      { status: 400 }
    );
  }
  if (isInventoryEmail(giftCard.recipientEmail)) {
    return NextResponse.json(
      { error: "Este bono no tiene un destinatario con email válido" },
      { status: 400 }
    );
  }

  const expiresLabel = giftCard.expiresAt.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const people = giftCard.numberOfPeople || 1;
  const common = {
    amount: Number(giftCard.amount),
    numberOfPeople: people,
    menuName: giftCard.menuName || undefined,
    harmonyNone: giftCard.harmonyNone,
    harmonyVino: giftCard.harmonyVino,
    harmonyNolo: giftCard.harmonyNolo,
    code: giftCard.code,
    expiresAt: expiresLabel,
  };

  const sentTo: string[] = [];
  const errors: string[] = [];

  try {
    await sendGiftCard({
      ...common,
      recipientEmail: giftCard.recipientEmail,
      recipientName: giftCard.recipientName || undefined,
      purchaserName: giftCard.purchaserName,
      message: giftCard.message || undefined,
    });
    sentTo.push(giftCard.recipientEmail);
  } catch (err) {
    console.error("[GiftCard Resend] destinatario:", err);
    errors.push(giftCard.recipientEmail);
  }

  if (
    giftCard.purchaserEmail !== giftCard.recipientEmail &&
    !isInventoryEmail(giftCard.purchaserEmail)
  ) {
    try {
      await sendGiftCard({
        ...common,
        recipientEmail: giftCard.purchaserEmail,
        recipientName: giftCard.purchaserName,
        purchaserName: giftCard.purchaserName,
        message: `Copia de tu bono regalo para ${giftCard.recipientEmail}`,
      });
      sentTo.push(giftCard.purchaserEmail);
    } catch (err) {
      console.error("[GiftCard Resend] comprador:", err);
      errors.push(giftCard.purchaserEmail);
    }
  }

  if (sentTo.length === 0) {
    return NextResponse.json(
      { error: "No se pudo enviar el email. Revisa Resend o el correo del destinatario." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    sentTo,
    errors,
  });
}
