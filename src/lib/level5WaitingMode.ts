// Демо-режим: «5-й уровень — до 1 сентября» (ожидание запуска Базы знаний с ИИ).
import { useEffect, useState } from "react";

const KEY = "level5-waiting-mode";
const EVT = "level5-waiting-mode-change";

export function getLevel5WaitingMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLevel5WaitingMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleLevel5WaitingMode() {
  setLevel5WaitingMode(!getLevel5WaitingMode());
}

export function useLevel5WaitingMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getLevel5WaitingMode());
  useEffect(() => {
    const sync = () => setOn(getLevel5WaitingMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
