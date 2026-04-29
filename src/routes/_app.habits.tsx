import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { HowItWorksBlock } from "@/components/section/HowItWorksBlock";

export const Route = createFileRoute("/_app/habits")({
  head: () => ({
    meta: [
      { title: "Привычки — Клуб «Моя жизнь»" },
      { name: "description", content: "Отслеживание ежедневных привычек." },
    ],
  }),
  component: HabitsScreen,
});

// ---------- Types & storage ----------

type DayMark = "done" | "skip";

interface Habit {
  id: string;
  title: string;
  description?: string;
  formula: string;
  startDate: string; // YYYY-MM-DD
  marks: Record<string, DayMark>; // YYYY-MM-DD -> mark
}

interface CatalogItem {
  title: string;
  description: string;
}

const CATALOG: CatalogItem[] = [
  { title: "Ранний подъём", description: "Вставать рано утром каждый день. Утренние часы — самое продуктивное время." },
  { title: "Ежедневная физическая активность", description: "Минимум 30 минут движения в день — зарядка, спорт, прогулка." },
  { title: "Медитация", description: "Ежедневная практика осознанности. Успокаивает ум и снижает стресс." },
  { title: "Дыхательные практики", description: "Контроль дыхания для снижения стресса и повышения концентрации." },
  { title: "Планирование дня", description: "Утром составлять список задач на день — фокус и порядок." },
  { title: "Пить 2 литра воды", description: "Гидратация влияет на энергию, кожу и работу мозга." },
  { title: "Ведение дневника", description: "Регулярно записывать мысли, события, переживания." },
  { title: "Учёт финансов", description: "Записывать доходы и расходы — контроль над деньгами." },
  { title: "Ежедневная растяжка или йога", description: "Гибкость, осанка, профилактика болей в спине." },
  { title: "Бегать", description: "Регулярные пробежки — выносливость, сердце, настроение." },
  { title: "Чтение художественной литературы", description: "Развивает воображение, эмпатию, словарный запас." },
  { title: "Чтение образовательной литературы", description: "Постоянное обучение и развитие новых навыков." },
  { title: "Достаточный сон", description: "7–9 часов качественного сна каждую ночь." },
  { title: "Практика благодарности", description: "Ежедневно отмечать 3 вещи, за которые благодарен." },
  { title: "Самоанализ", description: "Регулярно задавать себе вопросы и анализировать поведение." },
  { title: "Изучение иностранных языков", description: "Каждый день уделять время языку — слова, грамматика, практика." },
  { title: "Прогулки на свежем воздухе", description: "Минимум 30 минут на улице ежедневно." },
  { title: "Техники расслабления перед сном", description: "Ритуал отхода ко сну для качественного отдыха." },
  { title: "Питание без сахара", description: "Отказ от добавленного сахара — энергия, вес, здоровье." },
  { title: "Питание без выпечки и хлебобулочных изделий", description: "Исключение мучного из рациона." },
  { title: "Питание без кофеина", description: "Отказ от кофе и энергетиков — стабильная энергия." },
  { title: "Жизнь без новостей", description: "Информационная гигиена — меньше тревоги, больше фокуса." },
  { title: "Жизнь без алкоголя", description: "Полный отказ от спиртного." },
  { title: "Жизнь без курения", description: "Отказ от никотина в любой форме." },
  { title: "Развитие памяти", description: "Упражнения для тренировки памяти каждый день." },
  { title: "Слушать аудиокниги в пути", description: "Использовать дорогу для обучения." },
  { title: "Говорить «Я тебя люблю» своим близким", description: "Ежедневно выражать любовь словами." },
  { title: "Говорить слова благодарности людям", description: "Благодарить тех, кто рядом — каждый день." },
  { title: "Не переедание", description: "Есть до лёгкого насыщения, без переедания." },
  { title: "Контрастный душ", description: "Чередование тёплой и холодной воды — бодрость и иммунитет." },
  { title: "Писать вечером план на завтра", description: "Готовиться к завтрашнему дню заранее." },
  { title: "Ложиться спать до 23:00", description: "Ранний отход ко сну — качественный отдых." },
  { title: "Стоическая практика", description: "Ежедневное размышление в духе стоиков — фокус на том, что в твоей власти." },
  { title: "Радоваться жизни", description: "Сознательно находить и проживать моменты радости." },
];

const STORAGE_KEY = "habits-v1";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateAdd(base: string, days: number) {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string) {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000);
}

function loadHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Habit[];
  } catch {
    return [];
  }
}

function saveHabits(list: Habit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Auto-mark missed days as skip and auto-delete on 3 consecutive skips.
// Returns the cleaned list and a list of deleted habit titles.
function reconcile(list: Habit[]): { list: Habit[]; deleted: string[] } {
  const today = todayStr();
  const deleted: string[] = [];
  const cleaned: Habit[] = [];
  for (const h of list) {
    const updated: Habit = { ...h, marks: { ...h.marks } };
    // For every past day (not today) that has no mark -> skip
    const total = daysBetween(updated.startDate, today); // days from start to today (excluding today if positive)
    for (let i = 0; i < total; i++) {
      const d = dateAdd(updated.startDate, i);
      if (!updated.marks[d]) updated.marks[d] = "skip";
    }
    // Check 3 skips in a row
    let streak = 0;
    let dead = false;
    const lastIdx = total; // includes today if marked
    for (let i = 0; i <= lastIdx; i++) {
      const d = dateAdd(updated.startDate, i);
      const m = updated.marks[d];
      if (m === "skip") {
        streak++;
        if (streak >= 3) {
          dead = true;
          break;
        }
      } else if (m === "done") {
        streak = 0;
      } else {
        streak = 0; // future / today not marked
      }
    }
    if (dead) {
      deleted.push(updated.title);
    } else {
      cleaned.push(updated);
    }
  }
  return { list: cleaned, deleted };
}

// ---------- Screen ----------

type View =
  | { name: "list" }
  | { name: "detail"; item: CatalogItem }
  | { name: "custom" };

function HabitsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"mine" | "catalog">("mine");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [view, setView] = useState<View>({ name: "list" });
  const [notice, setNotice] = useState<string | null>(null);

  // Load + reconcile
  useEffect(() => {
    const raw = loadHabits();
    const { list, deleted } = reconcile(raw);
    if (deleted.length > 0) {
      saveHabits(list);
      setNotice(
        `Привычка "${deleted[0]}" удалена — 3 пропуска подряд. Можешь активировать её снова в каталоге.`,
      );
    } else if (raw.length !== list.length || JSON.stringify(raw) !== JSON.stringify(list)) {
      saveHabits(list);
    }
    setHabits(list);
  }, []);

  const updateHabits = (updater: (prev: Habit[]) => Habit[]) => {
    setHabits((prev) => {
      const next = updater(prev);
      saveHabits(next);
      return next;
    });
  };

  const activate = (title: string, formula: string, description?: string) => {
    const newHabit: Habit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      description,
      formula,
      startDate: todayStr(),
      marks: {},
    };
    updateHabits((prev) => [...prev, newHabit]);
    setTab("mine");
    setView({ name: "list" });
  };

  // ----- Detail screen -----
  if (view.name === "detail") {
    return (
      <DetailScreen
        item={view.item}
        onBack={() => setView({ name: "list" })}
        onActivate={(formula) => activate(view.item.title, formula, view.item.description)}
      />
    );
  }

  // ----- Custom screen -----
  if (view.name === "custom") {
    return (
      <CustomScreen
        onBack={() => setView({ name: "list" })}
        onActivate={(title, description, formula) => activate(title, formula, description)}
      />
    );
  }

  // ----- Main list screen -----
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center px-3 pt-2 pb-2">
        <BackButton onClick={() => navigate({ to: "/sections" })} />
        <h1 className="flex-1 text-center text-[16px] font-semibold">Привычки</h1>
        <div className="w-[64px]" />
      </div>

      {/* Tabs */}
      <div
        className="mx-4 mb-4 grid grid-cols-2 rounded-[12px] p-1"
        style={{ background: "#f0ebe2" }}
      >
        {(["mine", "catalog"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="tap rounded-[10px] py-2 text-[13px] font-medium transition-colors"
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                      color: "#fff",
                    }
                  : { color: "#7a6f5e" }
              }
            >
              {t === "mine" ? "Мои привычки" : "Каталог"}
            </button>
          );
        })}
      </div>

      {notice && (
        <div className="mx-4 mb-3 rounded-[12px] border px-3 py-2 text-[12px]" style={{ background: "#fff3e0", borderColor: "#FFB300", color: "#92400e" }}>
          {notice}
          <button className="ml-2 underline" onClick={() => setNotice(null)}>
            ок
          </button>
        </div>
      )}

      {tab === "mine" ? (
        <MineTab
          habits={habits}
          onMarkToday={(id) => {
            updateHabits((prev) =>
              prev.map((h) =>
                h.id === id ? { ...h, marks: { ...h.marks, [todayStr()]: "done" } } : h,
              ),
            );
          }}
          onDelete={(id) => {
            updateHabits((prev) => prev.filter((h) => h.id !== id));
          }}
          onEdit={(id, patch) => {
            updateHabits((prev) =>
              prev.map((h) => (h.id === id ? { ...h, ...patch } : h)),
            );
          }}
          onGoCatalog={() => setTab("catalog")}
        />
      ) : (
        <CatalogTab
          onCreateOwn={() => setView({ name: "custom" })}
          onPick={(item) => setView({ name: "detail", item })}
        />
      )}

      <div className="px-4">
        <HowItWorksBlock
          paragraphs={[
            {
              title: "💪 Что такое раздел «Привычки»",
              text: "Это твой личный трекер любых привычек, кроме 5 главных. Сюда ты добавляешь то, что хочешь сделать своей нормой: спорт, чтение, отказ от сладкого, ранний подъём, что угодно. Раздел помогает не держать всё в голове и видеть прогресс по каждой привычке отдельно.",
            },
            {
              title: "🎯 Как это работает",
              text: "Открываешь «Каталог» — выбираешь готовую привычку или создаёшь свою. У каждой привычки есть формула: «Что я делаю + как часто + сколько по времени». Каждый день, когда ты выполнил привычку — отмечаешь её. Пропустил 3 дня подряд — привычка автоматически уходит в архив, чтобы не висела мёртвым грузом. Можешь активировать снова в любой момент.",
            },
            {
              title: "💎 Зачем это нужно",
              text: "Привычки — это твоя личность в действии. Ты есть то, что ты делаешь каждый день. Этот раздел помогает осознанно формировать ту личность, которой хочешь быть, шаг за шагом, день за днём.",
            },
          ]}
          videos={[
            {
              title: "🎬 Как пользоваться разделом «Привычки»",
              duration: "5:00",
              caption: "Подробный разбор: как добавить привычку, как работает формула и как отмечать выполнение.",
            },
            {
              title: "🔥 Как закрепить новую привычку",
              duration: "4:30",
              caption: "Практические приёмы: как не сорваться в первые 30 дней и как встроить привычку в день.",
            },
          ]}
        />
      </div>
    </div>
  );
}

