/**
 * Sistema de emails transaccionales — Resend
 *
 * Funciones disponibles:
 *  - sendReservationConfirmation  → al confirmar reserva (con .ics adjunto)
 *  - sendReservationRejected      → si el pago Redsys es rechazado
 *  - sendReservationReminder      → recordatorio 24h antes y el mismo día (desde las 11:00)
 *  - sendAdminReservationNotification → copia al admin en confirmación/cancelación/rechazo
 *  - sendAdminDailyBriefing       → resumen de reservas del día para el admin
 *  - sendCancellationConfirmation → al cancelar una reserva
 *  - sendGiftCard                 → envío de bono regalo al destinatario
 */

import { generateIcs, googleCalendarLink, reservationIcsOptions, reservationStartDate } from "./ics";
import { generateGiftCardPdf } from "./pdf";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "reservas@gunnen.es";
const ADMIN_EMAILS = [
  "reservas@gunnen.es",
  "info@gunnen.es",
  ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : []),
].filter((email, i, arr) => arr.indexOf(email) === i);
const CONTACT_EMAIL = "reservas@gunnen.es";
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
      <a href="mailto:${CONTACT_EMAIL}" style="color:#8b7355">${CONTACT_EMAIL}</a> ·
      <a href="mailto:info@gunnen.es" style="color:#8b7355">info@gunnen.es</a> ·
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
  attendanceToken?: string;
}

export interface GiftCardData {
  recipientEmail: string;
  recipientName?: string;
  purchaserName: string;
  amount: number;
  menuName?: string;
  code: string;
  message?: string;
  expiresAt: string;
}

export interface AdminGiftCardNotificationData {
  code: string;
  amount: number;
  menuName?: string;
  purchaserName: string;
  purchaserEmail: string;
  recipientName?: string;
  recipientEmail: string;
  message?: string;
  paidAt: string;
}

export interface CancellationData {
  email: string;
  firstName: string;
  lastName: string;
  reservationDate: string;
  reservationTime: string;
  refundAmount?: number;
  refundStatus: string;
  reservationId?: string;
  numberOfPeople?: number;
  menuName?: string;
}

export type AdminReservationEvent = "confirmed" | "cancelled" | "rejected";

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

function reservationBox(data: ReservationEmailData, extraRows = "") {
  const formattedDate = formatDate(data.reservationDate);
  return `
    <div class="box">
      <div class="row"><span class="lbl">N.º Reserva</span><span class="val">#${data.reservationId.slice(-6).toUpperCase()}</span></div>
      <div class="row"><span class="lbl">Cliente</span><span class="val">${data.firstName} ${data.lastName}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${data.email}</span></div>
      <div class="row"><span class="lbl">Fecha</span><span class="val">${formattedDate}</span></div>
      <div class="row"><span class="lbl">Hora</span><span class="val">${data.reservationTime}</span></div>
      <div class="row"><span class="lbl">Comensales</span><span class="val">${data.numberOfPeople} personas</span></div>
      ${data.menuName ? `<div class="row"><span class="lbl">Menú</span><span class="val">${data.menuName}</span></div>` : ""}
      ${data.estimatedTotal ? `<div class="row"><span class="lbl">Total estimado</span><span class="val">${Number(data.estimatedTotal).toFixed(2)}€</span></div>` : ""}
      <div class="row"><span class="lbl">Retención garantía</span><span class="val">${Number(data.depositAmount).toFixed(2)}€</span></div>
      ${extraRows}
    </div>
  `;
}

// ─── Notificaciones admin (reservas) ───────────────────────────────────────────

