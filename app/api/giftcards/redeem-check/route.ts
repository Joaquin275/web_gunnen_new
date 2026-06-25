/**
 * POST /api/giftcards/redeem-check
 * Valida un código de bono regalo durante el proceso de reserva.
 * Verifica menú base, personas y reparto de armonía.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMenuBase } from "@/lib/menus";

export async function POST(request: Request) {
  try {
    const {
      code, estimatedTotal, menuName, menuId,
      numberOfPeople, harmonyNone, harmonyVino, harmonyNolo,
    } = await request.json();

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

    const bonoMenuBase = giftCard.menuId || getMenuBase(giftCard.menuName);
    const reservaMenuBase = menuId || getMenuBase(menuName);

    if (bonoMenuBase && reservaMenuBase && bonoMenuBase !== reservaMenuBase) {
      const bonoLabel = bonoMenuBase === "tempo" ? "TEMPO" : "IMPULSO";
      const reservaLabel = reservaMenuBase === "tempo" ? "TEMPO" : "IMPULSO";
      return NextResponse.json({
        valid: false,
        message: `Este bono es para el Menú ${bonoLabel}. Tu reserva es para el Menú ${reservaLabel}. No es compatible.`,
      });
    }

    const bonoPersonas = giftCard.numberOfPeople || 1;
    const reservaPersonas = Number(numberOfPeople) || 1;

    if (reservaPersonas > bonoPersonas) {
      return NextResponse.json({
        valid: false,
        message: `Este bono cubre ${bonoPersonas} ${bonoPersonas === 1 ? "persona" : "personas"}. Tu reserva es para ${reservaPersonas}. Ajusta el número de comensales o adquiere otro bono.`,
      });
    }

    // Validar armonía si el bono tiene desglose (bonos nuevos)
    const bonoHasHarmony = (giftCard.harmonyVino || 0) + (giftCard.harmonyNolo || 0) > 0
      || giftCard.harmonyNone > 0;

    if (bonoHasHarmony && giftCard.menuId) {
      const reqVino = Number(harmonyVino) || 0;
      const reqNolo = Number(harmonyNolo) || 0;
      const reqNone = Number(harmonyNone) ?? reservaPersonas - reqVino - reqNolo;

      if (reqVino > (giftCard.harmonyVino || 0)) {
        return NextResponse.json({
          valid: false,
          message: `Este bono incluye armonía con vino para ${giftCard.harmonyVino} ${giftCard.harmonyVino === 1 ? "persona" : "personas"}. Has solicitado ${reqVino}.`,
        });
      }
      if (reqNolo > (giftCard.harmonyNolo || 0)) {
        return NextResponse.json({
          valid: false,
          message: `Este bono incluye armonía No/Low para ${giftCard.harmonyNolo} ${giftCard.harmonyNolo === 1 ? "persona" : "personas"}. Has solicitado ${reqNolo}.`,
        });
      }
      if (reqNone > (giftCard.harmonyNone || 0)) {
        return NextResponse.json({
          valid: false,
          message: `Este bono incluye solo menú para ${giftCard.harmonyNone} ${giftCard.harmonyNone === 1 ? "persona" : "personas"}. Has solicitado ${reqNone} sin armonía.`,
        });
      }
    }

    const available = Number(giftCard.remainingAmount);
    const total = Number(estimatedTotal) || 0;
    const discount = Math.min(available, total);
    const remaining = Math.max(0, total - available);
    const fullyCovered = remaining === 0;

    const personasInfo = bonoPersonas > 1 ? ` · ${bonoPersonas} personas` : "";

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
