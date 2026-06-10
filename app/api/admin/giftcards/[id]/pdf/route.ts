import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGiftCardPdf } from "@/lib/pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const giftCard = await prisma.giftCard.findUnique({ where: { id } });
  if (!giftCard) {
    return NextResponse.json({ error: "Bono no encontrado" }, { status: 404 });
  }

  const pdfBuffer = await generateGiftCardPdf(giftCard.code);
  if (!pdfBuffer) {
    return NextResponse.json({ error: "No se pudo generar el PDF" }, { status: 500 });
  }

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Bono-${giftCard.code}.pdf"`,
    },
  });
}
