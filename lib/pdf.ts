/**
 * Generación dinámica del PDF de bono regalo.
 * Carga la plantilla /public/bono-regalo.pdf e inserta el código
 * sobre la línea de guiones "CÓDIGO BONO: ___________".
 *
 * Coordenadas calibradas con PyMuPDF sobre la plantilla actual (A5, 419.5×595.3 pt):
 *   – Posición de "CÓDIGO BONO: __________" en PyMuPDF (top-left):
 *       x0=119.7  y0=300.4  y1=313.1
 *   – Convertido a pdf-lib (bottom-left):
 *       X = 119.7   Y = 595.276 − 313.1 = 282.2
 *
 * Si cambia la plantilla, ejecutar:
 *   python -c "import fitz; doc=fitz.open('public/bono-regalo.pdf'); [print(w) for w in doc[0].get_text('words') if '___' in w[4]]"
 * y actualizar CODIGO_X / CODIGO_Y abajo.
 */

import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const CODIGO_X    = 120;   // X donde empiezan los guiones (px desde borde izq)
const CODIGO_Y    = 282;   // Y de la línea (px desde borde inferior, sistema pdf-lib)
const FONT_SIZE   = 11;
const PAGE_INDEX  = 0;     // El código va en la PRIMERA página

export async function generateGiftCardPdf(code: string): Promise<Buffer | null> {
  try {
    const templatePath = path.join(process.cwd(), "public", "bono-regalo.pdf");
    if (!fs.existsSync(templatePath)) return null;

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);

    const pages = pdfDoc.getPages();
    const page = pages[PAGE_INDEX];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Tapar los guiones con un rectángulo blanco para que quede limpio
    page.drawRectangle({
      x: CODIGO_X - 1,
      y: CODIGO_Y - 1,
      width: 160,   // ancho suficiente para cualquier código (ej. GUNNEN-XXXX-XXXX)
      height: FONT_SIZE + 4,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    // Escribir el código sobre la línea tapada
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
    console.error("Error generando PDF de bono regalo:", err);
    return null;
  }
}
