/**
 * POST /api/reservations/free
 * Crea una reserva confirmada directamente cuando un bono regalo cubre el 100%.
 * No requiere paso por Redsys.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReservationConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      date, time, firstName, lastName, email, phone,
      numberOfPeople, observations, allergens, allergenNotes,
      menuName, menuPrice, estimatedTotal, giftCardId, giftCardDiscount,
    } = data;

    if (!date || !time || !firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }
    if (!giftCardId) {
      return NextResponse.json({ error: "Se requiere un bono regalo válido" }, { status: 400 });
    }

    // Verificar que el bono sigue activo
    const giftCard = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
    if (!giftCard || giftCard.status !== "ACTIVE") {
      return NextResponse.json({ error: "El bono regalo no está disponible" }, { status: 400 });
    }
    if (new Date() > giftCard.expiresAt) {
      return NextResponse.json({ error: "El bono regalo ha caducado" }, { status: 400 });
    }

    const people = numberOfPeople || 2;
    const price = Number(menuPrice) || 0;
    const total = Number(estimatedTotal) || price * people;
    const discount = Number(giftCardDiscount) || 0;
    const remaining = Math.max(0, Number(giftCard.remainingAmount) - discount);

    // Crear reserva como CONFIRMED directamente
    const reservation = await prisma.reservation.create({
      data: {
        reservationDate: new Date(date + "T00:00:00"),
        reservationTime: time,
        firstName,
        lastName,
        email,
        phone,
        numberOfPeople: people,
        observations: observations || "",
        allergens: allergens || [],
        allergenNotes: allergenNotes || "",
        estimatedTotal: total,
        depositAmount: 0,
        menuName: menuName || "",
        menuPrice: price,
        status: "CONFIRMED",
        redsysOrder: "",
        redsysStatus: "GIFT_CARD",
        redsysAuthCode: "",
        redsysResponse: "",
        giftCardId,
      },
    });

    // Marcar el bono como REDEEMED si se agota, o reducir el saldo
    await prisma.giftCard.update({
      where: { id: giftCardId },
      data: {
        remainingAmount: remaining,
        status: remaining <= 0 ? "REDEEMED" : "ACTIVE",
        redeemedAt: remaining <= 0 ? new Date() : undefined,
      },
    });

    // Enviar email de confirmación al cliente
    try {
      await sendReservationConfirmation({
        firstName,
        lastName,
        email,
        reservationDate: new Date(date + "T00:00:00"),
        reservationTime: time,
        numberOfPeople: people,
        menuName: menuName || "",
        estimatedTotal: total,
        depositAmount: 0,
        reservationId: reservation.id,
      });
    } catch (emailErr) {
      console.error("Error enviando email de confirmación:", emailErr);
    }

    return NextResponse.json({ reservationId: reservation.id, status: "CONFIRMED" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error creando reserva";
    console.error("Error en /api/reservations/free:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
