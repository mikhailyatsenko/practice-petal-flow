import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { LevelTaskSheet, type LevelTaskContent } from "./LevelTaskSheet";
import { usePreviewLevel, type PreviewLevel } from "@/lib/previewLevel";

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
      "👥 Открывается Четвёрка",
      "⚙️ Открывается Маховик успеха",
      "⭐ +2 очка в день за Бадди",
    ],
    task: {
      videoTitle: "Уровень 2 — Бадди",
      caption: "Введение • Уровень 2",
      duration: "8:00",
      description: "Найди Бадди и заполни его карточку после созвона.",
    },
  },
  {
    id: "l3",
    title: "Создай Четвёрку",
    subtitle: "Объединись с другой парой",
    emoji: "👥",
    gradient: "linear-gradient(135deg, #0F6E56, #1D9E75)",
    steps: [
      { id: "s1", label: "Соединиться в четвёрку", done: false },
      { id: "s2", label: "Сделать 7 хитов подряд", done: false },
    ],
    reward: [
      "📚 Открывается Библиотека знаний",
      "⭐ +2 очка в день за Четвёрку",
    ],
    task: {
      videoTitle: "Уровень 3 — Четвёрка",
      caption: "Введение • Уровень 3",
      duration: "9:00",
      description: "Объединись с другой парой Бадди и создайте Четвёрку.",
    },
  },
  {
    id: "l4",
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
      videoTitle: "Уровень 4 — Формула",
      caption: "Введение • Уровень 4",
      duration: "12:00",
      description: "Прослушай книгу и сдай тест ИИ на 50%+.",
    },
  },
  {
    id: "l5",
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
      videoTitle: "Уровень 5 — 30 хитов",
      caption: "Введение • Уровень 5",
      duration: "7:00",
      description: "Все 5 практик 30 дней без пропуска.",
    },
  },
];

// Контент по ТЗ для режима предпросмотра уровней (1..5)
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
      "Открывается Четвёрка",
      "Открывается Маховик успеха",
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
    title: "Создай Четвёрку",
    subtitle: "Объединись с другой парой",
    emoji: "👥",
    gradient: "linear-gradient(135deg, #0F6E56, #1D9E75)",
    steps: [
      { id: "s1", label: "Соединиться в четвёрку", done: false },
    ],
    reward: [
      "Открывается Библиотека знаний",
      "+2 очка в день за Четвёрку",
    ],
    task: {
      videoTitle: "Уровень 3 — Четвёрка",
      caption: "Введение • Уровень 3",
      duration: "9:00",
      description: "Объединись с другой парой Бадди и создайте Четвёрку.",
    },
  },
  4: {
    id: "p4",
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
      videoTitle: "Уровень 4 — Формула",
      caption: "Введение • Уровень 4",
      duration: "12:00",
      description: "Прослушай книгу и сдай тест ИИ на 50%+.",
    },
  },
  5: {
    id: "p5",
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
      videoTitle: "Уровень 5 — 30 хитов",
      caption: "Введение • Уровень 5",
      duration: "7:00",
      description: "Все 5 практик 30 дней без пропуска.",
    },
  },
};

export function PathLevels() {
  const previewLevel = usePreviewLevel();
  const [idx, setIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  const lvl = previewLevel != null ? PREVIEW_LEVELS[previewLevel] : LEVELS[idx];
  const totalLevels = previewLevel != null ? 5 : LEVELS.length;
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
          const isMulti = rewards.length > 1;
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
                  const leadMatch = r.match(/^(🎁|🛍️|👥)\s*/);
                  const bulletEmoji = leadMatch ? leadMatch[1] : "🎁";
                  const clean = r.replace(/^(?:🎁|🛍️|👥)\s*/, "");
                  return (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {isMulti ? (
                        <span
                          aria-hidden
                          style={{
                            flexShrink: 0,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "#FFB300",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                          }}
                        >
                          {i + 1}
                        </span>
                      ) : (
                        <span
                          aria-hidden
                          style={{
                            flexShrink: 0,
                            fontSize: 16,
                            lineHeight: 1,
                            fontFamily:
                              '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
                          }}
                        >
                          {bulletEmoji}
                        </span>
                      )}
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
            marginTop: "auto",
            marginBottom: "auto",
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
