import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, Play, Check, X, Video } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { setTelemostLink } from "@/lib/telemostLinkStore";

export const Route = createFileRoute("/_app/telemost-link")({
  component: TelemostLinkPage,
});

const STEPS = [
  {
    title: "Открой Яндекс Телемост",
    text: "Нажми кнопку «Открыть Яндекс Телемост» и войди в свой аккаунт Яндекса.",
  },
  {
    title: "Создай новую встречу",
    text: "Создай новую видеовстречу и укажи название, например: «Созвоны с Бадди».",
  },
  {
    title: "Сделай встречу повторяющейся",
    text: "Включи повторение встречи, чтобы одна и та же ссылка использовалась для всех будущих созвонов.",
  },
  {
    title: "Сохрани встречу",
    text: "Сохрани встречу и скопируй ссылку Яндекс Телемоста.",
  },
];

function TelemostLinkPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"text" | "video">("text");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const handleCheck = () => {
    const v = link.trim();
    const ok = /^https?:\/\/(www\.)?telemost\.yandex\.(ru|com|by|kz)\/.+/i.test(v);
    if (ok) {
      setTelemostLink(v);
      setStatus("ok");
    } else {
      setStatus("error");
    }
  };


  return (
    <div className="px-4 pb-8">
      {/* Header */}
      <div className="relative flex items-center px-1 pt-2 pb-3">
        <div className="relative z-10">
          <BackButton onClick={() => navigate({ to: "/community" })} />
        </div>
        <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
          Создай ссылку для созвонов
        </h1>
      </div>

      <p className="text-[13px] text-muted-foreground leading-snug px-1 mb-3">
        Создай постоянную повторяющуюся встречу в Яндекс Телемосте. Эта ссылка будет использоваться для ваших созвонов с Бадди и для встреч четвёрки.
      </p>

      {/* CTA button */}
      <a
        href="https://telemost.yandex.ru/"
        target="_blank"
        rel="noopener noreferrer"
        className="tap w-full rounded-2xl py-3.5 mb-4 text-[14px] font-bold text-white flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #66BB6A, #43A047)",
          boxShadow: "0 6px 20px rgba(67,160,71,0.35)",
        }}
      >
        <ExternalLink className="h-4 w-4" />
        Открыть Яндекс Телемост
      </a>

      {/* Text / Video toggle */}
      <div className="flex rounded-xl mb-3" style={{ background: "#f0ebe2", padding: 4 }}>
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
                background: active ? "linear-gradient(135deg, #FFB300, #FF6D00)" : "transparent",
                color: active ? "#fff" : "#6b6356",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "video" ? (
        <div
          className="rounded-2xl mb-4 overflow-hidden hairline animate-fade-up"
          style={{ background: "linear-gradient(135deg, #ffe9d1, #ffd6a8)" }}
        >
          <div className="aspect-video flex items-center justify-center relative">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
            >
              <Play className="h-6 w-6" style={{ color: "#FF6D00" }} fill="#FF6D00" />
            </div>
          </div>
          <div className="px-4 py-3 bg-card">
            <p className="text-[13px] font-semibold flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Видео: как создать повторяющуюся встречу в Яндекс Телемосте
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">1:40 · пошагово, со скриншотами</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-4 animate-fade-up">
          {STEPS.map((s, i) => (
            <div key={i} className="bg-card hairline shadow-card rounded-2xl p-3.5">
              <div className="flex items-start gap-3">
                <div
                  className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-semibold leading-tight">{s.title}</h4>
                  <p className="text-[13px] text-muted-foreground mt-1 leading-snug">{s.text}</p>
                </div>
              </div>
              <div
                className="mt-3 rounded-xl flex items-center justify-center text-[11px] text-muted-foreground"
                style={{
                  background: "repeating-linear-gradient(45deg, #f5efe4, #f5efe4 8px, #ede4d0 8px, #ede4d0 16px)",
                  height: 140,
                }}
              >
                скриншот шага {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link input */}
      <div className="bg-card hairline shadow-card rounded-2xl p-3.5 mb-3">
        <label className="text-[13px] font-semibold block mb-2">Ссылка на Яндекс Телемост</label>
        <input
          type="url"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}

          placeholder="Вставь ссылку на встречу"
          className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none hairline bg-background"
        />

        {status === "error" && (
          <div
            className="mt-3 rounded-xl p-3 text-[13px] flex items-start gap-2"
            style={{ background: "#fff4f4", border: "1px solid #ffcccc", color: "#c62828" }}
          >
            <X className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Проверь ссылку. Нужно вставить ссылку на встречу Яндекс Телемоста.</span>
          </div>
        )}

        {status === "ok" && (
          <div
            className="mt-3 rounded-xl p-3 text-[13px] flex items-start gap-2"
            style={{ background: "#effaf1", border: "1px solid #bfe6c8", color: "#1f7a3a" }}
          >
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Ссылка создана и сохранена</span>
          </div>
        )}

        {status !== "ok" ? (
          <button
            onClick={handleCheck}
            className="tap mt-3 w-full rounded-2xl py-3 text-[14px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #FFB300, #FF6D00)",
              boxShadow: "0 6px 20px rgba(255,109,0,0.40)",
            }}
          >
            Проверить ссылку
          </button>
        ) : (
          <button
            onClick={() => navigate({ to: "/buddy", search: { demo: "has" } })}
            className="tap mt-3 w-full rounded-2xl py-3 text-[14px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #43A047, #2E7D32)",
              boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
            }}
          >
            Готово — перейти к Бадди
          </button>
        )}

      </div>
    </div>
  );
}
