/**
 * POST /api/giftcards/redeem-check
 * Valida un código de bono regalo durante el proceso de reserva.
 * Devuelve el importe disponible para descontar del total.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, estimatedTotal } = await request.json();

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, message: "Introduce un código de bono" }, { status: 400 });
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!giftCard) {
      return NextResponse.json({ valid: false, message: "Código de bono no encontrado" });
    }

    if (giftCard.status === "REDEEMED") {
      return NextResponse.json({ valid: false, message: "Este bono ya ha sido canjeado" });
    }

    if (giftCard.status === "EXPIRED" || giftCard.status === "CANCELLED") {
      return NextResponse.json({ valid: false, message: "Este bono no está activo" });
    }

    if (giftCard.status !== "ACTIVE") {
      return NextResponse.json({ valid: false, message: "Este bono no está activo" });
    }

    if (new Date() > giftCard.expiresAt) {
      return NextResponse.json({ valid: false, message: "Este bono ha caducado" });
    }

    const available = Number(giftCard.remainingAmount);
    const total = Number(estimatedTotal) || 0;
    const discount = Math.min(available, total);
    const remaining = Math.max(0, total - available);
    const fullyCovered = remaining === 0;

    return NextResponse.json({
      valid: true,
      giftCardId: giftCard.id,
      menuName: giftCard.menuName,
      available,          // importe del bono disponible
      discount,           // descuento que se aplica a esta reserva
      remaining,          // lo que queda por pagar (0 si bono cubre todo)
      fullyCovered,       // true → sin pago, false → pagar diferencia
      message: fullyCovered
        ? `Bono válido — Reserva cubierta al 100% (${available.toFixed(2)}€)`
        : `Bono válido — Se aplican ${discount.toFixed(2)}€. Resta pagar ${remaining.toFixed(2)}€`,
    });
  } catch (error) {
    console.error("Error validando bono regalo:", error);
    return NextResponse.json({ valid: false, message: "Error al validar el código" }, { status: 500 });
  }
}
