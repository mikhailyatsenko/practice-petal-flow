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

// Демо-набор уведомлений. От новых к старым.
export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    text: "У тебя новый отклик на заявку в Бадди",
    date: "2026-07-20T09:15:00+03:00",
  },
  {
    id: "n2",
    text: "Четвёрка создана — загляни на страницу «Четвёрка»",
    date: "2026-07-19T18:40:00+03:00",
  },
  {
    id: "n3",
    text: "Напоминание: завтра созвон с Бадди в 20:00 МСК",
    date: "2026-07-17T12:00:00+03:00",
  },
  {
    id: "n4",
    text: "Ты перешёл на 4-й уровень — открыт раздел «Возможности»",
    date: "2026-07-14T10:05:00+03:00",
  },
  {
    id: "n5",
    text: "Добро пожаловать в Клуб «Моя жизнь»!",
    date: "2026-07-10T08:00:00+03:00",
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
