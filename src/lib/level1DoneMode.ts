// Демо-режим: «1-й уровень пройден» — состояние между 1-м и 2-м уровнями.
import { useEffect, useState } from "react";

const KEY = "level1-done-mode";
const EVT = "level1-done-mode-change";

export function getLevel1DoneMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLevel1DoneMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleLevel1DoneMode() {
  setLevel1DoneMode(!getLevel1DoneMode());
}

export function useLevel1DoneMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getLevel1DoneMode());
  useEffect(() => {
    const sync = () => setOn(getLevel1DoneMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
