import { useTimezone } from "@/lib/timezoneStore";
import { mskToLocal, isMoscowTz } from "@/lib/mskTime";

interface Props {
  time: string; // "HH:MM" по МСК
  className?: string;
  align?: "left" | "right" | "center";
}

/**
 * Показывает время во втором часовом поясе пользователя,
 * если он отличается от Москвы. Формат: «16:00 по вашему времени».
 */
export function LocalTimeHint({ time, className = "", align = "right" }: Props) {
  const tz = useTimezone();
  const local = isMoscowTz(tz) ? time : mskToLocal(time, tz);
  if (!local) return null;

  const justifyCls =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <div className={`flex ${justifyCls} ${className}`}>
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none"
        style={{
          background: "#fff3e0",
          color: "#FF6D00",
          border: "1px solid #ffd9a8",
        }}
      >
        <span aria-hidden>🕒</span>
        {local}
        <span className="opacity-75 font-medium">по вашему</span>
      </span>
    </div>
  );
}

