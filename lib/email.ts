import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY no está definida");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "reservas@gunnen.es";
const RESTAURANT_NAME = process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Gunnen";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface ReservationConfirmationData {
  email: string;
  firstName: string;
  lastName: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople: number;
  depositAmount: number;
  reservationId: string;
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

// Template básico HTML
function getEmailTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 40px 0 20px;
      border-bottom: 1px solid #e5e5e5;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 300;
      margin: 0;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px 0;
    }
    .details {
      background: #fafaf9;
      padding: 30px;
      margin: 30px 0;
      border-left: 3px solid #8b7355;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1px;
      color: #666;
    }
    .value {
      font-size: 16px;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #e5e5e5;
      font-size: 14px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 15px 40px;
      background: #1a1a1a;
      color: #ffffff !important;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 12px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${RESTAURANT_NAME}</h1>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>${RESTAURANT_NAME}<br>
    ${process.env.NEXT_PUBLIC_RESTAURANT_EMAIL || 'info@gunnen.es'}<br>
    ${process.env.NEXT_PUBLIC_RESTAURANT_PHONE || '+34 XXX XXX XXX'}</p>
  </div>
</body>
</html>
  `;
}

export async function sendReservationConfirmation(data: ReservationConfirmationData) {
  const content = `
    <h2 style="font-weight: 300;">Reserva confirmada</h2>
    <p>Estimado/a ${data.firstName} ${data.lastName},</p>
    <p>Nos complace confirmar su reserva en ${RESTAURANT_NAME}.</p>
    
    <div class="details">
      <div class="details-row">
        <span class="label">Fecha</span>
        <span class="value">${data.reservationDate}</span>
      </div>
      <div class="details-row">
        <span class="label">Hora</span>
        <span class="value">${data.reservationTime}</span>
      </div>
      <div class="details-row">
        <span class="label">Comensales</span>
        <span class="value">${data.numberOfPeople} personas</span>
      </div>
      <div class="details-row">
        <span class="label">Señal pagada</span>
        <span class="value">${data.depositAmount.toFixed(2)}€</span>
      </div>
    </div>

    <p>Le esperamos con ilusión para ofrecerle una experiencia gastronómica inolvidable.</p>
    <p><strong>Política de cancelación:</strong> Para cancelaciones con más de 72 horas de antelación, reembolsaremos el 100% de la señal. Para cancelaciones con menos de 48 horas, la señal no será reembolsable.</p>
    
    <p style="text-align: center;">
      <a href="${APP_URL}/reservas/${data.reservationId}" class="button">Ver detalles</a>
    </p>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Confirmación de reserva — ${RESTAURANT_NAME}`,
    html: getEmailTemplate(content),
  });
}

export async function sendGiftCard(data: GiftCardData) {
  const content = `
    <h2 style="font-weight: 300;">Has recibido un bono regalo</h2>
    <p>Estimado/a ${data.recipientName || 'amigo/a'},</p>
    <p>${data.purchaserName} te ha regalado una experiencia en ${RESTAURANT_NAME}.</p>
    
    ${data.message ? `<p style="font-style: italic; padding: 20px; background: #f5f5f5;">"${data.message}"</p>` : ''}
    
    <div class="details">
      <div class="details-row">
        <span class="label">Importe</span>
        <span class="value">${data.amount.toFixed(2)}€</span>
      </div>
      <div class="details-row">
        <span class="label">Código</span>
        <span class="value" style="font-weight: 600; letter-spacing: 2px;">${data.code}</span>
      </div>
      <div class="details-row">
        <span class="label">Válido hasta</span>
        <span class="value">${data.expiresAt}</span>
      </div>
    </div>

    <p>Para utilizar este bono, simplemente realiza una reserva e introduce el código durante el proceso.</p>
    
    <p style="text-align: center;">
      <a href="${APP_URL}/reservas" class="button">Reservar ahora</a>
    </p>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.recipientEmail,
    subject: `Bono regalo para ${RESTAURANT_NAME}`,
    html: getEmailTemplate(content),
  });
}

export async function sendCancellationConfirmation(data: CancellationData) {
  const content = `
    <h2 style="font-weight: 300;">Cancelación de reserva</h2>
    <p>Estimado/a ${data.firstName} ${data.lastName},</p>
    <p>Hemos procesado la cancelación de su reserva.</p>
    
    <div class="details">
      <div class="details-row">
        <span class="label">Fecha de la reserva</span>
        <span class="value">${data.reservationDate}</span>
      </div>
      <div class="details-row">
        <span class="label">Hora</span>
        <span class="value">${data.reservationTime}</span>
      </div>
      ${data.refundAmount ? `
      <div class="details-row">
        <span class="label">Reembolso</span>
        <span class="value">${data.refundAmount.toFixed(2)}€</span>
      </div>
      ` : ''}
      <div class="details-row">
        <span class="label">Estado del reembolso</span>
        <span class="value">${data.refundStatus === 'full' ? 'Reembolso completo' : data.refundStatus === 'partial' ? 'Reembolso parcial' : 'Sin reembolso'}</span>
      </div>
    </div>

    ${data.refundAmount ? `<p>El reembolso será procesado en los próximos 5-10 días laborables.</p>` : ''}
    <p>Esperamos poder recibirle en otra ocasión.</p>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Cancelación de reserva — ${RESTAURANT_NAME}`,
    html: getEmailTemplate(content),
  });
}
