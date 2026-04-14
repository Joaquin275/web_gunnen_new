import { NextResponse } from "next/server";
import { tablesDb } from "@/lib/db-json";

// Días de apertura: 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
const OPEN_DAYS = [2, 3, 4, 5, 6];

export async function GET() {
  try {
    // Solo devolver fechas si hay al menos una mesa activa
    const activeTables = tablesDb.findAll().filter((t) => t.available);
    if (activeTables.length === 0) {
      return NextResponse.json({ dates: [] });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates: string[] = [];
    const cursor = new Date(today);

    // Generar fechas disponibles para los próximos 90 días (Mar–Sáb)
    for (let i = 0; i < 90; i++) {
      cursor.setDate(cursor.getDate() + 1);
      if (OPEN_DAYS.includes(cursor.getDay())) {
        dates.push(cursor.toISOString().split("T")[0]);
      }
    }

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return NextResponse.json({ error: "Error cargando fechas" }, { status: 500 });
  }
}
