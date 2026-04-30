import { Lock } from "lucide-react";
import type { PreviewLevel } from "@/lib/previewLevel";

interface LockedFeatureCardProps {
  emoji: string;
  title: string;
  unlockLevel: PreviewLevel;
  /** Тематическая подсказка под заголовком (например, «Партнёр для созвонов»). */
  hint?: string;
  /** Палитра анимации — выбирается под смысл раздела. */
  theme?: "warm" | "blue" | "violet" | "green";
}

const THEMES: Record<NonNullable<LockedFeatureCardProps["theme"]>, { from: string; to: string }> = {
  warm:   { from: "#FFB300", to: "#FF6D00" },
  blue:   { from: "#3B82F6", to: "#1D4ED8" },
  violet: { from: "#8B5CF6", to: "#5B21B6" },
  green:  { from: "#10B981", to: "#047857" },
};

export function LockedFeatureCard({
  emoji,
  title,
  unlockLevel,
  hint,
  theme = "warm",
}: LockedFeatureCardProps) {
  const { from, to } = THEMES[theme];
  const id = `lock-${title.replace(/\s+/g, "-")}`;

  return (
    <div
      className="relative w-full bg-card hairline rounded-2xl px-4 py-5 shadow-card overflow-hidden select-none"
      aria-disabled="true"
    >
      <style>{`
        @keyframes ${id}-orbit {
          from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
        }
        @keyframes ${id}-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.08); opacity: 1; }
        }
        @keyframes ${id}-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes ${id}-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ${id}-blink {
          0%, 100% { opacity: 0.25; }
          50%      { opacity: 1; }
        }
      `}</style>

      <div className="flex items-center gap-3.5">
        {/* Анимированный значок */}
        <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
          {/* Внешнее пунктирное кольцо */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px dashed ${from}`,
              opacity: 0.55,
              animation: `${id}-spin 14s linear infinite`,
            }}
          />
          {/* Внутренний градиентный диск */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              top: 14,
              left: 14,
              right: 14,
              bottom: 14,
              background: `linear-gradient(135deg, ${from}, ${to})`,
              boxShadow: `0 6px 18px ${from}55`,
              animation: `${id}-pulse 2.4s ease-in-out infinite`,
              fontSize: 26,
            }}
          >
            <span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif', filter: "grayscale(0.2)" }}>
              {emoji}
            </span>
          </div>
          {/* Орбитальный замок */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="absolute"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: `${id}-orbit 6s linear infinite`,
              }}
            >
              <Lock className="h-3 w-3" style={{ color: to }} strokeWidth={2.5} />
            </span>
          </div>
        </div>

        {/* Текст */}
        <div className="min-w-0 flex-1" style={{ animation: `${id}-float 3s ease-in-out infinite` }}>
          <h3 className="text-[15px] font-semibold leading-tight flex items-center gap-1.5">
            {title}
            <Lock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2.5} />
          </h3>
          {hint && (
            <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug">
              {hint}
            </p>
          )}
          <p
            className="mt-2 inline-block text-[11.5px] font-medium rounded-full px-2.5 py-1"
            style={{
              background: `linear-gradient(135deg, ${from}22, ${to}22)`,
              color: to,
            }}
          >
            🔒 Откроется на уровне {unlockLevel}
          </p>
        </div>
      </div>

      {/* Мигающие точки внизу */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {[0, 0.25, 0.5].map((d, i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: from,
              display: "inline-block",
              animation: `${id}-blink 1.2s ease-in-out ${d}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
