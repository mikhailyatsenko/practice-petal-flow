// Демо-режим: «2-й уровень пройден» — состояние между 2-м и 3-м уровнями.
import { useEffect, useState } from "react";

const KEY = "level2-done-mode";
const EVT = "level2-done-mode-change";

export function getLevel2DoneMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLevel2DoneMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleLevel2DoneMode() {
  setLevel2DoneMode(!getLevel2DoneMode());
}

export function useLevel2DoneMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getLevel2DoneMode());
  useEffect(() => {
    const sync = () => setOn(getLevel2DoneMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
