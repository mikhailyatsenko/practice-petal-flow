import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { LevelTaskSheet, type LevelTaskContent } from "./LevelTaskSheet";
import { usePreviewLevel, setPreviewLevel, type PreviewLevel } from "@/lib/previewLevel";
import { useLevel1DoneMode, setLevel1DoneMode } from "@/lib/level1DoneMode";
import { useLevel2DoneMode, setLevel2DoneMode } from "@/lib/level2DoneMode";
import { useLevel3DoneMode, setLevel3DoneMode } from "@/lib/level3DoneMode";
import { useLevel4DoneMode, setLevel4DoneMode } from "@/lib/level4DoneMode";


interface LevelStep {
  id: string;
  label: string;
  done: boolean;
}

interface Level {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  steps: LevelStep[];
  progress?: { done: number; total: number; unit?: string };
  footer?: string;
  reward: string | string[];
  task: LevelTaskContent;
}

const LEVELS: Level[] = [
  {
    id: "l1",
    title: "Старт пути",
    subtitle: "Создай желания и первую цель",
    emoji: "🌱",
    gradient: "linear-gradient(135deg, #993C1D, #D85A30)",
    steps: [
      { id: "s1", label: "Создать 5 желаний", done: false },
      { id: "s2", label: "Создать 1 цель", done: false },
    ],
    reward: "🤝 Открывается Бадди",
    task: {
      videoTitle: "Как выполнить уровень 1 — Старт пути",
      caption: "Введение • Уровень 1",
      duration: "8:42",
      description: "Создай 5 желаний и поставь первую цель.",
      videoDescription:
        "Аркадий объясняет с чего начать в клубе, как сформулировать свои первые желания и поставить цель. Посмотри видео перед тем как начать — это поможет сделать всё правильно с первого раза.",
      videoChapters: [
        { time: "0:00", title: "Зачем нужны желания и цели" },
        { time: "2:15", title: "Как сформулировать 5 желаний" },
        { time: "4:30", title: "Как поставить первую цель" },
        { time: "6:50", title: "Что делать после старта" },
      ],
      tasks: [
        {
          title: "Создать 5 желаний",
          description:
            "Желания — это то с чего всё начинается. Когда ты записываешь свои желания, ты делаешь первый шаг к тому чтобы они начали сбываться. Желание — это не цель с планом, это просто то чего ты хочешь. Запиши 5 желаний которые для тебя важны прямо сейчас.",
          active: true,
          goTo: "Желания → Создать желание",
        },
        {
          title: "Создать 1 цель",
          description:
            "После того как ты записал желания, выбери одно которое хочешь превратить в цель. Цель отличается от желания тем что у неё есть конкретный результат и срок. Поставь свою первую цель — это шаг к тому чтобы начать действовать.",
        },
      ],
    },
  },
  {
    id: "l2",
    title: "Найди Бадди",
    subtitle: "Соединись и заполни карточку",
    emoji: "🤝",
    gradient: "linear-gradient(135deg, #185FA5, #378ADD)",
    steps: [
      { id: "s1", label: "Соединиться с Бадди", done: false },
      { id: "s2", label: "Созвониться и заполнить карточку Бадди", done: false },
    ],
    reward: [
      "⚙️ Открывается Маховик успеха (пять главных привычек)",
      "⭐ +2 очка в день за Бадди",
    ],
    task: {
      videoTitle: "Как выполнить уровень 2 — Бадди",
      caption: "Введение • Уровень 2",
      duration: "8:00",
      description: "Найди Бадди, созвонись и заполни его карточку.",
      videoDescription:
        "Аркадий объясняет зачем нужен Бадди, как его найти в комьюнити, как провести первый созвон и что писать в карточке Бадди после разговора. Посмотри это видео — оно поможет с первого раза сделать всё правильно.",
      videoChapters: [
        { time: "0:00", title: "Зачем нужен Бадди и как это работает" },
        { time: "2:15", title: "Как найти Бадди в разделе Комьюнити" },
        { time: "4:30", title: "Как провести первый созвон — формат и советы" },
        { time: "6:50", title: "Как заполнить карточку Бадди после созвона" },
      ],
      tasks: [
        {
          title: "Соединиться с Бадди",
          description:
            "Зайди в раздел Комьюнити → Мой Бадди и найди человека с которым ты будешь идти в паре. Бадди — это твой напарник, с которым вы поддерживаете друг друга и держите ритм. Отправь запрос или прими входящий — и вы соединены.",
          active: true,
          goTo: "Комьюнити → Мой Бадди",
        },
        {
          title: "Созвониться и заполнить карточку Бадди",
          description:
            "После соединения договоритесь о созвоне. На созвоне познакомьтесь, расспроси Бадди о его цели, желаниях, сильных сторонах и о том в чём ему нужна поддержка. После созвона зайди в карточку Бадди и заполни её — это поможет вам обоим лучше друг друга поддерживать.",
          goTo: "Комьюнити → Мой Бадди → Заполнить карточку Бадди",
        },
      ],
    },
  },
  {
    id: "l3",
    title: "Активируй маховик успеха",
    subtitle: "Сделай Хит 5 из 5 семь дней подряд",
    emoji: "⚙️",
    gradient: "linear-gradient(135deg, #7A4A00, #E88200)",
    progress: { done: 0, total: 7, unit: "дней" },
    steps: [
      { id: "s1", label: "Сделать Хит 5/5 — 7 дней подряд", done: false },
    ],
    reward: [
      "👥 Открывается Четвёрка",
      "🔑 Открывается возможность сделать клуб бесплатным",
      "💥 +50 очков за прохождение уровня",
    ],
    task: {
      videoTitle: "Как выполнить уровень 3 — Активировать маховик",
      caption: "Введение • Уровень 3",
      duration: "6:30",
      description: "Сделай Хит 5/5 семь дней подряд и активируй свой маховик успеха.",
      videoDescription:
        "Аркадий объясняет что такое маховик успеха и почему семь дней подряд Хита 5/5 — это тот момент, когда он начинает крутиться сам. В видео — как удержать ритм всех пяти практик, что делать, если сорвался, и как поддержать себя на этой неделе.",
      videoChapters: [
        { time: "0:00", title: "Что такое маховик успеха" },
        { time: "1:40", title: "Почему именно 5 из 5 и 7 дней подряд" },
        { time: "3:20", title: "Как удержать ритм и не сорваться" },
        { time: "5:00", title: "Что произойдёт после активации" },
      ],
      tasks: [
        {
          title: "Сделать Хит 5/5 — 7 дней подряд",
          description:
            "Хит 5/5 — это день, когда ты выполнил все пять своих практик. Твоя задача — собрать 7 таких дней подряд, без пропусков. Если пропустил хоть один день — счётчик сбрасывается. Это активирует маховик успеха и открывает доступ к Четвёрке.",
          active: true,
          goTo: "Маховик успеха → Сегодняшние практики",
        },
      ],
    },
  },
  {
    id: "l4",
    title: "Создай Четвёрку",
    subtitle: "Объединись с другой парой",
    emoji: "👥",
    gradient: "linear-gradient(135deg, #0F6E56, #1D9E75)",
    steps: [
      { id: "s1", label: "Создать Четвёрку", done: false },
      { id: "s2", label: "Заполнить карточки участников второй пары", done: false },
    ],
    reward: [
      "🔰 Открывается Страховка от пропуска",
      "❄️ Открывается Заморозка клуба",
      "⭐ +2 очка в день за Четвёрку",
    ],
    task: {
      videoTitle: "Как выполнить уровень 4 — Четвёрка",
      caption: "Введение • Уровень 4",
      duration: "9:00",
      description: "Объединись с другой парой и сделайте 7 хитов подряд.",
      videoDescription:
        "Аркадий рассказывает зачем нужна Четвёрка, как объединиться с другой парой Бадди, как организовать совместный ритм и что такое Хит — общая практика которую вы делаете все вместе. Это видео поможет вам быстро войти в формат и не сорваться на старте.",
      videoChapters: [
        { time: "0:00", title: "Зачем нужна Четвёрка и как она работает" },
        { time: "2:10", title: "Как найти вторую пару и соединиться" },
        { time: "4:40", title: "Что такое Хит и как сделать его всем вместе" },
        { time: "7:00", title: "Как удержать ритм 7 дней подряд" },
      ],
      tasks: [
        {
          title: "Создать Четвёрку",
          description:
            "Найди вторую пару Бадди и соединитесь в Четвёрку. Четвёрка — это две пары которые идут вместе, поддерживают друг друга и делают практики синхронно. Задание засчитывается когда ты и твой Бадди объединились со второй парой и Четвёрка полностью сформирована.",
          active: true,
          goTo: "Комьюнити → Четвёрка",
        },
        {
          title: "Заполнить карточки участников второй пары",
          description:
            "После того как Четвёрка сформирована, заполни карточки двух новых участников — второй пары. Карточку своего Бадди повторно заполнять не нужно. Это поможет вам лучше узнать друг друга и поддерживать в ритме.",
          goTo: "Комьюнити → Четвёрка → Карточки участников",
        },
      ],
    },
  },
  {
    id: "l5",
    title: "Изучи формулу",
    subtitle: "Книга + ИИ-тест",
    emoji: "📖",
    gradient: "linear-gradient(135deg, #412402, #854F0B)",
    steps: [
      { id: "s1", label: "Прослушать «Закон притяжения» 6 ч", done: false },
      { id: "s2", label: "Сдать тест ИИ на 50%", done: false },
    ],
    reward: [
      "🛍️ Открывается Разделы магазинов",
      "💯 +100 бонусных очков",
    ],
    task: {
      videoTitle: "Как выполнить уровень 5 — Формула",
      caption: "Введение • Уровень 5",
      duration: "12:00",
      description: "Прослушай книгу «Закон притяжения» и сдай тест ИИ на 50%+.",
      videoDescription:
        "Аркадий объясняет как устроена формула успеха, зачем нужно прослушать книгу «Закон притяжения» полностью и как проходит ИИ-тест. Это видео поможет тебе подойти к материалу осознанно и пройти тест с первого раза.",
      videoChapters: [
        { time: "0:00", title: "Зачем нужна формула и эта книга" },
        { time: "2:30", title: "Как слушать книгу — режим и темп" },
        { time: "5:40", title: "Как проходит ИИ-тест и что он проверяет" },
        { time: "9:00", title: "Советы как сдать с первого раза" },
      ],
      tasks: [
        {
          title: "Прослушать «Закон притяжения» 6 ч",
          description:
            "Зайди в Библиотеку знаний, открой книгу «Закон притяжения» и прослушай её полностью — это около 6 часов. Слушай вдумчиво, можешь делать паузы и возвращаться к важным моментам. Эта книга — основа формулы, по которой работает весь клуб.",
          active: true,
          goTo: "Библиотека знаний → Закон притяжения",
        },
        {
          title: "Сдать тест ИИ на 50%",
          description:
            "После того как прослушал книгу, пройди ИИ-тест. Он проверит насколько ты усвоил ключевые идеи. Чтобы пройти уровень — нужно набрать минимум 50%. Если не получилось с первого раза — можно пересдать.",
          goTo: "Библиотека знаний → ИИ-тест",
        },
      ],
    },
  },
  {
    id: "l6",
    title: "Закрепись",
    subtitle: "Хит 30 дней подряд",
    emoji: "🏆",
    gradient: "linear-gradient(135deg, #3B6D11, #639922)",
    progress: { done: 0, total: 30, unit: "дней" },
    steps: [
      { id: "s1", label: "Сделать Хит 30 дней подряд", done: false },
    ],
    reward: ["🏆 +200 бонусных очков"],
    task: {
      videoTitle: "Как выполнить уровень 6 — 30 хитов",
      caption: "Введение • Уровень 6",
      duration: "7:00",
      description: "Сделай Хит 30 дней подряд — все 5 практик каждый день без пропуска.",
      videoDescription:
        "Аркадий объясняет почему именно 30 дней подряд — это тот момент когда привычка закрепляется и становится частью жизни. В видео — как не сорваться, что делать в трудные дни и как поддерживать друг друга в Четвёрке чтобы дойти до конца.",
      videoChapters: [
        { time: "0:00", title: "Почему именно 30 дней подряд" },
        { time: "1:40", title: "Как устроен Хит и что считается выполнением" },
        { time: "3:30", title: "Что делать в трудные дни и как не сорваться" },
        { time: "5:20", title: "Роль Бадди и Четвёрки на финишной прямой" },
      ],
      tasks: [
        {
          title: "Сделать Хит 30 дней подряд",
          description:
            "Хит — это день когда ты выполнил все 5 своих практик. Твоя задача — собрать 30 таких дней подряд, без пропусков. Если пропустил — счётчик сбрасывается. Опирайся на Бадди и Четвёрку, договоритесь поддерживать друг друга. Это финальный уровень — после него ты закрепляешь ритм навсегда.",
          active: true,
          goTo: "Маховик успеха → Сегодняшние практики",
        },
      ],
    },
  },
];

