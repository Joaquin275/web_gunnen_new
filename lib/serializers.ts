import type { Coupon, PressPost } from "@prisma/client";

export function serializeCoupon(c: Coupon) {
  return {
    id: c.id,
    code: c.code,
    type: c.type === "FIXED_AMOUNT" ? ("FIXED" as const) : ("PERCENTAGE" as const),
    value: Number(c.value),
    description: c.description ?? "",
    maxUses: c.maxUses ?? 0,
    usedCount: c.usedCount,
    expiresAt: c.validUntil?.toISOString() ?? "",
    active: c.isActive,
    createdAt: c.createdAt.toISOString(),
  };
}

export function serializePressPost(p: PressPost) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    publishedAt: p.publishedAt.toISOString(),
    published: p.isPublished,
    coverImage: p.coverImage ?? "",
  };
}

export function couponTypeFromApi(type: string) {
  return type === "FIXED" ? ("FIXED_AMOUNT" as const) : ("PERCENTAGE" as const);
}
