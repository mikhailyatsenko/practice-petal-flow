// Демо-режим: «4-й уровень пройден» — состояние между 4-м и 5-м уровнями.
import { useEffect, useState } from "react";

const KEY = "level4-done-mode";
const EVT = "level4-done-mode-change";

export function getLevel4DoneMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLevel4DoneMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleLevel4DoneMode() {
  setLevel4DoneMode(!getLevel4DoneMode());
}

export function useLevel4DoneMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getLevel4DoneMode());
  useEffect(() => {
    const sync = () => setOn(getLevel4DoneMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
