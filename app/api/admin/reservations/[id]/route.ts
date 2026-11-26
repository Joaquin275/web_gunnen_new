import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calcOrderTotal,
  getMenuBase,
  getMenuById,
  isHarmonyValid,
} from "@/lib/menus";

/**
 * PATCH /api/admin/reservations/[id]
 * Edita fecha, hora, comensales, menú, armonía y alérgenos.
 * No toca Redsys: la retención original se mantiene.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { giftCard: true },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }
  if (reservation.status === "CANCELLED") {
    return NextResponse.json({ error: "No se puede editar una reserva cancelada" }, { status: 400 });
  }

  const body = await req.json();
  const {
    firstName, lastName, email, phone,
    reservationDate, reservationTime, numberOfPeople,
    menuId, harmonyNone, harmonyVino, harmonyNolo,
    allergens, allergenNotes, observations,
  } = body;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !reservationDate || !reservationTime) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const people = Number(numberOfPeople);
  if (!Number.isInteger(people) || people < 1 || people > 4) {
    return NextResponse.json({ error: "El número de comensales debe ser entre 1 y 4" }, { status: 400 });
  }

  const menu = getMenuById(menuId);
  if (!menu) {
    return NextResponse.json({ error: "Menú inválido" }, { status: 400 });
  }

  const harmony = {
    none: Number(harmonyNone) || 0,
    vino: Number(harmonyVino) || 0,
    nolo: Number(harmonyNolo) || 0,
  };
  if (!isHarmonyValid(people, harmony)) {
    return NextResponse.json(
      { error: "La armonía debe sumar exactamente el número de comensales" },
      { status: 400 }
    );
  }

  const estimatedTotal = calcOrderTotal(menu.id, people, harmony);
  const giftCard = reservation.giftCard;
  let giftCover = 0;

  if (giftCard) {
    const bonoMenu = giftCard.menuId || getMenuBase(giftCard.menuName);
    if (bonoMenu && bonoMenu !== menu.id) {
      const bonoLabel = bonoMenu === "tempo" ? "TEMPO" : "IMPULSO";
      return NextResponse.json({
        error: `Esta reserva tiene un bono del Menú ${bonoLabel}. No se puede cambiar a ${menu.displayName}.`,
      }, { status: 400 });
    }
    giftCover = Number(giftCard.amount);
  }

  const remainingAfterGift = Math.max(0, estimatedTotal - giftCover);
  const theoreticalDeposit = Math.round(remainingAfterGift * 0.3 * 100) / 100;

  const newDate = new Date(reservationDate + "T00:00:00");
  const occupied = await prisma.reservation.findFirst({
    where: {
      id: { not: id },
      reservationDate: newDate,
      reservationTime,
      OR: [
        { status: "CONFIRMED" },
        {
          status: "PENDING_PAYMENT",
          createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        },
      ],
    },
    select: { id: true },
  });
  if (occupied) {
    return NextResponse.json(
      { error: "Esa fecha y hora ya tienen una reserva. Elige otra franja." },
      { status: 409 }
    );
  }

  const dateChanged =
    reservation.reservationDate.toISOString().slice(0, 10) !== reservationDate ||
    reservation.reservationTime !== reservationTime;

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      reservationDate: newDate,
      reservationTime,
      numberOfPeople: people,
      menuId: menu.id,
      menuName: menu.displayName,
      menuPrice: menu.basePrice,
      harmonyNone: harmony.none,
      harmonyVino: harmony.vino,
      harmonyNolo: harmony.nolo,
      estimatedTotal,
      allergens: Array.isArray(allergens) ? allergens : [],
      allergenNotes: allergenNotes?.trim() || null,
      observations: observations?.trim() || null,
      ...(dateChanged
        ? {
            reminder24hSentAt: null,
            reminderSameDaySentAt: null,
            attendanceConfirmedAt: null,
          }
        : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    estimatedTotal,
    giftCover,
    remainingAfterGift,
    theoreticalDeposit,
    actualDeposit: Number(updated.depositAmount),
  });
}
