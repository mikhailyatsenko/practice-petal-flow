// Дев-режим «Три уведомления»: одновременно включает три существующих
// баннера (созвон завтра с Бадди, «Бадди найден», «3-й уровень пройден»)
// чтобы проверить, что стек баннеров корректно раскладывается.
import { useEffect, useState } from "react";
import { setBuddyFoundMode } from "./buddyFoundMode";
import { setLevel3DoneMode } from "./level3DoneMode";
import { setCallReminderMode } from "./callReminderMode";

const KEY = "triple-banner-mode";
const EVT = "triple-banner-mode-change";

export function getTripleBannerMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setTripleBannerMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  if (on) {
    setCallReminderMode("buddy");
    setBuddyFoundMode(true);
    setLevel3DoneMode(true);
  } else {
    setCallReminderMode(null);
    setBuddyFoundMode(false);
    setLevel3DoneMode(false);
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function toggleTripleBannerMode() {
  setTripleBannerMode(!getTripleBannerMode());
}

export function useTripleBannerMode(): boolean {
  const [on, setOn] = useState<boolean>(() => getTripleBannerMode());
  useEffect(() => {
    const sync = () => setOn(getTripleBannerMode());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
