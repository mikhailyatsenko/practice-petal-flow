// Расписание созвона с Бадди (демо). Общее хранилище для обоих участников.
import { useEffect, useState } from "react";

export interface BuddySchedule {
  day: string; // Пн..Вс
  time: string; // HH:MM
  timezone: string; // например "МСК"
}

const KEY = "buddy-schedule";
const EVT = "buddy-schedule-change";

const DEFAULT: BuddySchedule = { day: "Чт", time: "20:00", timezone: "МСК" };

export function getBuddySchedule(): BuddySchedule {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      day: typeof parsed.day === "string" ? parsed.day : DEFAULT.day,
      time: typeof parsed.time === "string" ? parsed.time : DEFAULT.time,
      timezone: typeof parsed.timezone === "string" ? parsed.timezone : DEFAULT.timezone,
    };
  } catch {
    return DEFAULT;
  }
}

export function setBuddySchedule(s: BuddySchedule) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useBuddySchedule(): BuddySchedule {
  const [s, setS] = useState<BuddySchedule>(DEFAULT);
  useEffect(() => {
    const sync = () => setS(getBuddySchedule());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    sync();
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return s;
}

export const DAYS_FULL = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
export const TIMEZONES = ["МСК", "СПБ", "ЕКБ", "НСК", "ВЛД", "KZ (Астана)", "KZ (Алматы)"];
