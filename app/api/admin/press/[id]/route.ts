import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializePressPost } from "@/lib/serializers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.pressPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(serializePressPost(post));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const post = await prisma.pressPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.slug !== undefined ? { slug: body.slug.trim() } : {}),
        ...(body.excerpt !== undefined ? { excerpt: body.excerpt.trim() } : {}),
        ...(body.content !== undefined ? { content: body.content.trim() } : {}),
        ...(body.published !== undefined ? { isPublished: !!body.published } : {}),
        ...(body.publishedAt !== undefined ? { publishedAt: new Date(body.publishedAt) } : {}),
        ...(body.coverImage !== undefined ? { coverImage: body.coverImage?.trim() || null } : {}),
      },
    });

    revalidatePath("/prensa");
    revalidatePath(`/prensa/${post.slug}`);
    revalidatePath("/admin/press");
    revalidatePath("/");
    return NextResponse.json(serializePressPost(post));
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.pressPost.delete({ where: { id } });
    revalidatePath("/prensa");
    revalidatePath("/admin/press");
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    console.error("Error deleting press post:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
