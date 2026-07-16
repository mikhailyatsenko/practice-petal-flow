// Демо-режим "Подарок за переход на 4-й уровень".
// Хранит:
//  - активен ли демо-режим (mode)
//  - активирован ли подарок (activated)
//  - запись о начислении для истории активаций

import { useEffect, useState } from "react";

const MODE_KEY = "level4-gift-mode";
const ACT_KEY = "level4-gift-activated";
const ACT_AT_KEY = "level4-gift-activated-at";
const EVT = "level4-gift-change";

export const LEVEL4_GIFT_CODE = "ВОЗМОЖНОСТИ";

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVT));
}

export function getGiftMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setGiftMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(MODE_KEY, "1");
    else window.localStorage.removeItem(MODE_KEY);
  } catch {
    /* noop */
  }
  emit();
}

export function toggleGiftMode() {
  setGiftMode(!getGiftMode());
}

export function isGiftActivated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ACT_KEY) === "1";
  } catch {
    return false;
  }
}

export function getGiftActivatedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACT_AT_KEY);
  } catch {
    return null;
  }
}

export function activateGift() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACT_KEY, "1");
    window.localStorage.setItem(ACT_AT_KEY, new Date().toISOString());
  } catch {
    /* noop */
  }
  emit();
}

export function resetGift() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACT_KEY);
    window.localStorage.removeItem(ACT_AT_KEY);
  } catch {
    /* noop */
  }
  emit();
}

export function useLevel4Gift() {
  const [state, setState] = useState(() => ({
    mode: getGiftMode(),
    activated: isGiftActivated(),
    activatedAt: getGiftActivatedAt(),
  }));
  useEffect(() => {
    const sync = () =>
      setState({
        mode: getGiftMode(),
        activated: isGiftActivated(),
        activatedAt: getGiftActivatedAt(),
      });
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}

// Баннер показывается, если режим включён и подарок ещё не активирован.
export function useLevel4GiftBannerVisible() {
  const { mode, activated } = useLevel4Gift();
  return mode && !activated;
}
