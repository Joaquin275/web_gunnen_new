import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reservations });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      date, time, firstName, lastName, email, phone,
      numberOfPeople, observations, allergens, allergenNotes,
      couponCode, depositAmount, menuName, menuPrice,
    } = data;

    if (!date || !time || !firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        reservationDate: new Date(date + "T00:00:00"),
        reservationTime: time,
        firstName,
        lastName,
        email,
        phone,
        numberOfPeople: numberOfPeople || 2,
        observations: observations || "",
        allergens: allergens || [],
        allergenNotes: allergenNotes || "",
        couponCode: couponCode || "",
        estimatedTotal: menuPrice ? menuPrice * (numberOfPeople || 2) : 0,
        depositAmount: depositAmount || 0,
        menuName: menuName || "",
        menuPrice: menuPrice || 0,
        status: "CONFIRMED",
        redsysStatus: "NONE",
      },
    });

    return NextResponse.json({ reservationId: reservation.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error creando reserva";
    console.error("Error creating reservation:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
