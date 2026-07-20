import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useRouter } from "@tanstack/react-router";
import { BackButton } from "@/components/layout/BackButton";
import { useBellMode } from "@/lib/bellMode";
import {
  useNotifications,
  markNotificationsSeen,
  formatNotificationDate,
} from "@/lib/notificationsStore";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "История уведомлений — Клуб «Моя жизнь»" },
      { name: "description", content: "Все уведомления клуба в одном списке." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const router = useRouter();
  const { items, lastSeen } = useNotifications();

  // Считаем "непрочитанные" на момент захода на экран — фиксируем один раз,
  // чтобы подсветка не пропадала прямо во время просмотра. Со следующего
  // визита эти же уведомления уже будут "прошедшими".
  const unreadIds = useMemo(() => {
    return new Set(
      items.filter((n) => new Date(n.date).getTime() > lastSeen).map((n) => n.id),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    markNotificationsSeen();
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [items],
  );

  return (
    <div className="px-4 pt-2 pb-6">
      <BackButton onClick={() => router.history.back()} />
      <h1 className="mt-2 text-[22px] font-semibold leading-tight">История уведомлений</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Новые — с оранжевой рамкой. Прошедшие — обычные.
      </p>

      <div className="mt-4 space-y-2.5">
        {sorted.map((n) => {
          const isUnread = unreadIds.has(n.id);
          return (
            <div
              key={n.id}
              className={
                "rounded-2xl px-4 py-3 " +
                (isUnread
                  ? "bg-white shadow-card border-2"
                  : "bg-muted/40 hairline")
              }
              style={
                isUnread
                  ? { borderColor: "#FF6D00", boxShadow: "0 4px 16px rgba(255,109,0,0.15)" }
                  : undefined
              }
            >
              <p
                className={
                  "text-[14px] leading-snug " +
                  (isUnread ? "text-foreground font-medium" : "text-muted-foreground")
                }
              >
                {n.text}
              </p>
              <p
                className={
                  "mt-1 text-[11.5px] " +
                  (isUnread ? "text-[#FF6D00] font-medium" : "text-muted-foreground/70")
                }
              >
                {formatNotificationDate(n.date)}
              </p>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="rounded-2xl bg-card hairline px-4 py-8 text-center text-[13px] text-muted-foreground">
            Уведомлений пока нет
          </div>
        )}
      </div>
    </div>
  );
}
