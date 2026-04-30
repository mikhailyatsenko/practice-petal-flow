// Простой стор для глобального "режима запроса бадди"
// Когда включён — сверху на всех страницах висит лента, которая ведёт на /buddy?demo=waiting

import { useEffect, useState } from "react";

const KEY = "buddy-request-mode";
const EVT = "buddy-request-mode-change";

export function getBuddyRequestMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setBuddyRequestMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleBuddyRequestMode() {
  setBuddyRequestMode(!getBuddyRequestMode());
}

export function useBuddyRequestMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getBuddyRequestMode());
  useEffect(() => {
    const sync = () => setOn(getBuddyRequestMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
