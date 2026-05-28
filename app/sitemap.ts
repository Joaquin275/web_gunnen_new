import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://www.gunnen.es";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/menus`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/menus/tempo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/menus/impulso`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/reservas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/regala`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/quienes-somos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/prensa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Artículos de prensa publicados (solo los que tienen slug limpio, no URL externa)
  let pressRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.pressPost.findMany({
      where: { isPublished: true, externalUrl: null },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });
    pressRoutes = posts.map((post) => ({
      url: `${BASE}/prensa/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // Si falla la DB, devolvemos solo las rutas estáticas
  }

  return [...staticRoutes, ...pressRoutes];
}
