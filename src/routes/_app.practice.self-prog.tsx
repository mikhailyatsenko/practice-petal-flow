import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronDown, Play, Mic, Square, Check } from "lucide-react";
import { setPracticeDone } from "@/lib/practicesStore";

export const Route = createFileRoute("/_app/practice/self-prog")({
  head: () => ({
    meta: [
      { title: "Программирование успеха — Клуб «Моя жизнь»" },
      {
        name: "description",
        content:
          "Ежедневная аффирмация: программируй мышление успеха через слово, произнесённое вслух с верой.",
      },
    ],
  }),
  component: SelfProgScreen,
});

// ===== Константы =====

const LEVELS = [
  "0️⃣ Молчащий 🤐",
  "1️⃣ Программирующий 🗣️",
  "2️⃣ Эксперт слова 📝",
  "3️⃣ Хранитель формул 📜",
  "4️⃣ Программист сознания 🧠",
  "5️⃣ Мастер аффирмаций 💬",
  "6️⃣ Укротитель подсознания 🌀",
  "7️⃣ Повелитель убеждений 👑",
  "8️⃣ Архитектор мышления 🏛️",
  "9️⃣ Владыка установок ⚡",
  "🔟 Бог самопрограммирования 🌟",
];

const DEFAULT_AFFIRMATION = `Я — человек, который легко воплощает свои желания в жизнь. Быть успешным — это моя норма!

Успех — это просто привычка доводить свои намерения до результата, и я делаю это естественно и радостно каждый день.

Ежедневно доводя маленькие намерения до конца, я тренирую мышцу воплощения. Я замечаю — эта же сила, привычки доводить до конца, начинает работать на мои значимые и вдохновляющие цели. То, что раньше казалось большим — теперь воплощается так же естественно.

Я и Творец — одно целое. У меня та же сила, что и у Творца. Через меня течёт сила самой Вселенной. Жизнь идёт туда, куда я ей показываю. У неё нет другого маршрута, кроме того, который я проецирую своим сознанием. Мы всегда приходим туда, что видим внутри себя — так устроена жизнь.

Я благодарю себя за то, что каждый день выполняю 5 главных привычек и закручиваю маховик успеха — это создаёт восходящую спираль всё лучшей и лучшей жизни.

С каждым днём я чувствую всё больше и больше силы, уверенности, ощущения могущества.

Из-за того, что я проецирую самое прекрасное видение будущего, я каждый день ощущаю радость, энтузиазм и вдохновение жить и творить. Моё прекрасное будущее заряжает меня энергией прямо сейчас.

Я замечаю, как притягиваю нужных людей, обстоятельства, и вижу, как открываются двери возможностей, которые ведут меня к моим целям и желаниям. Я живу в гармонии и радости, потому что имею внутреннее видение и ощущение прекрасного будущего.

С каждым днём я становлюсь всё успешнее и успешнее. С каждым днём я становлюсь всё увереннее и увереннее. С каждым днём я становлюсь всё могущественнее и могущественнее.

Я властелин своей судьбы. Я господин своей жизни. Я творю. Я воплощаю. Я процветаю.`;

const STORAGE_KEY = "self-prog-affirmation";
const DONE_KEY = "self-prog-done-v2";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// ===== Главный экран =====

