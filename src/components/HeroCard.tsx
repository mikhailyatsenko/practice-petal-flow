import { ArrowRight } from "lucide-react";

interface HeroCardProps {
  doneToday: number;     // 0..5
  totalToday: number;    // обычно 5
  todayStars: number;    // очков заработано сегодня
  multiplier: number;    // напр. 1.1
  isHit: boolean;        // 5/5
  onCta: () => void;
}

export function HeroCard({ doneToday, totalToday, todayStars, multiplier, isHit, onCta }: HeroCardProps) {
  const progress = doneToday / totalToday;
  const pct = Math.round(progress * 100);
  const remaining = totalToday - doneToday;

  const title = isHit
    ? "ХИТ дня! Все 5 практик выполнены 🔥"
    : remaining === 1
    ? "Остался один шаг до ХИТА"
    : `Ещё ${remaining} практики до ХИТА`;

  const subtitle = isHit
    ? "Бонус +1 ⭐ начислен"
    : "5 практик · 1 день · твоя жизнь";

  return (
    <section
      className="relative mx-5 mt-3 rounded-3xl p-5 text-white shadow-card overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="relative z-10">
        <p className="text-[11px] uppercase tracking-[0.12em] opacity-85">{subtitle}</p>
        <h2 className="mt-1 text-[22px] font-bold leading-tight text-balance">{title}</h2>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Сегодня" value={`${doneToday}/${totalToday}`} />
          <Stat label="Очков" value={`+${todayStars}`} />
          <Stat label="Множитель" value={`×${multiplier.toFixed(1)}`} />
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] opacity-90">
            <span>Прогресс дня</span>
            <span className="tabular-nums font-semibold">{pct}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width,background] duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: isHit
                  ? "linear-gradient(90deg, white, oklch(0.85 0.18 70))"
                  : progress >= 0.66
                  ? "linear-gradient(90deg, white, oklch(0.9 0.15 70))"
                  : "white",
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onCta}
          className="tap relative mt-5 w-full overflow-hidden rounded-2xl bg-white px-5 py-3.5 font-semibold shadow-soft"
          style={{ color: "var(--primary-dark)" }}
        >
          <span className="relative z-10 inline-flex items-center justify-center gap-2">
            {isHit ? "Открыть кабинет" : "К следующей практике"} <ArrowRight className="h-4 w-4" />
          </span>
          <span className="shine-overlay" />
        </button>
      </div>

      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-[16px] font-bold tabular-nums">{value}</div>
    </div>
  );
}
