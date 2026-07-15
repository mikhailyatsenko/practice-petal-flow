// Хранилище «Карточек участников» Четвёрки в localStorage.
// Структура полностью совпадает с карточкой Бадди (BuddyCard).
// Ключ — userId участника.

import { useEffect, useState } from "react";
import { EMPTY_BUDDY_CARD, isBuddyCardFilled, type BuddyCard } from "@/lib/buddyCardStore";

export type FoursomeProfile = BuddyCard;

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

function normalize(p: Partial<FoursomeProfile> | undefined): FoursomeProfile {
  const src = p ?? {};
  return {
    goal: src.goal ?? "",
    spheres: [src.spheres?.[0] ?? "", src.spheres?.[1] ?? "", src.spheres?.[2] ?? ""],
    strengths: src.strengths ?? "",
    blockers: src.blockers ?? "",
    support: src.support ?? "",
  };
}

export function getFoursomeProfile(userId: string): FoursomeProfile {
  return normalize(read()[userId]);
}

export function saveFoursomeProfile(userId: string, profile: FoursomeProfile) {
  const s = read();
  s[userId] = normalize(profile);
  write(s);
}

export function isProfileFilled(p: FoursomeProfile | null | undefined): boolean {
  if (!p) return false;
  return isBuddyCardFilled(normalize(p));
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

export { EMPTY_BUDDY_CARD as EMPTY_FOURSOME_PROFILE };
