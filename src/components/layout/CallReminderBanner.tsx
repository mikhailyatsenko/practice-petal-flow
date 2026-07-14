import { useNavigate } from "@tanstack/react-router";
import {
  useCallReminder,
  formatHMS,
  isNoLinkMode,
} from "@/lib/callReminderMode";

// Иконка двух человек (Бадди) — лёгкое синхронное подпрыгивание на месте
function BuddyIcon({ tone = "white" }: { tone?: "white" | "orange" }) {
  const color = tone === "white" ? "#fff" : "#FF6D00";
  return (
    <svg viewBox="0 0 40 32" width="28" height="24" fill="none">
      <g style={{ transformOrigin: "13px 16px", animation: "buddy-icon-bounce 1.8s ease-in-out infinite" }}>
        <circle cx="13" cy="9" r="5" fill={color} />
        <path d="M4 28c0-5 4-9 9-9s9 4 9 9v2H4v-2z" fill={color} />
      </g>
      <g style={{ transformOrigin: "27px 16px", animation: "buddy-icon-bounce 1.8s ease-in-out infinite" }}>
        <circle cx="27" cy="9" r="5" fill={color} />
        <path d="M18 28c0-5 4-9 9-9s9 4 9 9v2H18v-2z" fill={color} />
      </g>
    </svg>
  );
}

// Иконка четырёх человек (Четвёрка) — с волновой пульсацией по очереди
function FoursomeIcon({ tone = "white" }: { tone?: "white" | "orange" }) {
  const color = tone === "white" ? "#fff" : "#FF6D00";
  const positions = [7, 17, 27, 37];
  return (
    <svg viewBox="0 0 44 32" width="32" height="24" fill="none">
      {positions.map((cx, i) => (
        <g
          key={cx}
          style={{
            transformOrigin: `${cx}px 16px`,
            animation: `foursome-icon-pulse 1.6s ease-in-out ${i * 0.15}s infinite`,
          }}
        >
          <circle cx={cx} cy="10" r="3.2" fill={color} />
          <path d={`M${cx - 5} 28c0-3 2.2-5.4 5-5.4s5 2.4 5 5.4v2h-10v-2z`} fill={color} />
        </g>
      ))}
    </svg>
  );
}

const iconKeyframes = `
  @keyframes buddy-icon-bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-2.5px) scale(1.05); }
  }
  @keyframes foursome-icon-pulse {
    0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
    50% { transform: translateY(-2px) scale(1.08); opacity: 0.9; }
  }
  @keyframes call-banner-pulse {
    0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(255,109,0,0.45); }
    50% { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(255,109,0,0.6); }
  }
  @keyframes call-banner-shine {
    0% { transform: translateX(0); }
    100% { transform: translateX(500%); }
  }
  @keyframes call-open-btn-shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
`;

export function CallReminderBanner() {
  const navigate = useNavigate();
  const { mode, ack, startAt, now } = useCallReminder();
  if (!mode) return null;

  const noLink = isNoLinkMode(mode);
  const isFoursome = mode === "foursome";
  const is2h = mode === "buddy-2h" || mode === "buddy-2h-no-link";
  const isBuddyTomorrow = mode === "buddy" || mode === "buddy-no-link";

  // «завтра»-режимы скрываются после подтверждения (если ссылка есть)
  if (isBuddyTomorrow && ack && !noLink) return null;

  const ctaLabel = noLink ? "Создать ссылку" : "Открыть";
  const handleClick = () => {
    if (noLink) navigate({ to: "/telemost-link" });
    else if (isFoursome) navigate({ to: "/foursome" });
    else navigate({ to: "/buddy", search: { demo: "has" } });
  };

  const wrapper = (children: React.ReactNode) => (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[61] w-full max-w-md px-3 pb-2 block"
      style={{
        top: "var(--call-reminder-top, 0px)",
        paddingTop: "var(--call-reminder-pt, max(env(safe-area-inset-top), 8px))",
      }}
      role="status"
    >
      {children}
      <style>{iconKeyframes}</style>
    </div>
  );

  // ===== Вариант 1: за 2 часа — спокойная белая карточка =====
  if (is2h) {
    const remaining = startAt != null ? startAt - now : 0;
    const started = remaining <= 0;
    const title = started
      ? "Созвон с Бадди начался"
      : `До созвона с Бадди — ${formatHMS(remaining)}`;

    return wrapper(
      <button
        type="button"
        onClick={handleClick}
        className="tap relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 w-full text-left bg-white"
        style={{ boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)" }}
        aria-label={title}
      >
        <span className="relative h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,109,0,0.10)" }}
        >
          <BuddyIcon tone="orange" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight text-slate-900 tabular-nums">
            {title}
          </p>
          <p className="text-[12px] leading-tight mt-0.5 text-slate-500">
            {noLink ? "Ссылка на комнату ещё не создана" : "Подключайся вовремя"}
          </p>
        </div>
        <span
          className="relative overflow-hidden rounded-full px-3 py-1.5 text-[12px] font-bold text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
              animation: "call-open-btn-shine 2.4s linear infinite",
            }}
          />
          <span className="relative">{ctaLabel}</span>
        </span>
      </button>,
    );
  }

  // ===== Вариант 2: за сутки — оранжевая плашка =====
  const title = isFoursome
    ? "Завтра созвон с Четвёркой!"
    : "Завтра созвон с Бадди!";
  const subtitle = noLink
    ? "Ссылка на комнату ещё не создана"
    : "Подготовься и приходи вовремя";

  return wrapper(
    <button
      type="button"
      onClick={handleClick}
      className="tap relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 w-full text-left text-white shadow-[0_10px_30px_rgba(255,109,0,0.45)]"
      style={{
        background: "linear-gradient(135deg, #FFB300, #FF6D00)",
        animation: "call-banner-pulse 1.6s ease-in-out infinite",
      }}
      aria-label={title}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
          animation: "call-banner-shine 2.2s linear infinite",
        }}
      />
      <span className="relative h-10 w-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
        {isFoursome ? <FoursomeIcon /> : <BuddyIcon />}
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="text-[14px] font-bold leading-tight">{title}</p>
        <p className="text-[12px] opacity-95 leading-tight mt-0.5">{subtitle}</p>
      </div>
      <span className="relative text-[12px] font-bold bg-white/25 rounded-full px-2.5 py-1 shrink-0">
        {ctaLabel} →
      </span>
    </button>,
  );
}
