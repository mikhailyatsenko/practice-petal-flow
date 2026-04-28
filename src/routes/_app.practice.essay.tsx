import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronDown, Play } from "lucide-react";
import { setPracticeDone } from "@/lib/practicesStore";

export const Route = createFileRoute("/_app/practice/essay")({
  head: () => ({
    meta: [
      { title: "Жизнь моей мечты — Клуб «Моя жизнь»" },
      {
        name: "description",
        content:
          "Пиши сочинение о своей идеальной жизни — каждый день минимум 200 символов.",
      },
    ],
  }),
  component: EssayScreen,
});

const LEVELS = [
  "0️⃣ Спящий 😴",
  "1️⃣ Мечтатель 💭",
  "2️⃣ Фантазёр 🌈",
  "3️⃣ Визионер 🔭",
  "4️⃣ Творец образов 🎨",
  "5️⃣ Архитектор жизни 🏛️",
  "6️⃣ Режиссёр судьбы 🎬",
  "7️⃣ Мастер реальности 💎",
  "8️⃣ Хранитель мечты ✨",
  "9️⃣ Властелин видения 👑",
  "🔟 Бог своей жизни 🌟",
];

const MAX_ESSAY = 2000;
const MIN_DAILY = 200;

const ESSAY_KEY = "essay-text-v1";
const DONE_KEY = "essay-done-v1";
const TODAY_ADDED_KEY = "essay-today-added-v1";
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// Аккуратная обрезка по границе предложения
function trimToSentenceStart(text: string, maxLen: number): { text: string; trimmed: boolean } {
  if (text.length <= maxLen) return { text, trimmed: false };
  // Сколько нужно отрезать с начала
  const cutFrom = text.length - maxLen;
  const tail = text.slice(cutFrom);
  // Найти первое начало предложения в хвосте
  const m = tail.match(/[.!?\n]\s+\S/);
  if (m && m.index !== undefined) {
    // Стартуем сразу после разделителя
    const sentenceStart = m.index + m[0].length - 1;
    return { text: tail.slice(sentenceStart), trimmed: true };
  }
  // Фолбэк: первый пробел
  const sp = tail.indexOf(" ");
  if (sp >= 0 && sp < tail.length - 1) {
    return { text: tail.slice(sp + 1), trimmed: true };
  }
  return { text: tail, trimmed: true };
}

