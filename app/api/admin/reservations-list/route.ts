import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reservationDate: true,
      reservationTime: true,
      firstName: true,
      lastName: true,
      email: true,
      numberOfPeople: true,
      menuName: true,
      depositAmount: true,
      status: true,
      redsysStatus: true,
      confirmedAt: true,
      attendanceConfirmedAt: true,
    },
  });

  return NextResponse.json({ reservations });
}
