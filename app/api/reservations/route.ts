import { NextResponse } from "next/server";
import { reservationsDb } from "@/lib/db-json";

export async function GET() {
  const reservations = reservationsDb.findAll();
  return NextResponse.json({ reservations });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
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
      menuName,
      menuPrice,
    } = data;

    if (!date || !time || !firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const reservation = reservationsDb.create({
      reservationDate: date,
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
      depositAmount: depositAmount || 0,
      menuName: menuName || "",
      menuPrice: menuPrice || 0,
      status: "CONFIRMED",
    });

    return NextResponse.json({ reservationId: reservation.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error creando reserva";
    console.error("Error creating reservation:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
