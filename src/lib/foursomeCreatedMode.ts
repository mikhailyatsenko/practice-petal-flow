// Дев-режим "Четвёрка создана" — глобальная лента о найденной четвёрке.
import { useEffect, useState } from "react";

const KEY = "foursome-created-mode";
const EVT = "foursome-created-mode-change";

export function getFoursomeCreatedMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setFoursomeCreatedMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleFoursomeCreatedMode() {
  setFoursomeCreatedMode(!getFoursomeCreatedMode());
}

export function useFoursomeCreatedMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getFoursomeCreatedMode());
  useEffect(() => {
    const sync = () => setOn(getFoursomeCreatedMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
