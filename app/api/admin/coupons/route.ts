import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { couponTypeFromApi, serializeCoupon } from "@/lib/serializers";

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons.map(serializeCoupon));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { code, type, value, description, maxUses, expiresAt, active } = body;
    if (!code || !type || value == null) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: String(code).toUpperCase(),
        type: couponTypeFromApi(type),
        value,
        description: description?.trim() || null,
        maxUses: maxUses ? Number(maxUses) : null,
        validUntil: expiresAt ? new Date(expiresAt) : null,
        isActive: active ?? true,
      },
    });

    return NextResponse.json(serializeCoupon(coupon), { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un cupón con ese código" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
