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
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold leading-none shrink-0"
        style={{
          background: "#EAF2FB",
          color: "#2F6BB8",
          border: "1px solid #cfe0f4",
        }}
      >
        <span aria-hidden>🕒</span>
        {local}
        <span className="font-semibold opacity-80">по вашему</span>
      </span>
    </div>
  );
}


