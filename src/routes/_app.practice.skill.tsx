import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronDown, Play, Plus, X } from "lucide-react";
import { setPracticeDone, useEffectiveProgress, usePracticeDone } from "@/lib/practicesStore";
import { HowVideoCards } from "@/components/section/HowVideoCards";

export const Route = createFileRoute("/_app/practice/skill")({
  head: () => ({
    meta: [
      { title: "Навык успеха — Клуб «Моя жизнь»" },
      {
        name: "description",
        content:
          "Записывай каждый день намерения, которые довёл до конца, и тренируй главный навык успеха.",
      },
    ],
  }),
  component: SkillScreen,
});

const LEVELS = [
  "0️⃣ Бросающий 🍃",
  "1️⃣ Начинающий 🌱",
  "2️⃣ Старательный 📋",
  "3️⃣ Дисциплинированный ⚙️",
  "4️⃣ Последовательный 🔗",
  "5️⃣ Завершающий 🎯",
  "6️⃣ Мастер слова 🤝",
  "7️⃣ Человек результата 💪",
  "8️⃣ Архитектор успеха 🏛️",
  "9️⃣ Властелин намерений ⚡",
  "🔟 Бог воплощения 🌟",
];

const MAX_PER_DAY = 3;
const MIN_TEXT_LEN = 3;

const TODAY_KEY = "skill-today-v1";
const DONE_KEY = "skill-done-v1";
const HISTORY_KEY = "skill-history-v1";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

type DayEntry = { date: string; items: string[] };

function SkillScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState<string[]>([]);
  const [doneToday, setDoneToday] = useState(false);
  const [history, setHistory] = useState<DayEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");

  const { streakDays } = useEffectiveProgress("skill");
  const storeDone = usePracticeDone("skill");

  // Когда «Следующий день» сбросил done в сторе — очищаем локальные успехи,
  // чтобы рамка стала пустой для записи новых на следующий день.
  useEffect(() => {
    if (!storeDone && doneToday) {
      setDoneToday(false);
      setItems([]);
      try {
        localStorage.removeItem(TODAY_KEY);
        localStorage.removeItem(DONE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, [storeDone, doneToday]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TODAY_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as { date: string; items: string[] };
        if (obj.date === todayStr() && Array.isArray(obj.items)) {
          setItems(obj.items);
        }
      }
      if (localStorage.getItem(DONE_KEY) === todayStr()) {
        setDoneToday(true);
        setPracticeDone("skill", true);
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

  const persistToday = (next: string[]) => {
    try {
      localStorage.setItem(
        TODAY_KEY,
        JSON.stringify({ date: todayStr(), items: next }),
      );
    } catch {
      /* ignore */
    }
  };

  const handleAdd = () => {
    const v = draft.trim();
    if (v.length < MIN_TEXT_LEN || items.length >= MAX_PER_DAY || doneToday)
      return;
    const next = [...items, v];
    setItems(next);
    persistToday(next);
    setDraft("");
    setAdding(false);
  };

  const handleRemove = (i: number) => {
    if (doneToday) return;
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    persistToday(next);
  };

  const handleCount = () => {
    if (items.length < 1 || doneToday) return;
    setDoneToday(true);
    setPracticeDone("skill", true);
    try {
      localStorage.setItem(DONE_KEY, todayStr());
      // Сохранить в историю
      const today = todayStr();
      const existing = history.filter((d) => d.date !== today);
      const next = [{ date: today, items }, ...existing].slice(0, 30);
      setHistory(next);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const level = useMemo(
    () => Math.min(Math.floor(streakDays / 30), 10),
    [streakDays],
  );
  const progressInLevel = streakDays % 30;
  const levelName = LEVELS[level];

  const canSubmit = items.length >= 1;
  const showAddButton = !adding && items.length < MAX_PER_DAY && !doneToday;

  const lastWeek = history.slice(0, 7);

  return (
    <div className="px-4 pt-2 pb-8">
      {/* Хедер */}
      <div className="relative flex items-center mb-3 min-h-[36px]">
        <button
          onClick={() => navigate({ to: "/" })}
          className="tap inline-flex items-center gap-1 text-[15px] font-normal text-[#FF6D00]"
        >
          <ChevronLeft className="h-5 w-5" /> Главная
        </button>
        <h1 className="text-[15px] font-semibold absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Навык успеха
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
            {doneToday ? "✅" : "🏆"}
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
                ? `${items.length} успеха записано · +1 ⭐`
                : "Запиши минимум 1 намерение которое довёл до конца"}
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

      {/* Мои успехи сегодня */}
      <section className="mt-3 bg-card hairline rounded-2xl shadow-card p-4">
        <p
          className="text-[11px] font-medium uppercase tracking-wider mb-3"
          style={{ color: "#9ca3af" }}
        >
          Мои успехи сегодня
        </p>

        <div className="space-y-2">
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-start gap-2"
              style={{
                background: "#dcfce7",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <span
                className="shrink-0 tabular-nums"
                style={{ color: "#16a34a", fontWeight: 700, fontSize: 14 }}
              >
                {i + 1}.
              </span>
              <p
                className="flex-1 min-w-0 text-[14px] leading-snug"
                style={{ color: "#14532d" }}
              >
                {it}
              </p>
              {!doneToday && (
                <button
                  onClick={() => handleRemove(i)}
                  className="tap shrink-0"
                  style={{ color: "#86efac" }}
                  aria-label="Удалить"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {showAddButton && (
          <button
            onClick={() => setAdding(true)}
            className="tap w-full mt-2 flex items-center justify-center gap-2"
            style={{
              border: "1.5px dashed #d1d5db",
              borderRadius: 12,
              padding: "12px 14px",
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            <Plus className="h-4 w-4" />
            {items.length === 0 ? "Записать успех" : "Добавить ещё успех"}
          </button>
        )}

        {adding && !doneToday && (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Что ты довёл до конца сегодня? Например: прочитал 30 страниц книги, сделал утреннюю зарядку, закончил отчёт..."
              autoFocus
              style={{
                width: "100%",
                border: "1.5px solid #FF6D00",
                borderRadius: 12,
                padding: "12px 14px",
                minHeight: 80,
                resize: "none",
                fontSize: 14,
                lineHeight: 1.6,
                outline: "none",
                color: "#1f2937",
                background: "#fff",
              }}
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setAdding(false);
                  setDraft("");
                }}
                className="tap flex-1"
                style={{
                  background: "#f3f4f6",
                  color: "#6b7280",
                  fontWeight: 500,
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 14,
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleAdd}
                disabled={draft.trim().length < MIN_TEXT_LEN}
                className="tap flex-1"
                style={{
                  background:
                    draft.trim().length < MIN_TEXT_LEN
                      ? "#e5e7eb"
                      : "linear-gradient(135deg, #FFB300, #FF6D00)",
                  color:
                    draft.trim().length < MIN_TEXT_LEN ? "#9ca3af" : "#fff",
                  fontWeight: 700,
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 14,
                  cursor:
                    draft.trim().length < MIN_TEXT_LEN ? "default" : "pointer",
                }}
              >
                Добавить
              </button>
            </div>
          </div>
        )}

        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: "1px solid #ede8df" }}
        >
          <span className="text-[12px]" style={{ color: "#9ca3af" }}>
            Записано сегодня
          </span>
          <span
            className="text-[13px] tabular-nums"
            style={{ color: "#FF6D00", fontWeight: 700 }}
          >
            {items.length} / {MAX_PER_DAY}
          </span>
        </div>
      </section>

      {/* Кнопка засчитать */}
      <section className="mt-4">
        <button
          onClick={handleCount}
          disabled={!canSubmit || doneToday}
          className="tap w-full"
          style={{
            background:
              !canSubmit || doneToday
                ? "#e5e7eb"
                : "linear-gradient(135deg, #FFB300, #FF6D00)",
            color: !canSubmit || doneToday ? "#9ca3af" : "#fff",
            fontWeight: 700,
            borderRadius: 16,
            padding: 16,
            fontSize: 15,
            cursor: !canSubmit || doneToday ? "default" : "pointer",
            boxShadow:
              !canSubmit || doneToday
                ? "none"
                : "0 4px 16px rgba(255,109,0,0.3)",
          }}
        >
          {doneToday ? "✅ Навык успеха засчитан" : "Засчитать навык успеха"}
        </button>
      </section>

      {/* История успехов */}
      {lastWeek.length > 0 && (
        <section className="mt-4 bg-card hairline rounded-2xl shadow-card p-4">
          <p
            className="text-[11px] font-medium uppercase tracking-wider mb-3"
            style={{ color: "#9ca3af" }}
          >
            История успехов
          </p>
          <div className="space-y-4">
            {lastWeek.map((day) => (
              <div key={day.date}>
                <p
                  className="text-[12px] font-bold mb-2"
                  style={{ color: "#6b7280" }}
                >
                  {formatDate(day.date)}
                </p>
                <div className="space-y-2">
                  {day.items.map((it, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-2 py-1">
                        <span
                          className="shrink-0 mt-1.5 rounded-full"
                          style={{
                            width: 6,
                            height: 6,
                            background: "#16a34a",
                          }}
                        />
                        <p
                          className="text-[13px] leading-snug"
                          style={{ color: "#555" }}
                        >
                          {it}
                        </p>
                      </div>
                      {i < day.items.length - 1 && (
                        <div
                          className="h-px ml-4"
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
                  title="🏆 Навык успеха"
                  text={`Главный навык успешного человека — привычка доводить намерения до воплощения. Не мечтать, не планировать, а доводить до конца. Каждый раз когда ты захотел что-то сделать — и сделал это — ты тренируешь эту мышцу. Со временем она становится твоей естественной нормой.`}
                />
                <HowCard
                  title="🎯 Как выполнять?"
                  text={`Каждый день записывай от 1 до 3 намерений которые довёл до конца. Это может быть что угодно — большое или маленькое. Примеры: прочитал 30 страниц книги, сделал зарядку, закончил отчёт, провёл звонок который откладывал.`}
                >
                  <div
                    className="mt-3 rounded-xl p-3 text-[13px] leading-snug"
                    style={{
                      background: "#fff3e0",
                      color: "#92400e",
                      border: "1px solid #ffe0b2",
                    }}
                  >
                    ☝️ Суть не в масштабе успеха, а в самом факте завершения.
                    Захотел → сделал → записал. Это и есть тренировка навыка.
                  </div>
                </HowCard>
                <HowCard
                  title="💎 Что ты получаешь?"
                  text={`Формируется привычка завершать начатое. Растёт сила воли и уверенность в себе. Намерения перестают зависать — они воплощаются.

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
                    В видео объясняется почему этот навык является главным
                    навыком успешных людей и как правильно его тренировать
                    каждый день.
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
  if (dateStr === today) return "Сегодня";
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(yest.getDate()).padStart(2, "0")}`;
  if (dateStr === yStr) return "Вчера";
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
