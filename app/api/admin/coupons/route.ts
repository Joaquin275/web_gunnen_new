import { NextRequest, NextResponse } from "next/server";
import { couponsDb } from "@/lib/db-json";

export async function GET() {
  return NextResponse.json(couponsDb.findAll());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type, value, description, maxUses, expiresAt, active } = body;
    if (!code || !type || !value) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }
    const coupon = couponsDb.create({ code, type, value, description, maxUses, expiresAt, active });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
