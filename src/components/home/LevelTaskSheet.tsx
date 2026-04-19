import { useEffect } from "react";
import { Play } from "lucide-react";

export interface LevelTaskContent {
  videoTitle: string;
  description: string;
  duration?: string;
  caption?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  levelNumber: number;
  levelTitle: string;
  emoji: string;
  content: LevelTaskContent;
}

export function LevelTaskSheet({ open, onClose, levelNumber, levelTitle, emoji, content }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end animate-fade-in"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Уровень ${levelNumber} — ${levelTitle}`}
    >
      <div
        className="w-full flex flex-col"
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          maxHeight: "85vh",
          animation: "slide-up 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
          <h3 className="text-[16px] font-semibold text-foreground">
            <span className="mr-1.5" aria-hidden>{emoji}</span>
            Уровень {levelNumber} — {levelTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              background: "#f0ebe0",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7a6b54",
              fontSize: 14,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {/* Caption above video */}
          <div style={{ fontSize: 13, color: "#b8a888", marginBottom: 8 }}>
            Как выполнить этот уровень
          </div>

          {/* Video card */}
          <div
            style={{
              background: "linear-gradient(135deg,#2a1505,#5a2e10)",
              height: 180,
              borderRadius: 14,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#FFB300,#FF6D00)",
                width: 54,
                height: 54,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 18px rgba(255,109,0,0.45)",
              }}
            >
              <Play className="h-6 w-6 text-white fill-white ml-0.5" />
            </div>
            {content.duration && (
              <span
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                {content.duration}
              </span>
            )}
          </div>

          {/* Caption below video */}
          <div
            style={{
              fontSize: 12,
              color: "#b8a888",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Посмотри видео и следуй инструкции. Выполни все шаги чтобы перейти на следующий уровень.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
