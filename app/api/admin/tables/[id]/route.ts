import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const table = await prisma.table.update({
      where: { id },
      data: {
        ...(body.name !== undefined    ? { name: body.name.trim() }            : {}),
        ...(body.capacity !== undefined ? { capacity: Number(body.capacity) }  : {}),
        ...(body.available !== undefined ? { available: body.available }       : {}),
        ...(body.notes !== undefined    ? { notes: body.notes?.trim() || null } : {}),
      },
    });
    return NextResponse.json(table);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: "Error actualizando mesa" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    return NextResponse.json({ error: "Error eliminando mesa" }, { status: 500 });
  }
}
