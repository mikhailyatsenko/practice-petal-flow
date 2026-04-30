// Простой стор для глобального "режима запроса четвёрки"
// Когда включён — сверху на всех страницах висит фиолетовая лента, ведёт на /foursome?demo=waiting

import { useEffect, useState } from "react";

const KEY = "foursome-request-mode";
const EVT = "foursome-request-mode-change";

export function getFoursomeRequestMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setFoursomeRequestMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleFoursomeRequestMode() {
  setFoursomeRequestMode(!getFoursomeRequestMode());
}

export function useFoursomeRequestMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getFoursomeRequestMode());
  useEffect(() => {
    const sync = () => setOn(getFoursomeRequestMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