// Контент по ТЗ для режима предпросмотра уровней (1..6)
const PREVIEW_LEVELS: Record<PreviewLevel, Level> = {
  1: {
    id: "p1",
    title: "Старт пути",
    subtitle: "Создай желания и первую цель",
    emoji: "🌱",
    gradient: "linear-gradient(135deg, #993C1D, #D85A30)",
    steps: [
      { id: "s1", label: "Создать 5 желаний", done: false },
      { id: "s2", label: "Создать 1 цель", done: false },
    ],
    reward: "Открывается Бадди",
    task: {
      videoTitle: "Уровень 1 — Старт",
      caption: "Введение • Уровень 1",
      duration: "5:00",
      description: "Создай 5 желаний и поставь первую цель.",
    },
  },
  2: {
    id: "p2",
    title: "Найди Бадди",
    subtitle: "Соединись и заполни карточку",
    emoji: "🤝",
    gradient: "linear-gradient(135deg, #185FA5, #378ADD)",
    steps: [
      { id: "s1", label: "Соединиться с Бадди", done: false },
      { id: "s2", label: "Созвониться и заполнить карточку Бадди", done: false },
    ],
    reward: [
      "Открывается Маховик успеха (пять главных привычек)",
      "+2 очка в день за Бадди",
    ],
    task: {
      videoTitle: "Уровень 2 — Бадди",
      caption: "Введение • Уровень 2",
      duration: "8:00",
      description: "Найди Бадди и заполни его карточку после созвона.",
    },
  },
  3: {
    id: "p3",
    title: "Активируй маховик успеха",
    subtitle: "Сделай Хит 5/5 семь дней подряд",
    emoji: "⚙️",
    gradient: "linear-gradient(135deg, #7A4A00, #E88200)",
    progress: { done: 0, total: 7, unit: "дней" },
    steps: [
      { id: "s1", label: "Сделать Хит 5/5 — 7 дней подряд", done: false },
    ],
    reward: [
      "Открывается Четвёрка",
      "Открывается возможность сделать клуб бесплатным",
      "+50 очков за прохождение уровня",
    ],
    task: {
      videoTitle: "Уровень 3 — Активировать маховик",
      caption: "Введение • Уровень 3",
      duration: "6:30",
      description: "Сделай Хит 5/5 семь дней подряд и активируй маховик успеха.",
    },
  },
  4: {
    id: "p4",
    title: "Создай Четвёрку",
    subtitle: "Объединись с другой парой",
    emoji: "👥",
    gradient: "linear-gradient(135deg, #0F6E56, #1D9E75)",
    steps: [
      { id: "s1", label: "Создать Четвёрку", done: false },
      { id: "s2", label: "Заполнить карточки участников второй пары", done: false },
    ],
    reward: [
      "Открывается Страховка от пропуска",
      "Открывается Заморозка клуба",
      "+2 очка в день за Четвёрку",
    ],
    task: {
      videoTitle: "Уровень 4 — Четвёрка",
      caption: "Введение • Уровень 4",
      duration: "9:00",
      description: "Объединись с другой парой Бадди и создайте Четвёрку.",
    },
  },
  5: {
    id: "p5",
    title: "Изучи формулу",
    subtitle: "Книга + ИИ-тест",
    emoji: "📖",
    gradient: "linear-gradient(135deg, #412402, #854F0B)",
    steps: [
      { id: "s1", label: "Прослушать «Закон притяжения» 6 ч", done: false },
      { id: "s2", label: "Сдать тест ИИ на 50%", done: false },
    ],
    reward: [
      "Открывается Разделы магазинов",
      "+100 бонусных очков",
    ],
    task: {
      videoTitle: "Уровень 5 — Формула",
      caption: "Введение • Уровень 5",
      duration: "12:00",
      description: "Прослушай книгу и сдай тест ИИ на 50%+.",
    },
  },
  6: {
    id: "p6",
    title: "Закрепись",
    subtitle: "Хит 30 дней подряд",
    emoji: "🏆",
    gradient: "linear-gradient(135deg, #3B6D11, #639922)",
    progress: { done: 0, total: 30, unit: "дней" },
    steps: [
      { id: "s1", label: "Сделать Хит 30 дней подряд", done: false },
    ],
    reward: ["+200 бонусных очков"],
    task: {
      videoTitle: "Уровень 6 — 30 хитов",
      caption: "Введение • Уровень 6",
      duration: "7:00",
      description: "Все 5 практик 30 дней без пропуска.",
    },
  },
};


