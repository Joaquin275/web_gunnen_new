/**
 * Sistema de emails transaccionales — Resend
 *
 * Funciones disponibles:
 *  - sendReservationConfirmation  → al confirmar reserva (con .ics adjunto)
 *  - sendReservationRejected      → si el pago Redsys es rechazado
 *  - sendReservationReminder      → recordatorio 3 días antes y mañana de la reserva
 *  - sendAdminDailyBriefing       → resumen de reservas del día para el admin
 *  - sendCancellationConfirmation → al cancelar una reserva
 *  - sendGiftCard                 → envío de bono regalo al destinatario
 */

import { generateIcs, googleCalendarLink } from "./ics";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "reservas@gunnen.es";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@gunnen.es";
const RESTAURANT_NAME = process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Gunnen";
const RESTAURANT_ADDRESS = "Juan Díaz Porlier, 15 — A Coruña";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://web-gunnen-new.vercel.app";

async function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no está definida. Los emails no se enviarán.");
    return null;
  }
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

// ─── Template base ────────────────────────────────────────────────────────────

function template(content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,serif;line-height:1.7;color:#1a1a1a;background:#f8f8f6;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff}
    .head{text-align:center;padding:40px 40px 24px;border-bottom:1px solid #e8e8e4}
    .head h1{font-size:28px;font-weight:300;letter-spacing:4px;text-transform:uppercase}
    .head p{font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-top:4px}
    .body{padding:40px}
    h2{font-size:22px;font-weight:300;margin-bottom:16px}
    p{margin-bottom:14px;color:#333;font-size:15px}
    .box{background:#fafaf9;border-left:3px solid #8b7355;padding:24px 28px;margin:24px 0}
    .row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #efefed;font-size:14px}
    .row:last-child{border-bottom:none}
    .lbl{color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding-top:3px}
    .val{font-weight:600;text-align:right}
    .btn{display:inline-block;padding:14px 36px;background:#1a1a1a;color:#fff!important;text-decoration:none;text-transform:uppercase;letter-spacing:2px;font-size:11px;margin:8px 4px}
    .btn-outline{background:#fff;color:#1a1a1a!important;border:1px solid #1a1a1a}
    .cal{background:#f0f4ff;border:1px solid #c5d0e8;padding:16px 20px;margin:20px 0;text-align:center}
    .cal p{font-size:13px;color:#444;margin-bottom:10px}
    .info{background:#fffbeb;border:1px solid #f5d87e;padding:16px 20px;margin:20px 0;font-size:13px;color:#7a5f00}
    .info-blue{background:#eff6ff;border:1px solid #bfdbfe;padding:16px 20px;margin:20px 0;font-size:13px;color:#1e40af}
    .foot{text-align:center;padding:28px 40px;border-top:1px solid #e8e8e4;font-size:12px;color:#999;line-height:1.8}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <h1>${RESTAURANT_NAME}</h1>
      <p>Alegría Compartida</p>
    </div>
    <div class="body">${content}</div>
    <div class="foot">
      ${RESTAURANT_NAME} · ${RESTAURANT_ADDRESS}<br>
      <a href="mailto:${ADMIN_EMAIL}" style="color:#8b7355">${ADMIN_EMAIL}</a> ·
      <a href="tel:+34613739550" style="color:#8b7355">+34 613 73 95 50</a><br>
      <a href="${APP_URL}" style="color:#8b7355">${APP_URL.replace("https://", "")}</a>
    </div>
  </div>
</body>
</html>`;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ReservationEmailData {
  reservationId: string;
  email: string;
  firstName: string;
  lastName: string;
  reservationDate: Date | string;
  reservationTime: string;
  numberOfPeople: number;
  menuName?: string;
  estimatedTotal?: number;
  depositAmount: number;
  redsysOrder?: string;
}

export interface GiftCardData {
  recipientEmail: string;
  recipientName?: string;
  purchaserName: string;
  amount: number;
  code: string;
  message?: string;
  expiresAt: string;
}

export interface CancellationData {
  email: string;
  firstName: string;
  lastName: string;
  reservationDate: string;
  reservationTime: string;
  refundAmount?: number;
  refundStatus: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function reservationStartDate(date: Date | string, time: string): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

// ─── 1. Confirmación de reserva ───────────────────────────────────────────────

export async function sendReservationConfirmation(data: ReservationEmailData) {
  const resend = await getResend();
  if (!resend) return;

  const startDate = reservationStartDate(data.reservationDate, data.reservationTime);
  const gcLink = googleCalendarLink({
    uid: `reserva-${data.reservationId}@gunnen.es`,
    summary: `Reserva en ${RESTAURANT_NAME}`,
    description: `Reserva para ${data.numberOfPeople} personas${data.menuName ? ` · Menú ${data.menuName}` : ""}. Número de reserva: ${data.reservationId.slice(-6).toUpperCase()}`,
    location: RESTAURANT_ADDRESS,
    startDate,
    durationMinutes: 120,
  });

  const icsContent = generateIcs({
    uid: `reserva-${data.reservationId}@gunnen.es`,
    summary: `Reserva en ${RESTAURANT_NAME}`,
    description: `Reserva para ${data.numberOfPeople} personas${data.menuName ? ` · Menú ${data.menuName}` : ""}`,
    location: RESTAURANT_ADDRESS,
    startDate,
    durationMinutes: 120,
  });

  const formattedDate = formatDate(data.reservationDate);

  const content = `
    <h2>Reserva confirmada</h2>
    <p>Estimado/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
    <p>Su reserva en ${RESTAURANT_NAME} ha sido confirmada. Le esperamos con ilusión.</p>

    <div class="box">
      <div class="row"><span class="lbl">N.º Reserva</span><span class="val">#${data.reservationId.slice(-6).toUpperCase()}</span></div>
      <div class="row"><span class="lbl">Fecha</span><span class="val">${formattedDate}</span></div>
      <div class="row"><span class="lbl">Hora</span><span class="val">${data.reservationTime}</span></div>
      <div class="row"><span class="lbl">Comensales</span><span class="val">${data.numberOfPeople} personas</span></div>
      ${data.menuName ? `<div class="row"><span class="lbl">Menú</span><span class="val">${data.menuName}</span></div>` : ""}
      ${data.estimatedTotal ? `<div class="row"><span class="lbl">Total estimado</span><span class="val">${Number(data.estimatedTotal).toFixed(2)}€</span></div>` : ""}
      <div class="row"><span class="lbl">Retención garantía (30%)</span><span class="val">${Number(data.depositAmount).toFixed(2)}€</span></div>
    </div>

    <div class="info-blue">
      <strong>Sobre su retención bancaria:</strong> Se ha retenido el 30% en su tarjeta como garantía. 
      Si acude a su reserva, la retención se libera sin cargo. 
      Cancelación gratuita con más de 24 horas de antelación.
    </div>

    <div class="cal">
      <p>Añada la reserva a su calendario para no olvidarla</p>
      <a href="${gcLink}" class="btn" target="_blank">Google Calendar</a>
    </div>

    <div class="info">
      <strong>Ubicación:</strong> ${RESTAURANT_ADDRESS}<br>
      <strong>Horario:</strong> Mar–Mié 13:00–15:00 · Jue–Sáb 13:00–15:00 y 20:00–23:00
    </div>

    <p style="font-size:13px;color:#888">
      Para cancelar o modificar su reserva con más de 24 horas de antelación, 
      contáctenos en <a href="mailto:${ADMIN_EMAIL}" style="color:#8b7355">${ADMIN_EMAIL}</a> 
      o por WhatsApp al +34 613 73 95 50.
    </p>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Reserva confirmada para el ${formattedDate} — ${RESTAURANT_NAME}`,
    html: template(content),
    attachments: [
      {
        filename: "reserva-gunnen.ics",
        content: Buffer.from(icsContent).toString("base64"),
      },
    ],
  });
}

// ─── 2. Pago rechazado ────────────────────────────────────────────────────────

export async function sendReservationRejected(data: ReservationEmailData) {
  const resend = await getResend();
  if (!resend) return;

  const formattedDate = formatDate(data.reservationDate);

  const content = `
    <h2>No se pudo completar su reserva</h2>
    <p>Estimado/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
    <p>Lamentablemente, la autorización bancaria para su reserva del <strong>${formattedDate} a las ${data.reservationTime}</strong> no pudo completarse. No se ha realizado ningún cargo ni retención en su tarjeta.</p>

    <div class="info" style="background:#fff5f5;border-color:#fca5a5;color:#991b1b">
      <strong>¿Qué ocurrió?</strong> La entidad bancaria no autorizó la retención de garantía (${Number(data.depositAmount).toFixed(2)}€). 
      Esto puede deberse a fondos insuficientes, tarjeta bloqueada o error en la autenticación 3D Secure.
    </div>

    <p>Puede intentar realizar la reserva de nuevo o contactar con nosotros directamente:</p>

    <div style="text-align:center;margin:24px 0">
      <a href="${APP_URL}/reservas" class="btn">Intentar de nuevo</a>
      <a href="https://wa.me/34613739550" class="btn btn-outline">WhatsApp</a>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Reserva no completada — ${RESTAURANT_NAME}`,
    html: template(content),
  });
}

// ─── 3. Recordatorio al cliente ───────────────────────────────────────────────

export async function sendReservationReminder(
  data: ReservationEmailData,
  type: "3days" | "morning"
) {
  const resend = await getResend();
  if (!resend) return;

  const formattedDate = formatDate(data.reservationDate);
  const startDate = reservationStartDate(data.reservationDate, data.reservationTime);

  const gcLink = googleCalendarLink({
    uid: `reserva-${data.reservationId}@gunnen.es`,
    summary: `Reserva en ${RESTAURANT_NAME}`,
    description: `Reserva para ${data.numberOfPeople} personas`,
    location: RESTAURANT_ADDRESS,
    startDate,
    durationMinutes: 120,
  });

  const is3days = type === "3days";

  const content = `
    <h2>${is3days ? "Su reserva es en 3 días" : "Recordatorio: su reserva es hoy"}</h2>
    <p>Estimado/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
    <p>${
      is3days
        ? `Le recordamos que tiene una reserva en <strong>${RESTAURANT_NAME}</strong> en tres días.`
        : `Hoy es el gran día — le esperamos esta ${Number(data.reservationTime.split(":")[0]) >= 18 ? "noche" : "tarde"} en <strong>${RESTAURANT_NAME}</strong>.`
    }</p>

    <div class="box">
      <div class="row"><span class="lbl">Fecha</span><span class="val">${formattedDate}</span></div>
      <div class="row"><span class="lbl">Hora</span><span class="val">${data.reservationTime}</span></div>
      <div class="row"><span class="lbl">Comensales</span><span class="val">${data.numberOfPeople} personas</span></div>
      ${data.menuName ? `<div class="row"><span class="lbl">Menú</span><span class="val">${data.menuName}</span></div>` : ""}
    </div>

    <div class="info">
      <strong>📍 Cómo llegar:</strong> ${RESTAURANT_ADDRESS}<br>
      Le recomendamos llegar con 5 minutos de antelación.
    </div>

    ${is3days ? `
    <div class="cal">
      <p>¿Aún no lo tiene en su calendario?</p>
      <a href="${gcLink}" class="btn" target="_blank">Añadir a Google Calendar</a>
    </div>
    <p style="font-size:13px;color:#888">
      Si necesita cancelar, recuerde que debe hacerlo con más de 24 horas de antelación 
      para evitar el cargo de la garantía. Contáctenos en 
      <a href="mailto:${ADMIN_EMAIL}" style="color:#8b7355">${ADMIN_EMAIL}</a>.
    </p>
    ` : `
    <p>Estamos deseando recibirle. Si tiene alguna pregunta de última hora, 
    llámenos al <a href="tel:+34613739550" style="color:#8b7355">+34 613 73 95 50</a>.</p>
    `}
  `;

  const subject = is3days
    ? `Recordatorio: su reserva en ${RESTAURANT_NAME} es en 3 días`
    : `¡Hoy es su reserva en ${RESTAURANT_NAME}! 🍽`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject,
    html: template(content),
  });
}

// ─── 4. Resumen diario para el admin ─────────────────────────────────────────

export async function sendAdminDailyBriefing(
  reservations: ReservationEmailData[]
) {
  const resend = await getResend();
  if (!resend) return;
  if (reservations.length === 0) return; // No enviar si no hay reservas

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const rows = reservations
    .map(
      (r) => `
      <div class="row">
        <span class="lbl">${r.reservationTime}</span>
        <span class="val">${r.firstName} ${r.lastName} · ${r.numberOfPeople} personas${r.menuName ? ` · ${r.menuName}` : ""}</span>
      </div>`
    )
    .join("");

  const content = `
    <h2>Reservas para hoy — ${today}</h2>
    <p>Buenos días. Aquí tienes el resumen de las reservas confirmadas para hoy:</p>

    <div class="box">
      <div class="row" style="font-weight:600">
        <span>Hora</span><span>Cliente · Detalles</span>
      </div>
      ${rows}
    </div>

    <div style="text-align:center;margin-top:24px">
      <a href="${APP_URL}/admin/reservations" class="btn">Ver panel de reservas</a>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `[Gunnen] ${reservations.length} reserva${reservations.length > 1 ? "s" : ""} para hoy — ${today}`,
    html: template(content),
  });
}

// ─── 5. Cancelación ──────────────────────────────────────────────────────────

export async function sendCancellationConfirmation(data: CancellationData) {
  const resend = await getResend();
  if (!resend) return;

  const content = `
    <h2>Cancelación de reserva</h2>
    <p>Estimado/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
    <p>Hemos procesado la cancelación de su reserva.</p>
    <div class="box">
      <div class="row"><span class="lbl">Fecha</span><span class="val">${data.reservationDate}</span></div>
      <div class="row"><span class="lbl">Hora</span><span class="val">${data.reservationTime}</span></div>
      ${data.refundAmount ? `<div class="row"><span class="lbl">Retención liberada</span><span class="val">${data.refundAmount.toFixed(2)}€</span></div>` : ""}
      <div class="row"><span class="lbl">Estado garantía</span><span class="val">${
        data.refundStatus === "full"
          ? "✓ Liberada sin cargo"
          : data.refundStatus === "partial"
          ? "Cargo parcial aplicado"
          : "Cargo aplicado"
      }</span></div>
    </div>
    <p>Esperamos poder recibirle en otra ocasión. Puede hacer una nueva reserva cuando lo desee.</p>
    <div style="text-align:center;margin-top:20px">
      <a href="${APP_URL}/reservas" class="btn">Nueva reserva</a>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Cancelación de reserva — ${RESTAURANT_NAME}`,
    html: template(content),
  });
}

// ─── 6. Bono regalo ──────────────────────────────────────────────────────────

export async function sendGiftCard(data: GiftCardData) {
  const resend = await getResend();
  if (!resend) return;

  const content = `
    <h2>Has recibido un bono regalo</h2>
    <p>Estimado/a <strong>${data.recipientName || "amigo/a"}</strong>,</p>
    <p><strong>${data.purchaserName}</strong> te ha regalado una experiencia gastronómica en ${RESTAURANT_NAME}.</p>
    ${data.message ? `<p style="font-style:italic;padding:20px;background:#fafaf9;border-left:3px solid #8b7355">"${data.message}"</p>` : ""}
    <div class="box">
      <div class="row"><span class="lbl">Importe</span><span class="val">${data.amount.toFixed(2)}€</span></div>
      <div class="row"><span class="lbl">Código</span><span class="val" style="letter-spacing:3px;font-size:18px">${data.code}</span></div>
      <div class="row"><span class="lbl">Válido hasta</span><span class="val">${data.expiresAt}</span></div>
    </div>
    <p>Para usarlo, simplemente realiza una reserva e introduce el código en el proceso.</p>
    <div style="text-align:center;margin-top:20px">
      <a href="${APP_URL}/reservas" class="btn">Reservar ahora</a>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.recipientEmail,
    subject: `Tienes un bono regalo de ${RESTAURANT_NAME}`,
    html: template(content),
  });
}
