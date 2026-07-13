// Демо-режим: "завтра созвон" — баннер на всех страницах.
// Включается из бургер-меню. Пропадает, если пользователь подтвердил
// или если режим выключили.

import { useEffect, useState } from "react";

export type CallReminderKind = "buddy" | "foursome";

const KEY_MODE = "call-reminder-mode"; // "buddy" | "foursome" | ""
const KEY_ACK = "call-reminder-ack"; // "1" когда подтвердил
const EVT = "call-reminder-change";

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

export function getCallReminderMode(): CallReminderKind | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY_MODE);
    return v === "buddy" || v === "foursome" ? v : null;
  } catch {
    return null;
  }
}

export function getCallReminderAck(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY_ACK) === "1";
  } catch {
    return false;
  }
}

export function setCallReminderMode(mode: CallReminderKind | null) {
  if (typeof window === "undefined") return;
  try {
    if (mode) {
      window.localStorage.setItem(KEY_MODE, mode);
      window.localStorage.removeItem(KEY_ACK);
    } else {
      window.localStorage.removeItem(KEY_MODE);
      window.localStorage.removeItem(KEY_ACK);
    }
  } catch {
    /* noop */
  }
  emit();
}

export function toggleCallReminderMode(mode: CallReminderKind) {
  const cur = getCallReminderMode();
  setCallReminderMode(cur === mode ? null : mode);
}

export function ackCallReminder() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_ACK, "1");
  } catch {
    /* noop */
  }
  emit();
}

export function useCallReminder(): { mode: CallReminderKind | null; ack: boolean } {
  const [state, setState] = useState(() => ({
    mode: getCallReminderMode(),
    ack: getCallReminderAck(),
  }));
  useEffect(() => {
    const sync = () =>
      setState({ mode: getCallReminderMode(), ack: getCallReminderAck() });
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}
