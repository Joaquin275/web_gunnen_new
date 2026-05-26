export interface ScheduleSlot {
  id: string;
  time: string;
  label: string;
  isActive: boolean;
  maxPeople: number;
}

export interface DaySchedule {
  dayOfWeek: number;
  isOpen: boolean;
  slots: ScheduleSlot[];
}

export const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const LUNCH = ["13:30", "13:45", "14:00"];
const DINNER = ["20:30", "20:45", "21:00"];

function makeSlot(time: string, label: string): ScheduleSlot {
  return {
    id: `slot-${time.replace(":", "")}`,
    time,
    label,
    isActive: true,
    maxPeople: 4,
  };
}

export function defaultWeeklySchedule(): DaySchedule[] {
  return DAY_NAMES.map((_, dayOfWeek) => {
    let slots: ScheduleSlot[] = [];
    let isOpen = false;

    if (dayOfWeek === 2 || dayOfWeek === 3) {
      isOpen = true;
      slots = LUNCH.map((t) => makeSlot(t, "Comida"));
    } else if (dayOfWeek >= 4 && dayOfWeek <= 6) {
      isOpen = true;
      slots = [
        ...LUNCH.map((t) => makeSlot(t, "Comida")),
        ...DINNER.map((t) => makeSlot(t, "Cena")),
      ];
    }

    return { dayOfWeek, isOpen, slots };
  });
}

export function getDaySchedule(schedule: DaySchedule[], dayOfWeek: number): DaySchedule | undefined {
  return schedule.find((d) => d.dayOfWeek === dayOfWeek);
}

export function getOpenDayNumbers(schedule: DaySchedule[]): number[] {
  return schedule.filter((d) => d.isOpen && d.slots.some((s) => s.isActive)).map((d) => d.dayOfWeek);
}

export function getActiveSlotsForDay(schedule: DaySchedule[], dayOfWeek: number): ScheduleSlot[] {
  const day = getDaySchedule(schedule, dayOfWeek);
  if (!day?.isOpen) return [];
  return day.slots.filter((s) => s.isActive);
}