function EssayScreen() {
  const navigate = useNavigate();
  const [essay, setEssay] = useState("");
  const [draft, setDraft] = useState("");
  const [doneToday, setDoneToday] = useState(false);
  const [todayAdded, setTodayAdded] = useState(0);
  const [trimmedNotice, setTrimmedNotice] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");

  const essayBoxRef = useRef<HTMLDivElement>(null);
  const streakDays = 0;

  useEffect(() => {
    try {
      const e = localStorage.getItem(ESSAY_KEY);
      if (e) setEssay(e);
      const d = localStorage.getItem(DONE_KEY);
      if (d === todayStr()) {
        setDoneToday(true);
        setPracticeDone("essay", true);
        const n = parseInt(localStorage.getItem(TODAY_ADDED_KEY) || "0", 10);
        if (!Number.isNaN(n)) setTodayAdded(n);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Авто-прокрутка к концу сочинения
  useEffect(() => {
    if (essayBoxRef.current) {
      essayBoxRef.current.scrollTop = essayBoxRef.current.scrollHeight;
    }
  }, [essay]);

  const level = useMemo(() => Math.min(Math.floor(streakDays / 30), 10), [streakDays]);
  const progressInLevel = streakDays % 30;
  const levelName = LEVELS[level];

  const draftLen = draft.length;
  const enough = draftLen >= MIN_DAILY;
  const essayLen = essay.length;
  const essayLenColor = essayLen > 1800 ? "#ef4444" : "#FF6D00";

  const handleSave = () => {
    if (!enough || doneToday) return;
    const newText = draft.trim();
    const combined = essay ? essay + "\n\n" + newText : newText;
    const { text: finalText, trimmed } = trimToSentenceStart(combined, MAX_ESSAY);
    setEssay(finalText);
    setTrimmedNotice(trimmed);
    setDoneToday(true);
    setPracticeDone("essay", true);
    setTodayAdded(newText.length);
    setDraft("");
    try {
      localStorage.setItem(ESSAY_KEY, finalText);
      localStorage.setItem(DONE_KEY, todayStr());
      localStorage.setItem(TODAY_ADDED_KEY, String(newText.length));
    } catch {
      /* ignore */
    }
  };

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
          Жизнь моей мечты
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
            {doneToday ? "✅" : "✍️"}
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
                ? `+${todayAdded} символов · +1 ⭐`
                : `Напиши минимум ${MIN_DAILY} символов сегодня`}
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

      {/* Моё сочинение */}
      <section className="mt-3">
        <p
          className="px-1 text-[11px] font-medium uppercase tracking-wider mb-2"
          style={{ color: "#9ca3af" }}
        >
          Моё сочинение
        </p>

        {trimmedNotice && (
          <div
            className="mb-2 rounded-xl px-3 py-2 text-[12px]"
            style={{ background: "#fff3e0", color: "#92400e" }}
          >
            ✂️ Начало сочинения было обрезано — добавлено новое
          </div>
        )}

        <div className="bg-card hairline rounded-2xl shadow-card overflow-hidden">
          <div
            ref={essayBoxRef}
            style={{
              maxHeight: 1400,
              overflowY: "auto",
              fontSize: 14,
              lineHeight: 1.8,
              padding: "14px 16px",
              whiteSpace: "pre-wrap",
              color: essay ? "#1f2937" : "#9ca3af",
            }}
          >
            {essay || "Здесь появится твоё сочинение о жизни мечты. Начни писать ниже."}
          </div>
          <div
            className="px-4 py-2 flex items-center justify-between"
            style={{ borderTop: "1px solid #ede8df", background: "#fafaf7" }}
          >
            <span className="text-[12px]">
              Символов:{" "}
              <span className="font-bold tabular-nums" style={{ color: essayLenColor }}>
                {essayLen}
              </span>{" "}
              <span style={{ color: "#9ca3af" }}>/ {MAX_ESSAY}</span>
            </span>
            <span className="text-[10px]" style={{ color: "#9ca3af" }}>
              прокрути вверх чтобы читать
            </span>
          </div>
        </div>
      </section>

      {/* Добавить сегодня */}
      <section className="mt-3">
        <div className="bg-card hairline rounded-2xl shadow-card p-4">
          <p
            className="text-[11px] font-medium uppercase tracking-wider mb-2"
            style={{ color: "#9ca3af" }}
          >
            Добавить сегодня
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={doneToday}
            placeholder="Продолжи своё сочинение... Пиши в настоящем времени: «Я живу», «Я чувствую», «Рядом со мной»..."
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              lineHeight: 1.7,
              minHeight: 90,
              resize: "none",
              color: "#1f2937",
              opacity: doneToday ? 0.6 : 1,
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px]" style={{ color: "#9ca3af" }}>
              Минимум {MIN_DAILY} символов
            </span>
            <span
              className="text-[12px] font-medium tabular-nums shrink-0"
              style={{ color: enough ? "#16a34a" : "#9ca3af" }}
            >
              {enough
                ? "✓ достаточно для сохранения"
                : `нужно ещё ${MIN_DAILY - draftLen} символов`}
            </span>
          </div>
        </div>
      </section>

      {/* Кнопка сохранить */}
      <section className="mt-4">
        <button
          onClick={handleSave}
          disabled={!enough || doneToday}
          className="tap w-full"
          style={{
            background:
              !enough || doneToday
                ? "#e5e7eb"
                : "linear-gradient(135deg, #FFB300, #FF6D00)",
            color: !enough || doneToday ? "#9ca3af" : "#fff",
            fontWeight: 700,
            borderRadius: 16,
            padding: 16,
            fontSize: 15,
            cursor: !enough || doneToday ? "default" : "pointer",
            boxShadow:
              !enough || doneToday ? "none" : "0 4px 14px rgba(255,109,0,0.35)",
          }}
        >
          {doneToday ? "✅ Сохранено" : "Сохранить и засчитать"}
        </button>
      </section>

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
                  title="✍️ Жизнь моей мечты"
                  text={`Каждый день ты пишешь продолжение сочинения своей идеальной жизни. Не план, не цели — а живую картину: как выглядит твой день, что ты чувствуешь, кто рядом, где ты находишься. Образ мечты постоянно в сознании — не как далёкая фантазия, а как знакомое место куда ты возвращаешься каждый день.`}
                />
                <HowCard
                  title="🎯 Как выполнять?"
                  text={`Пиши минимум 200 символов в день — это примерно 2-3 предложения. Сочинение растёт до 2000 символов. Когда заполнится — первые предложения сверху будут стираться по мере добавления новых снизу. Это нормально: обновляй, дополняй, детализируй.`}
                >
                  <div
                    className="mt-3 rounded-xl p-3 text-[13px] leading-snug"
                    style={{
                      background: "#fff3e0",
                      color: "#92400e",
                      border: "1px solid #ffe0b2",
                    }}
                  >
                    ☝️ Пиши в настоящем времени: «Я живу», «Я чувствую», «Рядом
                    со мной» — не «я буду» или «я хочу». Мозг воспринимает это
                    как реальность уже сейчас.
                  </div>
                </HowCard>
                <HowCard
                  title="💎 Что ты получаешь?"
                  text={`Ясное и детальное видение своего будущего. Мечта перестаёт быть туманной — она становится конкретной, живой, знакомой. Мозг начинает искать пути к тому, что он уже «знает».

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
                    В видео объясняется как писать сочинение, почему важно
                    настоящее время и как этот инструмент меняет мышление.
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
