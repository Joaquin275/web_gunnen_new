/**
 * Gestión del inventario de códigos de bonos pre-cargados.
 * Los códigos con status AVAILABLE son los que el admin añade manualmente.
 * Al comprar, se asigna uno aleatorio del pool que coincida en importe.
 */

import { prisma } from "@/lib/prisma";
import type { GiftCard } from "@prisma/client";

const INVENTORY_PLACEHOLDER = {
  purchaserName: "INVENTARIO",
  purchaserEmail: "inventario@gunnen.local",
  recipientEmail: "inventario@gunnen.local",
};

export interface ClaimGiftCardData {
  amount: number;
  menuName?: string;
  purchaserName: string;
  purchaserEmail: string;
  recipientName?: string;
  recipientEmail: string;
  message?: string;
  sendDate: Date;
  expiresAt: Date;
  redsysOrder: string;
}

/** Reserva un código AVAILABLE aleatorio y lo pasa a PENDING_PAYMENT. */
export async function claimAvailableGiftCard(
  data: ClaimGiftCardData
): Promise<GiftCard | null> {
  const candidates = await prisma.giftCard.findMany({
    where: {
      status: "AVAILABLE",
      amount: data.amount,
    },
    select: { id: true },
  });

  if (candidates.length === 0) return null;

  // Mezclar aleatoriamente e intentar reservar de forma atómica
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);

  for (const { id } of shuffled) {
    const updated = await prisma.giftCard.updateMany({
      where: { id, status: "AVAILABLE" },
      data: {
        status: "PENDING_PAYMENT",
        menuName: data.menuName || null,
        purchaserName: data.purchaserName,
        purchaserEmail: data.purchaserEmail,
        recipientName: data.recipientName || null,
        recipientEmail: data.recipientEmail,
        message: data.message || null,
        sendDate: data.sendDate,
        expiresAt: data.expiresAt,
        remainingAmount: data.amount,
        stripePaymentIntentId: data.redsysOrder,
      },
    });

    if (updated.count === 1) {
      return prisma.giftCard.findUnique({ where: { id } });
    }
  }

  return null;
}

/** Devuelve un bono cancelado al inventario si el pago falla. */
export async function releaseGiftCardToPool(giftCardId: string): Promise<void> {
  await prisma.giftCard.update({
    where: { id: giftCardId },
    data: {
      status: "AVAILABLE",
      ...INVENTORY_PLACEHOLDER,
      recipientName: null,
      message: null,
      menuName: null,
      stripePaymentIntentId: null,
      paidAt: null,
    },
  });
}

/** Crea un código de inventario (sin comprador). */
export function inventoryDefaults(amount: number, code: string, menuName?: string) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  return {
    code: code.toUpperCase(),
    amount,
    remainingAmount: amount,
    status: "AVAILABLE" as const,
    menuName: menuName || null,
    ...INVENTORY_PLACEHOLDER,
    recipientName: null,
    message: null,
    sendDate: new Date(),
    expiresAt,
  };
}

export { INVENTORY_PLACEHOLDER };
