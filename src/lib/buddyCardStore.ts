// Простое хранилище данных карточки Бадди (демо, localStorage)
import { useEffect, useState } from "react";

export interface BuddyCard {
  goal: string;          // Главная цель на 1–2 года
  spheres: [string, string, string]; // 3 сферы жизни
  strengths: string;     // Сильные стороны
  blockers: string;      // Что мешает достигать успеха
  support: string;       // В чём нужна моя поддержка
}

export const EMPTY_BUDDY_CARD: BuddyCard = {
  goal: "",
  spheres: ["", "", ""],
  strengths: "",
  blockers: "",
  support: "",
};

const KEY = "buddy-card";
const EVT = "buddy-card-change";

export function getBuddyCard(): BuddyCard {
  if (typeof window === "undefined") return EMPTY_BUDDY_CARD;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_BUDDY_CARD;
    const parsed = JSON.parse(raw);
    return {
      goal: parsed.goal ?? "",
      spheres: [parsed.spheres?.[0] ?? "", parsed.spheres?.[1] ?? "", parsed.spheres?.[2] ?? ""],
      strengths: parsed.strengths ?? "",
      blockers: parsed.blockers ?? "",
      support: parsed.support ?? "",
    };
  } catch {
    return EMPTY_BUDDY_CARD;
  }
}

export function setBuddyCard(card: BuddyCard) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(card));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function isBuddyCardFilled(card: BuddyCard): boolean {
  return (
    card.goal.trim() !== "" &&
    card.spheres.every((s) => s.trim() !== "") &&
    card.strengths.trim() !== "" &&
    card.blockers.trim() !== "" &&
    card.support.trim() !== ""
  );
}

export function buddyCardProgress(card: BuddyCard): number {
  const fields = [card.goal, ...card.spheres, card.strengths, card.blockers, card.support];
  const filled = fields.filter((f) => f.trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

export function useBuddyCard(): BuddyCard {
  const [card, setCard] = useState<BuddyCard>(EMPTY_BUDDY_CARD);
  useEffect(() => {
    setCard(getBuddyCard());
    const sync = () => setCard(getBuddyCard());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return card;
}