export function PathLevels() {
  const previewLevel = usePreviewLevel();
  const level1Done = useLevel1DoneMode();
  const level2Done = useLevel2DoneMode();
  const level3Done = useLevel3DoneMode();
  const level4Done = useLevel4DoneMode();
  const [idx, setIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (level4Done) {
    return <Level4DoneCard />;
  }

  if (level3Done) {
    return <Level3DoneCard />;
  }

  if (level2Done) {
    return <Level2DoneCard />;
  }

  if (level1Done) {
    return <Level1DoneCard />;
  }


  const lvl = previewLevel != null
    ? { ...PREVIEW_LEVELS[previewLevel], task: LEVELS[previewLevel - 1].task, reward: LEVELS[previewLevel - 1].reward }
    : LEVELS[idx];
  const totalLevels = previewLevel != null ? 6 : LEVELS.length;
  const currentIdx = previewLevel != null ? previewLevel : idx + 1;
  const isPreview = previewLevel != null;
  const doneCount = lvl.steps.filter((s) => s.done).length;
  const pct = lvl.progress
    ? Math.round((lvl.progress.done / lvl.progress.total) * 100)
    : Math.round((doneCount / lvl.steps.length) * 100);

  const next = () => {
    if (isPreview) return; // в предпросмотре уровень фиксирован
    setIdx((i) => (i + 1) % LEVELS.length);
  };

  return (
    <article
      key={lvl.id}
      className="rounded-2xl bg-card hairline overflow-hidden shadow-card animate-fade-up flex flex-col"
      style={{ minHeight: 356 }}
    >
      {/* Header (clickable — switches to next level) */}
      <button
        type="button"
        onClick={next}
        className="relative w-full text-left px-4 py-4 text-white overflow-hidden"
        style={{ background: lvl.gradient }}
        aria-label={`Уровень ${currentIdx} из ${totalLevels}`}
      >
        {/* Декоративные полупрозрачные круги */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 70,
            height: 70,
            background: "rgba(255,255,255,0.08)",
            top: -15,
            right: -10,
          }}
        />
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 45,
            height: 45,
            background: "rgba(255,255,255,0.06)",
            top: 20,
            right: 45,
          }}
        />

        <div className="relative">
          {/* Строка 1: эмодзи + бейдж по нижнему краю */}
          <div className="flex items-end gap-[10px]">
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: 10,
                width: 40,
                height: 40,
                fontSize: 20,
              }}
              aria-hidden
            >
              {lvl.emoji}
            </div>
            <span className="inline-block rounded-full bg-white/15 backdrop-blur px-2.5 py-0.5 text-[10.5px] font-medium mb-0.5">
              Уровень {currentIdx} из {totalLevels}
            </span>
          </div>

          {/* Строка 2: название */}
          <h3 className="mt-2 text-[20px] font-semibold leading-tight">
            {lvl.title}
          </h3>
          {/* Строка 3: подзаголовок */}
          <p className="mt-0.5 text-[12px] text-white/70 leading-snug">
            {lvl.subtitle}
          </p>
        </div>
      </button>

      {/* Body */}
      <div className="flex flex-col flex-1" style={{ padding: "14px 16px 16px" }}>
        {lvl.progress && (
          <>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Прогресс</span>
              <span className="text-success-dark font-medium tabular-nums">
                {lvl.progress.done} из {lvl.progress.total}{" "}
                {lvl.progress.unit ?? ""} ✓
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full rounded-full"
              style={{ background: "#f0ebe0" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%`, background: lvl.gradient }}
              />
            </div>
          </>
        )}

        <div className={lvl.progress ? "mt-3" : ""}>
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
            Задание
          </div>
          <ul className="space-y-1.5">
            {lvl.steps.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 text-[13px]">
                {s.done ? (
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-success text-white">
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                ) : (
                  <Circle
                    className="h-[18px] w-[18px] text-muted-foreground/60"
                    strokeWidth={1.6}
                  />
                )}
                <span
                  className={
                    s.done
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {lvl.footer && (
          <p className="mt-3 text-[12px] text-muted-foreground">{lvl.footer}</p>
        )}

        {/* Награды */}
        {(() => {
          const rewards = Array.isArray(lvl.reward) ? lvl.reward : [lvl.reward];
          // Извлекаем ведущий эмодзи (любой) из строки награды
          const EMOJI_RE =
            /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*/u;
          return (
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
                Награда 🎁
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {rewards.map((r, i) => {
                  const m = r.match(EMOJI_RE);
                  const bulletEmoji = m ? m[1] : "✨";
                  const clean = m ? r.slice(m[0].length) : r;
                  return (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          flexShrink: 0,
                          width: 22,
                          height: 22,
                          fontSize: 16,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily:
                            '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
                        }}
                      >
                        {bulletEmoji}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#1a1a1a",
                          lineHeight: 1.35,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {clean}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

        {/* CTA: Посмотреть задание */}
        <div
          onClick={() => setSheetOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSheetOpen(true);
            }
          }}
          style={{
            background: "linear-gradient(135deg,#FFB300,#FF6D00,#FF9800)",
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            marginTop: 16,
          }}
        >
          <span
            style={{
              position: "absolute",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              top: -20,
              right: 10,
            }}
            aria-hidden
          />
          <span
            style={{
              position: "absolute",
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              top: 5,
              right: 50,
            }}
            aria-hidden
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "#fff",
              position: "relative",
              zIndex: 1,
            }}
          >
            Посмотреть задание
          </span>
        </div>
      </div>

      <LevelTaskSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        levelNumber={currentIdx}
        levelTitle={lvl.title}
        emoji={lvl.emoji}
        content={lvl.task}
      />
    </article>
  );
}

function Level1DoneCard() {
  const handleNext = () => {
    setLevel1DoneMode(false);
    setPreviewLevel(2);
  };
  return (
    <article
      className="rounded-2xl overflow-hidden animate-fade-up flex flex-col"
      style={{
        background: "linear-gradient(180deg, #DCF7E3 0%, #F1FBF3 55%, #FFFFFF 100%)",
        border: "1px solid #B7E4C1",
        boxShadow: "0 8px 24px -12px rgba(34,165,87,0.25)",
        padding: "20px 18px 18px",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 64,
            height: 64,
            background: "#CDEFD6",
            fontSize: 34,
            lineHeight: 1,
          }}
          aria-hidden
        >
          🎉
        </div>
        <div className="min-w-0">
          <div
            style={{
              color: "#1E8E4A",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            Поздравляем!
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 20,
              fontWeight: 700,
              color: "#0F2A18",
              lineHeight: 1.2,
            }}
          >
            Ты прошёл 1-й уровень
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          background: "rgba(255,255,255,0.7)",
          border: "1px solid #CDEFD6",
          borderRadius: 12,
          padding: "12px 14px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div
          aria-hidden
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#1FA84F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 1,
            animation: "level1-check-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
          }}
        >
          <Check size={15} color="#fff" strokeWidth={3} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F2A18", display: "flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden>👥</span>
            <span>Открыт раздел «Бадди»</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#4B6B57", lineHeight: 1.4 }}>
            Теперь ты можешь найти своего Бадди и перейти к следующему этапу.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="tap relative overflow-hidden"
        style={{
          marginTop: 18,
          marginLeft: 4,
          marginRight: 4,
          background: "linear-gradient(135deg, #1FA84F 0%, #22A557 50%, #2FBB63 100%)",
          borderRadius: 14,
          padding: "14px 18px",
          color: "#fff",
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 16px -6px rgba(31,168,79,0.55)",
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>Перейти к 2-му уровню</span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "-40%",
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            transform: "skewX(-20deg)",
            animation: "level1-shine 2.4s linear infinite",
          }}
        />
        <style>{`@keyframes level1-shine { 0% { left: -40%; } 60%, 100% { left: 120%; } } @keyframes level1-check-pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      </button>
    </article>
  );
}

function Level2DoneCard() {
  const handleNext = () => {
    setLevel2DoneMode(false);
    setPreviewLevel(3);
  };
  return (
    <article
      className="rounded-2xl overflow-hidden animate-fade-up flex flex-col"
      style={{
        background: "linear-gradient(180deg, #DCF7E3 0%, #F1FBF3 55%, #FFFFFF 100%)",
        border: "1px solid #B7E4C1",
        boxShadow: "0 8px 24px -12px rgba(34,165,87,0.25)",
        padding: "20px 18px 18px",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 64,
            height: 64,
            background: "#CDEFD6",
            fontSize: 34,
            lineHeight: 1,
          }}
          aria-hidden
        >
          🎉
        </div>
        <div className="min-w-0">
          <div
            style={{
              color: "#1E8E4A",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            Поздравляем!
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 20,
              fontWeight: 700,
              color: "#0F2A18",
              lineHeight: 1.2,
            }}
          >
            Ты прошёл 2-й уровень
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3" style={{ marginTop: 16 }}>
        <RewardCheck
          emoji="⚙️"
          title='Открыт «Маховик успеха»'
          description="Теперь ты можешь активировать ежедневную серию и двигаться к следующему уровню."
        />
        <RewardCheck
          emoji="⭐"
          title="+2 очка в день за Бадди"
          description="Дополнительные очки начисляются за выполнение условий Бадди."
        />
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="tap relative overflow-hidden"
        style={{
          marginTop: 18,
          marginLeft: 4,
          marginRight: 4,
          background: "linear-gradient(135deg, #1FA84F 0%, #22A557 50%, #2FBB63 100%)",
          borderRadius: 14,
          padding: "14px 18px",
          color: "#fff",
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 16px -6px rgba(31,168,79,0.55)",
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>Перейти к 3-му уровню</span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "-40%",
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            transform: "skewX(-20deg)",
            animation: "level2-shine 2.4s linear infinite",
          }}
        />
        <style>{`@keyframes level2-shine { 0% { left: -40%; } 60%, 100% { left: 120%; } } @keyframes level2-check-pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      </button>
    </article>
  );
}

function RewardCheck({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.7)",
        border: "1px solid #CDEFD6",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <div
        aria-hidden
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#1FA84F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
          animation: "level2-check-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
        }}
      >
        <Check size={15} color="#fff" strokeWidth={3} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#0F2A18",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span aria-hidden>{emoji}</span>
          <span>{title}</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "#4B6B57", lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

function Level3DoneCard() {
  const handleNext = () => {
    setLevel3DoneMode(false);
    setPreviewLevel(4);
  };
  return (
    <article
      className="rounded-2xl overflow-hidden animate-fade-up flex flex-col"
      style={{
        background: "linear-gradient(180deg, #DCF7E3 0%, #F1FBF3 55%, #FFFFFF 100%)",
        border: "1px solid #B7E4C1",
        boxShadow: "0 8px 24px -12px rgba(34,165,87,0.25)",
        padding: "20px 18px 18px",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 64,
            height: 64,
            background: "#CDEFD6",
            fontSize: 34,
            lineHeight: 1,
          }}
          aria-hidden
        >
          🎉
        </div>
        <div className="min-w-0">
          <div
            style={{
              color: "#1E8E4A",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            Поздравляем!
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 20,
              fontWeight: 700,
              color: "#0F2A18",
              lineHeight: 1.2,
            }}
          >
            Ты прошёл 3-й уровень
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3" style={{ marginTop: 16 }}>
        <RewardCheck
          emoji="👥"
          title="Открывается Четвёрка"
          description="Теперь ты можешь объединиться с другой парой и идти вместе."
        />
        <RewardCheck
          emoji="🔑"
          title="Открывается возможность сделать клуб бесплатным"
          description="В разделе «Возможности» появятся кодовые слова и бонусы."
        />
        <RewardCheck
          emoji="💥"
          title="+50 очков за прохождение уровня"
          description="Бонусные очки уже начислены на твой счёт."
        />
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="tap relative overflow-hidden"
        style={{
          marginTop: 18,
          marginLeft: 4,
          marginRight: 4,
          background: "linear-gradient(135deg, #1FA84F 0%, #22A557 50%, #2FBB63 100%)",
          borderRadius: 14,
          padding: "14px 18px",
          color: "#fff",
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 16px -6px rgba(31,168,79,0.55)",
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>Перейти к 4-му уровню</span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "-40%",
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            transform: "skewX(-20deg)",
            animation: "level2-shine 2.4s linear infinite",
          }}
        />
      </button>
    </article>
  );
}

function Level4DoneCard() {
  const handleNext = () => {
    setLevel4DoneMode(false);
    setPreviewLevel(5);
  };
  return (
    <article
      className="rounded-2xl overflow-hidden animate-fade-up flex flex-col"
      style={{
        background: "linear-gradient(180deg, #DCF7E3 0%, #F1FBF3 55%, #FFFFFF 100%)",
        border: "1px solid #B7E4C1",
        boxShadow: "0 8px 24px -12px rgba(34,165,87,0.25)",
        padding: "20px 18px 18px",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 64,
            height: 64,
            background: "#CDEFD6",
            fontSize: 34,
            lineHeight: 1,
          }}
          aria-hidden
        >
          🎉
        </div>
        <div className="min-w-0">
          <div
            style={{
              color: "#1E8E4A",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            Поздравляем!
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 20,
              fontWeight: 700,
              color: "#0F2A18",
              lineHeight: 1.2,
            }}
          >
            Ты прошёл 4-й уровень
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3" style={{ marginTop: 16 }}>
        <RewardCheck
          emoji="📚"
          title="Открывается Библиотека знаний"
          description="Тебе доступны книги, материалы и ИИ-тесты для следующего уровня."
        />
        <RewardCheck
          emoji="🔰"
          title="Открывается Страховка от пропуска"
          description="Разовая защита от обнуления прогресса — покупай в разделе «Разделы»."
        />
        <RewardCheck
          emoji="❄️"
          title="Открывается Заморозка клуба"
          description="Ставь клуб на паузу на 21 день без потери прогресса."
        />
        <RewardCheck
          emoji="⭐"
          title="+2 очка в день за Четвёрку"
          description="Дополнительные очки начисляются за выполнение условий Четвёрки."
        />
      </div>


      <button
        type="button"
        onClick={handleNext}
        className="tap relative overflow-hidden"
        style={{
          marginTop: 18,
          marginLeft: 4,
          marginRight: 4,
          background: "linear-gradient(135deg, #1FA84F 0%, #22A557 50%, #2FBB63 100%)",
          borderRadius: 14,
          padding: "14px 18px",
          color: "#fff",
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 16px -6px rgba(31,168,79,0.55)",
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>Перейти к 5-му уровню</span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "-40%",
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            transform: "skewX(-20deg)",
            animation: "level2-shine 2.4s linear infinite",
          }}
        />
      </button>
    </article>
  );
}




