// Демо-режим: «3-й уровень пройден» — состояние между 3-м и 4-м уровнями.
import { useEffect, useState } from "react";

const KEY = "level3-done-mode";
const EVT = "level3-done-mode-change";

export function getLevel3DoneMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLevel3DoneMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleLevel3DoneMode() {
  setLevel3DoneMode(!getLevel3DoneMode());
}

export function useLevel3DoneMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getLevel3DoneMode());
  useEffect(() => {
    const sync = () => setOn(getLevel3DoneMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
