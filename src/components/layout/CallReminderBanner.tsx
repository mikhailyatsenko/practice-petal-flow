import { CalendarClock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  useCallReminder,
  formatCallCountdown,
  formatHMS,
  isNoLinkMode,
} from "@/lib/callReminderMode";

export function CallReminderBanner() {
  const navigate = useNavigate();
  const { mode, ack, startAt, now } = useCallReminder();
  if (!mode) return null;

  const noLink = isNoLinkMode(mode); // режим сам заявляет, что ссылки нет

  const isFoursome = mode === "foursome";
  const is2h = mode === "buddy-2h" || mode === "buddy-2h-no-link";
  const isBuddyTomorrow = mode === "buddy" || mode === "buddy-no-link";

  // "завтра" режимы скрываются после подтверждения — но только если ссылка есть.
  if (isBuddyTomorrow && ack && !noLink) return null;

  let title: string;
  let subtitle: string;

  if (is2h && startAt != null) {
    const remaining = startAt - now;
    const f = formatCallCountdown(remaining);
    title = f.started
      ? "Созвон с Бадди начался"
      : `До созвона с Бадди — ${formatHMS(remaining)}`;
    subtitle = noLink
      ? "Ссылка на комнату ещё не создана"
      : "Подключайся к комнате созвона вовремя";
  } else if (isBuddyTomorrow) {
    title = "Завтра созвон с Бадди";
    subtitle = noLink
      ? "Ссылка на комнату ещё не создана"
      : "Подготовься и приходи вовремя";
  } else {
    title = "Завтра созвон с Четвёркой!";
    subtitle = "Подготовься и приходи вовремя";
  }

  const ctaLabel = noLink ? "Создать ссылку" : "Открыть";

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[61] w-full max-w-md px-3 pb-2 block"
      style={{
        top: "var(--call-reminder-top, 0px)",
        paddingTop: "var(--call-reminder-pt, max(env(safe-area-inset-top), 8px))",
      }}
      role="status"
    >
      <button
        type="button"
        onClick={() => {
          if (noLink) navigate({ to: "/telemost-link" });
          else if (isFoursome) navigate({ to: "/foursome" });
          else navigate({ to: "/buddy", search: { demo: "has" } });
        }}
        className="tap relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 w-full text-left shadow-card"
        style={{
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          boxShadow: "0 6px 20px rgba(34, 197, 94, 0.35)",
        }}
      >
        {/* Global shimmer across the whole banner */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 38%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0.12) 62%, rgba(255,255,255,0) 100%)",
            transform: "translateX(-100%) skewX(-12deg)",
            animation: "green-shimmer 4.5s ease-in-out infinite",
          }}
        />

        <span className="relative h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white z-10"
          style={{ background: "rgba(255,255,255,0.18)" }}
        >
          <CalendarClock className="h-5 w-5" />
        </span>
        <div className="relative min-w-0 flex-1 z-10">
          <p className="text-[14px] font-bold leading-tight text-white drop-shadow-sm">
            {title}
          </p>
          <p className="text-[12px] leading-tight mt-0.5 text-white/90">
            {subtitle}
          </p>
        </div>
        <span
          className="relative overflow-hidden rounded-full px-3 py-1.5 text-[12px] font-bold text-white shrink-0 z-10"
          style={{
            background: "rgba(21, 128, 61, 0.72)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.12)",
            backdropFilter: "blur(2px)",
          }}
        >
          {ctaLabel}
        </span>
      </button>

      <style>{`
        @keyframes green-shimmer {
          0% { transform: translateX(-100%); }
          45% { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
