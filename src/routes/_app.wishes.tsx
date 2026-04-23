import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Plus, X, ArrowLeft, Check, ImageIcon, FolderOpen, Pencil, RotateCw, Sparkles } from "lucide-react";
import wishHouse from "@/assets/wish-house.jpg";
import wishBali from "@/assets/wish-bali.jpg";
import wishBody from "@/assets/wish-body.jpg";
import wishBook from "@/assets/wish-book.jpg";
import wishBusiness from "@/assets/wish-business.jpg";

export const Route = createFileRoute("/_app/wishes")({
  head: () => ({
    meta: [
      { title: "Желания — Клуб «Моя жизнь»" },
      { name: "description", content: "Лента твоих желаний — листай, вдохновляйся, воплощай." },
    ],
  }),
  component: WishesScreen,
});

const TABS = [
  { id: "wants",     label: "Хотелки"     },
  { id: "wishes",    label: "Желания"     },
  { id: "goals",     label: "Цели"        },
  { id: "tasks",     label: "Задачи"      },
  { id: "done",      label: "Воплощённые" },
] as const;

type TabId = typeof TABS[number]["id"];

interface Wish {
  id: string;
  image: string;
  title: string;
  reasons: string[];
}

const INITIAL_WISHES: Wish[] = [
  {
    id: "w1",
    image: wishHouse,
    title: "Дом у океана",
    reasons: [
      "Просыпаться под шум волн и встречать рассветы у воды",
      "Свобода и пространство для семьи и творчества",
      "Место силы, куда хочется возвращаться",
    ],
  },
  {
    id: "w2",
    image: wishBali,
    title: "Зимовка на Бали",
    reasons: [
      "Сменить обстановку и перезагрузить голову",
      "Жить среди природы, тепла и спокойствия",
      "Познакомиться с людьми со всего мира",
    ],
  },
  {
    id: "w3",
    image: wishBody,
    title: "Тело, в котором энергия",
    reasons: [
      "Чувствовать лёгкость и силу каждый день",
      "Уверенность в себе и в зеркале",
      "Здоровье — фундамент всего остального",
    ],
  },
  {
    id: "w4",
    image: wishBook,
    title: "Написать свою книгу",
    reasons: [
      "Оставить след и поделиться опытом с другими",
      "Структурировать свои мысли и путь",
      "Реализовать давнюю мечту",
    ],
  },
  {
    id: "w5",
    image: wishBusiness,
    title: "Своё дело, которое вдохновляет",
    reasons: [
      "Заниматься тем, что зажигает по утрам",
      "Финансовая свобода и контроль над временем",
      "Создавать ценность для других людей",
    ],
  },
];

const INITIAL_HOTELKI = [
  "Купить новые беспроводные наушники",
  "Сходить на массаж в эти выходные",
  "Попробовать сёрфинг",
  "Прочитать «Атомные привычки»",
  "Завести привычку медитации по утрам",
  "Съездить на выходные в горы",
  "Купить красивую кружку для кофе",
  "Научиться готовить пасту карбонара",
  "Сходить в новый ресторан с другом",
  "Завести растение на рабочий стол",
];

interface Goal {
  id: string;
  emoji: string;
  title: string;
  deadline: string;
  progress: number;
  next: string;
}

const GOALS: Goal[] = [
  {
    id: "g1",
    emoji: "🏝️",
    title: "Зимовка на Бали в январе",
    deadline: "до 1 января 2027",
    progress: 35,
    next: "Купить билеты до 1 декабря",
  },
  {
    id: "g2",
    emoji: "💪",
    title: "Похудеть на 6 кг",
    deadline: "до 1 июля 2026",
    progress: 50,
    next: "Тренировка 3 раза в неделю",
  },
  {
    id: "g3",
    emoji: "📖",
    title: "Написать черновик книги",
    deadline: "до 31 декабря 2026",
    progress: 15,
    next: "Писать по 500 слов в день",
  },
];

function WishesScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("wishes");
  const [inspires, setInspires] = useState<Record<string, number>>({});
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [hotelki, setHotelki] = useState<string[]>(INITIAL_HOTELKI);

  // Inline-форма для хотелки
  const [adding, setAdding] = useState(false);
  const [hotelkaText, setHotelkaText] = useState("");

  // Мастер создания желания
  const [creating, setCreating] = useState(false);

  // Редактирование желания
  const [editingWish, setEditingWish] = useState<Wish | null>(null);

  const handleInspire = (id: string) => {
    setInspires((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const handleAddHotelka = () => {
    const v = hotelkaText.trim();
    if (!v) return;
    setHotelki((prev) => [...prev, v]);
    setHotelkaText("");
    setAdding(false);
  };

  const handleCreateWish = (w: Omit<Wish, "id">) => {
    const newWish: Wish = { ...w, id: `w${Date.now()}` };
    setWishes((prev) => [newWish, ...prev]);
    setCreating(false);
  };

  const handleSaveEdit = (updated: Wish) => {
    setWishes((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setEditingWish(null);
  };

  if (creating) {
    return <CreateWishWizard onClose={() => setCreating(false)} onCreate={handleCreateWish} />;
  }

  if (editingWish) {
    return (
      <EditWishScreen
        wish={editingWish}
        onClose={() => setEditingWish(null)}
        onSave={handleSaveEdit}
      />
    );
  }

  return (
    <div className="pb-4">
      {/* Горизонтальные вкладки */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 no-scrollbar">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  active
                    ? "tap btn-pill-orange btn-sm shrink-0"
                    : "tap shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium bg-card text-muted-foreground hairline"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "wishes" && (
        <div className="px-4 pt-3 space-y-4">
          <button
            onClick={() => setCreating(true)}
            className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Добавить желание
          </button>
          {wishes.map((w, i) => (
            <WishCard
              key={w.id}
              wish={w}
              priority={i === 0}
              count={inspires[w.id] ?? 0}
              onInspire={() => handleInspire(w.id)}
              onEdit={() => setEditingWish(w)}
            />
          ))}
          <div className="text-center text-[11px] text-muted-foreground pt-2 pb-1">
            Это все твои желания на сегодня ✨
          </div>
        </div>
      )}

      {activeTab === "wants" && (
        <div className="px-4 pt-3 space-y-2">
          {adding ? (
            <InlineHotelkaForm
              value={hotelkaText}
              onChange={setHotelkaText}
              onSubmit={handleAddHotelka}
              onCancel={() => {
                setAdding(false);
                setHotelkaText("");
              }}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5 mb-1"
            >
              <Plus className="h-4 w-4" /> Добавить хотелку
            </button>
          )}
          {hotelki.map((h, i) => (
            <div
              key={i}
              className="bg-card hairline rounded-xl px-3.5 py-3 shadow-card flex items-center gap-3 animate-fade-up"
            >
              <div className="h-7 w-7 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[12px] font-medium text-muted-foreground">
                {i + 1}
              </div>
              <p className="text-[14px] leading-snug text-foreground/90 flex-1">{h}</p>
            </div>
          ))}
          <div className="text-center text-[11px] text-muted-foreground pt-2 pb-1">
            Маленькие хотелки — большие радости 🌿
          </div>
        </div>
      )}

      {activeTab === "goals" && (
        <div className="px-4 pt-3 space-y-3">
          {GOALS.map((g) => (
            <article
              key={g.id}
              className="bg-card hairline rounded-2xl p-4 shadow-card animate-fade-up"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  {g.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold leading-tight">{g.title}</h3>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{g.deadline}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Прогресс</span>
                  <span className="font-medium text-foreground">{g.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${g.progress}%`,
                      background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[12px] text-foreground/70 leading-snug flex-1">
                  <span className="text-muted-foreground">След. шаг: </span>
                  {g.next}
                </p>
                <button className="tap btn-pill-orange btn-sm shrink-0">Открыть</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeTab === "tasks" && <EmptyTab tab="Задачи" />}
      {activeTab === "done" && <EmptyTab tab="Воплощённые" />}
    </div>
  );
}

/* ---------------- Inline-форма «Добавить хотелку» ---------------- */

function InlineHotelkaForm({
  value,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filled = value.trim().length > 0;

  return (
    <div className="bg-card rounded-xl px-3.5 py-3 shadow-card animate-fade-up mb-1"
         style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (filled) onSubmit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="Напиши своё желание..."
        className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground"
      />
      <div className="mt-3 flex gap-2">
        <button
          onClick={onCancel}
          className="tap flex-1 rounded-full px-3.5 py-1.5 text-[12px] font-medium bg-secondary text-muted-foreground hairline"
        >
          Отмена
        </button>
        <button
          onClick={onSubmit}
          disabled={!filled}
          className="tap btn-pill-orange btn-sm flex-1 disabled:opacity-40"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}

/* ---------------- Карточка желания ---------------- */

function WishCard({
  wish,
  priority,
  count,
  onInspire,
  onEdit,
}: {
  wish: Wish;
  priority?: boolean;
  count: number;
  onInspire: () => void;
  onEdit: () => void;
}) {
  return (
    <article className="bg-card hairline rounded-2xl overflow-hidden shadow-card animate-fade-up">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <img
          src={wish.image}
          alt={wish.title}
          width={768}
          height={1024}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
        <button
          onClick={onEdit}
          aria-label="Изменить желание"
          className="tap absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
          style={{
            background: "rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Pencil className="h-3 w-3" /> Изменить
        </button>
      </div>

      <div className="px-4 py-3.5">
        <h3 className="text-[16px] font-semibold leading-tight text-foreground">
          {wish.title}
        </h3>

        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Почему это важно
        </p>

        <ul className="mt-1.5 space-y-1.5">
          {wish.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-snug text-foreground/80">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between gap-3">
          <DesireCharge level={count} onTap={onInspire} />
          <button className="tap btn-pill-orange btn-sm shrink-0">
            Сделать целью →
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyTab({ tab }: { tab: string }) {
  return (
    <div className="px-4 pt-16 text-center">
      <div className="text-4xl mb-3">✨</div>
      <h3 className="text-[15px] font-semibold text-foreground">{tab}</h3>
      <p className="mt-1.5 text-[12px] text-muted-foreground max-w-[260px] mx-auto">
        Здесь скоро появится твой раздел «{tab}». Сейчас открыты «Желания».
      </p>
    </div>
  );
}

/* ---------------- Заряд желания ---------------- */

const CHARGE_WORDS = [
  { label: "Нравится",      color: "#9c8f7a" },
  { label: "Вдохновляет",   color: "#FFB300" },
  { label: "Зажигает",      color: "#FF9100" },
  { label: "Манит",         color: "#FF7A00" },
  { label: "Жажду",         color: "#FF5722" },
  { label: "Горю желанием", color: "#E64A19" },
] as const;

const DOT_FILLED_COLORS = ["#FFD180", "#FFB300", "#FF9100", "#FF6D00", "#E64A19"];
const DOT_EMPTY = "#e0d8cc";

function DesireCharge({ level, onTap }: { level: number; onTap: () => void }) {
  const inCycle = level % 5;
  const displayDots = level > 0 && inCycle === 0 ? 5 : inCycle;
  const badge = level > 0 ? 1 + Math.floor((level - 1) / 5) : 0;
  const wordIdx = Math.min(5, displayDots);
  const word = CHARGE_WORDS[wordIdx];

  return (
    <button
      onClick={onTap}
      aria-label="Заряд желания"
      className="tap flex items-center gap-2.5 min-w-0 select-none -mx-1 px-1 py-1 rounded-lg"
    >
      <span className="text-[22px] leading-none transition-transform active:scale-90">
        ❤️
      </span>
      <span className="flex flex-col gap-1 min-w-0 text-left">
        <span className="flex items-center gap-1.5">
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < displayDots;
              return (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full transition-colors"
                  style={{ backgroundColor: filled ? DOT_FILLED_COLORS[i] : DOT_EMPTY }}
                />
              );
            })}
          </span>
          {badge > 0 && (
            <span
              key={badge}
              className="min-w-[20px] h-[18px] px-1.5 rounded-full bg-[#FF6D00] text-white text-[10px] font-bold flex items-center justify-center animate-pop"
            >
              +{badge}
            </span>
          )}
        </span>
        <span
          key={`${badge}-${displayDots}`}
          className="text-[12px] font-medium leading-none animate-pop"
          style={{ color: word.color }}
        >
          {word.label}
        </span>
      </span>
    </button>
  );
}

/* ============================================================
   ====================  МАСТЕР СОЗДАНИЯ  ===================== */

const STEP_LABELS = ["Название", "Причины", "Картинка"] as const;

function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="px-4 pt-3 pb-4">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const idx = i + 1;
          const done = step > idx;
          const active = step === idx;
          return (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors"
                  style={
                    done || active
                      ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                      : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                  }
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : idx}
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active || done ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 -mt-4 rounded"
                     style={{ background: step > idx ? "#FF6D00" : "var(--secondary)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WizardHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="tap inline-flex items-center gap-1 text-[13px] text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Отмена
        </button>
        <h2 className="flex-1 text-center text-[15px] font-semibold pr-12">{title}</h2>
      </div>
    </div>
  );
}

function CreateWishWizard({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (wish: Omit<Wish, "id">) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [title, setTitle] = useState("");
  const [reasons, setReasons] = useState<string[]>(["", "", ""]);
  const [image, setImage] = useState<string>("");

  const filledReasons = reasons.map((r) => r.trim()).filter(Boolean);

  const handleCreate = () => {
    onCreate({
      title: title.trim(),
      reasons: filledReasons,
      image,
    });
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <WizardHeader title="Готово" onBack={onClose} />
        <div className="px-4 pt-8 text-center animate-fade-up">
          <div className="text-6xl mb-3">🌟</div>
          <h2 className="text-[20px] font-bold">Желание создано!</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Твоё желание добавлено в ленту
          </p>

          <article className="mt-6 mx-auto max-w-sm bg-card hairline rounded-2xl overflow-hidden shadow-card text-left">
            {image && (
              <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                <img src={image} alt={title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="px-4 py-3.5">
              <h3 className="text-[16px] font-semibold">{title}</h3>
              {filledReasons.slice(0, 2).length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {filledReasons.slice(0, 2).map((r, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-snug text-foreground/80">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          <button
            onClick={handleCreate}
            className="tap btn-pill-orange mt-6 inline-flex items-center justify-center gap-1.5 px-6"
          >
            Посмотреть в ленте
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <WizardHeader title="Новое желание" onBack={onClose} />
      <StepIndicator step={step} />

      {step === 1 && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Как называется твоё желание?</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Короткое и образное — так оно лучше запоминается
          </p>

          <input
            autoFocus
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Дом у океана"
            className="mt-5 w-full rounded-xl bg-card px-4 py-3.5 text-[18px] font-bold outline-none transition-colors"
            style={{ border: `1px solid ${title.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
          />
          <div className="mt-1.5 text-right text-[11px] text-muted-foreground">
            {title.length}/80
          </div>

          <button
            disabled={title.trim().length < 2}
            onClick={() => setStep(2)}
            className="tap btn-pill-orange w-full mt-6 disabled:opacity-40"
          >
            Далее → Причины
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Почему это важно?</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Запиши причины — они держат мотивацию когда становится трудно.
          </p>

          <div className="mt-5 space-y-2.5">
            {reasons.map((r, i) => {
              const filled = r.trim().length > 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-[13px] font-bold transition-colors"
                    style={
                      filled
                        ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                        : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                    }
                  >
                    {i + 1}
                  </div>
                  <input
                    value={r}
                    onChange={(e) => {
                      const next = [...reasons];
                      next[i] = e.target.value;
                      setReasons(next);
                    }}
                    placeholder={i === 0 ? "Самая главная причина..." : `Причина ${i + 1}...`}
                    className="flex-1 rounded-xl bg-card px-3.5 py-2.5 text-[14px] outline-none transition-colors"
                    style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                  />
                  {reasons.length > 1 && (
                    <button
                      onClick={() => setReasons(reasons.filter((_, j) => j !== i))}
                      aria-label="Удалить причину"
                      className="tap h-8 w-8 shrink-0 rounded-full bg-secondary text-muted-foreground inline-flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {reasons.length < 5 && (
              <button
                onClick={() => setReasons([...reasons, ""])}
                className="tap w-full rounded-xl py-2.5 text-[13px] font-medium text-muted-foreground"
                style={{ border: "1px dashed rgba(0,0,0,0.18)" }}
              >
                + Ещё причина
              </button>
            )}
          </div>

          <div
            className="mt-4 rounded-xl px-3.5 py-3 text-[12px] leading-snug text-foreground/80"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
          >
            💡 Чем конкретнее — тем сильнее. «Чтобы дети росли у моря» лучше, чем «хочу дом».
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-secondary text-muted-foreground hairline"
            >
              ← Назад
            </button>
            <button
              disabled={filledReasons.length === 0}
              onClick={() => setStep(3)}
              className="tap btn-pill-orange flex-1 disabled:opacity-40"
            >
              Далее → Картинка
            </button>
          </div>
          <button
            onClick={() => setStep(3)}
            className="tap mt-3 w-full text-center text-[12px] text-muted-foreground underline-offset-2 hover:underline"
          >
            Пропустить
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Добавь картинку</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Визуальный образ усиливает желание. Загрузи фото с телефона или компьютера.
          </p>

          {!image ? (
            <label
              className="tap mt-5 block cursor-pointer rounded-[18px] bg-card px-4 py-8 text-center"
              style={{ border: "1.5px dashed #ede8df" }}
            >
              <div
                className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "linear-gradient(135deg, #FFE0B2, #FFB300)" }}
              >
                🖼️
              </div>
              <h3 className="mt-3 text-[15px] font-semibold">Выбрать фото</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Нажми чтобы выбрать фото с телефона или компьютера
              </p>
              <span className="tap btn-pill-orange mt-4 inline-flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4" /> Открыть галерею
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImage(URL.createObjectURL(f));
                }}
              />
            </label>
          ) : (
            <div className="mt-5">
              <div className="relative rounded-[18px] overflow-hidden" style={{ height: 200 }}>
                <img src={image} alt="Превью" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                  <div className="text-white text-[14px] font-semibold drop-shadow">{title}</div>
                </div>
                <button
                  onClick={() => setImage("")}
                  className="tap absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-white"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <X className="h-3 w-3" /> Убрать
                </button>
              </div>
              <label className="tap mt-2 block text-center text-[12px] text-muted-foreground underline-offset-2 hover:underline cursor-pointer">
                <RotateCw className="inline h-3 w-3 mr-1" /> Выбрать другое фото
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setImage(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-secondary text-muted-foreground hairline"
            >
              ← Назад
            </button>
            <button
              disabled={!image}
              onClick={() => setStep(4)}
              className="tap btn-pill-orange flex-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" /> Создать желание
            </button>
          </div>
          {!image && (
            <p className="mt-2 text-center text-[12px] text-muted-foreground">
              Загрузи картинку чтобы создать желание
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ===================  ЭКРАН РЕДАКТИРОВАНИЯ  ================= */

type EditTab = "title" | "reasons" | "image";

function EditWishScreen({
  wish,
  onClose,
  onSave,
}: {
  wish: Wish;
  onClose: () => void;
  onSave: (w: Wish) => void;
}) {
  const [tab, setTab] = useState<EditTab>("title");
  const [title, setTitle] = useState(wish.title);
  const [reasons, setReasons] = useState<string[]>(wish.reasons.length ? wish.reasons : [""]);
  const [image, setImage] = useState<string>(wish.image);

  const handleSave = () => {
    onSave({
      ...wish,
      title: title.trim() || wish.title,
      reasons: reasons.map((r) => r.trim()).filter(Boolean),
      image,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={onClose}
            className="tap inline-flex items-center gap-1 text-[13px] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> К желанию
          </button>
          <h2 className="flex-1 text-center text-[15px] font-semibold">Изменить</h2>
          <button onClick={handleSave} className="tap btn-pill-orange btn-sm">Сохранить</button>
        </div>
      </div>

      {/* Live превью */}
      <div className="px-4 pt-3">
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 130 }}>
          <img src={image} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
            <div className="text-white text-[15px] font-semibold drop-shadow">{title}</div>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="px-4 mt-3 flex gap-1.5">
        {([
          { id: "title",   label: "✏️ Название" },
          { id: "reasons", label: "💡 Причины"  },
          { id: "image",   label: "🖼 Картинка"  },
        ] as { id: EditTab; label: string }[]).map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                active
                  ? "tap btn-pill-orange btn-sm flex-1"
                  : "tap flex-1 rounded-full px-3 py-1.5 text-[12px] font-medium bg-card text-muted-foreground hairline"
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-4">
        {tab === "title" && (
          <div className="animate-fade-up">
            <input
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-card px-4 py-3 text-[16px] font-semibold outline-none transition-colors"
              style={{ border: `1px solid ${title.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
            <div className="mt-1.5 text-right text-[11px] text-muted-foreground">
              {title.length}/80
            </div>
            <div
              className="mt-4 rounded-xl px-3.5 py-3 text-[12px] leading-snug text-foreground/80"
              style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
            >
              💡 «Дом у океана» лучше чем «Купить недвижимость на побережье».
            </div>
          </div>
        )}

        {tab === "reasons" && (
          <div className="animate-fade-up space-y-2.5">
            {reasons.map((r, i) => {
              const filled = r.trim().length > 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-[13px] font-bold"
                    style={
                      filled
                        ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                        : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                    }
                  >
                    {i + 1}
                  </div>
                  <input
                    value={r}
                    onChange={(e) => {
                      const next = [...reasons];
                      next[i] = e.target.value;
                      setReasons(next);
                    }}
                    placeholder={`Причина ${i + 1}...`}
                    className="flex-1 rounded-xl bg-card px-3.5 py-2.5 text-[14px] outline-none transition-colors"
                    style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                  />
                  {reasons.length > 1 && (
                    <button
                      onClick={() => setReasons(reasons.filter((_, j) => j !== i))}
                      aria-label="Удалить причину"
                      className="tap h-8 w-8 shrink-0 rounded-full bg-secondary text-muted-foreground inline-flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {reasons.length < 5 && (
              <button
                onClick={() => setReasons([...reasons, ""])}
                className="tap w-full rounded-xl py-2.5 text-[13px] font-medium text-muted-foreground"
                style={{ border: "1px dashed rgba(0,0,0,0.18)" }}
              >
                + Добавить причину
              </button>
            )}
          </div>
        )}

        {tab === "image" && (
          <div className="animate-fade-up">
            <label
              className="tap block cursor-pointer rounded-[18px] bg-card px-4 py-8 text-center"
              style={{ border: "1.5px dashed #ede8df" }}
            >
              <div
                className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg, #FFE0B2, #FFB300)" }}
              >
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-3 text-[14px] font-semibold">Загрузить новое фото</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                С телефона или компьютера
              </p>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImage(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Bottom save */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-3 safe-bottom">
        <button onClick={handleSave} className="tap btn-pill-orange w-full">
          Сохранить изменения
        </button>
      </div>
    </div>
  );
}
