import { NextResponse } from "next/server";
import { getWeeklySchedule, getOpenDayNumbers } from "@/lib/schedule";
import { tablesDb } from "@/lib/db-json";

export async function GET() {
  try {
    const activeTables = tablesDb.findAll().filter((t) => t.available);
    if (activeTables.length === 0) {
      return NextResponse.json({ dates: [] });
    }

    const schedule = await getWeeklySchedule();
    const openDays = getOpenDayNumbers(schedule);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates: string[] = [];
    const cursor = new Date(today);

    for (let i = 0; i < 90; i++) {
      cursor.setDate(cursor.getDate() + 1);
      if (openDays.includes(cursor.getDay())) {
        dates.push(cursor.toISOString().split("T")[0]);
      }
    }

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return NextResponse.json({ error: "Error cargando fechas" }, { status: 500 });
  }
}
