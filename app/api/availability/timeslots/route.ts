import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeeklySchedule, getActiveSlotsForDay } from "@/lib/schedule";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });

    const selectedDate = new Date(dateParam + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return NextResponse.json({ timeSlots: [] });

    const schedule = await getWeeklySchedule();
    const slots = getActiveSlotsForDay(schedule, selectedDate.getDay());

    if (slots.length === 0) return NextResponse.json({ timeSlots: [] });

    const dateReservations = await prisma.reservation.findMany({
      where: {
        reservationDate: new Date(dateParam + "T00:00:00"),
        status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
      },
      select: { reservationTime: true },
    });

    const timeSlots = slots.map((slot) => {
      const occupied = dateReservations.filter((r) => r.reservationTime === slot.time).length;
      return {
        id: `slot-${dateParam}-${slot.time.replace(":", "")}`,
        time: slot.time,
        label: slot.label,
        capacity: 1,
        available: occupied > 0 ? 0 : 1,
        minPeople: 1,
        maxPeople: slot.maxPeople,
        depositPerPerson: 0,
      };
    });

    return NextResponse.json({ timeSlots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json({ error: "Error cargando horarios" }, { status: 500 });
  }
}
