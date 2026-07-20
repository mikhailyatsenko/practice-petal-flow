// Дев-режим "Колокольчик уведомлений" — показывает иконку колокольчика в шапке.
import { useEffect, useState } from "react";
import { markNotificationsSeen, resetNotificationsSeen } from "@/lib/notificationsStore";


const KEY = "bell-mode";
const EVT = "bell-mode-change";

export function getBellMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setBellMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleBellMode() {
  setBellMode(!getBellMode());
}

export function useBellMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getBellMode());
  useEffect(() => {
    const sync = () => setOn(getBellMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
