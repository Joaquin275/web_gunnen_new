import { NextRequest, NextResponse } from "next/server";
import { tablesDb } from "@/lib/db-json";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = tablesDb.update(id, body);
    if (!updated) return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = tablesDb.delete(id);
  if (!ok) return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
  return NextResponse.json({ success: true });
}
