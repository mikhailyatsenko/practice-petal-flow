import { Check, AlertTriangle, ChevronRight } from "lucide-react";
import { ProgressDots, type DotState } from "./ProgressDots";

export type PracticeState = "available" | "done" | "danger";

export interface Practice {
  id: string;
  title: string;             // "Самопрограммирование"
  emoji: string;             // ⚡
  reward: number;            // +1
  levelNumber: number;       // 4
  levelName: string;         // "Программист сознания 🧠"
  daysInLevel: number;       // 18
  daysToNextLevel: number;   // 30
  state: PracticeState;
  history: DotState[];       // последние 7 дней
  accent: string;            // CSS color string for icon bg
}

interface PracticeCardProps {
  practice: Practice;
  onComplete: (id: string, ev: React.MouseEvent<HTMLButtonElement>) => void;
  onOpen?: (id: string) => void;
}

export function PracticeCard({ practice, onComplete, onOpen }: PracticeCardProps) {
  const {
    id, title, emoji, reward, levelNumber, levelName,
    daysInLevel, daysToNextLevel, state, history, accent,
  } = practice;

  const disabled = state === "done";
  const levelPct = Math.min(100, Math.round((daysInLevel / daysToNextLevel) * 100));

  return (
    <article
      className={
        "tap relative rounded-2xl bg-card p-3.5 shadow-soft animate-fade-up " +
        (state === "done" ? "opacity-75" : "")
      }
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: `color-mix(in oklab, ${accent} 14%, transparent)` }}
        >
          {emoji}
        </div>

        <button
          onClick={() => onOpen?.(id)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-1.5">
            <h3 className={"truncate text-[15px] font-semibold " + (state === "done" ? "line-through" : "")}>
              {title}
            </h3>
            {state === "danger" && <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" />}
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {levelNumber}️⃣ {levelName}
          </p>
        </button>

        <button
          onClick={(e) => !disabled && onComplete(id, e)}
          disabled={disabled}
          aria-label={state === "done" ? "Сделано" : "Отметить выполнение"}
          className={
            "tap flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all " +
            (state === "done"
              ? "bg-primary text-white"
              : "text-white shadow-glow-primary")
          }
          style={
            state !== "done"
              ? { background: state === "danger" ? "var(--gradient-accent)" : "var(--gradient-primary)" }
              : undefined
          }
        >
          <Check className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>

      {/* Bottom row: streak dots + level progress + reward */}
      <div className="mt-3 flex items-center gap-3">
        <ProgressDots states={history} />
        <div className="flex-1 min-w-0">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${levelPct}%`,
                background: state === "danger" ? "var(--gradient-accent)" : "var(--gradient-primary)",
              }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10.5px] text-muted-foreground tabular-nums">
            <span>{daysInLevel}/{daysToNextLevel} дней</span>
            <span>+{reward}⭐</span>
          </div>
        </div>
      </div>
    </article>
  );
}
