// Конвертация HH:MM по МСК → HH:MM в пользовательском часовом поясе.
// МСК = Europe/Moscow (UTC+3, без DST).

export function mskToLocal(hhmm: string, tz: string): string | null {
  if (!hhmm || !tz) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  // Fixed reference date (без учёта DST по МСК — Москва без DST)
  const utc = new Date(Date.UTC(2025, 5, 15, h - 3, min));
  try {
    const local = new Intl.DateTimeFormat("ru-RU", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(utc);
    return local;
  } catch {
    return null;
  }
}

export function isMoscowTz(tz: string): boolean {
  return tz === "Europe/Moscow";
}
