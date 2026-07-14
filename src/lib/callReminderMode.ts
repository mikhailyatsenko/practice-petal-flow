// Демо-режим напоминания о созвоне.
// - "buddy" / "foursome": баннер "Завтра созвон ..." до подтверждения.
// - "buddy-2h": баннер с обратным отсчётом до созвона (t0 = момент включения,
//   расчётное начало = t0 + 2 часа). Автоматически выключается через 30 минут
//   после расчётного начала.

import { useEffect, useState } from "react";

export type CallReminderKind =
  | "buddy"
  | "foursome"
  | "buddy-2h"
  | "buddy-no-link"
  | "buddy-2h-no-link";

// Возвращает базовый режим (со ссылкой) для no-link режимов.
export function baseModeOf(mode: CallReminderKind | null): CallReminderKind | null {
  if (mode === "buddy-no-link") return "buddy";
  if (mode === "buddy-2h-no-link") return "buddy-2h";
  return mode;
}

export function isNoLinkMode(mode: CallReminderKind | null): boolean {
  return mode === "buddy-no-link" || mode === "buddy-2h-no-link";
}

const KEY_MODE = "call-reminder-mode";
const KEY_ACK = "call-reminder-ack";
const KEY_T0 = "call-reminder-t0";
const EVT = "call-reminder-change";

export const CALL_2H_LEAD_MS = 2 * 60 * 60 * 1000;
const CALL_2H_TAIL_MS = 30 * 60 * 1000; // сколько показываем после начала

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

function readMode(): CallReminderKind | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY_MODE);
    return v === "buddy" ||
      v === "foursome" ||
      v === "buddy-2h" ||
      v === "buddy-no-link" ||
      v === "buddy-2h-no-link"
      ? (v as CallReminderKind)
      : null;
  } catch {
    return null;
  }
}

function readT0(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY_T0);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function isTimedMode(mode: CallReminderKind | null): boolean {
  return mode === "buddy-2h" || mode === "buddy-2h-no-link";
}

export function getCallStartAt(): number | null {
  if (!isTimedMode(readMode())) return null;
  const t0 = readT0();
  return t0 == null ? null : t0 + CALL_2H_LEAD_MS;
}

export function getCallReminderMode(): CallReminderKind | null {
  const mode = readMode();
  if (!isTimedMode(mode)) return mode;
  const startAt = getCallStartAt();
  if (startAt == null) return null;
  if (Date.now() > startAt + CALL_2H_TAIL_MS) {
    // окно истекло — сбрасываем
    try {
      window.localStorage.removeItem(KEY_MODE);
      window.localStorage.removeItem(KEY_T0);
      window.localStorage.removeItem(KEY_ACK);
    } catch {
      /* noop */
    }
    return null;
  }
  return mode;
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
      if (isTimedMode(mode)) {
        window.localStorage.setItem(KEY_T0, String(Date.now()));
      } else {
        window.localStorage.removeItem(KEY_T0);
      }
    } else {
      window.localStorage.removeItem(KEY_MODE);
      window.localStorage.removeItem(KEY_ACK);
      window.localStorage.removeItem(KEY_T0);
    }
  } catch {
    /* noop */
  }
  emit();
}

export function toggleCallReminderMode(mode: CallReminderKind) {
  const cur = readMode();
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

export function useCallReminder(): {
  mode: CallReminderKind | null;
  ack: boolean;
  startAt: number | null;
  now: number;
} {
  const [state, setState] = useState(() => ({
    mode: null as CallReminderKind | null,
    ack: false,
    startAt: null as number | null,
    now: 0,
  }));
  useEffect(() => {
    const sync = () =>
      setState({
        mode: getCallReminderMode(),
        ack: getCallReminderAck(),
        startAt: getCallStartAt(),
        now: Date.now(),
      });
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    // тикаем для обратного отсчёта
    const id = window.setInterval(sync, 1000);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
      window.clearInterval(id);
    };
  }, []);
  return state;
}

// Форматирование остатка времени по ТЗ.
export function formatCallCountdown(remainingMs: number): {
  short: string; // для баннера справа от заголовка
  bannerTitle: string;
  pageTitle: string;
  pageValue: string;
  ctaLabel: string;
  started: boolean;
} {
  const totalMin = Math.max(0, Math.round(remainingMs / 60000));
  const started = remainingMs <= 0;

  if (started) {
    return {
      short: "Созвон начался",
      bannerTitle: "Созвон с Бадди начался",
      pageTitle: "Созвон с Бадди начался",
      pageValue: "Сейчас",
      ctaLabel: "Войти в комнату созвона",
      started: true,
    };
  }

  if (totalMin < 10) {
    const label = `Созвон начнётся через ${totalMin} мин`;
    return {
      short: label,
      bannerTitle: label,
      pageTitle: "Сегодня созвон с Бадди",
      pageValue: `Начнётся через ${totalMin} мин`,
      ctaLabel: "Перейти в комнату созвона",
      started: false,
    };
  }

  if (totalMin < 60) {
    return {
      short: `До созвона ${totalMin} мин`,
      bannerTitle: `До созвона ${totalMin} мин`,
      pageTitle: "Сегодня созвон с Бадди",
      pageValue: `До начала: ${totalMin} мин`,
      ctaLabel: "Перейти в комнату созвона",
      started: false,
    };
  }

  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const hm = `${h} ч ${m} мин`;
  return {
    short: `До созвона с Бадди — ${hm}`,
    bannerTitle: `До созвона с Бадди — ${hm}`,
    pageTitle: "Сегодня созвон с Бадди",
    pageValue: `До начала: ${hm}`,
    ctaLabel: "Перейти в комнату созвона",
    started: false,
  };
}

// HH:MM:SS для крупного таймера на странице.
export function formatHMS(remainingMs: number): string {
  const s = Math.max(0, Math.floor(remainingMs / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
