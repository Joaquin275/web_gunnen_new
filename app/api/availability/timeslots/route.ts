import { NextResponse } from "next/server";
import { reservationsDb } from "@/lib/db-json";

// 3 franjas de comida + 3 de cena — cada franja = 1 mesa
// Mar-Mié: solo comidas; Jue-Sáb: comidas + cenas
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

    if (!dateParam) {
      return NextResponse.json({ error: "Fecha es requerida" }, { status: 400 });
    }

    const selectedDate = new Date(dateParam + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return NextResponse.json({ timeSlots: [] });
    }

    const dayOfWeek = selectedDate.getDay();
    const slots = SLOTS_BY_DAY[dayOfWeek];

    // Dom (0) y Lun (1) cerrado
    if (!slots) {
      return NextResponse.json({ timeSlots: [] });
    }

    // Reservas confirmadas para esta fecha
    const allReservations = reservationsDb.findAll();
    const dateReservations = allReservations.filter((r) => {
      const rDate = (r.date ?? "").split("T")[0];
      return (
        rDate === dateParam &&
        (r.status === "CONFIRMED" || r.status === "PENDING_PAYMENT")
      );
    });

    // Cada franja = 1 mesa; si ya hay reserva en ese horario → ocupada
    const timeSlots = slots.map((time) => {
      const occupied = dateReservations.filter((r) => r.time === time).length;
      const available = occupied > 0 ? 0 : 1; // 1 mesa por franja

      return {
        id: `slot-${dateParam}-${time.replace(":", "")}`,
        time,
        capacity: 1,
        available,
        minPeople: 1,
        maxPeople: 8,
        depositPerPerson: 0,
      };
    });

    return NextResponse.json({ timeSlots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json({ error: "Error cargando horarios" }, { status: 500 });
  }
}
