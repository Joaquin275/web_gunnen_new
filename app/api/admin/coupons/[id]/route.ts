import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { couponTypeFromApi, serializeCoupon } from "@/lib/serializers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code !== undefined ? { code: String(body.code).toUpperCase() } : {}),
        ...(body.type !== undefined ? { type: couponTypeFromApi(body.type) } : {}),
        ...(body.value !== undefined ? { value: body.value } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
        ...(body.maxUses !== undefined ? { maxUses: body.maxUses ? Number(body.maxUses) : null } : {}),
        ...(body.expiresAt !== undefined ? { validUntil: body.expiresAt ? new Date(body.expiresAt) : null } : {}),
        ...(body.active !== undefined ? { isActive: !!body.active } : {}),
      },
    });

    return NextResponse.json(serializeCoupon(coupon));
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
