import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Check, ArrowRight } from "lucide-react";

export interface LevelTaskItem {
  title: string;
  description: string;
  done?: boolean;
  active?: boolean;
  goTo?: string; // например "Комьюнити → Мой Бадди → Заполнить карточку Бадди"
}

export interface VideoChapter {
  time: string; // "0:00"
  title: string;
}

export interface LevelTaskContent {
  videoTitle: string;
  description: string;
  duration?: string;
  caption?: string;
  // Расширенный контент (опционально)
  tasks?: LevelTaskItem[];
  videoDescription?: string;
  videoChapters?: VideoChapter[];
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
  const [tab, setTab] = useState<"desc" | "video">("desc");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) setTab("desc");
  }, [open]);

  if (!open) return null;

  const tasks = content.tasks ?? [];
  const chapters = content.videoChapters ?? [];

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
        className="w-full"
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "20px 16px 24px",
          maxHeight: "88vh",
          overflowY: "auto",
          animation: "slide-up 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a0e00", lineHeight: 1.3 }}>
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
              color: "#b8a888",
              fontSize: 14,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#8a7c63", lineHeight: 1.4, marginBottom: 14 }}>
          Выполни все задания чтобы перейти на следующий уровень
        </p>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "#f5f0e6",
            borderRadius: 12,
            padding: 4,
            marginBottom: 14,
          }}
        >
          {(
            [
              { id: "desc", label: "Описание" },
              { id: "video", label: "Видео" },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#1a0e00" : "#8a7c63",
                  background: active ? "#fff" : "transparent",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {tab === "desc" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.length > 0 ? (
              tasks.map((t, i) => (
                <TaskCard key={i} index={i + 1} item={t} />
              ))
            ) : (
              <p style={{ fontSize: 13, color: "#1a0e00", lineHeight: 1.5 }}>
                {content.description}
              </p>
            )}
          </div>
        ) : (
          <div>
            {/* Video preview */}
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
              <button
                type="button"
                aria-label="Воспроизвести"
                style={{
                  background: "linear-gradient(135deg,#FFB300,#FF6D00)",
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(255,109,0,0.45)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Play className="h-6 w-6 text-white fill-white ml-0.5" />
              </button>
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

            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1a0e00", marginTop: 12 }}>
              {content.videoTitle}
            </h4>
            {content.videoDescription && (
              <p style={{ fontSize: 12.5, color: "#5a4d35", lineHeight: 1.5, marginTop: 6 }}>
                {content.videoDescription}
              </p>
            )}

            {chapters.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#b8a888",
                    marginBottom: 8,
                  }}
                >
                  Содержание
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {chapters.map((c, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontSize: 13,
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          fontVariantNumeric: "tabular-nums",
                          color: "#FF6D00",
                          fontWeight: 600,
                          minWidth: 36,
                        }}
                      >
                        {c.time}
                      </span>
                      <span style={{ color: "#1a0e00", lineHeight: 1.4 }}>{c.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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

function TaskCard({ index, item }: { index: number; item: LevelTaskItem }) {
  const done = !!item.done;
  const active = !!item.active;
  return (
    <div
      style={{
        border: "1px solid",
        borderColor: active ? "#FFB300" : "#ede4d2",
        background: done ? "#fbf8f1" : active ? "#fff8e8" : "#fff",
        borderRadius: 14,
        padding: "14px 14px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: done ? "#23a06b" : "#FFB300",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {done ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : index}
        </span>
        <h5
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1a0e00",
            lineHeight: 1.3,
            flex: 1,
            minWidth: 0,
          }}
        >
          {item.title}
        </h5>
      </div>
      <p style={{ fontSize: 12.5, color: "#5a4d35", lineHeight: 1.5 }}>
        {item.description}
      </p>
      {item.goTo && (
        <div
          style={{
            marginTop: 10,
            background: "#fff",
            border: "1px dashed #FFB300",
            borderRadius: 10,
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#b8a888",
              marginBottom: 4,
            }}
          >
            Куда перейти
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "#1a0e00",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
              lineHeight: 1.4,
            }}
          >
            <ArrowRight className="h-3.5 w-3.5" style={{ color: "#FF6D00" }} />
            <span>{item.goTo}</span>
          </div>
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 999,
            background: done ? "rgba(35,160,107,0.12)" : "rgba(255,109,0,0.10)",
            color: done ? "#1f8a5d" : "#FF6D00",
          }}
        >
          {done ? "✅ Выполнено" : "⏳ В процессе"}
        </span>
      </div>
    </div>
  );
}
