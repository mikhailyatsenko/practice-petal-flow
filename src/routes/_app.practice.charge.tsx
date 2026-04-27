import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronDown, Play, Check } from "lucide-react";

export const Route = createFileRoute("/_app/practice/charge")({
  head: () => ({
    meta: [
      { title: "Зарядка желаний — Клуб «Моя жизнь»" },
      {
        name: "description",
        content:
          "Заряди свои желания эмоцией: лайкни каждое и одно зарядим на 100%.",
      },
    ],
  }),
  component: ChargeScreen,
});

const LEVELS = [
  "0️⃣ Не видящий 🙈",
  "1️⃣ Мечтатель 💭",
  "2️⃣ Чувствующий ❤️",
  "3️⃣ Верящий 🌱",
  "4️⃣ Притягивающий 🧲",
  "5️⃣ Вибрирующий ✨",
  "6️⃣ Воплощающий 🌊",
  "7️⃣ Творец реальности 🎨",
  "8️⃣ Мастер желаний 💎",
  "9️⃣ Властелин эмоций 👑",
  "🔟 Бог воплощения 🌟",
];

const DONE_KEY = "charge-done-v1";
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// Демо: количество желаний/целей и их прогресс зарядки
// В реальности должно подтягиваться из раздела «Желания».
const DEMO_TOTAL = 8;
const DEMO_CHARGED = 5; // сколько заряжено хотя бы на 20%
const DEMO_MAX_PERCENT = 60; // максимум среди всех

