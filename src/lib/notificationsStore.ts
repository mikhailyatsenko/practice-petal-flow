// Демо-хранилище уведомлений. Список — статичный, "непрочитанность" считаем
// по времени последнего просмотра страницы истории уведомлений.
import { useEffect, useState } from "react";

const SEEN_KEY = "notifications-last-seen";
const EVT = "notifications-change";

export interface NotificationItem {
  id: string;
  text: string;
  /** ISO date string */
  date: string;
}

// Полный демо-набор уведомлений по Типам 1–4. От новых к старым.
// Типы 5, 6, 7 (микро-toast, встроенные CTA, служебные баннеры) в историю не попадают.
export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  // Тип 1 — созвоны и запросы с дедлайном
  {
    id: "n-call-buddy-tomorrow",
    text: "Завтра созвон с Бадди — не забудь подготовиться",
    date: "2026-07-20T09:30:00+03:00",
  },
  {
    id: "n-call-buddy-link-missing",
    text: "Напоминание: ссылка на созвон с Бадди ещё не создана",
    date: "2026-07-20T08:15:00+03:00",
  },
  {
    id: "n-call-foursome-tomorrow",
    text: "Завтра созвон с Четвёркой — не забудь подготовиться",
    date: "2026-07-19T20:00:00+03:00",
  },
  {
    id: "n-call-foursome-link-missing",
    text: "Напоминание: ссылка на созвон с Четвёркой ещё не создана",
    date: "2026-07-19T18:40:00+03:00",
  },
  {
    id: "n-req-buddy-incoming",
    text: "У тебя новый запрос на Бадди — ответь в течение 24 часов",
    date: "2026-07-19T14:20:00+03:00",
  },
  {
    id: "n-req-foursome-incoming",
    text: "У тебя новый запрос на Четвёрку — ответь в течение 24 часов",
    date: "2026-07-18T19:05:00+03:00",
  },

  // Тип 2 — разовые радостные
  {
    id: "n-buddy-found",
    text: "Бадди найден! Твой Бадди — Анна",
    date: "2026-07-17T12:00:00+03:00",
  },
  {
    id: "n-foursome-created",
    text: "Четвёрка создана — ваша пара нашла вторую пару",
    date: "2026-07-16T15:30:00+03:00",
  },

  // Тип 3 — личный прогресс
  {
    id: "n-level-1-done",
    text: "Ты прошёл 1-й уровень!",
    date: "2026-07-15T10:00:00+03:00",
  },
  {
    id: "n-level-2-done",
    text: "Ты прошёл 2-й уровень!",
    date: "2026-07-14T11:20:00+03:00",
  },
  {
    id: "n-level-3-done",
    text: "Ты прошёл 3-й уровень!",
    date: "2026-07-13T16:45:00+03:00",
  },
  {
    id: "n-level-4-done",
    text: "Ты прошёл 4-й уровень!",
    date: "2026-07-12T09:10:00+03:00",
  },
  {
    id: "n-level-5-soon",
    text: "5-й уровень скоро откроется",
    date: "2026-07-11T18:00:00+03:00",
  },
  {
    id: "n-level-4-gift",
    text: "Тебе доступен подарок за переход на 4-й уровень — 50 бонусных очков",
    date: "2026-07-11T09:00:00+03:00",
  },

  // Тип 4 — нейтральные/неприятные исходы
  {
    id: "n-buddy-req-expired",
    text: "Заявка на Бадди аннулирована — за 24 часа никто не откликнулся",
    date: "2026-07-09T21:00:00+03:00",
  },
  {
    id: "n-buddy-req-declined",
    text: "Твой запрос на Бадди отклонили",
    date: "2026-07-08T13:25:00+03:00",
  },
  {
    id: "n-foursome-req-expired",
    text: "Заявка на Четвёрку аннулирована — за 24 часа не набралось согласия всех участников",
    date: "2026-07-07T22:10:00+03:00",
  },
  {
    id: "n-foursome-req-declined",
    text: "Твой запрос на Четвёрку отклонили",
    date: "2026-07-06T12:00:00+03:00",
  },
];

function getLastSeen(): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = window.localStorage.getItem(SEEN_KEY);
    return v ? Number(v) || 0 : 0;
  } catch {
    return 0;
  }
}

export function markNotificationsSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

/** Сбрасывает "последний просмотр", чтобы все уведомления снова считались новыми. */
export function resetNotificationsSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SEEN_KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useUnreadCount(): number {
  const [count, setCount] = useState<number>(() => computeUnread(getLastSeen()));
  useEffect(() => {
    const sync = () => setCount(computeUnread(getLastSeen()));
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return count;
}

export function useNotifications(): { items: NotificationItem[]; lastSeen: number } {
  const [lastSeen, setLastSeen] = useState<number>(() => getLastSeen());
  useEffect(() => {
    const sync = () => setLastSeen(getLastSeen());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { items: DEMO_NOTIFICATIONS, lastSeen };
}

function computeUnread(lastSeen: number): number {
  return DEMO_NOTIFICATIONS.filter((n) => new Date(n.date).getTime() > lastSeen).length;
}

export function formatNotificationDate(iso: string): string {
  const d = new Date(iso);
  const months = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month}, ${hh}:${mm}`;
}
