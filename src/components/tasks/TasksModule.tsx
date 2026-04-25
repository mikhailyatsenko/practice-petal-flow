import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Check, Play, Square, ChevronDown, X, Brain } from "lucide-react";
import { BrainstormListScreen, BrainstormAnswerScreen } from "./Brainstorm";

/* =====================================================================
   Раздел «Задачи». Самодостаточный модуль — НЕ трогает существующий код.
   Подключается из _app.wishes.tsx в ветке tab === "tasks".
   ===================================================================== */

export interface TaskGoalRef {
  id: string;
  title: string;
  plan: string;
  /** опциональный цветовой акцент цели (hex). Если не задан — оранжевый. */
  color?: string;
}

export type TaskDeadline =
  | "⬜ Не определён"
  | "🟧 На день"
  | "🟦 На неделю"
  | "🟪 На месяц"
  | "🟥 Главная задача";

export interface Task {
  id: string;
  goalId: string;
  title: string;
  deadline: TaskDeadline;
  duration: string;
  feeling: number; // 1..10
  done: boolean;
  timeSpent: number; // секунды
}

const DEADLINES: { value: TaskDeadline; label: string }[] = [
  { value: "⬜ Не определён",   label: "⬜ Не определён" },
  { value: "🟧 На день",        label: "🟧 На день" },
  { value: "🟦 На неделю",      label: "🟦 На неделю" },
  { value: "🟪 На месяц",       label: "🟪 На месяц" },
  { value: "🟥 Главная задача", label: "🏁 Главная задача" },
];

const DEADLINE_COLORS: Record<TaskDeadline, { bg: string; border?: string }> = {
  "⬜ Не определён":   { bg: "#d1d5db", border: "#b8b8b8" },
  "🟧 На день":        { bg: "#FF6D00" },
  "🟦 На неделю":      { bg: "#2563eb" },
  "🟪 На месяц":       { bg: "#7c3aed" },
  "🟥 Главная задача": { bg: "#e53e3e" },
};

const DURATIONS = [
  "3 мин","5 мин","10 мин","15 мин","20 мин","30 мин",
  "1 час","1.5 часа","2 часа","3 часа","4 часа","5 часов",
  "6 часов","7 часов","8 часов","9 часов","10 часов","Более 10 часов",
];

const FEELINGS: { value: number; emoji: string; label: string }[] = [
  { value: 10, emoji: "💜", label: "Эйфория" },
  { value: 9,  emoji: "🩷", label: "Страсть" },
  { value: 8,  emoji: "❤️", label: "Энтузиазм" },
  { value: 7,  emoji: "💚", label: "Воодушевление" },
  { value: 6,  emoji: "🧡", label: "Интерес" },
  { value: 5,  emoji: "💛", label: "Спокойствие" },
  { value: 4,  emoji: "🤍", label: "Сдержанность" },
  { value: 3,  emoji: "🩶", label: "Тягость" },
  { value: 2,  emoji: "🤎", label: "Неприязнь" },
  { value: 1,  emoji: "🖤", label: "Мучение" },
];

const feelingOf = (v: number) => FEELINGS.find((f) => f.value === v) ?? FEELINGS[5];

type FilterId = "all" | "open" | "main" | "day" | "week" | "month";

const FILTERS_ROW1: { id: FilterId; label: string }[] = [
  { id: "all",   label: "📋 Все задачи" },
  { id: "open",  label: "⬜ Открытые" },
  { id: "main",  label: "🟥 Главные" },
];
const FILTERS_ROW2: { id: FilterId; label: string }[] = [
  { id: "day",   label: "🟧 На день" },
  { id: "week",  label: "🟦 На неделю" },
  { id: "month", label: "🟪 На месяц" },
];

