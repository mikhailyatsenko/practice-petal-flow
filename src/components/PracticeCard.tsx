import { Check, Lock, AlertTriangle } from "lucide-react";
import { ProgressDots, type DotState } from "./ProgressDots";

export type PracticeState = "available" | "done" | "locked" | "danger";

export interface Practice {
  id: string;
  title: string;
  emoji: string;
  reward: number;
  state: PracticeState;
  history: DotState[]; // last 7 days
}

interface PracticeCardProps {
  practice: Practice;
  onComplete: (id: string, ev: React.MouseEvent<HTMLButtonElement>) => void;
}

export function PracticeCard({ practice, onComplete }: PracticeCardProps) {
  const { id, title, emoji, reward, state, history } = practice;
  const disabled = state === "locked" || state === "done";

  return (
    <article
      className={
        "tap relative flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-soft animate-fade-up " +
        (state === "done" ? "opacity-70" : "")
      }
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{
          background:
            state === "danger"
              ? "color-mix(in oklab, var(--danger) 12%, transparent)"
              : "color-mix(in oklab, var(--primary) 12%, transparent)",
        }}
      >
        {emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className={"truncate text-[15px] font-semibold " + (state === "done" ? "line-through" : "")}>
            {title}
          </h3>
          {state === "danger" && (
            <AlertTriangle className="h-3.5 w-3.5 text-danger" />
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <ProgressDots states={history} />
          <span className="text-[11px] text-muted-foreground">+{reward}⭐</span>
        </div>
      </div>

      <button
        onClick={(e) => !disabled && onComplete(id, e)}
        disabled={disabled}
        aria-label={state === "done" ? "Сделано" : "Отметить как выполнено"}
        className={
          "tap flex h-10 w-10 items-center justify-center rounded-full transition-all " +
          (state === "done"
            ? "bg-primary text-white"
            : state === "locked"
            ? "bg-muted text-muted-foreground"
            : "text-white shadow-glow-primary")
        }
        style={
          state === "available" || state === "danger"
            ? { background: "var(--gradient-primary)" }
            : undefined
        }
      >
        {state === "done" ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : state === "locked" ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Check className="h-5 w-5" strokeWidth={3} />
        )}
      </button>
    </article>
  );
}
