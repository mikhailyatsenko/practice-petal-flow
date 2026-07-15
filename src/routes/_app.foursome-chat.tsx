import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Check, X, Video } from "lucide-react";
import { z } from "zod";
import { BackButton } from "@/components/layout/BackButton";
import { TelegramIcon, MaxIcon } from "@/components/icons/MessengerIcons";
import { setFoursomeChat, type FoursomeMessenger } from "@/lib/foursomeChatStore";

const searchSchema = z.object({
  messenger: z.enum(["telegram", "max"]).catch("telegram"),
});

export const Route = createFileRoute("/_app/foursome-chat")({
  validateSearch: (s) => searchSchema.parse(s),
  component: FoursomeChatPage,
});

const STEPS = [
  {
    title: "Откройте мессенджер",
    text: "Откройте выбранный мессенджер и войдите в свой аккаунт.",
  },
  {
    title: "Создайте новый групповой чат",
    text: "В мессенджере создайте новый групповой чат для четырёх участников.",
  },
  {
    title: "Назовите чат",
    text: "Например: «Наша Четвёрка».",
  },
  {
    title: "Создайте ссылку-приглашение",
    text: "В настройках чата включите приглашение по ссылке.",
  },
  {
    title: "Скопируйте ссылку",
    text: "Скопируйте ссылку-приглашение и вернитесь в приложение.",
  },
];

function FoursomeChatPage() {
  const navigate = useNavigate();
  const { messenger } = Route.useSearch();
  const [tab, setTab] = useState<"text" | "video">("text");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const cfg =
    messenger === "telegram"
      ? {
          name: "Telegram",
          url: "https://t.me/",
          gradient: "linear-gradient(135deg, #29B6F6, #0288D1)",
          shadow: "0 6px 20px rgba(2,136,209,0.35)",
          Icon: TelegramIcon,
          re: /^https?:\/\/(t\.me|telegram\.me)\/.+/i,
        }
      : {
          name: "MAX",
          url: "https://max.ru/",
          gradient: "linear-gradient(135deg, #7C4DFF, #5E35B1)",
          shadow: "0 6px 20px rgba(94,53,177,0.35)",
          Icon: MaxIcon,
          re: /^https?:\/\/(www\.)?max\.(ru|com)\/.+/i,
        };

  const handleCheck = () => {
    const v = link.trim();
    if (cfg.re.test(v)) {
      setFoursomeChat({ messenger: messenger as FoursomeMessenger, link: v });
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
          <BackButton onClick={() => navigate({ to: "/foursome" })} />
        </div>

        <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
          Создай общий чат в {cfg.name}
        </h1>
      </div>

      <p className="text-[13px] text-muted-foreground leading-snug px-1 mb-3">
        Создайте групповой чат в {cfg.name} для всех четырёх участников Четвёрки и добавьте ссылку-приглашение.
      </p>

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
              Видео: как создать общий чат в {cfg.name}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">1:20 · пошагово, со скриншотами</p>
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
        <label className="text-[13px] font-semibold block mb-2">
          Ссылка-приглашение в общий чат
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder={messenger === "telegram" ? "https://t.me/+..." : "https://max.ru/..."}
          className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none hairline bg-background"
        />

        {status === "error" && (
          <div
            className="mt-3 rounded-xl p-3 text-[13px] flex items-start gap-2"
            style={{ background: "#fff4f4", border: "1px solid #ffcccc", color: "#c62828" }}
          >
            <X className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Проверь ссылку. Нужна ссылка-приглашение из {cfg.name}.</span>
          </div>
        )}

        {status === "ok" && (
          <div
            className="mt-3 rounded-xl p-3 text-[13px] flex items-start gap-2"
            style={{ background: "#effaf1", border: "1px solid #bfe6c8", color: "#1f7a3a" }}
          >
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Ссылка проверена и сохранена. Заявка опубликована.</span>
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
            onClick={() => navigate({ to: "/foursome", search: { demo: "waiting" } })}
            className="tap mt-3 w-full rounded-2xl py-3 text-[14px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #43A047, #2E7D32)",
              boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
            }}
          >
            Готово — перейти к заявке
          </button>
        )}
      </div>
    </div>
  );
}