const SAMPLE_TASKS = (goals: TaskGoalRef[]): Task[] => {
  if (goals.length === 0) return [];
  const g0 = goals[0]?.id ?? "";
  const g1 = goals[1]?.id ?? g0;
  const g2 = goals[2]?.id ?? g0;
  return [
    { id: "t1", goalId: g0, title: "Купить кроссовки для длинных дистанций", deadline: "🟧 На день", duration: "1 час", feeling: 8, done: false, timeSpent: 0 },
    { id: "t2", goalId: g0, title: "Составить план тренировок на месяц", deadline: "🟥 Главная задача", duration: "2 часа", feeling: 7, done: false, timeSpent: 0 },
    { id: "t3", goalId: g0, title: "Зарегистрироваться на ближайший полумарафон", deadline: "🟪 На месяц", duration: "30 мин", feeling: 9, done: false, timeSpent: 0 },
    { id: "t4", goalId: g1, title: "Найти преподавателя испанского", deadline: "🟦 На неделю", duration: "1 час", feeling: 6, done: false, timeSpent: 0 },
    { id: "t5", goalId: g1, title: "Пройти базовый курс грамматики", deadline: "🟥 Главная задача", duration: "Более 10 часов", feeling: 5, done: false, timeSpent: 0 },
    { id: "t6", goalId: g2, title: "Открыть накопительный счёт", deadline: "🟧 На день", duration: "30 мин", feeling: 7, done: false, timeSpent: 0 },
    { id: "t7", goalId: g2, title: "Настроить автоперевод 20% от дохода", deadline: "⬜ Не определён", duration: "15 мин", feeling: 8, done: false, timeSpent: 0 },
  ];
};

interface TasksModuleProps {
  goals: TaskGoalRef[];
  /** Фильтр по конкретной цели (когда пришли из «Цели → К задачам»). */
  initialGoalId?: string | null;
  onClearGoalFilter?: () => void;
  /** Контролируемое хранилище задач (если задано — используется вместо локального). */
  tasks?: Task[];
  onTasksChange?: (updater: (prev: Task[]) => Task[]) => void;
  /** Обновить план реализации цели */
  onUpdateGoalPlan?: (goalId: string, plan: string) => void;
}