function ChargeScreen() {
  const navigate = useNavigate();
  const [doneToday, setDoneToday] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");

  const streakDays = 12;

  useEffect(() => {
    try {
      const d = localStorage.getItem(DONE_KEY);
      if (d === todayStr()) setDoneToday(true);
    } catch {
      /* ignore */
    }
  }, []);

  const level = useMemo(() => Math.min(Math.floor(streakDays / 30), 10), [streakDays]);
  const progressInLevel = streakDays % 30;
  const levelName = LEVELS[level];

  const cond1Done = DEMO_CHARGED >= DEMO_TOTAL;
  const cond2Done = DEMO_MAX_PERCENT >= 100;
  const bothDone = cond1Done && cond2Done;

  const handleMarkDone = () => {
    if (!bothDone || doneToday) return;
    setDoneToday(true);
    try {
      localStorage.setItem(DONE_KEY, todayStr());
    } catch {
      /* ignore */
    }
  };

  const goToWishes = () => {
    void navigate({ to: "/wishes" });
  };

  return (
    <div className="px-4 pt-2 pb-8">
      {/* 1. Хедер */}
      <div className="relative flex items-center mb-3 min-h-[36px]">
        <button
          onClick={() => navigate({ to: "/" })}
          className="tap inline-flex items-center gap-1 text-[14px] font-medium text-[#FF6D00]"
        >
          <ChevronLeft className="h-5 w-5" /> Главная
        </button>
        <h1 className="text-[15px] font-semibold absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Зарядка желаний
        </h1>
        <div className="ml-auto" style={{ width: 80 }} />
      </div>

      {/* 2. Сегодня */}
      <section className="mt-2">
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: doneToday ? "#dcfce7" : "#fff3e0" }}
        >
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-[18px]"
            style={{
              background: doneToday ? "#16a34a" : "#FF6D00",
              color: "#fff",
            }}
          >
            {doneToday ? "✅" : "⚡"}
          </div>
          <div className="min-w-0">
            <p
              className="text-[14px] font-semibold leading-tight"
              style={{ color: doneToday ? "#15803d" : "#92400e" }}
            >
              {doneToday ? "Выполнено сегодня!" : "Ещё не выполнено"}
            </p>
            <p
              className="text-[12px] leading-tight mt-0.5"
              style={{ color: doneToday ? "#16a34a" : "#b45309" }}
            >
              {doneToday
                ? "Практика засчитана · +1 ⭐"
                : "Зарядись по всем желаниям, одно — на 100%"}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Уровень + серия */}
      <section className="mt-3 bg-card hairline rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold truncate">{levelName}</span>
          <span className="text-[15px] font-bold tabular-nums shrink-0 text-[#FF6D00]">
            {progressInLevel} / 30
          </span>
        </div>
        <div
          className="mt-2 h-2 rounded-full overflow-hidden"
          style={{ background: "#ede8df" }}
        >
          <div
            className="h-full"
            style={{
              width: `${(progressInLevel / 30) * 100}%`,
              background: "linear-gradient(90deg, #FFB300, #FF6D00)",
              transition: "width 600ms ease-out",
            }}
          />
        </div>

        <div className="my-3 h-px" style={{ background: "#ede8df" }} />

        <div className="flex items-center gap-3">
          <span style={{ fontSize: 26, lineHeight: 1 }}>🔥</span>
          <div className="min-w-0">
            <p
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: "#9ca3af" }}
            >
              Серия
            </p>
            <p
              className="text-[20px] font-bold leading-tight"
              style={{ color: "#FF6D00" }}
            >
              {streakDays} дней подряд
            </p>
          </div>
        </div>
      </section>

      {/* 5. Что нужно сделать */}
      <section className="mt-3">
        <p
          className="px-1 text-[11px] font-medium uppercase tracking-wider mb-2"
          style={{ color: "#9ca3af" }}
        >
          Что нужно сделать
        </p>
        <div className="space-y-2">
          <ChecklistItem
            done={cond1Done}
            text="Поставить лайк каждому желанию и цели"
            counter={`${DEMO_CHARGED} / ${DEMO_TOTAL}`}
          />
          <ChecklistItem
            done={cond2Done}
            text="Одно желание или цель зарядить на 100%"
            counter={`${DEMO_MAX_PERCENT}%`}
          />
        </div>
      </section>

      {/* 6. Кнопка перехода / засчитать */}
      <section className="mt-4">
        {!bothDone ? (
          <>
            <button
              onClick={goToWishes}
              className="tap w-full"
              style={{
                background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 16,
                padding: 16,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
              }}
            >
              ❤️ Перейти к желаниям и зарядиться
            </button>
            <p
              className="mt-2 text-[12px] leading-snug px-1 text-center"
              style={{ color: "#9ca3af" }}
            >
              Поставь лайки всем желаниям и целям — одно зарядить на 100%
            </p>
          </>
        ) : (
          <button
            onClick={handleMarkDone}
            disabled={doneToday}
            className="tap w-full"
            style={{
              background: doneToday
                ? "#d1d5db"
                : "linear-gradient(135deg, #FFB300, #FF6D00)",
              color: doneToday ? "#6b7280" : "#fff",
              fontWeight: 700,
              borderRadius: 16,
              padding: 16,
              fontSize: 15,
              cursor: doneToday ? "default" : "pointer",
              boxShadow: doneToday ? "none" : "0 4px 14px rgba(255,109,0,0.35)",
            }}
          >
            {doneToday ? "✅ Выполнено сегодня" : "✅ Засчитать зарядку"}
          </button>
        )}
      </section>

      {/* 8. Как это работает */}
      <section className="mt-4">
        <button
          onClick={() => setHowOpen((v) => !v)}
          className="tap w-full bg-card hairline rounded-2xl shadow-card px-4 py-3 flex items-center justify-between"
        >
          <span className="text-[14px] font-medium">❓ Как это работает</span>
          <ChevronDown
            className="h-5 w-5 transition-transform"
            style={{ transform: howOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        {howOpen && (
          <div className="mt-3 animate-fade-up">
            <div
              className="flex rounded-xl mb-3"
              style={{ background: "#f0ebe2", padding: 4 }}
            >
              {(
                [
                  { k: "text", label: "📖 Текст" },
                  { k: "video", label: "▶️ Видео" },
                ] as const
              ).map((t) => {
                const active = howTab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setHowTab(t.k)}
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

            {howTab === "text" && (
              <div className="space-y-3">
                <HowCard
                  title="⚡ Что такое Зарядка желаний"
                  text={`Зарядить желание — это сделать его живым внутри себя. Пока желание просто написано — оно мёртвое, это просто слова. Когда ты смотришь на него и чувствуешь эмоцию — оно оживает, становится заряженным энергией.

Представь аккумулятор. Ненаполненный аккумулятор не работает. Желание без эмоции — то же самое. Ты заряжаешь его своей верой и ощущением что это уже твоё.

Заряженное желание — это желание к которому у тебя есть живая эмоциональная связь. Ты не просто знаешь что оно есть — ты его чувствуешь. Оно тебя притягивает, вдохновляет, заряжает энергией. Незаряженное — висит в списке мёртвым грузом. Ты про него забываешь. Оно не работает.

Оба смысла работают одновременно: ты заряжаешь желание — вливаешь в него свою эмоцию и веру. И ты заряжаешься от желания — получаешь энергию и вдохновение.`}
                />
                <HowCard
                  title="🎯 Как выполнять?"
                  text={`Перейди в раздел «Желания» и нажимай на сердечко рядом с каждым желанием и целью — каждое нажатие добавляет 20% заряда. Пройди по всем.

Одно желание или цель нажми 5 раз до 100% — это твоя глубокая зарядка дня. В этот момент по-настоящему представь что это уже произошло. Не процесс достижения — а результат. Ты уже там. Почувствуй радость, гордость, свободу.`}
                >
                  <div
                    className="mt-3 rounded-xl p-3 text-[13px] leading-snug"
                    style={{
                      background: "#fff3e0",
                      color: "#92400e",
                      border: "1px solid #ffe0b2",
                    }}
                  >
                    ☝️ Важно: чувствуй что это 100% произойдёт. Именно
                    уверенность рождает эмоцию. Если есть сомнение — эмоции нет.
                    Входи в состояние «это уже моё».
                  </div>
                </HowCard>
                <HowCard
                  title="💎 Что ты получаешь?"
                  text={`Со временем образ каждого желания становится для тебя родным и знакомым. Уходит внутреннее сопротивление. Появляется естественная тяга двигаться к желаниям — не через усилие и силу воли, а через притяжение. Ты начинаешь замечать возможности, которые раньше проходили мимо.

Эмоции — это не просто приятное ощущение. Это индикатор того, что сигнал отправлен. Чем ярче и сильнее ты чувствуешь радость, гордость, свободу — тем глубже желание записывается внутри тебя.

🏆 Награда: +1 очко ежедневно за выполнение.`}
                />
              </div>
            )}

            {howTab === "video" && (
              <div className="bg-card hairline rounded-2xl overflow-hidden shadow-card">
                <div
                  className="relative aspect-video w-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #2a1a05 0%, #4a2c0a 50%, #1a0e00 100%)",
                  }}
                >
                  <button
                    aria-label="Воспроизвести"
                    className="tap h-16 w-16 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                    }}
                  >
                    <Play className="h-7 w-7 fill-white ml-1" />
                  </button>
                  <span className="absolute bottom-2.5 right-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                    6:30
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[13px] leading-snug text-foreground">
                    В видео объясняется как правильно заряжаться желаниями, как
                    входить в нужное эмоциональное состояние и почему это
                    работает.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ChecklistItem({
  done,
  text,
  counter,
}: {
  done: boolean;
  text: string;
  counter: string;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{
        background: done ? "#dcfce7" : "#fff",
        border: done ? "1px solid #bbf7d0" : "1px solid #ede8df",
      }}
    >
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: done ? "#16a34a" : "#f0ebe2",
          color: done ? "#fff" : "#9ca3af",
        }}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </div>
      <p
        className="flex-1 text-[14px] leading-snug"
        style={{
          color: done ? "#15803d" : "#1f2937",
          fontWeight: done ? 600 : 500,
        }}
      >
        {text}
      </p>
      <span
        className="text-[13px] font-bold tabular-nums shrink-0"
        style={{ color: done ? "#16a34a" : "#FF6D00" }}
      >
        {counter}
      </span>
    </div>
  );
}

function HowCard({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-card shadow-card p-4" style={{ borderRadius: 14 }}>
      <p className="text-[14px] font-semibold mb-2">{title}</p>
      <p className="text-[13px] leading-snug whitespace-pre-line text-foreground/85">
        {text}
      </p>
      {children}
    </div>
  );
}
