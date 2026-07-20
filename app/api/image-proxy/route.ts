import { NextRequest, NextResponse } from "next/server";

// Proxy de imágenes: evita el bloqueo anti-hotlinking de los medios de comunicación.
// El navegador pide la imagen a /api/image-proxy?url=..., y nuestro servidor la descarga
// sin revelar el referer, por lo que el periódico no puede bloquearla.

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Falta el parámetro url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Protocolo no permitido" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      // Sin Referer para evitar el bloqueo
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error al obtener la imagen: ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isImage = ALLOWED_CONTENT_TYPES.some((t) => contentType.startsWith(t));
    if (!isImage) {
      return NextResponse.json({ error: "El recurso no es una imagen" }, { status: 400 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[image-proxy] Error:", err);
    return NextResponse.json({ error: "No se pudo obtener la imagen" }, { status: 502 });
  }
}
