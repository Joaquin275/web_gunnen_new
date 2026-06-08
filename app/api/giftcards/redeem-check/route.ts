/**
 * POST /api/giftcards/redeem-check
 * Valida un código de bono regalo durante el proceso de reserva.
 * Verifica que el menú y el número de personas coincidan con el bono adquirido.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Extrae el menú base (TEMPO o IMPULSO) del nombre completo */
function getMenuBase(menuName: string | null | undefined): string | null {
  if (!menuName) return null;
  const upper = menuName.toUpperCase();
  if (upper.includes("TEMPO")) return "TEMPO";
  if (upper.includes("IMPULSO")) return "IMPULSO";
  return null;
}

export async function POST(request: Request) {
  try {
    const { code, estimatedTotal, menuName, numberOfPeople } = await request.json();

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

    // ── Validar menú ────────────────────────────────────────────────────────
    const bonoMenuBase = getMenuBase(giftCard.menuName);
    const reservaMenuBase = getMenuBase(menuName);

    if (bonoMenuBase && reservaMenuBase && bonoMenuBase !== reservaMenuBase) {
      return NextResponse.json({
        valid: false,
        message: `Este bono es para el Menú ${bonoMenuBase}. Tu reserva es para el Menú ${reservaMenuBase}. No es compatible.`,
      });
    }

    // ── Validar número de personas ─────────────────────────────────────────
    const bonoPersonas = giftCard.numberOfPeople || 1;
    const reservaPersonas = Number(numberOfPeople) || 1;

    if (reservaPersonas > bonoPersonas) {
      return NextResponse.json({
        valid: false,
        message: `Este bono cubre ${bonoPersonas} ${bonoPersonas === 1 ? "persona" : "personas"}. Tu reserva es para ${reservaPersonas}. Ajusta el número de comensales o adquiere otro bono.`,
      });
    }

    const available = Number(giftCard.remainingAmount);
    const total = Number(estimatedTotal) || 0;
    const discount = Math.min(available, total);
    const remaining = Math.max(0, total - available);
    const fullyCovered = remaining === 0;

    const personasInfo = bonoPersonas > 1
      ? ` · ${bonoPersonas} personas`
      : "";

    return NextResponse.json({
      valid: true,
      giftCardId: giftCard.id,
      menuName: giftCard.menuName,
      numberOfPeople: bonoPersonas,
      available,
      discount,
      remaining,
      fullyCovered,
      message: fullyCovered
        ? `Bono válido${personasInfo} — Reserva cubierta al 100% (${available.toFixed(2)}€)`
        : `Bono válido${personasInfo} — Se aplican ${discount.toFixed(2)}€. Resta pagar ${remaining.toFixed(2)}€`,
    });
  } catch (error) {
    console.error("Error validando bono regalo:", error);
    return NextResponse.json({ valid: false, message: "Error al validar el código" }, { status: 500 });
  }
}
