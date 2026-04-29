import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { HowVideoCards } from "./HowVideoCards";

type VideoItem = { title: string; duration: string; caption: string };
type TextBlock = { title: string; text: string };

export function HowItWorksBlock({
  paragraphs,
  videos,
  className = "",
}: {
  paragraphs: TextBlock[];
  videos: [VideoItem, VideoItem];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"text" | "video">("text");

  return (
    <section className={`mt-6 ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap w-full bg-card hairline rounded-2xl shadow-card px-4 py-3 flex items-center justify-between"
      >
        <span className="text-[14px] font-medium">❓ Как это работает</span>
        <ChevronDown
          className="h-5 w-5 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div className="mt-3 animate-fade-up">
          <div
            className="flex rounded-xl mb-3"
            style={{ background: "#f0ebe2", padding: 4 }}
          >
            {([
              { k: "text" as const, label: "📖 Текст" },
              { k: "video" as const, label: "▶️ Видео" },
            ]).map((t) => {
              const active = tab === t.k;
              return (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className="tap flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #FFB300, #FF6D00)"
                      : "transparent",
                    color: active ? "#fff" : "#6b6356",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === "text" && (
            <div className="space-y-3">
              {paragraphs.map((p, i) => (
                <div
                  key={i}
                  className="bg-card shadow-card p-4"
                  style={{ borderRadius: 14 }}
                >
                  <p className="text-[14px] font-semibold mb-2">{p.title}</p>
                  <p className="text-[13px] leading-snug text-foreground/85 whitespace-pre-line">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "video" && (
            <HowVideoCards first={videos[0]} second={videos[1]} />
          )}
        </div>
      )}
    </section>
  );
}
