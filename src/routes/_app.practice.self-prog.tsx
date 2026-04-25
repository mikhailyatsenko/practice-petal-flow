import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronDown, Play } from "lucide-react";

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
const DONE_KEY = "self-prog-done";
const STREAK_KEY = "self-prog-streak"; // { days: number }

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function SelfProgScreen() {
  const navigate = useNavigate();
  const [affirmation, setAffirmation] = useState<string>(DEFAULT_AFFIRMATION);
  const [doneToday, setDoneToday] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");
  // Демо: серия 17 дней, уровень 1 (Программирующий)
  const [streakDays] = useState(17);

  useEffect(() => {
    try {
      const a = localStorage.getItem(STORAGE_KEY);
      if (a) setAffirmation(a);
      const d = localStorage.getItem(DONE_KEY);
      if (d === todayStr()) setDoneToday(true);
    } catch {
      /* ignore */
    }
  }, []);

  const level = useMemo(() => Math.min(Math.floor(streakDays / 30), 10), [streakDays]);
  const progressInLevel = streakDays % 30;
  const levelName = LEVELS[level];

  const handleSpeak = () => {
    if (doneToday) return;
    // Демо: засчитываем сразу
    setDoneToday(true);
    try {
      localStorage.setItem(DONE_KEY, todayStr());
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

  void STREAK_KEY;

  return (
    <div className="px-4 pt-2 pb-6">
      {/* Хедер */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="tap inline-flex items-center gap-1 text-[14px] font-medium text-[#FF6D00]"
        >
          <ChevronLeft className="h-5 w-5" /> Главная
        </button>
        <h1 className="text-[15px] font-semibold absolute left-1/2 -translate-x-1/2">
          Программирование успеха
        </h1>
        <div style={{ width: 80 }} />
      </div>

      {/* Блок «Сегодня» */}
      <section className="mt-2">
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: doneToday ? "#dcfce7" : "#fff3e0",
          }}
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

      {/* Моя аффирмация */}
      <section className="mt-3 bg-card hairline rounded-2xl shadow-card p-4">
        <p
          className="text-[11px] font-medium uppercase tracking-wider mb-2"
          style={{ color: "#9ca3af" }}
        >
          Моя аффирмация
        </p>
        <div className="relative">
          <p
            className="text-[14px] leading-snug whitespace-pre-line"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {affirmation}
          </p>
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 26,
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0), #fff)",
              pointerEvents: "none",
            }}
          />
        </div>
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

      {/* Кнопка «Проговорить» */}
      <section className="mt-4">
        <button
          onClick={handleSpeak}
          disabled={doneToday}
          className="tap w-full text-white"
          style={{
            background: doneToday
              ? "#d1d5db"
              : "linear-gradient(135deg, #FFB300, #FF6D00)",
            color: doneToday ? "#6b7280" : "#fff",
            fontWeight: 700,
            borderRadius: 16,
            padding: 17,
            fontSize: 15,
            cursor: doneToday ? "not-allowed" : "pointer",
            boxShadow: doneToday ? "none" : "0 4px 14px rgba(255,109,0,0.35)",
          }}
        >
          {doneToday ? "✅ Выполнено сегодня" : "🎙 Проговорить аффирмацию"}
        </button>
        <p
          className="mt-2 text-[12px] leading-snug px-1"
          style={{ color: "#9ca3af" }}
        >
          Нажми на кнопку «Проговорить аффирмацию» — откроется бот, проговори
          аффирмацию голосом минимум 1 минуту
        </p>
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
            {/* Переключатель */}
            <div
              className="flex p-1 rounded-xl mb-3"
              style={{ background: "#f0ebe2" }}
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
                    желания и цели — работает в разы сильнее готовой.
                    Инвестируй 15 минут и создай свою.
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
                  <p className="text-[14px] leading-snug">
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

      {editorOpen && (
        <AffirmationEditor
          initial={affirmation}
          onCancel={() => setEditorOpen(false)}
          onSave={saveAffirmation}
        />
      )}
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
      <h3 className="text-[14px] font-semibold mb-1.5">{title}</h3>
      <p className="text-[13px] leading-snug text-[#3a2f20]">{text}</p>
      {children}
    </div>
  );
}

function AffirmationEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: string;
  onCancel: () => void;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  const isDirty = text !== initial;
  const canSave = text.trim().length > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fafaf7",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        animation: "fade-in 0.2s ease-out",
      }}
    >
      <div className="mx-auto w-full max-w-md flex flex-col h-full">
        <div className="flex items-center px-4 py-3 border-b border-border/60 bg-background">
          <button
            onClick={onCancel}
            className="tap inline-flex items-center gap-1 text-[14px] font-medium text-[#FF6D00]"
          >
            <ChevronLeft className="h-5 w-5" /> Назад
          </button>
          <h2 className="text-[15px] font-semibold absolute left-1/2 -translate-x-1/2">
            Моя аффирмация
          </h2>
        </div>

        <div className="flex-1 overflow-auto px-4 py-4">
          <div
            className="rounded-xl p-3 text-[13px] leading-snug mb-3"
            style={{
              background: "#fff3e0",
              color: "#92400e",
              border: "1px solid #ffe0b2",
            }}
          >
            По умолчанию используется аффирмация клуба. Ты можешь заменить её
            своей — или отредактировать в любой момент.
          </div>

          <div className="bg-card rounded-2xl shadow-card p-3 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4000}
              className="w-full bg-transparent border-0 outline-none resize-none text-[14px] leading-relaxed"
              style={{ minHeight: 320 }}
            />
            <div
              className="text-right text-[11px] mt-1"
              style={{ color: "#9ca3af" }}
            >
              {text.length} / 4000
            </div>
          </div>
        </div>

        <div className="px-4 pb-5 pt-2 bg-background border-t border-border/60">
          {isDirty && (
            <p
              className="text-[12px] mb-2 text-center"
              style={{ color: "#FF6D00", fontWeight: 600 }}
            >
              ● Несохранённые изменения
            </p>
          )}
          <button
            onClick={() => canSave && onSave(text)}
            disabled={!canSave}
            className="tap w-full"
            style={{
              background: canSave
                ? "linear-gradient(135deg, #FFB300, #FF6D00)"
                : "#f3f4f6",
              color: canSave ? "#fff" : "#9ca3af",
              fontWeight: 700,
              borderRadius: 16,
              padding: 15,
              fontSize: 15,
              cursor: canSave ? "pointer" : "not-allowed",
              boxShadow: canSave ? "0 4px 14px rgba(255,109,0,0.35)" : "none",
            }}
          >
            Сохранить аффирмацию
          </button>
        </div>
      </div>
    </div>
  );
}