export async function sendAdminReservationNotification(
  data: ReservationEmailData,
  event: AdminReservationEvent
) {
  const resend = await getResend();
  if (!resend) return;

  const formattedDate = formatDate(data.reservationDate);
  const titles: Record<AdminReservationEvent, string> = {
    confirmed: "Nueva reserva confirmada",
    cancelled: "Reserva cancelada",
    rejected: "Reserva no completada (pago rechazado)",
  };

  const content = `
    <h2>${titles[event]}</h2>
    <p>Notificación automática del sistema de reservas.</p>
    ${reservationBox(data)}
    <div style="text-align:center;margin-top:24px">
      <a href="${APP_URL}/admin/reservations/${data.reservationId}" class="btn">Ver en el panel</a>
    </div>
  `;

  const subjects: Record<AdminReservationEvent, string> = {
    confirmed: `[Gunnen] Reserva confirmada — ${formattedDate} ${data.reservationTime} · ${data.firstName} ${data.lastName}`,
    cancelled: `[Gunnen] Reserva cancelada — ${formattedDate} · ${data.firstName} ${data.lastName}`,
    rejected: `[Gunnen] Pago rechazado — ${data.firstName} ${data.lastName}`,
  };

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAILS,
    subject: subjects[event],
    html: template(content),
  });
}

/** Envía confirmación al cliente y copia al administrador */
export async function notifyReservationConfirmed(data: ReservationEmailData) {
  await Promise.all([
    sendReservationConfirmation(data),
    sendAdminReservationNotification(data, "confirmed"),
  ]);
}

/** Envía rechazo al cliente y aviso al administrador */
export async function notifyReservationRejected(data: ReservationEmailData) {
  await Promise.all([
    sendReservationRejected(data),
    sendAdminReservationNotification(data, "rejected"),
  ]);
}

/** Envía cancelación al cliente y copia al administrador */
export async function notifyReservationCancelled(data: CancellationData) {
  await Promise.all([
    sendCancellationConfirmation(data),
    sendAdminCancellationNotification(data),
  ]);
}

async function sendAdminCancellationNotification(data: CancellationData) {
  const resend = await getResend();
  if (!resend) return;

  const content = `
    <h2>Reserva cancelada</h2>
    <p>Se ha cancelado una reserva en el sistema.</p>
    <div class="box">
      ${data.reservationId ? `<div class="row"><span class="lbl">N.º Reserva</span><span class="val">#${data.reservationId.slice(-6).toUpperCase()}</span></div>` : ""}
      <div class="row"><span class="lbl">Cliente</span><span class="val">${data.firstName} ${data.lastName}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${data.email}</span></div>
      <div class="row"><span class="lbl">Fecha</span><span class="val">${data.reservationDate}</span></div>
      <div class="row"><span class="lbl">Hora</span><span class="val">${data.reservationTime}</span></div>
      ${data.numberOfPeople ? `<div class="row"><span class="lbl">Comensales</span><span class="val">${data.numberOfPeople}</span></div>` : ""}
      ${data.menuName ? `<div class="row"><span class="lbl">Menú</span><span class="val">${data.menuName}</span></div>` : ""}
      ${data.refundAmount != null ? `<div class="row"><span class="lbl">Retención</span><span class="val">${data.refundAmount.toFixed(2)}€</span></div>` : ""}
    </div>
    <div style="text-align:center;margin-top:24px">
      <a href="${APP_URL}/admin/reservations" class="btn">Ver reservas</a>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAILS,
    subject: `[Gunnen] Cancelación — ${data.firstName} ${data.lastName} · ${data.reservationDate}`,
    html: template(content),
  });
}

// ─── 1. Confirmación de reserva ───────────────────────────────────────────────