// ---------- Mine Tab ----------

function MineTab({
  habits,
  onMarkToday,
  onDelete,
  onEdit,
  onGoCatalog,
}: {
  habits: Habit[];
  onMarkToday: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, patch: Partial<Habit>) => void;
  onGoCatalog: () => void;
}) {
  return (
    <div className="px-4 space-y-3">
      {habits.length === 0 && (
        <p className="text-center text-[13px] text-muted-foreground py-6">
          Пока нет активных привычек. Открой каталог и выбери первую.
        </p>
      )}

      {habits.map((h) => (
        <HabitCard
          key={h.id}
          habit={h}
          onMarkToday={() => onMarkToday(h.id)}
          onDelete={() => onDelete(h.id)}
          onEdit={(patch) => onEdit(h.id, patch)}
        />
      ))}

      <button
        onClick={onGoCatalog}
        className="tap w-full rounded-[14px] py-[14px] text-[14px] font-medium"
        style={{ border: "1.5px dashed #FF6D00", color: "#FF6D00" }}
      >
        ＋ Добавить привычку
      </button>
    </div>
  );
}

function HabitCard({
  habit,
  onMarkToday,
  onDelete,
  onEdit,
}: {
  habit: Habit;
  onMarkToday: () => void;
  onDelete: () => void;
  onEdit: (patch: Partial<Habit>) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(habit.title);
  const [editFormula, setEditFormula] = useState(habit.formula);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const today = todayStr();
  const dayNumber = daysBetween(habit.startDate, today) + 1;
  const totalCircles = Math.max(dayNumber + 7, 30);

  const circles = useMemo(() => {
    const arr: { n: number; date: string; state: "done" | "skip" | "today" | "future" }[] = [];
    for (let i = 0; i < totalCircles; i++) {
      const date = dateAdd(habit.startDate, i);
      const cmp = daysBetween(date, today);
      let state: "done" | "skip" | "today" | "future";
      if (cmp > 0) {
        // past
        state = habit.marks[date] === "done" ? "done" : "skip";
      } else if (cmp === 0) {
        state = habit.marks[date] === "done" ? "done" : "today";
      } else {
        state = "future";
      }
      arr.push({ n: i + 1, date, state });
    }
    return arr;
  }, [habit, today, totalCircles]);

  const colorFor = (s: "done" | "skip" | "today" | "future") => {
    switch (s) {
      case "done": return { bg: "#16a34a", color: "#fff" };
      case "skip": return { bg: "#ef4444", color: "#fff" };
      case "today": return { bg: "#FFB300", color: "#fff" };
      case "future": return { bg: "#e5e7eb", color: "#9ca3af" };
    }
  };

  return (
    <div
      className="relative rounded-[16px] bg-white p-4"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-md border border-[#ede8df] px-2 py-1 text-[15px] font-bold focus:border-[#FF6D00] outline-none"
            />
          ) : (
            <h3 className="text-[16px] font-bold leading-tight truncate">{habit.title}</h3>
          )}
        </div>
        <span className="text-[12px]" style={{ color: "#8a8a8a" }}>
          День {dayNumber}
        </span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="tap -mt-1 -mr-1 px-1"
            style={{ color: "#8a8a8a", fontSize: 18, lineHeight: 1 }}
            aria-label="Меню"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 w-40 rounded-lg bg-white py-1 text-[13px] shadow-lg border border-[#ede8df]">
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#faf7f1]"
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Изменить
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-[#faf7f1]"
                onClick={() => {
                  setMenuOpen(false);
                  if (typeof window !== "undefined" && window.confirm(`Удалить привычку «${habit.title}»?`)) {
                    onDelete();
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Удалить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formula */}
      {editing ? (
        <textarea
          value={editFormula}
          onChange={(e) => setEditFormula(e.target.value)}
          className="mt-2 w-full rounded-md border border-[#ede8df] px-2 py-1 text-[12px] italic focus:border-[#FF6D00] outline-none"
          rows={2}
        />
      ) : (
        <p className="mt-1 text-[12px] italic" style={{ color: "#8a8a8a" }}>
          {habit.formula}
        </p>
      )}

      {editing && (
        <div className="mt-2 flex gap-2">
          <button
            className="flex-1 rounded-lg py-1.5 text-[12px] font-medium text-white"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
            onClick={() => {
              if (editTitle.trim().length >= 1 && editFormula.trim().length >= 5) {
                onEdit({ title: editTitle.trim(), formula: editFormula.trim() });
                setEditing(false);
              }
            }}
          >
            Сохранить
          </button>
          <button
            className="flex-1 rounded-lg border border-[#ede8df] py-1.5 text-[12px]"
            onClick={() => {
              setEditTitle(habit.title);
              setEditFormula(habit.formula);
              setEditing(false);
            }}
          >
            Отмена
          </button>
        </div>
      )}

      {/* Circles */}
      <div className="mt-3 flex flex-wrap" style={{ gap: 5 }}>
        {circles.map((c) => {
          const col = colorFor(c.state);
          const clickable = c.state === "today";
          return (
            <button
              key={c.n}
              disabled={!clickable}
              onClick={clickable ? onMarkToday : undefined}
              className="flex items-center justify-center text-[11px] font-medium select-none"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: col.bg,
                color: col.color,
                cursor: clickable ? "pointer" : "default",
              }}
            >
              {c.n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Catalog Tab ----------

function CatalogTab({
  onCreateOwn,
  onPick,
}: {
  onCreateOwn: () => void;
  onPick: (item: CatalogItem) => void;
}) {
  return (
    <div className="px-4 space-y-3">
      <button
        onClick={onCreateOwn}
        className="tap w-full rounded-[14px] py-[14px] text-[14px] font-medium"
        style={{ border: "1.5px dashed #FF6D00", color: "#FF6D00" }}
      >
        ✏️ Создать свою привычку
      </button>

      <p className="text-center text-[12px]" style={{ color: "#8a8a8a" }}>
        или выбери из готовых
      </p>

      <div className="space-y-2">
        {CATALOG.map((item) => (
          <button
            key={item.title}
            onClick={() => onPick(item)}
            className="tap block w-full rounded-[14px] bg-white p-3 text-left"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <h4 className="text-[15px] font-semibold leading-tight">{item.title}</h4>
            <p
              className="mt-1 text-[12px] leading-snug line-clamp-2"
              style={{ color: "#8a8a8a" }}
            >
              {item.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Detail screen (catalog item) ----------

function DetailScreen({
  item,
  onBack,
  onActivate,
}: {
  item: CatalogItem;
  onBack: () => void;
  onActivate: (formula: string) => void;
}) {
  const [formula, setFormula] = useState("");
  const valid = formula.trim().length >= 10;

  return (
    <div className="pb-8">
      <div className="flex items-center px-3 pt-2 pb-2">
        <BackButton onClick={onBack} />
        <h1 className="flex-1 text-center text-[16px] font-semibold truncate px-2">{item.title}</h1>
        <div className="w-[64px]" />
      </div>

      <div className="px-4 space-y-4">
        <p className="text-[14px]" style={{ color: "#555", lineHeight: 1.7 }}>
          {item.description}
        </p>

        <div
          className="rounded-[16px] bg-white p-4"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
        >
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "#8a8a8a" }}>
            ТРИГГЕР / ДЕЙСТВИЕ / МЕСТО / ВРЕМЯ
          </p>
          <p className="mt-2 text-[13px]" style={{ color: "#FF6D00" }}>
            Напиши по формуле: «Когда [триггер], я буду [действие], в [место], в [время]»
          </p>
          <p className="mt-2 text-[12px] italic" style={{ color: "#8a8a8a", lineHeight: 1.6 }}>
            — Когда я почищу зубы утром, я буду медитировать, на кухне, в 7:00<br />
            — Когда я закончу ужин, я буду учить английский, за рабочим столом, в 19:00
          </p>

          <textarea
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Когда [триггер], я буду [действие], в [место], в [время]"
            className="mt-3 w-full rounded-[12px] px-3 py-2 text-[13px] outline-none focus:border-[#FF6D00]"
            style={{
              border: "1.5px solid #ede8df",
              minHeight: 80,
            }}
          />
        </div>

        <button
          disabled={!valid}
          onClick={() => onActivate(formula.trim())}
          className="tap w-full rounded-[14px] py-3 text-[14px] font-semibold transition-colors"
          style={
            valid
              ? {
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  color: "#fff",
                }
              : { background: "#e5e7eb", color: "#9ca3af" }
          }
        >
          ⭐ Активировать привычку
        </button>
      </div>
    </div>
  );
}

// ---------- Custom screen ----------

function CustomScreen({
  onBack,
  onActivate,
}: {
  onBack: () => void;
  onActivate: (title: string, description: string, formula: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formula, setFormula] = useState("");
  const valid =
    title.trim().length >= 3 && description.trim().length >= 3 && formula.trim().length >= 3;

  const inputStyle: React.CSSProperties = {
    border: "1.5px solid #ede8df",
    borderRadius: 12,
  };

  return (
    <div className="pb-8">
      <div className="flex items-center px-3 pt-2 pb-2">
        <BackButton onClick={onBack} />
        <h1 className="flex-1 text-center text-[16px] font-semibold">Своя привычка</h1>
        <div className="w-[64px]" />
      </div>

      <div className="px-4 space-y-3">
        <div>
          <label className="text-[12px] font-medium text-muted-foreground">Название</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Холодный душ"
            className="mt-1 w-full px-3 py-2 text-[14px] outline-none focus:border-[#FF6D00]"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-muted-foreground">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опиши зачем тебе эта привычка и что она даёт..."
            className="mt-1 w-full px-3 py-2 text-[13px] outline-none focus:border-[#FF6D00]"
            style={{ ...inputStyle, minHeight: 80 }}
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-muted-foreground">Формула привычки</label>
          <p className="mt-1 text-[12px]" style={{ color: "#FF6D00" }}>
            Когда [триггер], я буду [действие], в [место], в [время]
          </p>
          <textarea
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Когда [триггер], я буду [действие], в [место], в [время]"
            className="mt-1 w-full px-3 py-2 text-[13px] outline-none focus:border-[#FF6D00]"
            style={{ ...inputStyle, minHeight: 80 }}
          />
        </div>

        <button
          disabled={!valid}
          onClick={() => onActivate(title.trim(), description.trim(), formula.trim())}
          className="tap mt-2 w-full rounded-[14px] py-3 text-[14px] font-semibold"
          style={
            valid
              ? {
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  color: "#fff",
                }
              : { background: "#e5e7eb", color: "#9ca3af" }
          }
        >
          ✅ Активировать привычку
        </button>

        <p className="text-center text-[11px] text-muted-foreground pt-1">
          <Plus className="inline h-3 w-3 -mt-0.5" /> Все три поля обязательны (минимум 3 символа)
        </p>
      </div>
    </div>
  );
}
