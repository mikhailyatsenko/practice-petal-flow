// Хранилище анкет участников Четвёрки в localStorage.
// Ключ — userId участника, значение — заполненная анкета.

import { useEffect, useState } from "react";

export interface FoursomeProfile {
  goal12?: string;      // Главная цель на 1-2 года
  wishes?: string;      // Три желания
  strengths?: string;   // Сильные стороны
  blockers?: string;    // Что мешает достигать целей
  support?: string;     // В чём нужна поддержка
  offer?: string;       // Чем может быть полезен
  notes?: string;       // Дополнительные заметки
  filledAt?: number;
}

const KEY = "foursome-profiles";
const EVT = "foursome-profiles-change";

type Store = Record<string, FoursomeProfile>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getFoursomeProfile(userId: string): FoursomeProfile | null {
  const p = read()[userId];
  return p ?? null;
}

export function saveFoursomeProfile(userId: string, profile: FoursomeProfile) {
  const s = read();
  s[userId] = { ...profile, filledAt: Date.now() };
  write(s);
}

export function isProfileFilled(p: FoursomeProfile | null | undefined): boolean {
  if (!p) return false;
  return Boolean(
    (p.goal12 && p.goal12.trim()) ||
      (p.wishes && p.wishes.trim()) ||
      (p.strengths && p.strengths.trim()) ||
      (p.support && p.support.trim())
  );
}

export function useFoursomeProfiles() {
  const [store, setStore] = useState<Store>({});
  useEffect(() => {
    const sync = () => setStore(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return store;
}
