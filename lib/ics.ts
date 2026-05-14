/**
 * Generador de archivos .ics (iCalendar) para adjuntar en emails de confirmación.
 * Compatible con Apple Calendar, Google Calendar, Outlook y cualquier cliente estándar.
 */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Formatea una fecha como YYYYMMDDTHHMMSS (hora local) */
function formatIcsDate(date: Date): string {
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    "00"
  );
}

/** Escapa caracteres especiales en campos ICS */
function escIcs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export interface IcsEventOptions {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes?: number;
}

/**
 * Genera el contenido de un archivo .ics con el evento de la reserva.
 * Se puede adjuntar en emails o descargar directamente.
 */
export function generateIcs(opts: IcsEventOptions): string {
  const start = new Date(opts.startDate);
  const end = new Date(start.getTime() + (opts.durationMinutes ?? 120) * 60000);

  const now = new Date();
  const dtStamp = formatIcsDate(now);
  const dtStart = formatIcsDate(start);
  const dtEnd = formatIcsDate(end);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gunnen//Reserva//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escIcs(opts.summary)}`,
    `DESCRIPTION:${escIcs(opts.description)}`,
    `LOCATION:${escIcs(opts.location)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT3D",       // Recordatorio 3 días antes
    "ACTION:DISPLAY",
    `DESCRIPTION:Recordatorio: ${escIcs(opts.summary)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",       // Recordatorio 2 horas antes
    "ACTION:DISPLAY",
    `DESCRIPTION:Su reserva en Gunnen es en 2 horas`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Genera el enlace de Google Calendar para añadir el evento con un clic.
 */
export function googleCalendarLink(opts: IcsEventOptions): string {
  const start = new Date(opts.startDate);
  const end = new Date(start.getTime() + (opts.durationMinutes ?? 120) * 60000);

  const fmt = (d: Date) =>
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    "00";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.summary,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: opts.description,
    location: opts.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
