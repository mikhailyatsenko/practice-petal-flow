import { useState } from "react";
import { Check, Circle, ChevronRight } from "lucide-react";

interface LevelStep {
  id: string;
  label: string;
  done: boolean;
}

interface Level {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  steps: LevelStep[];
  progress?: { done: number; total: number; unit?: string };
  footer?: string;
}

const LEVELS: Level[] = [
  {
    id: "l1",
    title: "Найди союзника",
    subtitle: "Бадди + первый созвон",
    gradient: "linear-gradient(135deg, #C75B3C, #8E3B25)",
    steps: [
      { id: "s1", label: "Найти Бадди", done: true },
      { id: "s2", label: "Провести созвон 60 мин", done: true },
      { id: "s3", label: "Написать желание Бадди", done: false },
    ],
  },
  {
    id: "l2",
    title: "Познай формулу",
    subtitle: "Книга + ИИ-бот 50%+",
    gradient: "linear-gradient(135deg, #B8893A, #7A5A22)",
    steps: [
      { id: "s1", label: "Прослушать книгу 6 ч", done: false },
      { id: "s2", label: "Сформулировать формулу", done: false },
      { id: "s3", label: "Сдать ИИ-боту на 50%+", done: false },
    ],
  },
  {
    id: "l3",
    title: "Выработай ритм",
    subtitle: "7 дней хит — 5 из 5",
    gradient: "linear-gradient(135deg, #FFB300, #FF6D00)",
    progress: { done: 3, total: 7, unit: "дней" },
    steps: [
      { id: "d1", label: "День 1 — все 5 практик", done: true },
      { id: "d2", label: "День 2 — все 5 практик", done: true },
      { id: "d3", label: "День 3 — все 5 практик", done: true },
      { id: "d4", label: "День 4 — все 5 практик", done: false },
      { id: "d5", label: "День 5 — все 5 практик", done: false },
      { id: "d6", label: "День 6 — все 5 практик", done: false },
      { id: "d7", label: "День 7 — все 5 практик", done: false },
    ],
  },
  {
    id: "l4",
    title: "Найди племя",
    subtitle: "Четвёрка + созвон",
    gradient: "linear-gradient(135deg, #7A8B4A, #4F5E2A)",
    steps: [
      { id: "s1", label: "Найти вторую пару", done: false },
      { id: "s2", label: "Все 4 подтверждают", done: false },
      { id: "s3", label: "Созвон 80 мин", done: false },
    ],
  },
  {
    id: "l5",
    title: "Создай видение",
    subtitle: "Дизайн жизни + день",
    gradient: "linear-gradient(135deg, #8B3A4E, #5A1F30)",
    steps: [
      { id: "s1", label: "Написать 1000+ символов", done: false },
      { id: "s2", label: "Описать идеальный день", done: false },
      { id: "s3", label: "Поделиться с Бадди", done: false },
    ],
  },
  {
    id: "l6",
    title: "Стань собой",
    subtitle: "3 качества × 7 дней",
    gradient: "linear-gradient(135deg, #3E5266, #243646)",
    steps: [
      { id: "s1", label: "Выбрать 3 качества", done: false },
      { id: "s2", label: "7 дней практики", done: false },
      { id: "s3", label: "Написать рефлексию", done: false },
    ],
  },
  {
    id: "l7",
    title: "30 хитов подряд",
    subtitle: "Все 5 практик 30 дней без пропуска",
    gradient: "linear-gradient(135deg, #5C4033, #2E1F18)",
    progress: { done: 0, total: 30, unit: "дней" },
    steps: [
      { id: "s1", label: "Участники: ты и Бадди", done: false },
      { id: "s2", label: "Дней осталось: 30", done: false },
      { id: "s3", label: "Награда: 200 ⭐", done: false },
    ],
    footer: "Награда: 200 ⭐",
  },
];

export function PathLevels() {
  const [idx, setIdx] = useState(0);
  const lvl = LEVELS[idx];
  const doneCount = lvl.steps.filter((s) => s.done).length;
  const pct = lvl.progress
    ? Math.round((lvl.progress.done / lvl.progress.total) * 100)
    : Math.round((doneCount / lvl.steps.length) * 100);

  const next = () => setIdx((i) => (i + 1) % LEVELS.length);

  return (
    <article
      key={lvl.id}
      className="rounded-2xl bg-card hairline overflow-hidden shadow-card animate-fade-up"
    >
      {/* Header (clickable — switches to next level) */}
      <button
        type="button"
        onClick={next}
        className="relative w-full text-left px-4 py-4 text-white overflow-hidden"
        style={{ background: lvl.gradient }}
        aria-label={`Перейти к следующему уровню (сейчас ${idx + 1} из ${LEVELS.length})`}
      >
        <span className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-white/15 blur-xl" />
        <span className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className="inline-block rounded-full bg-white/22 backdrop-blur px-2.5 py-0.5 text-[10.5px] font-medium">
              Уровень {idx + 1} из {LEVELS.length}
            </span>
            <h3 className="mt-2 text-[20px] font-semibold leading-tight">
              {lvl.title}
            </h3>
            <p className="mt-0.5 text-[12px] text-white/90 leading-snug">
              {lvl.subtitle}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 opacity-90" />
        </div>
      </button>

      {/* Body */}
      <div className="px-4 py-3.5">
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

        <ul className={`${lvl.progress ? "mt-3" : ""} space-y-1.5`}>
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

        {lvl.footer && (
          <p className="mt-3 text-[12px] text-muted-foreground">{lvl.footer}</p>
        )}

        {/* Pagination dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {LEVELS.map((l, i) => (
            <span
              key={l.id}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-5 bg-foreground/70" : "w-1.5 bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
