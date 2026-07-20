// Дата и время предварительного созвона Четвёрки (демо).
// Общее хранилище для всех участников — localStorage.
import { useEffect, useState } from "react";

export interface FoursomePrelimCall {
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:MM (МСК)
}

const KEY = "foursome-prelim-call";
const EVT = "foursome-prelim-call-change";

const EMPTY: FoursomePrelimCall = { date: null, time: null };

export function getFoursomePrelimCall(): FoursomePrelimCall {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw);
    return {
      date: typeof p.date === "string" ? p.date : null,
      time: typeof p.time === "string" ? p.time : null,
    };
  } catch {
    return EMPTY;
  }
}

export function setFoursomePrelimCall(v: FoursomePrelimCall) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function clearFoursomePrelimCall() {
  setFoursomePrelimCall(EMPTY);
}

export function useFoursomePrelimCall(): FoursomePrelimCall {
  const [v, setV] = useState<FoursomePrelimCall>(EMPTY);
  useEffect(() => {
    const sync = () => setV(getFoursomePrelimCall());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    sync();
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return v;
}

const DAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export function formatPrelimCall(v: FoursomePrelimCall): string | null {
  if (!v.date || !v.time) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.date);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (isNaN(d.getTime())) return null;
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]} · ${v.time} МСК`;
}
