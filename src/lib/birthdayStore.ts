const KEY = "app.birthday";

export interface Birthday {
  day: number;
  month: number; // 1-12
  year: number;
}

export function setBirthday(b: Birthday) {
  try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {}
}

export function getBirthday(): Birthday | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Birthday;
  } catch {
    return null;
  }
}

export const MONTHS_RU = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];

export function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}
