import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inventoryDefaults } from "@/lib/giftcards-pool";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body as {
      items: {
        code: string;
        amount: number;
        buyerName?: string;
        buyerEmail?: string;
        recipientName?: string;
        recipientEmail?: string;
        message?: string;
        sendDate?: string;
      }[];
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Sin datos" }, { status: 400 });
    }

    const existingCodes = new Set(
      (await prisma.giftCard.findMany({ select: { code: true } })).map((g) => g.code.toUpperCase())
    );

    let created = 0;
    let skipped = 0;

    for (const item of items) {
      const code = item.code.trim().toUpperCase();
      if (!code || existingCodes.has(code)) {
        skipped++;
        continue;
      }

      const defaults = inventoryDefaults(Number(item.amount), code);

      await prisma.giftCard.create({
        data: {
          ...defaults,
          ...(item.buyerName && item.buyerEmail
            ? {
                status: "ACTIVE" as const,
                purchaserName: item.buyerName.trim(),
                purchaserEmail: item.buyerEmail.trim(),
                recipientName: item.recipientName?.trim() || item.buyerName.trim(),
                recipientEmail: item.recipientEmail?.trim() || item.buyerEmail.trim(),
                message: item.message?.trim() || null,
                sendDate: item.sendDate ? new Date(item.sendDate) : new Date(),
                paidAt: new Date(),
              }
            : {}),
        },
      });

      existingCodes.add(code);
      created++;
    }

    return NextResponse.json({ created, skipped });
  } catch (error) {
    console.error("Error bulk import:", error);
    return NextResponse.json({ error: "Error en importación masiva" }, { status: 500 });
  }
}
