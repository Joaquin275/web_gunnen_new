/** Utilidades de zona horaria Europe/Madrid para recordatorios. */

const TZ = "Europe/Madrid";

export function getMadridParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
  };
}

/** YYYY-MM-DD en hora de Madrid */
export function madridDateKey(date = new Date()): string {
  const { year, month, day } = getMadridParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addDaysToDateKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** Convierte YYYY-MM-DD a Date para consultas Prisma (@db.Date) */
export function dateKeyToUtcDate(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function reservationDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isSameDayReminderWindow(date = new Date()): boolean {
  return getMadridParts(date).hour >= 10;
}
