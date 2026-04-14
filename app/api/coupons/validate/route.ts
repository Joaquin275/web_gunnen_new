import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, amount } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Código requerido" },
        { status: 400 }
      );
    }

    // Buscar el cupón
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: "Cupón no encontrado",
      });
    }

    // Validaciones
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        message: "Cupón no activo",
      });
    }

    // Validar fechas
    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json({
        valid: false,
        message: "Cupón aún no válido",
      });
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json({
        valid: false,
        message: "Cupón expirado",
      });
    }

    // Validar usos
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        valid: false,
        message: "Cupón agotado",
      });
    }

    // Validar importe mínimo
    if (coupon.minAmount && amount < Number(coupon.minAmount)) {
      return NextResponse.json({
        valid: false,
        message: `Importe mínimo: ${Number(coupon.minAmount)}€`,
      });
    }

    // Calcular descuento
    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (amount * Number(coupon.value)) / 100;
    } else {
      discount = Number(coupon.value);
    }

    // No puede ser mayor que el importe total
    discount = Math.min(discount, amount);

    return NextResponse.json({
      valid: true,
      discount,
      couponId: coupon.id,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, message: "Error validando cupón" },
      { status: 500 }
    );
  }
}
