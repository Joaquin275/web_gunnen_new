/**
 * Horario semanal — persistido en Settings (Supabase).
 */

import { prisma } from "@/lib/prisma";
import {
  defaultWeeklySchedule,
  type DaySchedule,
} from "@/lib/schedule-types";

export type { DaySchedule, ScheduleSlot } from "@/lib/schedule-types";
export {
  DAY_NAMES,
  defaultWeeklySchedule,
  getDaySchedule,
  getOpenDayNumbers,
  getActiveSlotsForDay,
} from "@/lib/schedule-types";

export async function getWeeklySchedule(): Promise<DaySchedule[]> {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "weekly_schedule" },
    });

    if (!setting?.value) return defaultWeeklySchedule();

    const parsed = JSON.parse(setting.value) as DaySchedule[];
    if (!Array.isArray(parsed) || parsed.length !== 7) return defaultWeeklySchedule();
    return parsed;
  } catch {
    return defaultWeeklySchedule();
  }
}

export async function saveWeeklySchedule(schedule: DaySchedule[]): Promise<DaySchedule[]> {
  const normalized = schedule.map((day) => ({
    ...day,
    slots: day.slots
      .map((s) => ({
        ...s,
        time: s.time.trim(),
        maxPeople: Math.max(1, Math.min(4, s.maxPeople || 4)),
      }))
      .filter((s) => /^\d{2}:\d{2}$/.test(s.time))
      .sort((a, b) => a.time.localeCompare(b.time)),
  }));

  await prisma.settings.upsert({
    where: { key: "weekly_schedule" },
    update: { value: JSON.stringify(normalized) },
    create: {
      key: "weekly_schedule",
      value: JSON.stringify(normalized),
      description: "Horario semanal de franjas horarias para reservas",
    },
  });

  return normalized;
}
