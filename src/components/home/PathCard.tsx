import { ArrowRight, Check, Circle } from "lucide-react";

export interface PathStep {
  id: string;
  label: string;
  done: boolean;
}

interface PathCardProps {
  level: number;
  totalLevels: number;
  title: string;
  description: string;
  steps: PathStep[];
  onOpen?: () => void;
}

export function PathCard({ level, totalLevels, title, description, steps, onOpen }: PathCardProps) {
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <article className="rounded-2xl bg-card hairline overflow-hidden shadow-card">
      {/* Orange header */}
      <div
        className="relative px-4 py-4 text-white overflow-hidden"
        style={{ background: "var(--gradient-orange)" }}
      >
        <span className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-white/15 blur-xl" />
        <span className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />

        <div className="relative">
          <span className="inline-block rounded-full bg-white/22 backdrop-blur px-2.5 py-0.5 text-[10.5px] font-medium">
            Уровень {level} из {totalLevels}
          </span>
          <h3 className="mt-2 text-[20px] font-semibold leading-tight">{title}</h3>
          <p className="mt-0.5 text-[12px] text-white/90 leading-snug">{description}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="text-success-dark font-medium tabular-nums">
            {done} из {steps.length} дней ✓
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full" style={{ background: "#f0ebe0" }}>
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%`, background: "var(--gradient-orange)" }}
          />
        </div>

        <ul className="mt-3 space-y-1.5">
          {steps.map((s) => (
            <li key={s.id} className="flex items-center gap-2.5 text-[13px]">
              {s.done ? (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-success text-white">
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </span>
              ) : (
                <Circle className="h-[18px] w-[18px] text-muted-foreground/60" strokeWidth={1.6} />
              )}
              <span className={s.done ? "line-through text-muted-foreground" : "text-foreground"}>
                {s.label}
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={onOpen}
          className="tap btn-orange mt-4 w-full px-4 py-2.5 text-[14px]"
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            Открыть практики <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </article>
  );
}
