import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.pressPost.findMany({
    select: { id: true, slug: true, externalUrl: true, title: true },
  });

  console.log("Posts actuales:");
  for (const post of posts) {
    console.log(`  [${post.id}] slug="${post.slug}" externalUrl="${post.externalUrl}" title="${post.title}"`);
  }

  // Si el slug parece una URL (empieza por http), moverlo a externalUrl y generar un slug limpio
  let fixed = 0;
  for (const post of posts) {
    if (post.slug.startsWith("http") || post.slug.startsWith("www")) {
      const externalUrl = post.slug.startsWith("http") ? post.slug : `https://${post.slug}`;
      // Generar slug desde el título
      const newSlug = post.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      console.log(`\nFixing post "${post.title}":`);
      console.log(`  slug: "${post.slug}" → "${newSlug}"`);
      console.log(`  externalUrl: null → "${externalUrl}"`);

      await prisma.pressPost.update({
        where: { id: post.id },
        data: { slug: newSlug, externalUrl },
      });
      fixed++;
    }
  }

  console.log(`\nFixed ${fixed} posts.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
