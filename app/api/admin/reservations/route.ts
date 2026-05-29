import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      reservationDate,
      reservationTime,
      numberOfPeople,
      menuName,
      observations,
    } = body;

    if (!firstName || !lastName || !email || !reservationDate || !reservationTime || !numberOfPeople) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "",
        reservationDate: new Date(reservationDate + "T00:00:00"),
        reservationTime,
        numberOfPeople: Number(numberOfPeople),
        menuName: menuName?.trim() || null,
        observations: observations?.trim() || null,
        allergens: [],
        status: "CONFIRMED",
        confirmedAt: new Date(),
        redsysStatus: "NONE",
        estimatedTotal: 0,
        depositAmount: 0,
        attendanceToken: randomBytes(32).toString("hex"),
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error creando reserva" }, { status: 500 });
  }
}
