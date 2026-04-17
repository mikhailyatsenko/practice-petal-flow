import { ArrowRight, Check } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface HeroCardProps {
  title: string;
  subtitle: string;
  progress: number; // 0..1
  checklist: ChecklistItem[];
  ctaLabel: string;
  onCta: () => void;
  onToggle: (id: string) => void;
}

export function HeroCard({ title, subtitle, progress, checklist, ctaLabel, onCta, onToggle }: HeroCardProps) {
  const pct = Math.round(progress * 100);
  const near = progress >= 0.66;

  return (
    <section
      className="relative mx-5 mt-3 rounded-3xl p-5 text-white shadow-card overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="relative z-10">
        <p className="text-[12px] uppercase tracking-wider opacity-80">{subtitle}</p>
        <h2 className="mt-1 text-[22px] font-bold leading-tight text-balance">{title}</h2>

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
                background: near
                  ? "linear-gradient(90deg, white, oklch(0.9 0.15 70))"
                  : "white",
              }}
            />
          </div>
        </div>

        {/* Checklist */}
        <ul className="mt-4 space-y-2">
          {checklist.map((it) => (
            <li key={it.id}>
              <button
                onClick={() => onToggle(it.id)}
                className="tap w-full flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5 text-left hover:bg-white/15"
              >
                <span
                  className={
                    "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors " +
                    (it.done ? "bg-white border-white" : "border-white/60")
                  }
                >
                  {it.done && (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary-dark)" }}>
                      <path className="check-path" d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  )}
                </span>
                <span className={"text-[14px] " + (it.done ? "line-through opacity-60" : "")}>
                  {it.label}
                </span>
                {it.done && <Check className="ml-auto h-4 w-4 opacity-70" />}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onCta}
          className="tap relative mt-5 w-full overflow-hidden rounded-2xl bg-white px-5 py-3.5 font-semibold text-foreground shadow-soft"
          style={{ color: "var(--primary-dark)" }}
        >
          <span className="relative z-10 inline-flex items-center justify-center gap-2">
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </span>
          <span className="shine-overlay" />
        </button>
      </div>

      {/* Decorative orb */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
    </section>
  );
}
