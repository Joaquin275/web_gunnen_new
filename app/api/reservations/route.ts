import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      timeSlotId,
      date,
      time,
      firstName,
      lastName,
      email,
      phone,
      numberOfPeople,
      observations,
      allergens,
      allergenNotes,
      couponCode,
      depositAmount,
    } = data;

    // Validar slot disponible
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });

    if (!timeSlot) {
      return NextResponse.json(
        { error: "Horario no encontrado" },
        { status: 404 }
      );
    }

    // Contar reservas existentes
    const existingReservations = await prisma.reservation.count({
      where: {
        timeSlotId,
        status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
      },
    });

    if (existingReservations >= timeSlot.capacity) {
      return NextResponse.json(
        { error: "Horario no disponible" },
        { status: 400 }
      );
    }

    // Validar número de personas
    if (numberOfPeople < timeSlot.minPeople || numberOfPeople > timeSlot.maxPeople) {
      return NextResponse.json(
        { error: "Número de personas inválido" },
        { status: 400 }
      );
    }

    // Calcular importe total estimado y señal
    const estimatedTotal = Number(timeSlot.depositPerPerson) * numberOfPeople / 0.3; // 30% es la señal
    const depositAmountCalc = Number(timeSlot.depositPerPerson) * numberOfPeople;

    // Validar cupón si existe
    let couponId = null;
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        couponId = coupon.id;
        if (coupon.type === "PERCENTAGE") {
          couponDiscount = (depositAmountCalc * Number(coupon.value)) / 100;
        } else {
          couponDiscount = Number(coupon.value);
        }
        couponDiscount = Math.min(couponDiscount, depositAmountCalc);

        // Incrementar contador de usos
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const finalDeposit = depositAmountCalc - couponDiscount;

    // Crear reserva
    const reservation = await prisma.reservation.create({
      data: {
        timeSlotId,
        reservationDate: new Date(date + "T00:00:00"),
        reservationTime: time,
        firstName,
        lastName,
        email,
        phone,
        numberOfPeople,
        observations,
        allergens: allergens || [],
        allergenNotes,
        couponId,
        couponDiscount,
        estimatedTotal,
        depositAmount: finalDeposit,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({
      reservationId: reservation.id,
      depositAmount: finalDeposit,
    });
  } catch (error: any) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: error.message || "Error creando reserva" },
      { status: 500 }
    );
  }
}
