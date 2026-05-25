import { NextRequest, NextResponse } from "next/server";
import { giftCardsDb } from "@/lib/db-json";

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

    const toImport = items.map((item) => ({
      code: item.code.trim().toUpperCase(),
      amount: Number(item.amount),
      buyerName: item.buyerName?.trim() || "—",
      buyerEmail: item.buyerEmail?.trim() || "—",
      recipientName: item.recipientName?.trim() || item.buyerName?.trim() || "—",
      recipientEmail: item.recipientEmail?.trim() || item.buyerEmail?.trim() || "—",
      message: item.message?.trim() || "",
      status: "ACTIVE" as const,
      sendDate: item.sendDate || new Date().toISOString().split("T")[0],
      redeemedAt: null,
    }));

    const result = giftCardsDb.createBulk(toImport);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error bulk import:", error);
    return NextResponse.json({ error: "Error en importación masiva" }, { status: 500 });
  }
}
