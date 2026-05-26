import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function readJson(filename) {
  const filePath = path.join(process.cwd(), "data", filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function migrateCoupons() {
  const existing = readJson("coupons.json");
  const count = await prisma.coupon.count();
  if (count > 0) {
    console.log(`Cupones: ya hay ${count} en Supabase, omitiendo migración`);
    return;
  }

  for (const c of existing) {
    await prisma.coupon.create({
      data: {
        code: c.code.toUpperCase(),
        type: c.type === "FIXED" ? "FIXED_AMOUNT" : "PERCENTAGE",
        value: c.value,
        description: c.description || null,
        maxUses: c.maxUses ?? null,
        usedCount: c.usedCount ?? 0,
        validUntil: c.expiresAt ? new Date(c.expiresAt) : null,
        isActive: c.active ?? true,
      },
    });
    console.log(` ✓ Cupón ${c.code}`);
  }
  if (existing.length === 0) console.log("Cupones: sin datos en JSON");
}

async function migratePress() {
  const existing = readJson("press.json");
  const count = await prisma.pressPost.count();
  if (count > 0) {
    console.log(`Prensa: ya hay ${count} en Supabase, omitiendo migración`);
    return;
  }

  for (const p of existing) {
    await prisma.pressPost.create({
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        publishedAt: new Date(p.publishedAt),
        isPublished: p.published,
        coverImage: p.coverImage || null,
      },
    });
    console.log(` ✓ Prensa: ${p.title}`);
  }
  if (existing.length === 0) console.log("Prensa: sin datos en JSON");
}

async function main() {
  console.log("Migrando datos JSON → Supabase...\n");
  await migrateCoupons();
  await migratePress();
  console.log("\nMigración completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
