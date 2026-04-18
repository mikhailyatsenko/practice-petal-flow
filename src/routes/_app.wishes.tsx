import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
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

const WISHES: Wish[] = [
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

const HOTELKI = [
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

  const handleInspire = (id: string) => {
    setInspires((prev) => ({ ...prev, [id]: Math.min(5, (prev[id] ?? 0) + 1) }));
  };

  // (kept for backward compatibility above)

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
          <button className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5">
            <Plus className="h-4 w-4" /> Добавить желание
          </button>
          {WISHES.map((w, i) => (
            <WishCard
              key={w.id}
              wish={w}
              priority={i === 0}
              count={inspires[w.id] ?? 0}
              onInspire={() => handleInspire(w.id)}
            />
          ))}
          <div className="text-center text-[11px] text-muted-foreground pt-2 pb-1">
            Это все твои желания на сегодня ✨
          </div>
        </div>
      )}

      {activeTab === "wants" && (
        <div className="px-4 pt-3 space-y-2">
          <button className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5 mb-1">
            <Plus className="h-4 w-4" /> Добавить хотелку
          </button>
          {HOTELKI.map((h, i) => (
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

function WishCard({
  wish,
  priority,
  count,
  onInspire,
}: {
  wish: Wish;
  priority?: boolean;
  count: number;
  onInspire: () => void;
}) {
  return (
    <article className="bg-card hairline rounded-2xl overflow-hidden shadow-card animate-fade-up">
      <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
        <img
          src={wish.image}
          alt={wish.title}
          width={768}
          height={1024}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
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
  const safe = Math.max(0, Math.min(5, level));
  const word = CHARGE_WORDS[safe];

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <button
        onClick={onTap}
        aria-label="Заряд желания"
        className="tap text-[22px] leading-none select-none active:scale-90 transition-transform"
      >
        ❤️
      </button>
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < safe;
            return (
              <span
                key={i}
                className="h-2 w-2 rounded-full transition-colors"
                style={{ backgroundColor: filled ? DOT_FILLED_COLORS[i] : DOT_EMPTY }}
              />
            );
          })}
        </div>
        <span
          key={safe}
          className="text-[12px] font-medium leading-none animate-pop"
          style={{ color: word.color }}
        >
          {word.label}
        </span>
      </div>
    </div>
  );
}
