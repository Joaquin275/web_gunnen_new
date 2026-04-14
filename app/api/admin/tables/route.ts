import { NextRequest, NextResponse } from "next/server";
import { tablesDb } from "@/lib/db-json";

export async function GET() {
  return NextResponse.json(tablesDb.findAll());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, capacity, available, notes } = body;
    if (!name || !capacity) {
      return NextResponse.json({ error: "Nombre y capacidad son requeridos" }, { status: 400 });
    }
    const table = tablesDb.create({ name, capacity: Number(capacity), available: available ?? true, notes: notes ?? "" });
    return NextResponse.json(table, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
