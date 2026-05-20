/**
 * Generación dinámica del PDF de bono regalo.
 * Carga la plantilla /public/bono-regalo.pdf e inserta el código
 * sobre la línea de guiones "CÓDIGO BONO: ___________".
 *
 * Coordenadas: ajusta CÓDIGO_X / CÓDIGO_Y si el texto no queda exactamente
 * sobre la línea. Origen de coordenadas pdf-lib = esquina inferior izquierda.
 */

import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Posición del código sobre la línea de guiones del documento.
// Estos valores son aproximados para una hoja A4.
// Modifícalos si el texto aparece desplazado.
const CODIGO_X = 195; // distancia desde el borde izquierdo (puntos)
const CODIGO_Y = 82;  // distancia desde el borde inferior  (puntos)
const FONT_SIZE = 12;

export async function generateGiftCardPdf(code: string): Promise<Buffer | null> {
  try {
    const templatePath = path.join(process.cwd(), "public", "bono-regalo.pdf");
    if (!fs.existsSync(templatePath)) return null;

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);

    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1]; // el código va en la última página

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Dibuja el código sobre la línea de guiones
    lastPage.drawText(code, {
      x: CODIGO_X,
      y: CODIGO_Y,
      size: FONT_SIZE,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (err) {
    console.error("Error generando PDF de bono regalo:", err);
    return null;
  }
}