function SelfProgScreen() {
  const navigate = useNavigate();
  const [affirmation, setAffirmation] = useState<string>(DEFAULT_AFFIRMATION);
  const [doneToday, setDoneToday] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");

  // Демо: серия 17 дней => уровень 0, прогресс 17/30
  const streakDays = 17;

  useEffect(() => {
    try {
      const a = localStorage.getItem(STORAGE_KEY);
      if (a) setAffirmation(a);
      const d = localStorage.getItem(DONE_KEY);
      if (d === todayStr()) {
        setDoneToday(true);
        setPracticeDone("self-prog", true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const level = useMemo(() => Math.min(Math.floor(streakDays / 30), 10), [streakDays]);
  const progressInLevel = streakDays % 30;
  const levelName = LEVELS[level];

  const handleSpeak = () => {
    const next = !doneToday;
    setDoneToday(next);
    setPracticeDone("self-prog", next);
    try {
      if (next) {
        localStorage.setItem(DONE_KEY, todayStr());
      } else {
        localStorage.removeItem(DONE_KEY);
      }
    } catch {
      /* ignore */
    }
  };

  const saveAffirmation = (text: string) => {
    setAffirmation(text);
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch {
      /* ignore */
    }
    setEditorOpen(false);
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
          Программирование успеха
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
            {doneToday ? "✅" : "🎙"}
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
                ? "Бот засчитал привычку · +1 ⭐"
                : "Проговори аффирмацию минимум 1 минуту"}
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

      {/* 4. Запись — sticky сверху, чтобы читать аффирмацию ниже */}
      <section
        className="mt-3 sticky z-20"
        style={{ top: 8 }}
      >
        <p
          className="px-1 text-[11px] font-medium uppercase tracking-wider mb-2"
          style={{ color: "#9ca3af" }}
        >
          Вариант 1 — прямо здесь
        </p>
        <Recorder doneToday={doneToday} onComplete={handleSpeak} />
      </section>

      {/* 5. Моя аффирмация — показываем целиком, читаем пока крутим вниз */}
      <section className="mt-4 bg-card hairline rounded-2xl shadow-card p-4">
        <p
          className="text-[11px] font-medium uppercase tracking-wider mb-2"
          style={{ color: "#9ca3af" }}
        >
          Моя аффирмация
        </p>
        <p className="text-[14px] leading-relaxed whitespace-pre-line">
          {affirmation}
        </p>
        <button
          onClick={() => setEditorOpen(true)}
          className="tap mt-3 w-full rounded-xl py-2.5 text-[14px] font-medium"
          style={{
            border: "1.5px solid #FF6D00",
            color: "#FF6D00",
            background: "transparent",
          }}
        >
          ✏️ Изменить аффирмацию
        </button>
      </section>

      {/* 6. Вариант 2 — проговорить в боте */}
      <section className="mt-4">
        <p
          className="px-1 text-[11px] font-medium uppercase tracking-wider mb-2"
          style={{ color: "#9ca3af" }}
        >
          Вариант 2 — в боте
        </p>
        <button
          onClick={handleSpeak}
          className="tap w-full"
          style={{
            background: doneToday
              ? "#d1d5db"
              : "linear-gradient(135deg, #FFB300, #FF6D00)",
            color: doneToday ? "#6b7280" : "#fff",
            fontWeight: 700,
            borderRadius: 16,
            padding: 17,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: doneToday ? "none" : "0 4px 14px rgba(255,109,0,0.35)",
          }}
        >
          {doneToday ? "✅ Выполнено сегодня" : "🤖 Открыть бота и проговорить"}
        </button>
        <p
          className="mt-2 text-[12px] leading-snug px-1 text-center"
          style={{ color: "#9ca3af" }}
        >
          Откроется бот — проговори аффирмацию голосом минимум 1 минуту
        </p>
      </section>


      {/* 6. Как это работает */}
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
            {/* Переключатель Текст / Видео */}
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
                  title="⚡ Программирование успеха"
                  text="Мы становимся тем, кем ощущаем себя внутри. Если ты убеждён, что ты успешный, уверенный, достигающий целей человек — твой мозг начинает работать именно так, подбирая соответствующие мысли, решения и действия. Слово, произнесённое вслух с убеждённостью — это не просто звук. Это программа, которую вшиваешь в свою личность. И когда эта программа записана — она становится самоисполняющимся пророчеством."
                />
                <HowCard
                  title="🎯 Как выполнять?"
                  text='Нажми «Проговорить аффирмацию» и читай текст вслух — не монотонно, а с эмоцией и верой. ✅ 1 минута записи — и практика дня засчитана. В клубе есть готовая аффирмация как отправная точка. Но мы настоятельно рекомендуем создать свою — под твои конкретные желания, цели и образ того человека, которым ты хочешь стать.'
                >
                  <div
                    className="mt-3 rounded-xl p-3 text-[13px] leading-snug"
                    style={{
                      background: "#fff3e0",
                      color: "#92400e",
                      border: "1px solid #ffe0b2",
                    }}
                  >
                    ☝️ Собственная аффирмация, написанная под твои конкретные
                    желания и цели — работает в разы сильнее готовой. Инвестируй
                    15 минут и создай свою.
                  </div>
                </HowCard>
                <HowCard
                  title="🤖 Что происходит в боте?"
                  text="Бот распознаёт твою речь и засчитывает выполнение после того, как ты наговорил нужный минимум. Никто кроме тебя не слышит запись — это личная практика."
                />
                <HowCard
                  title="💎 Что ты получаешь?"
                  text="Со временем ты заметишь, что старые сомнения и негативные мысли о себе уходят. На их место приходят уверенность, внутренняя сила и ощущение «я могу». Это не магия — это нейронаука: повторение формирует новые нейронные связи. 🏆 Награда: +1 очко ежедневно за выполнение."
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
                    7:00
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[13px] leading-snug text-foreground">
                    В видео подробно объясняется как работает раздел, что такое
                    аффирмация, как её правильно проговаривать и как создать
                    свою.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 7. Экран редактирования (фуллскрин-оверлей) */}
      {editorOpen && (
        <AffirmationEditor
          initial={affirmation}
          onClose={() => setEditorOpen(false)}
          onSave={saveAffirmation}
        />
      )}
    </div>
  );
}

// ===== Карточка «Как это работает» =====

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
    <div
      className="bg-card shadow-card p-4"
      style={{ borderRadius: 14 }}
    >
      <p className="text-[14px] font-semibold mb-2">{title}</p>
      <p className="text-[13px] leading-snug text-foreground/85">{text}</p>
      {children}
    </div>
  );
}

// ===== Экран редактирования аффирмации =====

function AffirmationEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: string;
  onClose: () => void;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [text]);

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-background">
      <div className="px-4 pt-2 pb-8 safe-top safe-bottom">
        {/* Хедер */}
        <div className="relative flex items-center mb-3 min-h-[36px]">
          <button
            onClick={onClose}
            className="tap inline-flex items-center gap-1 text-[14px] font-medium text-[#FF6D00]"
          >
            <ChevronLeft className="h-5 w-5" /> Назад
          </button>
          <h1 className="text-[15px] font-semibold absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            Моя аффирмация
          </h1>
          <div className="ml-auto" style={{ width: 80 }} />
        </div>

        {/* Инфо-блок */}
        <div
          className="rounded-2xl px-4 py-3 text-[13px] leading-snug"
          style={{ background: "#fff3e0", color: "#92400e" }}
        >
          По умолчанию используется аффирмация клуба. Ты можешь заменить её
          своей — или отредактировать в любой момент.
        </div>

        {/* Карточка с textarea */}
        <div className="mt-3 bg-card hairline rounded-2xl shadow-card p-4">
          <textarea
            ref={taRef}
            value={text}
            maxLength={4000}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введи свою аффирмацию…"
            className="w-full resize-none bg-transparent outline-none border-0 text-[14px] leading-snug"
            style={{ minHeight: 200 }}
          />
          <div
            className="mt-3 pt-2 text-right text-[11px] tabular-nums"
            style={{ borderTop: "1px solid #ede8df", color: "#9ca3af" }}
          >
            {text.length} / 4000
          </div>
        </div>

        {/* Сохранить */}
        <button
          onClick={() => onSave(text)}
          className="tap mt-4 w-full"
          style={{
            background: "linear-gradient(135deg, #FFB300, #FF6D00)",
            color: "#fff",
            fontWeight: 700,
            borderRadius: 16,
            padding: 16,
            fontSize: 15,
            boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
          }}
        >
          Сохранить аффирмацию
        </button>
      </div>
    </div>
  );
}

