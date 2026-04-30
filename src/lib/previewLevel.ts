// Глобальный режим визуального предпросмотра уровней (1..5) или null.
// Это только демо-показ — реальные данные пользователя не меняются.

import { useEffect, useState } from "react";

export type PreviewLevel = 1 | 2 | 3 | 4 | 5;

const KEY = "preview-level";
const EVT = "preview-level-change";

export function getPreviewLevel(): PreviewLevel | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const n = Number(raw);
    if (n >= 1 && n <= 5) return n as PreviewLevel;
    return null;
  } catch {
    return null;
  }
}

export function setPreviewLevel(level: PreviewLevel | null) {
  if (typeof window === "undefined") return;
  try {
    if (level == null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, String(level));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function togglePreviewLevel(level: PreviewLevel) {
  const current = getPreviewLevel();
  setPreviewLevel(current === level ? null : level);
}

export function usePreviewLevel(): PreviewLevel | null {
  const [lvl, setLvl] = useState<PreviewLevel | null>(() => getPreviewLevel());
  useEffect(() => {
    const sync = () => setLvl(getPreviewLevel());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return lvl;
}

// Открыт ли раздел на текущем уровне предпросмотра.
// Если предпросмотр не активен — всё открыто (обычное поведение приложения).
export type Feature = "flywheel" | "buddy" | "foursome" | "library" | "sections";

const UNLOCKS: Record<PreviewLevel, Feature[]> = {
  1: [],
  2: ["flywheel", "buddy"],
  3: ["flywheel", "buddy", "foursome", "library"],
  4: ["flywheel", "buddy", "foursome", "library", "sections"],
  5: ["flywheel", "buddy", "foursome", "library", "sections"],
};

export function isFeatureUnlocked(feature: Feature, level: PreviewLevel | null): boolean {
  if (level == null) return true;
  return UNLOCKS[level].includes(feature);
}

// На каком уровне фича открывается — для подписи "Откроется на уровне N".
export function unlockLevelOf(feature: Feature): PreviewLevel {
  const order: PreviewLevel[] = [1, 2, 3, 4, 5];
  for (const lvl of order) {
    if (UNLOCKS[lvl].includes(feature)) return lvl;
  }
  return 5;
}
