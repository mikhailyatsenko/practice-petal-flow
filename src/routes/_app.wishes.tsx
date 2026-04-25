import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ArrowLeft, Check, ImageIcon, FolderOpen, Pencil, RotateCw, Sparkles, Trash2, Trophy, MoreHorizontal } from "lucide-react";
import wishHouse from "@/assets/wish-house.jpg";
import wishBali from "@/assets/wish-bali.jpg";
import wishBody from "@/assets/wish-body.jpg";
import wishBook from "@/assets/wish-book.jpg";
import wishBusiness from "@/assets/wish-business.jpg";
import goalMarathon from "@/assets/goal-marathon.jpg";
import goalLanguage from "@/assets/goal-language.jpg";
import goalSavings from "@/assets/goal-savings.jpg";
import { TasksModule, CreateOrEditTaskScreen, type Task as ModuleTask } from "@/components/tasks/TasksModule";

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

const getAdjacentTab = (tab: TabId, step: -1 | 1): TabId | null => {
  const idx = TABS.findIndex((item) => item.id === tab);
  const next = TABS[idx + step];
  return next ? next.id : null;
};

type ImageAspect = "portrait" | "landscape" | "square";

const aspectClass = (a?: ImageAspect) =>
  a === "landscape" ? "aspect-[16/10]" : a === "square" ? "aspect-square" : "aspect-[4/5]";

interface Wish {
  id: string;
  image: string;
  title: string;
  reasons: string[];
  aspect?: ImageAspect;
}

