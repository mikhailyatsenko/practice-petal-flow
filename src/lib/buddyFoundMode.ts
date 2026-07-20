// Дев-режим "Бадди найден" — глобальная лента о найденном бадди.
import { useEffect, useState } from "react";

const KEY = "buddy-found-mode";
const EVT = "buddy-found-mode-change";

export function getBuddyFoundMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setBuddyFoundMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleBuddyFoundMode() {
  setBuddyFoundMode(!getBuddyFoundMode());
}

export function useBuddyFoundMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getBuddyFoundMode());
  useEffect(() => {
    const sync = () => setOn(getBuddyFoundMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
