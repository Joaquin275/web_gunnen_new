import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const tables = await prisma.table.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(tables);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { name, capacity, available, notes } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

    const table = await prisma.table.create({
      data: {
        name: name.trim(),
        capacity: Number(capacity) || 4,
        available: available ?? true,
        notes: notes?.trim() || null,
      },
    });
    return NextResponse.json(table);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error creando mesa" }, { status: 500 });
  }
}
