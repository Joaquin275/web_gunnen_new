import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializePressPost } from "@/lib/serializers";

export async function GET() {
  const posts = await prisma.pressPost.findMany({ orderBy: { publishedAt: "desc" } });
  return NextResponse.json(posts.map(serializePressPost));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, slug, excerpt, content, published, publishedAt, coverImage } = body;
    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const post = await prisma.pressPost.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt?.trim() || "",
        content: content.trim(),
        isPublished: !!published,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        coverImage: coverImage?.trim() || null,
      },
    });

    return NextResponse.json(serializePressPost(post), { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una publicación con ese slug" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