// ===== Recorder (визуальная имитация записи) =====

const REQUIRED_SECONDS = 60;
const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function Recorder({
  doneToday,
  onComplete,
}: {
  doneToday: boolean;
  onComplete: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Псевдо-уровни для визуализации волны
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: 28 }, () => 0.2),
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = () => {
    if (doneToday) return;
    setRecording(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
      setLevels((prev) =>
        prev.map(() => 0.25 + Math.random() * 0.75),
      );
    }, 1000);
  };

  const stop = () => {
    setRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLevels((prev) => prev.map(() => 0.2));
  };

  const reset = () => {
    stop();
    setSeconds(0);
  };

  const canFinish = seconds >= REQUIRED_SECONDS;
  const progress = Math.min(seconds / REQUIRED_SECONDS, 1);

  if (doneToday) {
    return (
      <div
        className="rounded-2xl px-4 py-5 flex items-center justify-center gap-2"
        style={{ background: "#dcfce7", color: "#15803d" }}
      >
        <Check className="h-5 w-5" strokeWidth={3} />
        <span className="text-[14px] font-semibold">Запись засчитана</span>
      </div>
    );
  }

  return (
    <div
      className="hairline rounded-2xl shadow-card p-3"
      style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "saturate(180%) blur(8px)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Кнопка микрофона */}
        <button
          onClick={recording ? stop : start}
          aria-label={recording ? "Остановить запись" : "Начать запись"}
          className="tap rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 52,
            height: 52,
            background: recording
              ? "#dc2626"
              : "linear-gradient(135deg, #FFB300, #FF6D00)",
            color: "#fff",
            boxShadow: recording
              ? "0 0 0 5px rgba(220,38,38,0.18)"
              : "0 4px 14px rgba(255,109,0,0.4)",
            transition: "all 200ms ease-out",
          }}
        >
          {recording ? (
            <Square className="h-5 w-5 fill-white" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>

        {/* Центр: таймер + прогресс + волна */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[20px] font-bold tabular-nums leading-none"
              style={{ color: recording ? "#FF6D00" : "#1f2937" }}
            >
              {formatTime(seconds)}
            </span>
            <span className="text-[11px]" style={{ color: "#9ca3af" }}>
              / {formatTime(REQUIRED_SECONDS)}
            </span>
          </div>
          <div
            className="mt-1.5 h-1.5 rounded-full overflow-hidden"
            style={{ background: "#ede8df" }}
          >
            <div
              className="h-full"
              style={{
                width: `${progress * 100}%`,
                background: canFinish
                  ? "#16a34a"
                  : "linear-gradient(90deg, #FFB300, #FF6D00)",
                transition: "width 400ms ease-out",
              }}
            />
          </div>
        </div>

        {/* Засчитать — компактная кнопка справа */}
        <button
          onClick={() => {
            stop();
            onComplete();
          }}
          disabled={!canFinish}
          className="tap rounded-xl shrink-0 text-[12px] font-bold"
          style={{
            background: canFinish
              ? "linear-gradient(135deg, #16a34a, #15803d)"
              : "#e5e7eb",
            color: canFinish ? "#fff" : "#9ca3af",
            padding: "10px 12px",
            cursor: canFinish ? "pointer" : "not-allowed",
            boxShadow: canFinish ? "0 4px 12px rgba(22,163,74,0.35)" : "none",
          }}
        >
          {canFinish ? "✅ Засчитать" : "⏳ 1 мин"}
        </button>
      </div>

      {/* Подсказка / сброс */}
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <p
          className="text-[11px] leading-snug truncate"
          style={{ color: recording ? "#b45309" : "#9ca3af" }}
        >
          {recording
            ? "🔴 Идёт запись… читай аффирмацию ниже"
            : seconds === 0
            ? "Нажми микрофон и листай вниз — читай аффирмацию"
            : canFinish
            ? "Минута набрана — можешь засчитать"
            : "Запись на паузе"}
        </p>
        {seconds > 0 && !recording && (
          <button
            onClick={reset}
            className="tap text-[11px] font-medium shrink-0"
            style={{ color: "#6b7280", textDecoration: "underline" }}
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}