export async function sendReservationConfirmation(data: ReservationEmailData) {
  const resend = await getResend();
  if (!resend) return;

  const icsOpts = reservationIcsOptions({
    id: data.reservationId,
    reservationDate: data.reservationDate,
    reservationTime: data.reservationTime,
    numberOfPeople: data.numberOfPeople,
    menuName: data.menuName,
  });
  const gcLink = googleCalendarLink(icsOpts);
  const icsContent = generateIcs(icsOpts);

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
      <p style="font-size:12px;color:#888;margin-top:10px">También puede abrir el adjunto <strong>reserva-gunnen.ics</strong> para Apple Calendar, Outlook o su móvil.</p>
    </div>

    <div class="info">
      <strong>Ubicación:</strong> ${RESTAURANT_ADDRESS}<br>
      <strong>Horario:</strong> Mar–Mié 13:00–15:00 · Jue–Sáb 13:00–15:00 y 20:00–23:00
    </div>

    <p style="font-size:13px;color:#888">
      Para cancelar o modificar su reserva con más de 24 horas de antelación, 
      contáctenos en <a href="mailto:${CONTACT_EMAIL}" style="color:#8b7355">${CONTACT_EMAIL}</a> 
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
  type: "24h" | "same_day"
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

  const is24h = type === "24h";

  const content = `
    <h2>${is24h ? "Recordatorio: su reserva es mañana" : "Recordatorio: su reserva es hoy"}</h2>
    <p>Estimado/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
    <p>${
      is24h
        ? `Le recordamos que tiene una reserva en <strong>${RESTAURANT_NAME}</strong> mañana.`
        : `Hoy le esperamos en <strong>${RESTAURANT_NAME}</strong> a las <strong>${data.reservationTime}</strong>.`
    }</p>

    <div class="box">
      <div class="row"><span class="lbl">N.º Reserva</span><span class="val">#${data.reservationId.slice(-6).toUpperCase()}</span></div>
      <div class="row"><span class="lbl">Fecha</span><span class="val">${formattedDate}</span></div>
      <div class="row"><span class="lbl">Hora</span><span class="val">${data.reservationTime}</span></div>
      <div class="row"><span class="lbl">Comensales</span><span class="val">${data.numberOfPeople} personas</span></div>
      ${data.menuName ? `<div class="row"><span class="lbl">Menú</span><span class="val">${data.menuName}</span></div>` : ""}
    </div>

    <div class="info">
      <strong>📍 Cómo llegar:</strong> ${RESTAURANT_ADDRESS}<br>
      Le recomendamos llegar con 5 minutos de antelación.
    </div>

    ${data.attendanceToken ? `
    <div style="background:#f0f8f0;border:2px solid #4ade80;padding:20px 24px;margin:24px 0;text-align:center">
      <p style="font-size:15px;font-weight:600;color:#166534;margin-bottom:6px">¿Confirma su asistencia?</p>
      <p style="font-size:13px;color:#166534;margin-bottom:14px">
        Un simple clic y lo tenemos registrado. Nos ayuda a prepararlo todo para usted.
      </p>
      <a href="${APP_URL}/api/reservations/confirm-attendance?token=${data.attendanceToken}"
         style="display:inline-block;padding:12px 32px;background:#166534;color:#fff;text-decoration:none;text-transform:uppercase;letter-spacing:2px;font-size:12px">
        ✓ Confirmo mi asistencia
      </a>
    </div>
    ` : ""}

    ${is24h ? `
    <div class="cal">
      <p>¿Aún no lo tiene en su calendario?</p>
      <a href="${gcLink}" class="btn" target="_blank">Añadir a Google Calendar</a>
    </div>
    <p style="font-size:13px;color:#888">
      Si necesita cancelar, recuerde que debe hacerlo con más de 24 horas de antelación
      para evitar el cargo de la garantía. Contáctenos en
      <a href="mailto:${CONTACT_EMAIL}" style="color:#8b7355">${CONTACT_EMAIL}</a>.
    </p>
    ` : `
    <p>Estamos deseando recibirle. Si tiene alguna pregunta de última hora,
    llámenos al <a href="tel:+34613739550" style="color:#8b7355">+34 613 73 95 50</a>.</p>
    `}
  `;

  const subject = is24h
    ? `Recordatorio: su reserva en ${RESTAURANT_NAME} es mañana`
    : `¡Hoy es su reserva en ${RESTAURANT_NAME}! — ${data.reservationTime}`;

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
    to: ADMIN_EMAILS,
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

export async function sendAdminGiftCardNotification(data: AdminGiftCardNotificationData) {
  const resend = await getResend();
  if (!resend) return;

  const menuLabel = data.menuName || "Experiencia gastronómica";

  const content = `
    <h2>Nueva venta de bono regalo</h2>
    <p>Se ha completado una compra de bono regalo en la web.</p>

    <div class="box">
      <div class="row"><span class="lbl">Código asignado</span><span class="val" style="font-family:monospace;letter-spacing:2px">${data.code}</span></div>
      <div class="row"><span class="lbl">Menú</span><span class="val">${menuLabel}</span></div>
      <div class="row"><span class="lbl">Importe</span><span class="val">${data.amount.toFixed(2)}€</span></div>
      <div class="row"><span class="lbl">Comprador</span><span class="val">${data.purchaserName} (${data.purchaserEmail})</span></div>
      <div class="row"><span class="lbl">Destinatario</span><span class="val">${data.recipientName || data.purchaserName} (${data.recipientEmail})</span></div>
      ${data.message ? `<div class="row"><span class="lbl">Dedicatoria</span><span class="val" style="font-style:italic">"${data.message}"</span></div>` : ""}
      <div class="row"><span class="lbl">Fecha pago</span><span class="val">${data.paidAt}</span></div>
    </div>

    <div style="text-align:center;margin-top:24px">
      <a href="${APP_URL}/admin/giftcards" class="btn">Ver bonos en el panel</a>
    </div>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAILS,
    subject: `[Gunnen] Bono vendido — ${data.code} (${data.amount.toFixed(2)}€)`,
    html: template(content),
  });
}

export async function sendGiftCard(data: GiftCardData) {
  const resend = await getResend();
  if (!resend) return;

  const menuLabel = data.menuName || "Experiencia gastronómica";

  const content = `
    <h2>Has recibido un bono regalo</h2>
    <p>Estimado/a <strong>${data.recipientName || "amigo/a"}</strong>,</p>
    <p><strong>${data.purchaserName}</strong> te ha regalado una experiencia en ${RESTAURANT_NAME}.</p>
    ${data.message ? `<p style="font-style:italic;padding:20px;background:#fafaf9;border-left:3px solid #8b7355">"${data.message}"</p>` : ""}

    <div class="box">
      <div class="row"><span class="lbl">Menú</span><span class="val" style="font-weight:600">${menuLabel}</span></div>
      <div class="row"><span class="lbl">Importe</span><span class="val">${data.amount.toFixed(2)}€ por persona</span></div>
      <div class="row">
        <span class="lbl">Código del bono</span>
        <span class="val" style="letter-spacing:4px;font-size:20px;font-family:monospace;font-weight:700;color:#8b7355">${data.code}</span>
      </div>
      <div class="row"><span class="lbl">Válido hasta</span><span class="val">${data.expiresAt}</span></div>
    </div>

    <div style="background:#1a1a1a;color:#fff;padding:28px 32px;margin:28px 0;text-align:center">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin-bottom:8px">Tu código de bono regalo</p>
      <p style="font-size:28px;letter-spacing:6px;font-family:monospace;font-weight:700;color:#c9a96e;margin:0">${data.code}</p>
    </div>

    <p>Para canjear tu bono, realiza una reserva en nuestra web e introduce este código en el paso de confirmación.</p>
    <p style="font-size:13px;color:#888">El bono es válido para el menú indicado y puede usarse para cualquier reserva disponible antes de la fecha de vencimiento.</p>
    <div style="text-align:center;margin-top:24px">
      <a href="${APP_URL}/reservas" class="btn">Reservar ahora</a>
    </div>
  `;

  // Generar PDF personalizado con el código insertado dinámicamente
  let attachments: { filename: string; content: Buffer }[] = [];
  try {
    const pdfBuffer = await generateGiftCardPdf(data.code);
    if (pdfBuffer) {
      attachments = [{ filename: "Bono-Regalo-Gunnen.pdf", content: pdfBuffer }];
    }
  } catch {
    // Sin PDF adjunto, el email se envía igualmente
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.recipientEmail,
    subject: `Tu bono regalo ${RESTAURANT_NAME} — ${menuLabel}`,
    html: template(content),
    ...(attachments.length > 0 && { attachments }),
  });
}
