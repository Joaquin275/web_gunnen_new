import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LUNCH_SLOTS = ["13:30", "13:45", "14:00"];
const DINNER_SLOTS = ["20:30", "20:45", "21:00"];
const SLOTS_BY_DAY: Record<number, string[]> = {
  2: LUNCH_SLOTS,
  3: LUNCH_SLOTS,
  4: [...LUNCH_SLOTS, ...DINNER_SLOTS],
  5: [...LUNCH_SLOTS, ...DINNER_SLOTS],
  6: [...LUNCH_SLOTS, ...DINNER_SLOTS],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });

    const selectedDate = new Date(dateParam + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return NextResponse.json({ timeSlots: [] });

    const dayOfWeek = selectedDate.getDay();
    const slots = SLOTS_BY_DAY[dayOfWeek];
    if (!slots) return NextResponse.json({ timeSlots: [] });

    const dateReservations = await prisma.reservation.findMany({
      where: {
        reservationDate: new Date(dateParam + "T00:00:00"),
        status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
      },
      select: { reservationTime: true },
    });

    const timeSlots = slots.map((time) => {
      const occupied = dateReservations.filter((r) => r.reservationTime === time).length;
      return {
        id: `slot-${dateParam}-${time.replace(":", "")}`,
        time,
        capacity: 1,
        available: occupied > 0 ? 0 : 1,
        minPeople: 1,
        maxPeople: 5,
        depositPerPerson: 0,
      };
    });

    return NextResponse.json({ timeSlots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json({ error: "Error cargando horarios" }, { status: 500 });
  }
}
