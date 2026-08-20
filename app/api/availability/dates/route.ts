import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeeklySchedule, getOpenDayNumbers } from "@/lib/schedule";
import { addDaysToDateKey, getMadridParts, madridDateKey } from "@/lib/timezone";

export async function GET() {
  try {
    const activeTables = await prisma.table.count({ where: { available: true } });
    if (activeTables === 0) {
      return NextResponse.json({ dates: [] });
    }

    const schedule = await getWeeklySchedule();
    const openDays = getOpenDayNumbers(schedule);

    // Abierto el resto del año en curso y los dos siguientes (sin tope de 6 meses)
    const { year } = getMadridParts();
    const lastDate = `${year + 2}-12-31`;

    const dates: string[] = [];
    let cursor = madridDateKey();

    while (cursor < lastDate) {
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
