import { NextRequest, NextResponse } from "next/server";
import { pressDb } from "@/lib/db-json";

export async function GET() {
  return NextResponse.json(pressDb.findAll());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, content, published, publishedAt } = body;
    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }
    const post = pressDb.create({ title, slug, excerpt, content, published: !!published, publishedAt, coverImage: "" });
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
