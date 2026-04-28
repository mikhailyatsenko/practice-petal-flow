import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronDown, Play } from "lucide-react";
import { setPracticeDone } from "@/lib/practicesStore";

export const Route = createFileRoute("/_app/practice/step")({
  head: () => ({
    meta: [
      { title: "Шаг к цели — Клуб «Моя жизнь»" },
      {
        name: "description",
        content:
          "Делай каждый день хотя бы один шаг к своим целям — система ежедневных действий.",
      },
    ],
  }),
  component: StepScreen,
});

const LEVELS = [
  "0️⃣ Застывший ⛔",
  "1️⃣ Первый шаг 👣",
  "2️⃣ Идущий 🚶",
  "3️⃣ Набирающий темп 🏃",
  "4️⃣ Движущийся к цели 🧭",
  "5️⃣ Строитель результата 🏗️",
  "6️⃣ Системный игрок ♟️",
  "7️⃣ Человек действия ⚡",
  "8️⃣ Мастер воплощения 🎯",
  "9️⃣ Властелин целей 👑",
  "🔟 Легенда результата 🌟",
];

const DONE_KEY = "step-done-v1";
const HISTORY_KEY = "step-history-v1";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

type HistoryItem = { goal: string; task: string };
type DayEntry = { date: string; items: HistoryItem[] };

