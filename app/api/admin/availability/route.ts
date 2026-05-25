import { NextRequest, NextResponse } from "next/server";
import { getWeeklySchedule, saveWeeklySchedule, type DaySchedule } from "@/lib/schedule";

export async function GET() {
  const schedule = await getWeeklySchedule();
  return NextResponse.json({ schedule });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { schedule } = body as { schedule: DaySchedule[] };

    if (!Array.isArray(schedule) || schedule.length !== 7) {
      return NextResponse.json({ error: "Formato de horario inválido" }, { status: 400 });
    }

    const saved = await saveWeeklySchedule(schedule);
    return NextResponse.json({ schedule: saved });
  } catch (error) {
    console.error("Error saving schedule:", error);
    return NextResponse.json({ error: "Error guardando horario" }, { status: 500 });
  }
}
