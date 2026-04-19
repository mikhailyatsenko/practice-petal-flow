import { ChevronRight } from "lucide-react";

export type DayState = "done" | "missed" | "empty";

export interface PracticeRow {
  id: string;
  title: string;
  streakDays: number;
  doneToday: boolean;
  history: DayState[]; // 30 точек
  level: number; // 0..10
  progress: number; // дней в текущем уровне (может быть отрицательным при пропусках подряд)
}

interface PracticeRowCardProps {
  practice: PracticeRow;
  onToggle: (id: string) => void;
}

const LEVELS: Record<string, string[]> = {
  "self-prog": [
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
  ],
  charge: [
    "0️⃣ Не видящий 🙈",
    "1️⃣ Начинающий видеть 👁️‍🗨️",
    "2️⃣ Мечтатель 💭",
    "3️⃣ Визионер 🔮",
    "4️⃣ Провидец 👁️",
    "5️⃣ Архитектор будущего 🏗️",
    "6️⃣ Творец реальности ✨",
    "7️⃣ Повелитель образов 🎭",
    "8️⃣ Мастер воображения 🎨",
    "9️⃣ Создатель миров 🌍",
    "🔟 Бог визуализации 🌟",
  ],
  essay: [
    "0️⃣ Чистый лист 📄",
    "1️⃣ Начинающий писать ✏️",
    "2️⃣ Мечтающий вслух 💭",
    "3️⃣ Страж мечты 🔑",
    "4️⃣ Летописец жизни 📖",
    "5️⃣ Искусный сочинитель ✍️",
    "6️⃣ Архитектор мечты 🏗️",
    "7️⃣ Творец будущего 🌅",
    "8️⃣ Автор своей жизни 🖊️",
    "9️⃣ Владыка своей жизни 👑",
    "🔟 Бог воплощения мечты 🌟",
  ],
  skill: [
    "0️⃣ Слепой к победам 🤷",
    "1️⃣ Замечающий успехи 🔍",
    "2️⃣ Коллекционер побед 📝",
    "3️⃣ Хранитель триумфов 🏆",
    "4️⃣ Мастер достижений ✨",
    "5️⃣ Архитектор успеха 🏗️",
    "6️⃣ Повелитель побед 👑",
    "7️⃣ Создатель славы 🌟",
    "8️⃣ Владыка триумфов 💎",
    "9️⃣ Творец легенд ⚡",
    "🔟 Бог успеха 🏆",
  ],
  wishes: [
    "0️⃣ Бездействующий 🪨",
    "1️⃣ Движущийся ➡️",
    "2️⃣ Созидатель 🔨",
    "3️⃣ Реализатор 🚀",
    "4️⃣ Воплотитель 💪",
    "5️⃣ Мастер действий 🏃",
    "6️⃣ Покоритель целей 🎯",
    "7️⃣ Повелитель результатов 🏆",
    "8️⃣ Архитектор побед 👑",
    "9️⃣ Владыка достижений 💎",
    "🔟 Бог воплощения 🌟",
  ],
};

const dotStyle = (s: DayState): string => {
  switch (s) {
    case "done":
      return "bg-[#16a34a]";
    case "missed":
      return "bg-[#ef4444]";
    default:
      return "bg-[#e0d8cc]";
  }
};

const dayWord = (n: number) => {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 14) return "дней";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
};

export function PracticeRowCard({ practice, onToggle }: PracticeRowCardProps) {
  const { id, title, streakDays, doneToday, level, progress } = practice;

  // Логика: progress < 0 => N красных слева (пропуски обнулили прогресс).
  // progress > 0 => N зелёных слева. Остальное — пусто.
  const hasMissedStreak = progress < 0;
  const missedStreak = hasMissedStreak ? Math.abs(progress) : 0;
  const doneCount = progress > 0 ? progress : 0;

  const dots: DayState[] = Array.from({ length: 30 }, (_, i) => {
    if (hasMissedStreak) return i < missedStreak ? "missed" : "empty";
    return i < doneCount ? "done" : "empty";
  });

  const levelName = LEVELS[id]?.[Math.min(level, 10)] ?? `Уровень ${level}`;
  const progressValue = progress;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(id);
        }
      }}
      className="tap w-full text-left bg-card hairline rounded-xl px-3 py-2 shadow-card animate-fade-up cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {/* Верхняя строка: название + бейдж/кнопка (фикс. высота) */}
      <div className="flex items-center gap-2">
        <h3 className="text-[14px] font-medium leading-tight truncate flex-1 min-w-0">
          {title}
        </h3>
        <div className="shrink-0 flex items-center justify-center min-h-[26px]">
          {!doneToday ? (
            <div
              style={{
                background: "linear-gradient(135deg,#FFB300,#FF6D00)",
                borderRadius: 20,
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 500,
                color: "#fff",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              Сделать
            </div>
          ) : (
            <span
              className="inline-flex items-center"
              style={{
                background: "#f0fdf4",
                border: "0.5px solid #16a34a",
                color: "#16a34a",
                borderRadius: 20,
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 500,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              +1 ⭐
            </span>
          )}
        </div>
      </div>

      {/* Вторая строка: серия / пропуски */}
      <p
        className={
          "mt-1 text-[11px] leading-tight " +
          (hasMissedStreak
            ? "text-[#ef4444] font-medium"
            : streakDays > 0
              ? "text-success-dark"
              : "text-muted-foreground")
        }
      >
        {hasMissedStreak
          ? `Пропущено ${missedStreak} ${dayWord(missedStreak)} подряд`
          : `Серия: ${streakDays} ${dayWord(streakDays)}`}
      </p>

      {/* Кружки */}
      <div className="mt-2 flex items-center gap-2 min-h-[20px]">
        <div className="flex flex-wrap gap-[2px] flex-1 min-w-0">
          {dots.map((s, i) => (
            <span
              key={i}
              className={"h-1.5 w-1.5 rounded-full " + dotStyle(s)}
            />
          ))}
        </div>
      </div>

      {/* Разделитель */}
      <div className="mt-2 h-px bg-border/60" />

      {/* Нижняя строка: уровень + прогресс */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-[#FF6D00] truncate">
          {levelName}
        </span>
        <span
          className={
            "text-[11px] tabular-nums shrink-0 " +
            (hasMissedStreak
              ? "text-[#ef4444] font-bold"
              : "text-muted-foreground")
          }
        >
          {progressValue}/30
        </span>
      </div>
    </div>
  );
}