function StepScreen() {
  const navigate = useNavigate();
  const [doneToday, setDoneToday] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [history, setHistory] = useState<DayEntry[]>([]);
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");

  const streakDays = 0;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DONE_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as { date: string; count: number };
        if (obj.date === todayStr()) {
          const isDone = obj.count >= 1;
          setDoneToday(isDone);
          setTodayCount(obj.count);
          if (isDone) setPracticeDone("wishes", true);
        }
      }
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) {
        const arr = JSON.parse(h) as DayEntry[];
        if (Array.isArray(arr)) setHistory(arr);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const level = useMemo(
    () => Math.min(Math.floor(streakDays / 30), 10),
    [streakDays],
  );
  const progressInLevel = streakDays % 30;
  const levelName = LEVELS[level];

  const lastWeek = history.slice(0, 7);

  return (
    <div className="px-4 pt-2 pb-8">
      {/* Хедер */}
      <div className="relative flex items-center mb-3 min-h-[36px]">
        <button
          onClick={() => navigate({ to: "/" })}
          className="tap inline-flex items-center gap-1 text-[14px] font-medium text-[#FF6D00]"
        >
          <ChevronLeft className="h-5 w-5" /> Главная
        </button>
        <h1 className="text-[15px] font-semibold absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Шаг к цели
        </h1>
        <div className="ml-auto" style={{ width: 80 }} />
      </div>

      {/* Сегодня */}
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
            {doneToday ? "✅" : "🎯"}
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
                ? `${todayCount} ${pluralTasks(todayCount)} выполнено · +1 ⭐`
                : "Выполни хотя бы одну задачу к своим целям"}
            </p>
          </div>
        </div>
      </section>

      {/* Уровень + серия */}
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

      {/* Что нужно сделать */}
      <section className="mt-3">
        <div
          className="flex items-center gap-3"
          style={{
            background: doneToday ? "#dcfce7" : "#FAF6EF",
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <div
            className="shrink-0 rounded-full flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              background: doneToday ? "#16a34a" : "transparent",
              border: doneToday ? "none" : "1.5px solid #d1d5db",
              color: "#fff",
              fontSize: 13,
              lineHeight: 1,
            }}
          >
            {doneToday ? "✓" : ""}
          </div>
          <p
            className="text-[14px] leading-snug"
            style={{
              color: doneToday ? "#15803d" : "#1a1a1a",
              fontWeight: doneToday ? 600 : 400,
            }}
          >
            Выполни хотя бы 1 задачу к любой из своих целей
          </p>
        </div>
      </section>

      {/* Кнопка перехода */}
      <section className="mt-4">
        <button
          onClick={() => {
            if (!doneToday) void navigate({ to: "/wishes", search: { tab: "tasks" } });
          }}
          disabled={doneToday}
          className="tap w-full"
          style={{
            background: doneToday
              ? "#e5e7eb"
              : "linear-gradient(135deg, #FFB300, #FF6D00)",
            color: doneToday ? "#9ca3af" : "#fff",
            fontWeight: 700,
            borderRadius: 16,
            padding: 16,
            fontSize: 15,
            cursor: doneToday ? "default" : "pointer",
            boxShadow: doneToday ? "none" : "0 4px 16px rgba(255,109,0,0.3)",
          }}
        >
          {doneToday ? "✅ Шаг к цели засчитан" : "🎯 Перейти к задачам"}
        </button>
        {!doneToday && (
          <p
            className="text-center mt-2"
            style={{ fontSize: 12, color: "#9ca3af" }}
          >
            Выполни хотя бы одну задачу — остальные по желанию и рекомендованы
          </p>
        )}
      </section>

      {/* История шагов */}
      {lastWeek.length > 0 && (
        <section className="mt-4 bg-card hairline rounded-2xl shadow-card p-4">
          <p
            className="text-[11px] font-medium uppercase tracking-wider mb-3"
            style={{ color: "#9ca3af" }}
          >
            История шагов
          </p>
          <div className="space-y-4">
            {lastWeek.map((day) => (
              <div key={day.date}>
                <div className="flex items-baseline justify-between mb-2">
                  <p
                    className="text-[12px] font-bold"
                    style={{ color: "#6b7280" }}
                  >
                    {formatDate(day.date)}
                  </p>
                </div>
                <div>
                  {day.items.map((it, i) => (
                    <div key={i}>
                      <div className="py-2">
                        <p
                          style={{
                            fontSize: 11,
                            color: "#FF6D00",
                            fontWeight: 600,
                          }}
                        >
                          {it.goal}
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#1a1a1a",
                            lineHeight: 1.4,
                            marginTop: 2,
                          }}
                        >
                          {it.task}
                        </p>
                      </div>
                      {i < day.items.length - 1 && (
                        <div
                          className="h-px"
                          style={{ background: "#ede8df" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Как это работает */}
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
                  title="🎯 Шаг к цели"
                  text={`Цели воплощаются не через грандиозные прорывы, а через ежедневные маленькие шаги. Один шаг в день — это 365 шагов в год. Это и есть система. Каждый день ты делаешь хотя бы одно конкретное действие по своим целям. Не планируешь — делаешь.`}
                />
                <HowCard
                  title="🎯 Как выполнять?"
                  text={`Перейди в раздел «Задачи», выбери любую задачу к своей цели и выполни её. Достаточно одной задачи — привычка засчитана. Остальные выполняй по желанию.`}
                >
                  <div
                    className="mt-3 rounded-xl p-3 text-[13px] leading-snug"
                    style={{
                      background: "#fff3e0",
                      color: "#92400e",
                      border: "1px solid #ffe0b2",
                    }}
                  >
                    ☝️ Рекомендуем делать больше одной задачи — каждый
                    дополнительный шаг ускоряет воплощение цели. Но минимум —
                    одна задача в день.
                  </div>
                </HowCard>
                <HowCard
                  title="💎 Что ты получаешь?"
                  text={`Цели перестают быть далёкими мечтами — они становятся живым процессом. Каждый день ты видишь движение вперёд. Это создаёт мощную мотивацию продолжать.

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
                    5:20
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[13px] leading-snug text-foreground">
                    В видео объясняется как система ежедневных шагов приводит к
                    большим результатам и как правильно работать с задачами.
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

function pluralTasks(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "задача";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "задачи";
  return "задач";
}

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const today = todayStr();
  if (dateStr === today) return "сегодня";
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(yest.getDate()).padStart(2, "0")}`;
  if (dateStr === yStr) return "вчера";
  return `${d} ${MONTHS[m - 1]}${new Date().getFullYear() !== y ? ` ${y}` : ""}`;
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
    <div className="bg-card hairline rounded-2xl shadow-card p-4">
      <h3 className="text-[14px] font-semibold mb-2">{title}</h3>
      <p
        className="text-[13px] leading-relaxed whitespace-pre-line"
        style={{ color: "#4b5563" }}
      >
        {text}
      </p>
      {children}
    </div>
  );
}
