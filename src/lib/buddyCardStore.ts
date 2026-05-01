// Хранилище карточки Бадди — 5 вопросов
import { useEffect, useState } from "react";

const KEY = "buddy-card-v1";
const EVT = "buddy-card-change";

export interface BuddyCardData {
  goal: string;
  spheres: [string, string, string];
  strengths: string;
  obstacles: string;
  support: string;
}

const EMPTY: BuddyCardData = {
  goal: "",
  spheres: ["", "", ""],
  strengths: "",
  obstacles: "",
  support: "",
};

export function getBuddyCard(): BuddyCardData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      goal: typeof parsed.goal === "string" ? parsed.goal : "",
      spheres: Array.isArray(parsed.spheres) && parsed.spheres.length === 3
        ? [String(parsed.spheres[0] ?? ""), String(parsed.spheres[1] ?? ""), String(parsed.spheres[2] ?? "")]
        : ["", "", ""],
      strengths: typeof parsed.strengths === "string" ? parsed.strengths : "",
      obstacles: typeof parsed.obstacles === "string" ? parsed.obstacles : "",
      support: typeof parsed.support === "string" ? parsed.support : "",
    };
  } catch {
    return EMPTY;
  }
}

export function setBuddyCard(data: BuddyCardData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function isBuddyCardFilled(data: BuddyCardData): boolean {
  return (
    data.goal.trim().length > 0 &&
    data.spheres.every((s) => s.trim().length > 0) &&
    data.strengths.trim().length > 0 &&
    data.obstacles.trim().length > 0 &&
    data.support.trim().length > 0
  );
}

export function buddyCardProgress(data: BuddyCardData): number {
  // 7 полей: goal, 3 sphere, strengths, obstacles, support
  const fields = [
    data.goal,
    data.spheres[0],
    data.spheres[1],
    data.spheres[2],
    data.strengths,
    data.obstacles,
    data.support,
  ];
  const filled = fields.filter((s) => s.trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export function useBuddyCard(): BuddyCardData {
  const [data, setData] = useState<BuddyCardData>(() => getBuddyCard());
  useEffect(() => {
    const sync = () => setData(getBuddyCard());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return data;
}