export function TasksModule({ goals, initialGoalId, onClearGoalFilter, tasks: tasksProp, onTasksChange, onUpdateGoalPlan }: TasksModuleProps) {
  const [internalTasks, setInternalTasks] = useState<Task[]>(() => SAMPLE_TASKS(goals));
  const tasks = tasksProp ?? internalTasks;
  const setTasks = (updater: (prev: Task[]) => Task[]) => {
    if (onTasksChange) onTasksChange(updater);
    else setInternalTasks(updater);
  };
  const [filter, setFilter] = useState<FilterId>("all");
  const [openGoalId, setOpenGoalId] = useState<string | null>(initialGoalId ?? null);
  const [creating, setCreating] = useState(false);
  const [createForGoalId, setCreateForGoalId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [editingPlanGoalId, setEditingPlanGoalId] = useState<string | null>(null);
  const [planDraft, setPlanDraft] = useState("");
  const [shatteringId, setShatteringId] = useState<string | null>(null);

  // Заметки по целям и ответы мозгового штурма (локальное хранилище модуля)
  const [notesByGoal, setNotesByGoal] = useState<Record<string, string>>({});
  const [editingNotesGoalId, setEditingNotesGoalId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [answersByGoal, setAnswersByGoal] = useState<Record<string, Record<number, string>>>({});
  const [brainstormGoalId, setBrainstormGoalId] = useState<string | null>(null);
  const [brainstormQuestion, setBrainstormQuestion] = useState<number | null>(null);

  // Таймеры — поддерживаем несколько активных параллельно
  const [activeTimerIds, setActiveTimerIds] = useState<Set<string>>(new Set());
  const [elapsedMap, setElapsedMap] = useState<Record<string, number>>({});

  // Применяем initialGoalId при изменении (если перешли из «Цели»)
  useEffect(() => {
    if (initialGoalId) setOpenGoalId(initialGoalId);
  }, [initialGoalId]);

  // Таймер: тикает каждую секунду для всех активных
  useEffect(() => {
    if (activeTimerIds.size === 0) return;
    const id = window.setInterval(() => {
      setElapsedMap((prev) => {
        const next = { ...prev };
        activeTimerIds.forEach((tid) => {
          next[tid] = (next[tid] ?? 0) + 1;
        });
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeTimerIds]);

  const startTimer = (taskId: string) =>
    setActiveTimerIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  const stopTimer = (taskId: string) => {
    if (!activeTimerIds.has(taskId)) return;
    const elapsed = elapsedMap[taskId] ?? 0;
    setActiveTimerIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    setElapsedMap((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, timeSpent: t.timeSpent + elapsed } : t)));
  };

  const visibleTasks = useMemo(() => {
    let list = tasks.filter((t) => !t.done);
    if (initialGoalId) list = list.filter((t) => t.goalId === initialGoalId);
    switch (filter) {
      case "open":  list = list.filter((t) => t.deadline === "⬜ Не определён"); break;
      case "main":  list = list.filter((t) => t.deadline === "🟥 Главная задача"); break;
      case "day":   list = list.filter((t) => t.deadline === "🟧 На день"); break;
      case "week":  list = list.filter((t) => t.deadline === "🟦 На неделю"); break;
      case "month": list = list.filter((t) => t.deadline === "🟪 На месяц"); break;
    }
    return list;
  }, [tasks, filter, initialGoalId]);

  // Группировка по целям (с сохранением порядка целей)
  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const g of goals) map.set(g.id, []);
    for (const t of visibleTasks) {
      if (!map.has(t.goalId)) map.set(t.goalId, []);
      map.get(t.goalId)!.push(t);
    }
    const order = goals.map((g) => g.id);
    for (const k of map.keys()) if (!order.includes(k)) order.push(k);
    return order
      .map((gid) => ({ goal: goals.find((g) => g.id === gid), gid, items: map.get(gid) ?? [] }))
      .filter((row) => row.items.length > 0);
  }, [visibleTasks, goals]);

  const handleCreate = (data: Omit<Task, "id" | "done" | "timeSpent">) => {
    const newTask: Task = { ...data, id: `t${Date.now()}`, done: false, timeSpent: 0 };
    setTasks((prev) => [newTask, ...prev]);
    setCreating(false);
    setCreateForGoalId(null);
  };
  const handleSaveEdit = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
  };
  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTimerIds.has(id)) {
      setActiveTimerIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
    setEditingTask(null);
    setOpenTaskId(null);
  };
  const handleMarkDone = (id: string) => {
    // Игнорируем повторное нажатие
    if (shatteringId === id) return;
    if (activeTimerIds.has(id)) {
      setActiveTimerIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
    // Возвращаемся в ленту, чтобы пользователь увидел свою карточку
    setOpenTaskId(null);
    // Ждём, пока лента отрендерится и доскроллится к карточке
    window.setTimeout(() => setShatteringId(id), 450);
    // 450ms скролл + 250ms галочка + 400ms вылет + 400ms схлопывание
    window.setTimeout(() => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: true } : t)));
      setShatteringId((c) => (c === id ? null : c));
    }, 1600);
  };

  // ===== Рендер экранов =====

  if (creating) {
    return (
      <CreateOrEditTaskScreen
        mode="create"
        goals={goals}
        defaultGoalId={createForGoalId ?? initialGoalId ?? null}
        onCancel={() => { setCreating(false); setCreateForGoalId(null); }}
        onSubmit={(d) => handleCreate(d)}
      />
    );
  }

  if (editingTask) {
    return (
      <CreateOrEditTaskScreen
        mode="edit"
        goals={goals}
        task={editingTask}
        onCancel={() => setEditingTask(null)}
        onSubmit={(d) => handleSaveEdit({ ...editingTask, ...d })}
      />
    );
  }

  if (openTaskId) {
    const t = tasks.find((x) => x.id === openTaskId);
    if (t) {
      const g = goals.find((x) => x.id === t.goalId);
      return (
        <TaskDetailScreen
          task={t}
          goal={g}
          isTimerActive={activeTimerIds.has(t.id)}
          liveSeconds={elapsedMap[t.id] ?? 0}
          onBack={() => setOpenTaskId(null)}
          onEdit={() => { setOpenTaskId(null); setEditingTask(t); }}
          onDelete={() => handleDelete(t.id)}
          onStartTimer={() => startTimer(t.id)}
          onStopTimer={() => stopTimer(t.id)}
          onMarkDone={() => handleMarkDone(t.id)}
        />
      );
    }
  }

  // ===== Лента =====
  return (
    <div className="px-4 pt-3 pb-2 space-y-3">
      <button
        onClick={() => setCreating(true)}
        className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5"
      >
        <Plus className="h-4 w-4" /> Добавить задачу
      </button>

      {/* Активный фильтр по цели (когда пришли из «Цели») */}
      {initialGoalId && (
        <div
          className="rounded-xl px-3.5 py-2.5 flex items-center justify-between text-[13px]"
          style={{ background: "#fff3e0", border: "1px solid #FF6D00", color: "#FF6D00" }}
        >
          <span>
            Фильтр по цели: <b>{goals.find((g) => g.id === initialGoalId)?.title ?? "—"}</b>
          </span>
          <button onClick={onClearGoalFilter} className="tap text-[12px] underline">
            Сбросить
          </button>
        </div>
      )}

      {/* Фильтры — 2 ряда по центру */}
      <div className="space-y-1.5">
        <div className="flex justify-center gap-1.5 flex-wrap">
          {FILTERS_ROW1.map((f) => (
            <FilterChip key={f.id} active={filter === f.id} label={f.label} onClick={() => setFilter(f.id)} />
          ))}
        </div>
        <div className="flex justify-center gap-1.5 flex-wrap">
          {FILTERS_ROW2.map((f) => (
            <FilterChip key={f.id} active={filter === f.id} label={f.label} onClick={() => setFilter(f.id)} />
          ))}
        </div>
      </div>

      {grouped.length === 0 && (
        <div className="text-center text-[13px] text-muted-foreground py-10">
          Пока нет задач по выбранному фильтру. Добавь первую ✨
        </div>
      )}

      {grouped.map((row) => {
        const isOpen = openGoalId === row.gid;
        const goal = row.goal;
        return (
          <div key={row.gid} className="space-y-2">
            {/* Заголовок группы */}
            <div className="w-full rounded-xl px-3 py-2.5 flex items-center gap-2">
              <button
                onClick={() => setOpenGoalId(isOpen ? null : row.gid)}
                className="tap flex-1 min-w-0 text-left"
              >
                <span className="text-[14px] font-semibold leading-snug block break-words text-foreground">
                  {goal?.title ?? "Без цели"}
                </span>
              </button>
              <button
                onClick={() => setOpenGoalId(isOpen ? null : row.gid)}
                className="tap shrink-0 inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5"
                style={
                  isOpen
                    ? { background: "rgba(255,109,0,0.10)", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.35)" }
                    : { background: "transparent", color: "#9a8f7e", border: "1px solid #ede8df" }
                }
              >
                {isOpen ? "Закрыть план" : "Открыть план"}
                <ChevronDown
                  className="h-3 w-3 transition-transform"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                />
              </button>
            </div>

            {/* План реализации */}
            {isOpen && goal && (
              <article
                className="bg-card rounded-2xl overflow-hidden shadow-card animate-fade-up"
                style={{ border: "1px solid #ede8df" }}
              >
                <div className="h-1 w-full" style={{ background: goal.color ?? "#FF6D00" }} />
                <div className="p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      План реализации
                    </p>
                    {editingPlanGoalId !== row.gid && (
                      <button
                        onClick={() => { setEditingPlanGoalId(row.gid); setPlanDraft(goal.plan ?? ""); }}
                        aria-label="Изменить план"
                        className="tap inline-flex items-center justify-center rounded-full"
                        style={{ width: 26, height: 26, color: "#9a8f7e", border: "1px solid #ede8df", background: "#fff" }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {editingPlanGoalId === row.gid ? (
                    <div className="mt-2">
                      <textarea
                        value={planDraft}
                        onChange={(e) => setPlanDraft(e.target.value)}
                        rows={5}
                        autoFocus
                        className="w-full rounded-xl p-2.5 text-[14px] leading-[1.6] text-foreground/90 outline-none"
                        style={{ border: "1px solid #ede8df", background: "#fff", resize: "vertical" }}
                        placeholder="Опиши план реализации…"
                      />
                      <div className="mt-2 flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingPlanGoalId(null)}
                          className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium"
                          style={{ background: "#fff", color: "#8a8a8a", border: "1px solid #ede8df" }}
                        >
                          <X className="h-3.5 w-3.5" /> Отмена
                        </button>
                        <button
                          onClick={() => {
                            onUpdateGoalPlan?.(row.gid, planDraft);
                            setEditingPlanGoalId(null);
                          }}
                          className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-white"
                          style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)" }}
                        >
                          <Check className="h-3.5 w-3.5" /> Сохранить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[14px] leading-[1.6] text-foreground/90 whitespace-pre-wrap">
                      {goal.plan || "План пока не описан."}
                    </p>
                  )}
                </div>
              </article>
            )}

            {/* Задачи */}
            <div className="space-y-2">
              {row.items.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  isTimerActive={activeTimerIds.has(t.id)}
                  liveSeconds={elapsedMap[t.id] ?? 0}
                  isShattering={shatteringId === t.id}
                  onOpen={() => setOpenTaskId(t.id)}
                  onComplete={() => handleMarkDone(t.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function pluralTasks(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "задача";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "задачи";
  return "задач";
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors"
      style={
        active
          ? { background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff", border: "1px solid transparent" }
          : { background: "#fff", color: "#8a8a8a", border: "1px solid #ede8df" }
      }
    >
      {label}
    </button>
  );
}

/* ---------------- Строка задачи в ленте ---------------- */

function TaskRow({
  task,
  isTimerActive,
  liveSeconds,
  isShattering,
  onOpen,
  onComplete,
}: {
  task: Task;
  isTimerActive: boolean;
  liveSeconds: number;
  isShattering?: boolean;
  onOpen: () => void;
  onComplete: () => void;
}) {
  const c = DEADLINE_COLORS[task.deadline];
  const f = feelingOf(task.feeling);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Этапы анимации: tick (0-250ms) → flyOut (250-650ms) → collapse (650-1050ms)
  const [stage, setStage] = useState<"idle" | "tick" | "flyOut" | "collapse">("idle");
  useEffect(() => {
    if (!isShattering) { setStage("idle"); return; }
    // Гарантированно показать карточку перед стартом анимации
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setStage("tick");
    const t1 = window.setTimeout(() => setStage("flyOut"), 250);
    const t2 = window.setTimeout(() => setStage("collapse"), 650);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [isShattering]);

  const checked = task.done || stage !== "idle";
  const collapsing = stage === "collapse";
  const flying = stage === "flyOut" || stage === "collapse";

  return (
    <div
      ref={wrapperRef}
      style={{
        overflow: "hidden",
        maxHeight: collapsing ? 0 : 200,
        marginBottom: collapsing ? 0 : undefined,
        transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), margin-bottom 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        style={{
          transform: flying ? "translateX(120%)" : "translateX(0)",
          opacity: flying ? 0 : 1,
          transition: flying
            ? "transform 0.4s cubic-bezier(0.55,0,1,0.45), opacity 0.4s ease"
            : undefined,
        }}
      >
        <div
          onClick={() => { if (stage === "idle") onOpen(); }}
          role="button"
          tabIndex={0}
          className={`tap w-full text-left bg-card rounded-2xl px-3 py-2.5 shadow-card transition-all duration-100 active:scale-[0.98] active:bg-[#fff7ed] cursor-pointer animate-fade-up`}
          style={{
            border: isTimerActive ? "2px solid #FF6D00" : "1px solid #ede8df",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="shrink-0 rounded-[3px]"
              style={{
                width: 10,
                height: 10,
                background: c.bg,
                border: c.border ? `1px solid ${c.border}` : "none",
              }}
            />
            <span
              className="flex-1 text-[14px] font-semibold leading-snug break-words"
              style={task.done ? { textDecoration: "line-through", color: "#8a8a8a" } : undefined}
            >
              {task.title}
            </span>
            <div className="shrink-0 flex flex-col items-end" style={{ gap: 2 }}>
              <span className="text-[17px] leading-none" aria-label={f.label}>{f.emoji}</span>
              {task.duration && task.duration !== "—" && (
                <span className="text-[11px] leading-none" style={{ color: "#8a8a8a" }}>{task.duration}</span>
              )}
            </div>
            <button
              type="button"
              aria-label={checked ? "Задача выполнена" : "Отметить выполненной"}
              onClick={(e) => {
                e.stopPropagation();
                if (checked) return;
                onComplete();
              }}
              className="shrink-0 inline-flex items-center justify-center rounded-full"
              style={{
                width: 22,
                height: 22,
                background: checked ? "#16a34a" : "transparent",
                border: checked ? "2px solid #16a34a" : "2px solid #d1d5db",
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 20,
                    strokeDashoffset: checked ? 0 : 20,
                    transition: "stroke-dashoffset 0.25s ease",
                  }}
                />
              </svg>
            </button>
          </div>
          {isTimerActive && (
            <div className="mt-2 flex justify-center">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ background: "#fff3e0", color: "#FF6D00" }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current task-pulse" />
                ▶ {fmtTime(task.timeSpent + liveSeconds)}
              </div>
            </div>
          )}
          <style>{`
            @keyframes taskPulse { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
            .task-pulse { animation: taskPulse 1.1s ease-in-out infinite; }
          `}</style>
        </div>
      </div>
    </div>
  );
}

function fmtTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function fmtTimeBig(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

/* ---------------- Экран задачи ---------------- */

function TaskDetailScreen({
  task, goal, isTimerActive, liveSeconds,
  onBack, onEdit, onDelete, onStartTimer, onStopTimer, onMarkDone,
}: {
  task: Task;
  goal?: TaskGoalRef;
  isTimerActive: boolean;
  liveSeconds: number;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onMarkDone: () => void;
}) {
  const f = feelingOf(task.feeling);
  const total = task.timeSpent + (isTimerActive ? liveSeconds : 0);

  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="tap inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> К задачам
        </button>
      </div>

      <div className="space-y-2">
        {goal && (
          <span className="inline-block rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "#ede8df", color: "#8a8a8a" }}>
            Цель: {goal.title}
          </span>
        )}
        <h1 className="text-[22px] font-bold leading-tight text-foreground">{task.title}</h1>
      </div>

      {/* Таймер */}
      <article className="bg-card rounded-2xl shadow-card p-5 text-center" style={{ border: "1px solid #ede8df" }}>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Таймер работы</p>
        <p className="mt-2 text-[48px] font-bold leading-none text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmtTimeBig(total)}
        </p>
        {!isTimerActive ? (
          <button
            onClick={onStartTimer}
            className="tap mt-4 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)" }}
          >
            <Play className="h-4 w-4" /> Начать работу
          </button>
        ) : (
          <button
            onClick={onStopTimer}
            className="tap mt-4 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white"
            style={{ background: "#e53e3e" }}
          >
            <Square className="h-4 w-4" /> Остановить
          </button>
        )}
        {task.timeSpent > 0 && !isTimerActive && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Планировалось: {task.duration} · Факт: {fmtTimeBig(task.timeSpent)}
          </p>
        )}
      </article>

      <button
        onClick={onMarkDone}
        className="tap w-full rounded-full py-3 text-[14px] font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#34d399,#16a34a)" }}
      >
        ✅ Задача сделана!
      </button>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="tap flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-medium bg-card"
          style={{ border: "1px solid #ede8df", color: "#1a1a1a" }}
        >
          <Pencil className="h-4 w-4" /> Изменить
        </button>
        <button
          onClick={onDelete}
          className="tap flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-medium bg-card"
          style={{ border: "1px solid #f5c5c5", color: "#e53e3e" }}
        >
          <Trash2 className="h-4 w-4" /> Удалить
        </button>
      </div>
    </div>
  );
}

/* ---------------- Создание / редактирование задачи ---------------- */

export function CreateOrEditTaskScreen({
  mode, goals, task, defaultGoalId, onCancel, onSubmit,
}: {
  mode: "create" | "edit";
  goals: TaskGoalRef[];
  task?: Task;
  defaultGoalId?: string | null;
  onCancel: () => void;
  onSubmit: (data: Omit<Task, "id" | "done" | "timeSpent">) => void;
}) {
  const [goalId, setGoalId] = useState<string>(task?.goalId ?? defaultGoalId ?? "");
  const [title, setTitle] = useState<string>(task?.title ?? "");
  const [deadline, setDeadline] = useState<TaskDeadline>(task?.deadline ?? "⬜ Не определён");
  const [duration, setDuration] = useState<string>(task?.duration ?? "");
  const [feeling, setFeeling] = useState<number>(task?.feeling ?? 0);

  const valid = title.trim().length >= 3 && duration.length > 0 && feeling > 0;

  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="tap inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Отмена
        </button>
        <h1 className="text-[15px] font-semibold">{mode === "create" ? "Новая задача" : "Изменить задачу"}</h1>
        <span className="w-12" />
      </div>

      {/* Цель */}
      <Section title="К какой цели?">
        <div className="space-y-2">
          {goals.map((g) => {
            const active = goalId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGoalId(active ? "" : g.id)}
                className="tap w-full flex items-center gap-3 rounded-xl px-3 py-2.5 bg-card transition-colors text-left"
                style={{ border: `1px solid ${active ? "#FF6D00" : "#ede8df"}` }}
              >
                <span
                  className="shrink-0 rounded-lg"
                  style={{ width: 32, height: 32, background: g.color ?? "linear-gradient(135deg,#FFB300,#FF6D00)" }}
                />
                <span className="flex-1 text-[14px] font-medium">{g.title}</span>
                {active && <Check className="h-4 w-4" style={{ color: "#FF6D00" }} />}
              </button>
            );
          })}
          {goals.length === 0 && (
            <p className="text-[12px] text-muted-foreground">Пока нет целей — задача будет без привязки.</p>
          )}
        </div>
      </Section>

      {/* Название */}
      <Section title="Название задачи">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Написать первую главу"
          className="w-full rounded-xl px-3.5 py-3 text-[15px] bg-card outline-none"
          style={{ border: `1px solid ${title.trim() ? "#FF6D00" : "#ede8df"}` }}
        />
      </Section>

      {/* Срок */}
      <Section title="Срок выполнения">
        <div className="flex flex-wrap gap-1.5">
          {DEADLINES.map((d) => {
            const active = deadline === d.value;
            return (
              <button
                key={d.value}
                onClick={() => setDeadline(d.value)}
                className="tap rounded-full px-3 py-1.5 text-[12.5px] font-medium"
                style={
                  active
                    ? { background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff", border: "1px solid transparent" }
                    : { background: "#fff", color: "#1a1a1a", border: "1px solid #ede8df" }
                }
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Время */}
      <Section title="Сколько времени нужно?" subtitle="Если сесть и непрерывно решать задачу — сколько уйдёт?">
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map((d) => {
            const active = duration === d;
            return (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className="tap rounded-full px-3 py-1.5 text-[12.5px] font-medium"
                style={
                  active
                    ? { background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff", border: "1px solid transparent" }
                    : { background: "#fff", color: "#1a1a1a", border: "1px solid #ede8df" }
                }
              >
                {d}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Чувство */}
      <Section title="Что чувствуешь к этой задаче?">
        <div className="space-y-1.5">
          {FEELINGS.map((f) => {
            const active = feeling === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFeeling(f.value)}
                className="tap w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                style={
                  active
                    ? { background: "#fff3e0", border: "1px solid #FF6D00", color: "#FF6D00" }
                    : { background: "#fff", border: "1px solid #ede8df", color: "#1a1a1a" }
                }
              >
                <span className="text-[18px] leading-none">{f.emoji}</span>
                <span className="flex-1 text-[14px] font-medium">{f.label}</span>
                {active && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </Section>

      <button
        disabled={!valid}
        onClick={() => valid && onSubmit({ goalId, title: title.trim(), deadline, duration, feeling })}
        className="tap w-full rounded-full py-3 text-[14px] font-semibold transition-colors"
        style={
          valid
            ? { background: "linear-gradient(135deg,#34d399,#16a34a)", color: "#fff" }
            : { background: "#ede8df", color: "#8a8a8a", cursor: "not-allowed" }
        }
      >
        ✅ {mode === "create" ? "Создать задачу" : "Сохранить"}
      </button>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-[11.5px] text-muted-foreground">{subtitle}</p>}
      <div className="pt-1">{children}</div>
    </section>
  );
}
