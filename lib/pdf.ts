/**
 * Generación dinámica del PDF de bono regalo.
 * Carga la plantilla /public/bono-regalo.pdf e inserta el código.
 *
 * En Vercel serverless, el fichero se lee desde el sistema de ficheros
 * (process.cwd()/public). Si no se encuentra, intenta descargarlo desde
 * la URL pública como fallback.
 *
 * Coordenadas calibradas con PyMuPDF sobre la plantilla (A5, 419.5×595.3 pt):
 *   – "CÓDIGO BONO: __________" en PyMuPDF: x0=119.7, y0=300.4, y1=313.1
 *   – En pdf-lib (bottom-left): X=119.7, Y=595.276−313.1=282.2
 *
 * Si cambia la plantilla:
 *   python -c "import fitz; doc=fitz.open('public/bono-regalo.pdf'); [print(w) for w in doc[0].get_text('words') if '___' in w[4]]"
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const CODIGO_X   = 120;
const CODIGO_Y   = 282;
const FONT_SIZE  = 11;
const PAGE_INDEX = 0;

async function loadTemplateBytes(): Promise<Uint8Array | null> {
  // Intento 1: sistema de ficheros (funciona en local y en la mayoría de deploys)
  try {
    const fs = await import("fs");
    const path = await import("path");
    const templatePath = path.join(process.cwd(), "public", "bono-regalo.pdf");
    if (fs.existsSync(templatePath)) {
      const buf = fs.readFileSync(templatePath);
      return new Uint8Array(buf);
    }
  } catch {
    // fs no disponible en este entorno
  }

  // Intento 2: fetch desde la URL pública (fallback para Vercel Edge / funciones sin fs)
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.gunnen.es";
    const res = await fetch(`${appUrl}/bono-regalo.pdf`);
    if (res.ok) {
      const ab = await res.arrayBuffer();
      return new Uint8Array(ab);
    }
    console.error("[PDF] Fetch fallback devolvió status:", res.status);
  } catch (err) {
    console.error("[PDF] Error en fetch fallback:", err);
  }

  return null;
}

export async function generateGiftCardPdf(code: string): Promise<Buffer | null> {
  try {
    const templateBytes = await loadTemplateBytes();
    if (!templateBytes) {
      console.error("[PDF] No se pudo cargar la plantilla bono-regalo.pdf");
      return null;
    }

    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[PAGE_INDEX];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Tapar los guiones con un rectángulo blanco
    page.drawRectangle({
      x: CODIGO_X - 1,
      y: CODIGO_Y - 1,
      width: 160,
      height: FONT_SIZE + 4,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    // Escribir el código
    page.drawText(code, {
      x: CODIGO_X,
      y: CODIGO_Y,
      size: FONT_SIZE,
      font,
      color: rgb(0.08, 0.08, 0.08),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (err) {
    console.error("[PDF] Error generando PDF de bono regalo:", err);
    return null;
  }
}
