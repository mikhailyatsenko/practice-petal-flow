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

  const alignCls =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <div className={`text-[11px] text-muted-foreground leading-tight ${alignCls} ${className}`}>
      {local} по вашему времени
    </div>
  );
}
