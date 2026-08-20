import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeeklySchedule, getOpenDayNumbers } from "@/lib/schedule";
import { addDaysToDateKey, madridDateKey } from "@/lib/timezone";

const BOOKING_WINDOW_DAYS = 180;

export async function GET() {
  try {
    const activeTables = await prisma.table.count({ where: { available: true } });
    if (activeTables === 0) {
      return NextResponse.json({ dates: [] });
    }

    const schedule = await getWeeklySchedule();
    const openDays = getOpenDayNumbers(schedule);

    const dates: string[] = [];
    let cursor = madridDateKey();

    for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
      cursor = addDaysToDateKey(cursor, 1);
      const [y, m, d] = cursor.split("-").map(Number);
      const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      if (openDays.includes(dayOfWeek)) {
        dates.push(cursor);
      }
    }

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return NextResponse.json({ error: "Error cargando fechas" }, { status: 500 });
  }
}