const INITIAL_WISHES: Wish[] = [
  {
    id: "w1",
    image: wishHouse,
    title: "Дом у океана",
    aspect: "portrait",
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
    aspect: "landscape",
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
    aspect: "square",
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
    aspect: "landscape",
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
    aspect: "portrait",
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

interface GoalTask {
  id: number;
  text: string;
  done: boolean;
}

interface Goal {
  id: string;
  title: string;
  image: string;            // путь к картинке цели
  deadline: string;
  progress: number;
  reasons: string[];
  criteria: string;
  plan: string;
  tasks: GoalTask[];
  aspect?: ImageAspect;
}

const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const daysInMonth = (monthIdx: number, year: number) =>
  new Date(year, monthIdx + 1, 0).getDate();

const formatDeadline = (d: number, m: number, y: number) =>
  `${d} ${MONTHS_RU[m]} ${y}`;

// Начальные цели — НЕ пересекаются с желаниями (другие темы и картинки)
const INITIAL_GOALS: Goal[] = [
  {
    id: "g1",
    title: "Пробежать первый марафон",
    image: goalMarathon,
    aspect: "landscape",
    deadline: "1 октября 2026",
    progress: 35,
    reasons: [
      "Доказать себе, что могу больше",
      "Построить выносливость и здоровье",
    ],
    criteria: "Финиш марафона 42,2 км в пределах 4:30:00.",
    plan: "Тренировки 4 раза в неделю → длинная пробежка по выходным → участие в полумарафоне в августе.",
    tasks: [
      { id: 1, text: "Купить кроссовки для длинных дистанций", done: true },
      { id: 2, text: "Составить план тренировок", done: false },
      { id: 3, text: "Зарегистрироваться на марафон", done: false },
    ],
  },
  {
    id: "g2",
    title: "Выучить испанский до B1",
    image: goalLanguage,
    aspect: "portrait",
    deadline: "1 июня 2027",
    progress: 20,
    reasons: [
      "Свободно общаться в путешествиях",
      "Открыть мир испаноязычной культуры",
    ],
    criteria: "Сдан экзамен DELE B1 с положительным результатом.",
    plan: "3 урока в неделю с преподавателем + ежедневно 20 мин Duolingo + один сериал в оригинале в неделю.",
    tasks: [
      { id: 1, text: "Найти преподавателя", done: true },
      { id: 2, text: "Пройти базовый курс грамматики", done: false },
    ],
  },
  {
    id: "g3",
    title: "Накопить финансовую подушку",
    image: goalSavings,
    aspect: "square",
    deadline: "31 декабря 2026",
    progress: 45,
    reasons: [
      "Чувствовать уверенность и спокойствие",
      "Иметь свободу выбирать, а не выживать",
    ],
    criteria: "На отдельном счёте лежит сумма равная 6 месячным расходам.",
    plan: "Откладывать 20% дохода каждый месяц → класть на отдельный накопительный счёт → не трогать.",
    tasks: [
      { id: 1, text: "Открыть накопительный счёт", done: true },
      { id: 2, text: "Настроить автоперевод 20%", done: false },
    ],
  },
];

function WishesScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("wishes");
  const [transitionState, setTransitionState] = useState<{
    current: TabId;
    next: TabId;
    direction: -1 | 1;
    stage: "animating";
  } | null>(null);
  const touchRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [inspires, setInspires] = useState<Record<string, number>>({});
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [hotelki, setHotelki] = useState<string[]>(INITIAL_HOTELKI);

  // Цели
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [goalInspires, setGoalInspires] = useState<Record<string, number>>({});
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [creatingGoal, setCreatingGoal] = useState<null | { fromWish?: Wish; returnTo?: TabId }>(null);

  // Inline-форма для хотелки
  const [adding, setAdding] = useState(false);
  const [hotelkaText, setHotelkaText] = useState("");

  // Мастер создания желания
  const [creating, setCreating] = useState(false);

  // Редактирование желания
  const [editingWish, setEditingWish] = useState<Wish | null>(null);

  // Воплощённые
  const [doneHotelki, setDoneHotelki] = useState<Set<string>>(
    () => new Set([
      "Купить красивую кружку для кофе",
      "Научиться готовить пасту карбонара",
      "Завести растение на рабочий стол",
    ]),
  );
  const [doneWishes, setDoneWishes] = useState<Set<string>>(
    () => new Set(["w2", "w4"]),
  );
  const [doneGoals, setDoneGoals] = useState<Set<string>>(
    () => new Set(["g3"]),
  );

  // Раздел «Задачи»: фильтр по конкретной цели (когда переходим из «Цели → К задачам»)
  const [tasksFromGoalId, setTasksFromGoalId] = useState<string | null>(null);

  // Центральное хранилище задач (используется и в TasksModule, и в карточке цели)
  const [moduleTasks, setModuleTasks] = useState<ModuleTask[]>([
    { id: "t1", goalId: "g1", title: "Купить кроссовки для длинных дистанций", deadline: "🟧 На день", duration: "1 час", feeling: 8, done: false, timeSpent: 0 },
    { id: "t2", goalId: "g1", title: "Составить план тренировок на месяц", deadline: "🟥 Главная задача", duration: "2 часа", feeling: 7, done: false, timeSpent: 0 },
    { id: "t3", goalId: "g1", title: "Зарегистрироваться на полумарафон", deadline: "🟪 На месяц", duration: "30 мин", feeling: 9, done: false, timeSpent: 0 },
    { id: "t4", goalId: "g2", title: "Найти преподавателя испанского", deadline: "🟦 На неделю", duration: "1 час", feeling: 6, done: false, timeSpent: 0 },
    { id: "t5", goalId: "g2", title: "Пройти базовый курс грамматики", deadline: "🟥 Главная задача", duration: "Более 10 часов", feeling: 5, done: false, timeSpent: 0 },
    { id: "t6", goalId: "g3", title: "Открыть накопительный счёт", deadline: "🟧 На день", duration: "30 мин", feeling: 7, done: false, timeSpent: 0 },
    { id: "t7", goalId: "g3", title: "Настроить автоперевод 20% от дохода", deadline: "⬜ Не определён", duration: "15 мин", feeling: 8, done: false, timeSpent: 0 },
  ]);

  // Быстрая постановка задачи из карточки цели
  const [quickTaskGoalId, setQuickTaskGoalId] = useState<string | null>(null);

  useEffect(() => {
    const onTouchMove = (event: TouchEvent) => {
      const state = touchRef.current;
      if (!state.active) return;

      const touch = event.touches[0];
      if (!touch) return;

      const dx = touch.clientX - state.x;
      const dy = touch.clientY - state.y;
      const startedNearEdge = state.x <= 32 || state.x >= window.innerWidth - 32;
      const isHorizontalSwipe = Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.1;

      if (startedNearEdge && isHorizontalSwipe) {
        event.preventDefault();
      }
    };

    const resetTouch = () => {
      touchRef.current.active = false;
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchcancel", resetTouch);

    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchcancel", resetTouch);
    };
  }, []);

  const toggleDoneHotelka = (text: string) => {
    setDoneHotelki((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };
  const toggleDoneWish = (id: string) => {
    setDoneWishes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleDoneGoal = (id: string) => {
    setDoneGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInspire = (id: string) => {
    setInspires((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };
  const handleGoalInspire = (id: string) => {
    setGoalInspires((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
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

  const handleDeleteWish = (id: string) => {
    setWishes((prev) => prev.filter((w) => w.id !== id));
    setEditingWish(null);
  };

  const handleEditHotelka = (i: number, v: string) => {
    const t = v.trim();
    if (!t) return;
    setHotelki((prev) => prev.map((h, j) => (j === i ? t : h)));
  };

  const handleDeleteHotelka = (i: number) => {
    setHotelki((prev) => prev.filter((_, j) => j !== i));
  };

  const handleCreateGoal = (g: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...g,
      id: `g${Date.now()}`,
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleSaveGoal = (updated: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setEditingGoal(null);
  };
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setEditingGoal(null);
  };

  if (creatingGoal) {
    return (
      <CreateGoalWizard
        wishes={wishes}
        fromWish={creatingGoal.fromWish}
        onClose={() => {
          const ret = creatingGoal.returnTo;
          setCreatingGoal(null);
          if (ret) setActiveTab(ret);
        }}
        onCreate={(g, openInGoals, sourceWishId) => {
          handleCreateGoal(g);
          // Желание превратилось в цель — убираем его из ленты желаний
          if (sourceWishId) {
            setWishes((prev) => prev.filter((w) => w.id !== sourceWishId));
          }
          const ret = creatingGoal.returnTo;
          setCreatingGoal(null);
          if (openInGoals) setActiveTab("goals");
          else setActiveTab("goals"); // всегда показываем созданную цель
          void ret;
        }}
      />
    );
  }

  if (editingGoal) {
    return (
      <EditGoalScreen
        goal={editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleSaveGoal}
        onDelete={() => handleDeleteGoal(editingGoal.id)}
      />
    );
  }

  if (creating) {
    return (
      <CreateWishWizard
        onClose={() => setCreating(false)}
        onCreate={handleCreateWish}
        hotelki={hotelki}
        onConsumeHotelka={(idx) => setHotelki((prev) => prev.filter((_, j) => j !== idx))}
      />
    );
  }

  if (editingWish) {
    return (
      <EditWishScreen
        wish={editingWish}
        onClose={() => setEditingWish(null)}
        onSave={handleSaveEdit}
        onDelete={() => handleDeleteWish(editingWish.id)}
      />
    );
  }

  
  const changeTabWithCardEffect = (direction: -1 | 1, targetTab?: TabId) => {
    if (transitionState) return;
    const next = targetTab ?? getAdjacentTab(activeTab, direction);
    if (!next || next === activeTab) return;
    setTransitionState({ current: activeTab, next, direction, stage: "animating" });
    window.setTimeout(() => {
      setActiveTab(next);
      setTransitionState(null);
    }, 320);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, active: true };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current.active || transitionState) return;
    touchRef.current.active = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) changeTabWithCardEffect(1);
    if (dx > 0) changeTabWithCardEffect(-1);
  };

  const renderTabContent = (tab: TabId) => {
    if (tab === "wishes") {
      return (
        <div className="px-4 pt-3 space-y-4">
          <button
            onClick={() => setCreating(true)}
            className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Добавить желание
          </button>
          <div className="space-y-4">
            {wishes.filter((w) => !doneWishes.has(w.id)).map((w) => (
              <WishCard
                key={w.id}
                wish={w}
                priority={false}
                count={inspires[w.id] ?? 0}
                onInspire={() => handleInspire(w.id)}
                onEdit={() => setEditingWish(w)}
                onMakeGoal={() => setCreatingGoal({ fromWish: w, returnTo: "wishes" })}
                onDelete={() => handleDeleteWish(w.id)}
                isDone={doneWishes.has(w.id)}
                onToggleDone={() => toggleDoneWish(w.id)}
              />
            ))}
            {wishes.filter((w) => !doneWishes.has(w.id)).length === 0 && (
              <div className="text-center text-[13px] text-muted-foreground py-10">
                Пока нет желаний. Добавь первое ✨
              </div>
            )}
          </div>
          <div className="text-center text-[11px] text-muted-foreground pt-2 pb-1">
            Это все твои желания на сегодня ✨
          </div>
        </div>
      );
    }

    if (tab === "wants") {
      return (
        <div className="px-4 pt-3">
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
              className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Добавить хотелку
            </button>
          )}
          <div className="mt-5 space-y-2">
            {hotelki.filter((h) => !doneHotelki.has(h)).map((h) => {
              const realIdx = hotelki.indexOf(h);
              return (
                <HotelkaItem
                  key={`${realIdx}-${h}`}
                  index={realIdx + 1}
                  text={h}
                  onSave={(v) => handleEditHotelka(realIdx, v)}
                  onDelete={() => handleDeleteHotelka(realIdx)}
                  isDone={doneHotelki.has(h)}
                  onToggleDone={() => toggleDoneHotelka(h)}
                />
              );
            })}
          </div>
          <div className="text-center text-[11px] text-muted-foreground pt-3 pb-1">
            Маленькие хотелки — большие радости 🌿
          </div>
        </div>
      );
    }

    if (tab === "goals") {
      return (
        <div className="px-4 pt-3 space-y-4">
          <button
            onClick={() => setCreatingGoal({ returnTo: "goals" })}
            className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Добавить цель
          </button>
          {goals.filter((g) => !doneGoals.has(g.id)).map((g) => {
            const goalTasks = moduleTasks.filter((t) => t.goalId === g.id);
            const goalDone = goalTasks.filter((t) => t.done).length;
            return (
              <GoalCard
                key={g.id}
                goal={g}
                count={goalInspires[g.id] ?? 0}
                onInspire={() => handleGoalInspire(g.id)}
                onEdit={() => setEditingGoal(g)}
                onDelete={() => handleDeleteGoal(g.id)}
                isDone={doneGoals.has(g.id)}
                onToggleDone={() => toggleDoneGoal(g.id)}
                tasksAll={goalTasks}
                tasksDoneCount={goalDone}
                onAddTask={() => setQuickTaskGoalId(g.id)}
                onOpenTasks={() => {
                  // По правке: при переходе из «Цели» фильтр НЕ ставим — показываем все задачи всех целей.
                  setTasksFromGoalId(null);
                  changeTabWithCardEffect(1, "tasks");
                }}
              />
            );
          })}
          {goals.filter((g) => !doneGoals.has(g.id)).length === 0 && (
            <div className="text-center text-[12px] text-muted-foreground pt-6">
              Пока нет целей. Создай первую — вырасти её из желания 🎯
            </div>
          )}
        </div>
      );
    }

    if (tab === "tasks") {
      return (
        <TasksModule
          goals={goals.filter((g) => !doneGoals.has(g.id)).map((g) => ({
            id: g.id,
            title: g.title,
            plan: g.plan,
          }))}
          initialGoalId={tasksFromGoalId}
          onClearGoalFilter={() => setTasksFromGoalId(null)}
          tasks={moduleTasks}
          onTasksChange={(updater) => setModuleTasks(updater)}
        />
      );
    }

    return (
      <RealizedTab
        hotelki={hotelki.filter((h) => doneHotelki.has(h))}
        wishes={wishes.filter((w) => doneWishes.has(w.id))}
        goals={goals.filter((g) => doneGoals.has(g.id))}
        onUndoHotelka={(t) => toggleDoneHotelka(t)}
        onUndoWish={(id) => toggleDoneWish(id)}
        onUndoGoal={(id) => toggleDoneGoal(id)}
      />
    );
  };

  return (
    <div className="pb-4" style={{ touchAction: "pan-y" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Горизонтальные вкладки */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 no-scrollbar">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === activeTab) return;
                  const currentIndex = TABS.findIndex((item) => item.id === activeTab);
                  const nextIndex = TABS.findIndex((item) => item.id === tab.id);
                  changeTabWithCardEffect(nextIndex > currentIndex ? 1 : -1, tab.id);
                }}
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

      <div className="relative overflow-hidden">
        {!transitionState && <div>{renderTabContent(activeTab)}</div>}

        {transitionState && (
          <div className="relative grid" style={{ gridTemplateAreas: '"stack"' }}>
            <div
              className="min-w-0"
              style={{
                gridArea: "stack",
                animation: transitionState.direction === 1
                  ? "slide-out-left 320ms cubic-bezier(.2,.7,.2,1) both"
                  : "slide-out-right 320ms cubic-bezier(.2,.7,.2,1) both",
                background: "var(--background)",
                zIndex: 10,
              }}
            >
              {renderTabContent(transitionState.current)}
            </div>
            <div
              className="min-w-0"
              style={{
                gridArea: "stack",
                animation: transitionState.direction === 1
                  ? "slide-in-from-right 320ms cubic-bezier(.2,.7,.2,1) both"
                  : "slide-in-from-left 320ms cubic-bezier(.2,.7,.2,1) both",
                background: "var(--background)",
                zIndex: 20,
              }}
            >
              {renderTabContent(transitionState.next)}
            </div>
          </div>
        )}
      </div>

      {/* Быстрая постановка задачи из карточки цели */}
      {quickTaskGoalId && createPortal(
        <div
          className="fixed inset-0 z-[100] overflow-y-auto animate-fade-up flex justify-center"
          style={{ background: "var(--background)" }}
        >
          <div className="w-full max-w-[480px]">
            <CreateOrEditTaskScreen
              mode="create"
              goals={goals.filter((g) => !doneGoals.has(g.id)).map((g) => ({ id: g.id, title: g.title, plan: g.plan }))}
              defaultGoalId={quickTaskGoalId}
              onCancel={() => setQuickTaskGoalId(null)}
              onSubmit={(d) => {
                setModuleTasks((prev) => [
                  { ...d, id: `t${Date.now()}`, done: false, timeSpent: 0 },
                  ...prev,
                ]);
                setQuickTaskGoalId(null);
              }}
            />
          </div>
        </div>,
        document.body
      )}
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

/* ---------------- Хотелка с редактированием ---------------- */

function HotelkaItem({
  index,
  text,
  onSave,
  onDelete,
  isDone,
  onToggleDone,
  readOnly = false,
}: {
  index: number;
  text: string;
  onSave: (v: string) => void;
  onDelete: () => void;
  isDone: boolean;
  onToggleDone: () => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const filled = value.trim().length > 0;

  const submit = () => {
    if (!filled) return;
    onSave(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="bg-card rounded-xl px-3.5 py-3 shadow-card animate-fade-up"
        style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
      >
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[12px] font-medium text-muted-foreground">
            {index}
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setValue(text);
                setEditing(false);
              }
            }}
            className="flex-1 bg-transparent outline-none text-[14px] text-foreground"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              setValue(text);
              setEditing(false);
            }}
            className="tap flex-1 rounded-full px-3.5 py-1.5 text-[12px] font-medium bg-secondary text-muted-foreground hairline"
          >
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={!filled}
            className="tap btn-pill-orange btn-sm flex-1 disabled:opacity-40"
          >
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card hairline rounded-xl px-3.5 py-3 shadow-card flex items-center gap-3 animate-fade-up min-h-[52px]">
      <div className="h-7 w-7 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[12px] font-medium text-muted-foreground">
        {index}
      </div>
      <p
        className="text-[14px] leading-snug text-foreground/90 flex-1"
        style={readOnly ? { textDecoration: "line-through", opacity: 0.7 } : undefined}
      >
        {text}
      </p>
      {readOnly ? (
        <button
          type="button"
          onClick={onToggleDone}
          aria-label="Снять отметку «Воплощено»"
          className="tap inline-flex items-center justify-center shrink-0"
          style={{ width: 32, height: 32, borderRadius: 10, background: "#16a34a", color: "#fff" }}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>
      ) : (
        <ActionsMenu
          onDone={onToggleDone}
          onEdit={() => {
            setValue(text);
            setEditing(true);
          }}
          onDelete={onDelete}
          doneConfirmText={`«${text}» будет перемещена в раздел «Воплощённые».`}
          deleteConfirmText={`«${text}» будет удалена навсегда. Это действие нельзя отменить.`}
        />
      )}
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
  onMakeGoal,
  onDelete,
  isDone,
  onToggleDone,
  readOnly = false,
}: {
  wish: Wish;
  priority?: boolean;
  count: number;
  onInspire: () => void;
  onEdit: () => void;
  onMakeGoal: () => void;
  onDelete: () => void;
  isDone: boolean;
  onToggleDone: () => void;
  readOnly?: boolean;
}) {
  void isDone;
  return (
    <article className="bg-card hairline rounded-2xl overflow-hidden shadow-card animate-fade-up">
      <div className={`relative ${aspectClass(wish.aspect)} w-full overflow-hidden bg-muted`}>
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
        <div className="flex items-start gap-3">
          <h3
            className="text-[16px] font-semibold leading-tight text-foreground flex-1 min-w-0"
            style={readOnly ? { textDecoration: "line-through", opacity: 0.75 } : undefined}
          >
            {wish.title}
          </h3>
          {readOnly ? (
            <button
              type="button"
              onClick={onToggleDone}
              aria-label="Снять отметку «Воплощено»"
              className="tap inline-flex items-center justify-center shrink-0"
              style={{ width: 32, height: 32, borderRadius: 10, background: "#16a34a", color: "#fff" }}
            >
              <Check className="h-4 w-4" strokeWidth={3} />
            </button>
          ) : (
            <ActionsMenu
            onDone={onToggleDone}
            onEdit={onEdit}
            onDelete={onDelete}
            doneConfirmText={`«${wish.title}» будет перемещено в раздел «Воплощённые».`}
            deleteConfirmText={`«${wish.title}» будет удалено навсегда. Это действие нельзя отменить.`}
          />
        </div>

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
          <button onClick={onMakeGoal} className="tap btn-pill-orange btn-sm shrink-0">
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

const CHARGE_COLORS = ["#9c8f7a", "#FFB300", "#FF9100", "#FF7A00", "#FF5722", "#E64A19"];
const DOT_FILLED_COLORS = ["#FFD180", "#FFB300", "#FF9100", "#FF6D00", "#E64A19"];
const DOT_EMPTY = "#e0d8cc";

function DesireCharge({ level, onTap, mode = "inspire" }: { level: number; onTap: () => void; mode?: "inspire" | "proud" }) {
  const total = Math.max(0, level);
  const inRound = total === 0 ? 0 : ((total - 1) % 5) + 1;
  // +1 — с первого тапа; +2 — когда пошёл второй круг (после 100%)
  const badgeCount = total === 0 ? 0 : Math.floor((total - 1) / 5) + 1;
  const justHit100 = total > 0 && inRound === 5;
  const label =
    mode === "proud"
      ? total === 0
        ? "Горжусь"
        : `Горжусь · ${total}`
      : total === 0
        ? "Заряжает"
        : `Зарядился на ${inRound * 20}%`;
  const color = CHARGE_COLORS[inRound];

  return (
    <button
      onClick={onTap}
      aria-label="Заряд желания"
      className="tap flex items-center gap-2.5 min-w-0 select-none -mx-1 px-1 py-1 rounded-lg relative"
    >
      <span
        key={`heart-${justHit100 ? total : "idle"}`}
        className={`text-[22px] leading-none transition-transform active:scale-90 ${justHit100 ? "animate-celebrate" : ""}`}
      >
        ❤️
      </span>
      <span className="flex flex-col gap-1 min-w-0 text-left">
        <span className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < inRound;
            return (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${justHit100 && filled ? "animate-celebrate-glow" : ""}`}
                style={{ backgroundColor: filled ? DOT_FILLED_COLORS[i] : DOT_EMPTY }}
              />
            );
          })}
          {/* Бейдж +N — фикс. ширина, чтобы лейбл не прыгал */}
          <span className="ml-1 inline-flex items-center justify-start" style={{ width: 30, height: 18 }}>
            {badgeCount > 0 && (
              <span
                key={badgeCount}
                className="min-w-[22px] h-[18px] px-1.5 rounded-full text-[10px] font-bold text-white inline-flex items-center justify-center animate-pop"
                style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)", boxShadow: "0 2px 6px rgba(255,109,0,0.35)" }}
              >
                +{badgeCount}
              </span>
            )}
          </span>
        </span>
        {/* Фиксированная высота строки лейбла */}
        <span className="block leading-none" style={{ minHeight: 14 }}>
          <span
            key={total}
            className={`text-[12px] font-medium leading-none inline-block ${justHit100 ? "animate-celebrate" : "animate-pop"}`}
            style={{ color }}
          >
            {label}
          </span>
        </span>
      </span>

      {/* Конфетти при 100% */}
      {justHit100 && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          {[
            { c: "#FF6D00", x: -22, y: -28 },
            { c: "#FFB300", x: 18,  y: -30 },
            { c: "#FF9100", x: -28, y: 6   },
            { c: "#E64A19", x: 24,  y: 10  },
            { c: "#FFD180", x: 0,   y: -34 },
            { c: "#FF6D00", x: -10, y: 22  },
            { c: "#FFB300", x: 14,  y: 24  },
          ].map((p, i) => (
            <span
              key={`${total}-${i}`}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                background: p.c,
                left: 0,
                top: 0,
                ["--cx" as never]: `${p.x}px`,
                ["--cy" as never]: `${p.y}px`,
                animation: "confetti-burst 800ms ease-out both",
              }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

/* ============================================================
   ====================  МАСТЕР СОЗДАНИЯ  ===================== */

const STEP_LABELS = ["Название", "Причины", "Картинка"] as const;

function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="px-4 pt-3 pb-4">
      <div className="flex items-start justify-between max-w-[420px] mx-auto">
        {STEP_LABELS.map((label, i) => {
          const idx = i + 1;
          const done = step > idx;
          const active = step === idx;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1.5 min-w-0 shrink-0">
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
                <div className="flex-1 h-[2px] mx-1 mt-3 rounded"
                     style={{ background: step > idx ? "#FF6D00" : "var(--secondary)" }} />
              )}
            </React.Fragment>
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
  hotelki,
  onConsumeHotelka,
}: {
  onClose: () => void;
  onCreate: (wish: Omit<Wish, "id">) => void;
  hotelki: string[];
  onConsumeHotelka: (idx: number) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [title, setTitle] = useState("");
  const [reasons, setReasons] = useState<string[]>(["", "", ""]);
  const [image, setImage] = useState<string>("");
  const [fromHotelkaIdx, setFromHotelkaIdx] = useState<number | null>(null);

  const filledReasons = reasons.map((r) => r.trim()).filter(Boolean);

  const handleCreate = () => {
    if (fromHotelkaIdx !== null) {
      onConsumeHotelka(fromHotelkaIdx);
    }
    onCreate({
      title: title.trim(),
      reasons: filledReasons,
      image,
    });
  };

  const handlePickHotelka = (i: number, text: string) => {
    if (fromHotelkaIdx === i) {
      setFromHotelkaIdx(null);
      setTitle("");
    } else {
      setFromHotelkaIdx(i);
      setTitle(text.slice(0, 80));
    }
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
            Напиши своё желание или выбери одну из хотелок ниже, чтобы превратить её в желание.
          </p>

          <input
            autoFocus
            value={title}
            maxLength={80}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fromHotelkaIdx !== null) setFromHotelkaIdx(null);
            }}
            placeholder="Например: Дом у океана"
            className="mt-5 w-full rounded-xl bg-card px-4 py-3.5 text-[18px] font-bold outline-none transition-colors"
            style={{ border: `1px solid ${title.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
          />
          <div className="mt-1.5 text-right text-[11px] text-muted-foreground">
            {title.length}/80
          </div>

          {hotelki.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  или выбери из хотелок
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto -mx-1 px-1 pb-1">
                {hotelki.map((h, i) => {
                  const active = fromHotelkaIdx === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePickHotelka(i, h)}
                      className="tap w-full text-left bg-card rounded-xl px-3.5 py-3 shadow-card flex items-center gap-3 transition-colors"
                      style={{ border: `1px solid ${active ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                    >
                      <div
                        className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors"
                        style={{
                          background: active ? "#FF6D00" : "var(--secondary)",
                          color: active ? "#fff" : "var(--muted-foreground)",
                        }}
                      >
                        {active ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      <p className="text-[14px] leading-snug text-foreground/90 flex-1">{h}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
  onDelete,
}: {
  wish: Wish;
  onClose: () => void;
  onSave: (w: Wish) => void;
  onDelete: () => void;
}) {
  void onDelete;
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

/* ============================================================
   ========================  ЦЕЛИ  ============================ */

function GoalCard({
  goal,
  count,
  onInspire,
  onEdit,
  onDelete,
  isDone,
  onToggleDone,
  onOpenTasks,
  tasksAll = [],
  tasksDoneCount = 0,
  onAddTask,
}: {
  goal: Goal;
  count: number;
  onInspire: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDone: boolean;
  onToggleDone: () => void;
  onOpenTasks?: () => void;
  tasksAll?: ModuleTask[];
  tasksDoneCount?: number;
  onAddTask?: () => void;
}) {
  void isDone;
  const openTasks = tasksAll.filter((t) => !t.done);
  const totalTasks = tasksAll.length;

  return (
    <article className="bg-card hairline rounded-[20px] overflow-hidden shadow-card animate-fade-up">
      <div className={`relative w-full ${aspectClass(goal.aspect)}`}>
        <img src={goal.image} alt={goal.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>

      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <h3 className="text-[20px] font-bold leading-tight text-foreground flex-1 min-w-0">{goal.title}</h3>
          <ActionsMenu
            onDone={onToggleDone}
            onEdit={onEdit}
            onDelete={onDelete}
            doneConfirmText={`«${goal.title}» будет перемещена в раздел «Воплощённые». Это действие можно отменить.`}
            deleteConfirmText={`«${goal.title}» будет удалена навсегда. Это действие нельзя отменить.`}
          />
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">📅 до {goal.deadline}</p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-semibold" style={{ color: "#FF6D00" }}>{goal.progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#ede8df" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${goal.progress}%`,
                background: "linear-gradient(135deg, #FFB300, #FF6D00)",
              }}
            />
          </div>
        </div>

        <div className="my-3 h-px bg-border/60" />

        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Почему это важно
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {goal.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-snug text-foreground/80">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "#FF6D00" }} />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <div className="my-3 h-px bg-border/60" />

        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Критерий готовности
        </p>
        <div
          className="mt-1.5 rounded-xl px-3 py-2.5 text-[13px] leading-snug text-foreground/85"
          style={{ background: "#FAF6EF" }}
        >
          {goal.criteria}
        </div>

        <div className="my-3 h-px bg-border/60" />

        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          План реализации
        </p>
        <p className="mt-1.5 text-[13px] leading-snug text-foreground/85 whitespace-pre-line">
          {goal.plan}
        </p>

        <div className="my-3 h-px bg-border/60" />

        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Задачи
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddTask?.(); }}
            aria-label="Добавить задачу"
            className="tap inline-flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 26, height: 26,
              background: "linear-gradient(135deg,#FFB300,#FF6D00)",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(255,109,0,0.35)",
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
        {totalTasks === 0 ? (
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">Задач пока нет — добавь первую кнопкой +</p>
        ) : openTasks.length === 0 ? (
          <p className="mt-1.5 text-[13px] text-foreground/85">✅ Все задачи выполнены!</p>
        ) : (
          <ul className="mt-1.5 space-y-1.5">
            {openTasks.map((t) => (
              <li key={t.id} className="flex items-start gap-2 text-[13px] leading-snug text-foreground/85">
                <span
                  className="mt-0.5 inline-block h-4 w-4 rounded-[4px] shrink-0"
                  style={{ border: "1.5px solid #c8c0b0", background: "#fff" }}
                />
                <span className="flex-1">{t.title}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <span>Сделано задач:</span>
          <span className="font-semibold tabular-nums" style={{ color: "#16a34a" }}>{tasksDoneCount}</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <DesireCharge level={count} onTap={onInspire} />
          <button
            onClick={onOpenTasks}
            className="tap btn-pill-orange btn-sm shrink-0"
            style={{ borderRadius: 12 }}
          >
            К задачам →
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   =================  МАСТЕР СОЗДАНИЯ ЦЕЛИ  =================== */

function GoalStepIndicator({
  step,
  labels,
}: {
  step: number;
  labels: string[];
}) {
  const n = labels.length;
  // Прогресс линии: от центра 1-го кружка до центра последнего
  const progressPct = n > 1 ? Math.min(Math.max((step - 1) / (n - 1), 0), 1) * 100 : 0;
  return (
    <div className="px-4 pt-3 pb-4">
      <div className="relative">
        {/* Линия-фон (между центрами первого и последнего кружка) */}
        <div
          className="absolute top-[14px] h-[2px] rounded"
          style={{
            left: `calc((100% / ${n}) / 2)`,
            right: `calc((100% / ${n}) / 2)`,
            background: "var(--secondary)",
          }}
        />
        {/* Линия-прогресс */}
        <div
          className="absolute top-[14px] h-[2px] rounded transition-[width]"
          style={{
            left: `calc((100% / ${n}) / 2)`,
            width: `calc((100% - (100% / ${n})) * ${progressPct / 100})`,
            background: "#FF6D00",
          }}
        />
        <div className="relative flex items-start">
          {labels.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5"
                style={{ width: `${100 / n}%` }}
              >
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
                  className="text-[10px] font-medium whitespace-nowrap"
                  style={{ color: active || done ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WheelColumn({
  values,
  index,
  onChange,
  width,
}: {
  values: (string | number)[];
  index: number;
  onChange: (i: number) => void;
  width: number;
}) {
  const ITEM_H = 40;
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external index → scroll position
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = index * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTo({ top: target, behavior: "smooth" });
    }
  }, [index]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const i = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(values.length - 1, i));
      const snap = clamped * ITEM_H;
      if (Math.abs(el.scrollTop - snap) > 1) {
        el.scrollTo({ top: snap, behavior: "smooth" });
      }
      if (clamped !== index) onChange(clamped);
    }, 90);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="relative overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      style={{
        height: ITEM_H * 5,
        width,
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ height: ITEM_H * 2 }} />
      {values.map((v, i) => (
        <div
          key={i}
          className="snap-center flex items-center justify-center text-[16px] transition-all"
          style={{
            height: ITEM_H,
            color: i === index ? "#1a1a1a" : "rgba(0,0,0,0.35)",
            fontWeight: i === index ? 600 : 400,
            transform: i === index ? "scale(1.05)" : "scale(1)",
          }}
        >
          {v}
        </div>
      ))}
      <div style={{ height: ITEM_H * 2 }} />
    </div>
  );
}

function DateWheelPicker({
  day,
  month,
  year,
  onChange,
}: {
  day: number;
  month: number;
  year: number;
  onChange: (d: number, m: number, y: number) => void;
}) {
  const ITEM_H = 40;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  const maxDay = daysInMonth(month, year);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <div className="relative mt-5 rounded-2xl bg-card hairline overflow-hidden">
      {/* Selection highlight */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-xl"
        style={{
          height: ITEM_H,
          background: "rgba(255,109,0,0.08)",
          border: "1px solid rgba(255,109,0,0.25)",
          margin: "0 8px",
        }}
      />
      {/* Top + bottom fade */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0"
        style={{ height: ITEM_H * 2, background: "linear-gradient(180deg, #fff, rgba(255,255,255,0))" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{ height: ITEM_H * 2, background: "linear-gradient(0deg, #fff, rgba(255,255,255,0))" }}
      />
      <div className="flex items-center justify-center gap-2 px-3">
        <WheelColumn
          values={days}
          index={Math.min(day - 1, days.length - 1)}
          onChange={(i) => onChange(i + 1, month, year)}
          width={64}
        />
        <WheelColumn
          values={MONTHS_RU}
          index={month}
          onChange={(i) => {
            const newMax = daysInMonth(i, year);
            onChange(Math.min(day, newMax), i, year);
          }}
          width={130}
        />
        <WheelColumn
          values={years}
          index={Math.max(0, years.indexOf(year))}
          onChange={(i) => {
            const y = years[i];
            const newMax = daysInMonth(month, y);
            onChange(Math.min(day, newMax), month, y);
          }}
          width={80}
        />
      </div>
    </div>
  );
}

function CreateGoalWizard({
  wishes,
  fromWish,
  onClose,
  onCreate,
}: {
  wishes: Wish[];
  fromWish?: Wish;
  onClose: () => void;
  onCreate: (g: Omit<Goal, "id">, openInGoals: boolean, sourceWishId?: string) => void;
}) {
  const startFromWish = !!fromWish;
  // Шаги:
  // Если из желания — 1: Срок, 2: Критерий, 3: План
  // Если с нуля — 1: Желание, 2: Срок, 3: Критерий, 4: План
  const labels = startFromWish
    ? ["Срок", "Критерий", "План"]
    : ["Желание", "Срок", "Критерий", "План"];
  const [step, setStep] = useState<number>(1);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(fromWish ?? null);

  // Дедлайн по умолчанию: 31 декабря текущего года
  const today = new Date();
  const [dlDay, setDlDay] = useState<number>(31);
  const [dlMonth, setDlMonth] = useState<number>(11); // декабрь
  const [dlYear, setDlYear] = useState<number>(today.getFullYear());

  const [criteria, setCriteria] = useState("");
  const [plan, setPlan] = useState("");
  const [done, setDone] = useState(false);

  const finalize = () => {
    if (!selectedWish) return;
    onCreate(
      {
        title: selectedWish.title,
        image: selectedWish.image,
        deadline: formatDeadline(dlDay, dlMonth, dlYear),
        progress: 0,
        reasons: selectedWish.reasons,
        criteria: criteria.trim(),
        plan: plan.trim(),
        tasks: [],
      },
      true,
      startFromWish ? selectedWish.id : undefined,
    );
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center px-4 py-3">
            <h2 className="flex-1 text-center text-[15px] font-semibold">Готово</h2>
          </div>
        </div>
        <div className="px-4 pt-8 text-center animate-fade-up">
          <div className="text-6xl mb-3">🎯</div>
          <h2 className="text-[20px] font-bold">Цель создана!</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Твоя цель добавлена в ленту целей
          </p>

          {selectedWish && (
            <article className="mt-6 mx-auto max-w-sm bg-card hairline rounded-[20px] overflow-hidden shadow-card text-left">
              <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                <img src={selectedWish.image} alt={selectedWish.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-3 bottom-2 text-white text-[15px] font-semibold drop-shadow">
                  {selectedWish.title}
                </div>
              </div>
              <div className="px-4 py-3.5">
                <div className="h-1.5 w-full rounded-full" style={{ background: "#ede8df" }} />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">0%</p>
              </div>
            </article>
          )}

          <button
            onClick={finalize}
            className="tap btn-pill-orange mt-6 inline-flex items-center justify-center gap-1.5 px-6"
          >
            Посмотреть в ленте целей
          </button>
        </div>
      </div>
    );
  }

  // Хедер
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  // Какой логический шаг сейчас
  const isPickWish = !startFromWish && step === 1;
  const isDeadline = startFromWish ? step === 1 : step === 2;
  const isCriteria = startFromWish ? step === 2 : step === 3;
  const isPlan = startFromWish ? step === 3 : step === 4;

  // Превью карточки (название + картинка) — показываем на всех шагах после выбора желания
  const showPreview = !!selectedWish && !isPickWish;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center px-4 py-3">
          <button onClick={onClose} className="tap inline-flex items-center gap-1 text-[13px] text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Отмена
          </button>
          <h2 className="flex-1 text-center text-[15px] font-semibold pr-12">Новая цель</h2>
        </div>
      </div>

      <GoalStepIndicator step={step} labels={labels} />

      {showPreview && selectedWish && (
        <div className="px-4 pt-1 pb-1">
          <div className="relative rounded-2xl overflow-hidden" style={{ height: 110 }}>
            <img src={selectedWish.image} alt={selectedWish.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute left-3 bottom-2 right-3 text-white text-[16px] font-semibold drop-shadow leading-tight">
              {selectedWish.title}
            </div>
          </div>
        </div>
      )}

      {isPickWish && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Выбери желание</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Цель вырастает из желания — выбери то, которое хочешь воплотить
          </p>

          <div className="mt-5 space-y-2">
            {wishes.length === 0 && (
              <p className="text-[13px] text-muted-foreground text-center py-6">
                Сначала создай желание во вкладке «Желания»
              </p>
            )}
            {wishes.map((w) => {
              const active = selectedWish?.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWish(w)}
                  className="tap w-full text-left bg-card rounded-xl px-3 py-3 shadow-card flex items-center gap-3 transition-colors"
                  style={{ border: `1.5px solid ${active ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                >
                  <img
                    src={w.image}
                    alt={w.title}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <p className="flex-1 text-[14px] font-medium text-foreground/90">{w.title}</p>
                  {active && (
                    <div
                      className="h-6 w-6 shrink-0 rounded-full inline-flex items-center justify-center text-white"
                      style={{ background: "#FF6D00" }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            disabled={!selectedWish}
            onClick={() => setStep(2)}
            className="tap btn-pill-orange w-full mt-6 disabled:opacity-40"
          >
            Далее → Срок цели
          </button>
        </div>
      )}

      {isDeadline && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">До какого числа хочешь достичь цели?</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Выбери дату — конкретный срок помогает двигаться.
          </p>

          <DateWheelPicker
            day={dlDay}
            month={dlMonth}
            year={dlYear}
            onChange={(d, m, y) => {
              setDlDay(d);
              setDlMonth(m);
              setDlYear(y);
            }}
          />

          <p className="mt-3 text-center text-[13px] text-foreground/70">
            📅 до <span className="font-semibold text-foreground">{formatDeadline(dlDay, dlMonth, dlYear)}</span>
          </p>

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleBack}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-secondary text-muted-foreground hairline"
            >
              ← Назад
            </button>
            <button
              onClick={() => setStep(step + 1)}
              className="tap btn-pill-orange flex-1"
            >
              Далее → Критерий
            </button>
          </div>
        </div>
      )}

      {isCriteria && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Напиши критерий готовности</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Одно предложение — конкретный факт, по которому ты поймёшь что цель достигнута. Не «хочу похудеть», а «вес 74 кг на весах утром».
          </p>

          <div
            className="mt-4 rounded-xl px-3.5 py-3 text-[12.5px] leading-snug text-foreground/80"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
          >
            <div className="font-semibold mb-1.5">Примеры:</div>
            <ul className="space-y-1">
              <li>• «Написана и опубликована первая глава книги.»</li>
              <li>• «Куплены билеты на Бали и забронировано жильё на 2 месяца.»</li>
              <li>• «Открыт расчётный счёт ИП и получен первый оплаченный заказ.»</li>
            </ul>
          </div>

          <textarea
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="Напиши критерий готовности"
            rows={4}
            className="mt-4 w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
            style={{ border: `1px solid ${criteria.trim().length > 5 ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
          />

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleBack}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-secondary text-muted-foreground hairline"
            >
              ← Назад
            </button>
            <button
              disabled={criteria.trim().length <= 5}
              onClick={() => setStep(step + 1)}
              className="tap btn-pill-orange flex-1 disabled:opacity-40"
            >
              Далее → План
            </button>
          </div>
        </div>
      )}

      {isPlan && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Напиши план реализации</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Опиши шаги — как и в каком порядке ты будешь двигаться к цели.
          </p>

          <div
            className="mt-4 rounded-xl px-3.5 py-3 text-[12.5px] leading-snug text-foreground/80"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
          >
            <div className="font-semibold mb-1.5">Примеры:</div>
            <ul className="space-y-1">
              <li>• «Накопить деньги → купить билеты → найти жильё → оформить страховку.»</li>
              <li>• «3 тренировки в неделю + убрать сахар. Взвешиваться раз в 2 недели.»</li>
            </ul>
          </div>

          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Опиши порядок действий..."
            rows={5}
            className="mt-4 w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
            style={{ border: `1px solid ${plan.trim().length > 5 ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
          />

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleBack}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-secondary text-muted-foreground hairline"
            >
              ← Назад
            </button>
            <button
              disabled={plan.trim().length <= 5}
              onClick={() => setDone(true)}
              className="tap btn-pill-orange flex-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              🎯 Создать цель
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   =================  РЕДАКТИРОВАНИЕ ЦЕЛИ  ==================== */

type GoalEditTab = "title" | "deadline" | "reasons" | "image" | "criteria" | "plan" | "progress";

function parseDeadline(s: string): { d: number; m: number; y: number } {
  // Ожидаем формат "31 декабря 2026"
  const parts = s.trim().split(/\s+/);
  const today = new Date();
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = MONTHS_RU.indexOf(parts[1].toLowerCase());
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && m >= 0 && !isNaN(y)) return { d, m, y };
  }
  return { d: 31, m: 11, y: today.getFullYear() };
}

function EditGoalScreen({
  goal,
  onClose,
  onSave,
  onDelete,
}: {
  goal: Goal;
  onClose: () => void;
  onSave: (g: Goal) => void;
  onDelete: () => void;
}) {
  void onDelete;
  const [tab, setTab] = useState<GoalEditTab>("title");
  const [title, setTitle] = useState(goal.title);
  const [reasons, setReasons] = useState<string[]>(goal.reasons.length ? goal.reasons : [""]);
  const [criteria, setCriteria] = useState(goal.criteria);
  const [plan, setPlan] = useState(goal.plan);
  const [progress, setProgress] = useState(goal.progress);
  const [image, setImage] = useState(goal.image);

  const initDl = parseDeadline(goal.deadline);
  const [dlDay, setDlDay] = useState<number>(initDl.d);
  const [dlMonth, setDlMonth] = useState<number>(initDl.m);
  const [dlYear, setDlYear] = useState<number>(initDl.y);

  const handleSave = () => {
    onSave({
      ...goal,
      title: title.trim() || goal.title,
      deadline: formatDeadline(dlDay, dlMonth, dlYear),
      reasons: reasons.map((r) => r.trim()).filter(Boolean),
      criteria: criteria.trim() || goal.criteria,
      plan: plan.trim() || goal.plan,
      progress,
      image,
    });
  };

  // Порядок: Название → Причины → Картинка → Срок → Критерий → План → Прогресс
  const tabs: { id: GoalEditTab; label: string }[] = [
    { id: "title",    label: "✏️ Название"  },
    { id: "reasons",  label: "💡 Причины"  },
    { id: "image",    label: "🖼 Картинка"  },
    { id: "deadline", label: "📅 Срок"      },
    { id: "criteria", label: "✅ Критерий" },
    { id: "plan",     label: "🗺 План"      },
    { id: "progress", label: "📊 Прогресс" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={onClose}
            className="tap inline-flex items-center gap-1 text-[13px] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> К цели
          </button>
          <h2 className="flex-1 text-center text-[15px] font-semibold">Изменить</h2>
          
          <button onClick={handleSave} className="tap btn-pill-orange btn-sm">Сохранить</button>
        </div>
      </div>

      {/* Live превью */}
      <div className="px-4 pt-3">
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 110 }}>
          <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-3 py-2">
            <div className="text-white text-[15px] font-semibold drop-shadow">{title}</div>
          </div>
          <div
            className="absolute top-2 right-2 text-white text-[12px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
          >
            {progress}%
          </div>
        </div>
      </div>

      {/* Табы — две строки */}
      <div className="px-4 mt-3 flex gap-1.5 flex-wrap">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                active
                  ? "tap btn-pill-orange btn-sm"
                  : "tap rounded-full px-3 py-1.5 text-[12px] font-medium bg-card text-muted-foreground hairline"
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
            <div className="mt-1.5 text-right text-[11px] text-muted-foreground">{title.length}/80</div>
          </div>
        )}

        {tab === "deadline" && (
          <div className="animate-fade-up">
            <p className="text-[13px] text-muted-foreground">
              До какого числа нужно достичь цели
            </p>
            <DateWheelPicker
              day={dlDay}
              month={dlMonth}
              year={dlYear}
              onChange={(d, m, y) => {
                setDlDay(d);
                setDlMonth(m);
                setDlYear(y);
              }}
            />
            <p className="mt-3 text-center text-[13px] text-foreground/70">
              📅 до <span className="font-semibold text-foreground">{formatDeadline(dlDay, dlMonth, dlYear)}</span>
            </p>
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
            <div className="rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: "16 / 9" }}>
              <img src={image} alt={title} className="h-full w-full object-cover" />
            </div>
            <label
              className="tap block cursor-pointer rounded-[18px] bg-card px-4 py-6 text-center"
              style={{ border: "1.5px dashed #ede8df" }}
            >
              <div className="mx-auto h-12 w-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, #FFE0B2, #FFB300)" }}>
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-2 text-[14px] font-semibold">Загрузить новое фото</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">С телефона или компьютера</p>
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

        {tab === "criteria" && (
          <div className="animate-fade-up">
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              rows={4}
              className="w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
              style={{ border: `1px solid ${criteria.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
          </div>
        )}

        {tab === "plan" && (
          <div className="animate-fade-up">
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              rows={6}
              className="w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
              style={{ border: `1px solid ${plan.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
          </div>
        )}

        {tab === "progress" && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-muted-foreground">Текущий прогресс</span>
              <span
                className="text-[13px] font-bold text-white px-3 py-1 rounded-full"
                style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
              >
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-orange-500"
              style={{ accentColor: "#FF6D00" }}
            />
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

/* ============================================================
   ===========  Кнопка «Воплощено» + поп-ап =================== */

function ActionsMenu({
  onDone,
  onEdit,
  onDelete,
  doneConfirmText,
  deleteConfirmText,
}: {
  onDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
  doneConfirmText: string;
  deleteConfirmText: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDone, setConfirmDone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;

      const menuWidth = 172;
      const menuHeight = 136;
      const gap = 8;
      const viewportPadding = 12;

      const left = Math.min(
        window.innerWidth - menuWidth - viewportPadding,
        Math.max(viewportPadding, rect.right - menuWidth),
      );

      const belowTop = rect.bottom + gap;
      const aboveTop = rect.top - menuHeight - gap;
      const top = belowTop + menuHeight <= window.innerHeight - viewportPadding
        ? belowTop
        : Math.max(viewportPadding, aboveTop);

      setMenuPos({ top, left });
    };

    const onDocPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("touchstart", onDocPointerDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("touchstart", onDocPointerDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Действия"
        className="tap inline-flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          background: "transparent",
          border: "none",
          color: "#6b6b6b",
        }}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[70] animate-fade-up"
          style={{
            top: menuPos?.top ?? 0,
            left: menuPos?.left ?? 0,
            width: 172,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirmDone(true);
            }}
            className="tap flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium"
            style={{ color: "#16a34a" }}
          >
            <Check className="h-4 w-4" /> Выполнить
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="tap flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-foreground"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            <Pencil className="h-4 w-4" /> Изменить
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirmDelete(true);
            }}
            className="tap flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium"
            style={{ color: "#E53935", borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            <Trash2 className="h-4 w-4" /> Удалить
          </button>
        </div>,
        document.body,
      )}
      {confirmDone && (
        <RealizedConfirmSheet
          text={doneConfirmText}
          onCancel={() => setConfirmDone(false)}
          onConfirm={() => {
            setConfirmDone(false);
            onDone();
          }}
        />
      )}
      {confirmDelete && (
        <DeleteConfirmSheet
          text={deleteConfirmText}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
}

function DoneButton({
  isDone,
  onToggle,
  confirmText,
}: {
  isDone: boolean;
  onToggle: () => void;
  confirmText: string;
  variant?: "compact" | "wide";
}) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (isDone) {
      onToggle();
    } else {
      setOpen(true);
    }
  };

  const confirm = () => {
    onToggle();
    setOpen(false);
  };

  const doneStyles: React.CSSProperties = {
    background: "#16a34a",
    border: "1px solid #16a34a",
    color: "#ffffff",
  };
  const idleStyles: React.CSSProperties = {
    background: "rgba(22,163,74,0.14)",
    border: "1px solid rgba(22,163,74,0.35)",
    color: "#16a34a",
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isDone}
        aria-label={isDone ? "Снять отметку «Воплощено»" : "Отметить как воплощённое"}
        className="tap inline-flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          transition: "all 0.2s",
          ...(isDone ? doneStyles : idleStyles),
        }}
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </button>
      {open && (
        <RealizedConfirmSheet
          text={confirmText}
          onCancel={() => setOpen(false)}
          onConfirm={confirm}
        />
      )}
    </>
  );
}

function RealizedConfirmSheet({
  text,
  onCancel,
  onConfirm,
}: {
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div
        className="w-full animate-fade-up"
        style={{
          maxWidth: "calc(28rem - 2rem)",
          background: "#fff",
          borderRadius: "24px 24px 24px 24px",
          padding: "24px 20px 28px",
          marginBottom: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4"
          style={{ width: 40, height: 4, borderRadius: 2, background: "#ede8df" }}
        />
        <div className="text-center text-[48px] leading-none">🎉</div>
        <h3 className="mt-2 text-center text-[18px] font-bold text-foreground">Воплощено?</h3>
        <p
          className="mt-2 text-center text-[14px] text-muted-foreground"
          style={{ lineHeight: 1.6 }}
        >
          {text}
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="tap mt-5 w-full font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #4CAF50, #16a34a)",
            borderRadius: 14,
            padding: 14,
          }}
        >
          ✅ Да, воплощено!
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="tap mt-2 w-full text-muted-foreground"
          style={{
            background: "transparent",
            border: "1px solid #ede8df",
            borderRadius: 14,
            padding: 13,
          }}
        >
          Отмена
        </button>
      </div>
    </div>,
    document.body,
  );
}

function DeleteConfirmSheet({
  text,
  onCancel,
  onConfirm,
}: {
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div
        className="w-full animate-fade-up"
        style={{
          maxWidth: "calc(28rem - 2rem)",
          background: "#fff",
          borderRadius: 24,
          padding: "24px 20px 28px",
          marginBottom: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4"
          style={{ width: 40, height: 4, borderRadius: 2, background: "#ede8df" }}
        />
        <div className="text-center text-[48px] leading-none">🗑️</div>
        <h3 className="mt-2 text-center text-[18px] font-bold text-foreground">Удалить?</h3>
        <p
          className="mt-2 text-center text-[14px] text-muted-foreground"
          style={{ lineHeight: 1.6 }}
        >
          {text}
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="tap mt-5 w-full font-bold text-white"
          style={{
            background: "#E53935",
            borderRadius: 14,
            padding: 14,
          }}
        >
          Да, удалить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="tap mt-2 w-full text-muted-foreground"
          style={{
            background: "transparent",
            border: "1px solid #ede8df",
            borderRadius: 14,
            padding: 13,
          }}
        >
          Отмена
        </button>
      </div>
    </div>,
    document.body,
  );
}



function RealizedTab({
  hotelki,
  wishes,
  goals,
  onUndoHotelka,
  onUndoWish,
  onUndoGoal,
}: {
  hotelki: string[];
  wishes: Wish[];
  goals: Goal[];
  onUndoHotelka: (text: string) => void;
  onUndoWish: (id: string) => void;
  onUndoGoal: (id: string) => void;
}) {
  const total = hotelki.length + wishes.length + goals.length;

  if (total === 0) {
    return (
      <div className="px-4 pt-16 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-[15px] font-semibold text-foreground">Воплощённые</h3>
        <p className="mt-1.5 text-[12px] text-muted-foreground max-w-[280px] mx-auto">
          Здесь появятся хотелки, желания и цели, которые ты отметишь как воплощённые.
        </p>
      </div>
    );
  }

  const undoBtn = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-label="Снять отметку «Воплощено»"
      className="tap inline-flex items-center justify-center shrink-0"
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "#16a34a",
        border: "2px solid #16a34a",
        color: "#fff",
        transition: "all 0.2s",
      }}
    >
      <Check className="h-4 w-4" strokeWidth={3} />
    </button>
  );

  type MixedItem =
    | { kind: "hotelka"; key: string; text: string; onUndo: () => void }
    | { kind: "wish"; key: string; text: string; image: string; onUndo: () => void }
    | { kind: "goal"; key: string; text: string; image: string; onUndo: () => void };

  const items: MixedItem[] = [
    ...goals.map((g) => ({
      kind: "goal" as const, key: `g-${g.id}`, text: g.title, image: g.image,
      onUndo: () => onUndoGoal(g.id),
    })),
    ...wishes.map((w) => ({
      kind: "wish" as const, key: `w-${w.id}`, text: w.title, image: w.image,
      onUndo: () => onUndoWish(w.id),
    })),
    ...hotelki.map((h, i) => ({
      kind: "hotelka" as const, key: `h-${i}-${h}`, text: h,
      onUndo: () => onUndoHotelka(h),
    })),
  ];

  // Перемешать детерминированно (стабильный порядок между рендерами)
  const mixed = items
    .map((it, i) => ({ it, sort: ((it.key.length * 31 + i * 17) % 97) }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.it);

  const badge = (kind: MixedItem["kind"]) => {
    const map = {
      hotelka: { label: "Хотелка", bg: "#fff3e0", color: "#FF6D00" },
      wish:    { label: "Желание", bg: "#fce7f3", color: "#db2777" },
      goal:    { label: "Цель",    bg: "#dcfce7", color: "#16a34a" },
    } as const;
    const m = map[kind];
    return (
      <span
        className="inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
        style={{ background: m.bg, color: m.color }}
      >
        {m.label}
      </span>
    );
  };

  return (
    <div className="px-4 pt-3 space-y-2">
      {mixed.map((it) => (
        <div
          key={it.key}
          className="bg-card hairline rounded-xl px-3.5 py-3 shadow-card flex items-center gap-3 min-h-[52px]"
        >
          {"image" in it && (
            <img src={it.image} alt={it.text} className="h-10 w-10 rounded-lg object-cover shrink-0" />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            {badge(it.kind)}
            <p className="text-[14px] leading-snug text-foreground/90 line-through opacity-70 break-words">
              {it.text}
            </p>
          </div>
          {undoBtn(it.onUndo)}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Deck свайп-карточек желаний ---------------- */

function WishesDeck({
  wishes,
  inspires,
  onInspire,
  onEdit,
  onMakeGoal,
  onDelete,
  onToggleDone,
  doneWishes,
}: {
  wishes: Wish[];
  inspires: Record<string, number>;
  onInspire: (id: string) => void;
  onEdit: (w: Wish) => void;
  onMakeGoal: (w: Wish) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
  doneWishes: Set<string>;
}) {
  const [order, setOrder] = useState<string[]>(() => wishes.map((w) => w.id));
  const [dx, setDx] = useState(0);
  const [flying, setFlying] = useState<null | "left" | "right">(null);
  const startRef = useRef<{ x: number; y: number; active: boolean; locked: boolean }>({ x: 0, y: 0, active: false, locked: false });

  // Sync order with incoming wishes (add new / remove deleted), preserving current order for existing ids.
  useEffect(() => {
    setOrder((prev) => {
      const ids = new Set(wishes.map((w) => w.id));
      const kept = prev.filter((id) => ids.has(id));
      const added = wishes.map((w) => w.id).filter((id) => !kept.includes(id));
      return [...added, ...kept];
    });
  }, [wishes]);

  const byId = new Map(wishes.map((w) => [w.id, w]));
  const visibleIds = order.filter((id) => byId.has(id));

  if (visibleIds.length === 0) {
    return (
      <div className="text-center text-[13px] text-muted-foreground py-10">
        Пока нет желаний. Добавь первое ✨
      </div>
    );
  }

  
  const THRESHOLD = 90;

  const commitSwipe = (dir: "left" | "right") => {
    setFlying(dir);
    window.setTimeout(() => {
      setOrder((prev) => {
        if (prev.length <= 1) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setDx(0);
      setFlying(null);
    }, 280);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY, active: true, locked: false };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = startRef.current;
    if (!s.active || flying) return;
    const t = e.touches[0];
    const deltaX = t.clientX - s.x;
    const deltaY = t.clientY - s.y;
    if (!s.locked) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        s.active = false;
        return;
      }
      s.locked = true;
    }
    setDx(deltaX);
  };
  const onTouchEnd = () => {
    const s = startRef.current;
    startRef.current = { x: 0, y: 0, active: false, locked: false };
    if (flying) return;
    if (!s.locked) {
      setDx(0);
      return;
    }
    if (Math.abs(dx) > THRESHOLD) {
      commitSwipe(dx < 0 ? "left" : "right");
    } else {
      setDx(0);
    }
  };

  return (
    <div
      className="relative"
      style={{
        minHeight: 520,
      }}
    >
      {visibleIds.slice(0, 3).reverse().map((id, idxFromBottom, arr) => {
        const w = byId.get(id)!;
        const depth = arr.length - 1 - idxFromBottom; // 0 = top
        const isTop = depth === 0;
        const progress = isTop ? Math.min(Math.abs(dx) / 160, 1) : 0;

        // Behind cards: scale + darken; as top is dragged, they rise toward 1.
        const baseScale = depth === 0 ? 1 : depth === 1 ? 0.94 : 0.88;
        const baseY = depth === 0 ? 0 : depth === 1 ? 10 : 20;
        const nextScale = depth === 1 ? baseScale + (1 - baseScale) * progress : baseScale;
        const nextY = depth === 1 ? baseY - baseY * progress : baseY;
        const darken = depth === 0 ? 0 : depth === 1 ? 0.18 - 0.18 * progress : 0.28;

        let transform = `translate3d(0, ${nextY}px, 0) scale(${nextScale})`;
        let transition = flying && isTop
          ? "transform 280ms cubic-bezier(.2,.7,.2,1), opacity 280ms ease"
          : startRef.current.active && isTop
            ? "none"
            : "transform 260ms cubic-bezier(.2,.7,.2,1)";
        let opacity = 1;
        let zIndex = 10 - depth;
        let boxShadow = isTop
          ? "0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 16px -8px rgba(0,0,0,0.15)"
          : "0 8px 20px -10px rgba(0,0,0,0.15)";

        if (isTop) {
          if (flying) {
            const out = flying === "left" ? -window.innerWidth : window.innerWidth;
            transform = `translate3d(${out}px, 0, 0) rotate(${flying === "left" ? -12 : 12}deg)`;
            opacity = 0;
          } else {
            const rot = dx / 20;
            transform = `translate3d(${dx}px, 0, 0) rotate(${rot}deg)`;
          }
        }

        return (
          <div
            key={id}
            className="absolute inset-x-0 top-0"
            style={{
              transform,
              transition,
              opacity,
              zIndex,
              willChange: "transform, opacity",
              touchAction: "pan-y",
            }}
            onTouchStart={isTop ? onTouchStart : undefined}
            onTouchMove={isTop ? onTouchMove : undefined}
            onTouchEnd={isTop ? onTouchEnd : undefined}
            onTouchCancel={isTop ? onTouchEnd : undefined}
          >
            <div className="relative rounded-2xl" style={{ boxShadow }}>
              <WishCard
                wish={w}
                priority={isTop}
                count={inspires[w.id] ?? 0}
                onInspire={() => onInspire(w.id)}
                onEdit={() => onEdit(w)}
                onMakeGoal={() => onMakeGoal(w)}
                onDelete={() => onDelete(w.id)}
                isDone={doneWishes.has(w.id)}
                onToggleDone={() => onToggleDone(w.id)}
              />
              {darken > 0 && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{ background: `rgba(0,0,0,${darken})`, transition: "background 260ms ease" }}
                />
              )}
            </div>
          </div>
        );
      })}
      {/* Подсказка */}
      
    </div>
  );
}
