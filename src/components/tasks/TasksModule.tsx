import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Check, Play, Square, ChevronDown, X, Brain, Key, ChevronRight, ChevronLeft } from "lucide-react";
import { BrainstormListScreen, BrainstormAnswerScreen } from "./Brainstorm";
import { GanttView } from "./GanttView";


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
  /** миниатюра картинки цели/желания. */
  image?: string;
}

export type TaskDeadline =
  | "⬜ Не определён"
  | "🟧 На день"
  | "🟦 На неделю"
  | "🟪 На месяц"
  | "🟩 Квартал";

export interface Task {
  id: string;
  goalId: string;
  title: string;
  deadline: TaskDeadline;
  duration: string;
  feeling: number; // 1..10
  done: boolean;
  timeSpent: number; // секунды
  parentTaskId?: string | null;
  isKeyTask?: boolean;
  isRecurring?: boolean;
  /** ISO YYYY-MM-DD — заданные вручную даты (для режима «Гант»). */
  startDate?: string;
  endDate?: string;
}

const DEADLINES: { value: TaskDeadline; label: string }[] = [
  { value: "⬜ Не определён", label: "⬜ Не определён" },
  { value: "🟧 На день",      label: "🟧 На день" },
  { value: "🟦 На неделю",    label: "🟦 На неделю" },
  { value: "🟪 На месяц",     label: "🟪 На месяц" },
  { value: "🟩 Квартал",      label: "🟩 Квартал" },
];

const DEADLINE_COLORS: Record<TaskDeadline, { bg: string; border?: string }> = {
  "⬜ Не определён": { bg: "#D3D1C7", border: "#b8b8b8" },
  "🟧 На день":      { bg: "#E88200" },
  "🟦 На неделю":    { bg: "#378ADD" },
  "🟪 На месяц":     { bg: "#7F77DD" },
  "🟩 Квартал":      { bg: "#639922" },
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

type FilterId = "all" | "open" | "day" | "week" | "month" | "quarter";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all",     label: "📋 Все задачи" },
  { id: "open",    label: "⬜ Открытые" },
  { id: "day",     label: "🟧 День" },
  { id: "week",    label: "🟦 Неделя" },
  { id: "month",   label: "🟪 Месяц" },
  { id: "quarter", label: "🟩 Квартал" },
];

type ViewMode = "list" | "key" | "gantt";



const SAMPLE_TASKS = (goals: TaskGoalRef[]): Task[] => {
  if (goals.length === 0) return [];
  const g0 = goals[0]?.id ?? "";
  const g1 = goals[1]?.id ?? g0;
  const g2 = goals[2]?.id ?? g0;
  return [
    { id: "t1", goalId: g0, title: "Купить кроссовки для длинных дистанций", deadline: "🟧 На день", duration: "1 час", feeling: 8, done: false, timeSpent: 0 },
    { id: "t2", goalId: g0, title: "Составить план тренировок на месяц", deadline: "🟩 Квартал", duration: "2 часа", feeling: 7, done: false, timeSpent: 0 },
    { id: "t3", goalId: g0, title: "Зарегистрироваться на ближайший полумарафон", deadline: "🟪 На месяц", duration: "30 мин", feeling: 9, done: false, timeSpent: 0 },
    { id: "t4", goalId: g1, title: "Найти преподавателя испанского", deadline: "🟦 На неделю", duration: "1 час", feeling: 6, done: false, timeSpent: 0 },
    { id: "t5", goalId: g1, title: "Пройти базовый курс грамматики", deadline: "🟩 Квартал", duration: "Более 10 часов", feeling: 5, done: false, timeSpent: 0 },

    { id: "t6", goalId: g2, title: "Открыть накопительный счёт", deadline: "🟧 На день", duration: "30 мин", feeling: 7, done: false, timeSpent: 0 },
    { id: "t7", goalId: g2, title: "Настроить автоперевод 20% от дохода", deadline: "⬜ Не определён", duration: "15 мин", feeling: 8, done: false, timeSpent: 0 },
  ];
};

interface TasksModuleProps {
  goals: TaskGoalRef[];
  /** Фильтр по конкретной цели (когда пришли из «Цели → К задачам»). */
  initialGoalId?: string | null;
  onClearGoalFilter?: () => void;
  /** Сразу открыть мозговой штурм для цели. */
  initialBrainstormGoalId?: string | null;
  onClearBrainstormGoalId?: () => void;
  /** Уведомлять родителя, когда открыт мозговой штурм. */
  onBrainstormingChange?: (active: boolean) => void;
  /** Контролируемое хранилище задач (если задано — используется вместо локального). */
  tasks?: Task[];
  onTasksChange?: (updater: (prev: Task[]) => Task[]) => void;
  /** Обновить план реализации цели */
  onUpdateGoalPlan?: (goalId: string, plan: string) => void;
}

export function TasksModule({ goals, initialGoalId, onClearGoalFilter, initialBrainstormGoalId, onClearBrainstormGoalId, onBrainstormingChange, tasks: tasksProp, onTasksChange, onUpdateGoalPlan }: TasksModuleProps) {
  const [internalTasks, setInternalTasks] = useState<Task[]>(() => SAMPLE_TASKS(goals));
  const tasks = tasksProp ?? internalTasks;
  const setTasks = (updater: (prev: Task[]) => Task[]) => {
    if (onTasksChange) onTasksChange(updater);
    else setInternalTasks(updater);
  };
  const [filter, setFilter] = useState<FilterId>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  
  const [pendingParentInsert, setPendingParentInsert] = useState<{ goalId: string; parentId: string | null; level: number } | null>(null);
  const [attachExistingTaskId, setAttachExistingTaskId] = useState<string | null>(null);
  const [keyExpanded, setKeyExpanded] = useState<Set<string>>(new Set());
  const [addKeyGoalId, setAddKeyGoalId] = useState<string | null>(null);
  const [freeTasksExpanded, setFreeTasksExpanded] = useState<Set<string>>(new Set());
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
  const [brainstormGoalId, setBrainstormGoalId] = useState<string | null>(initialBrainstormGoalId ?? null);
  const [brainstormQuestion, setBrainstormQuestion] = useState<number | null>(null);

  // Применяем initialBrainstormGoalId при изменении (если открыли из меню цели).
  // Не вызываем onClearBrainstormGoalId сразу — иначе при анимации перехода вкладок
  // компонент перемонтируется и получит уже null. Сбрасываем при выходе (onBack).
  useEffect(() => {
    if (initialBrainstormGoalId) {
      setBrainstormGoalId(initialBrainstormGoalId);
      setBrainstormQuestion(null);
    }
  }, [initialBrainstormGoalId]);

  // Уведомляем родителя об открытии/закрытии мозгового штурма
  useEffect(() => {
    onBrainstormingChange?.(brainstormGoalId != null);
  }, [brainstormGoalId, onBrainstormingChange]);

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
      case "open":    list = list.filter((t) => t.deadline === "⬜ Не определён"); break;
      case "day":     list = list.filter((t) => t.deadline === "🟧 На день"); break;
      case "week":    list = list.filter((t) => t.deadline === "🟦 На неделю"); break;
      case "month":   list = list.filter((t) => t.deadline === "🟪 На месяц"); break;
      case "quarter": list = list.filter((t) => t.deadline === "🟩 Квартал"); break;
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
      .filter((row) => viewMode === "key" ? !!row.goal : row.items.length > 0);
  }, [visibleTasks, goals, viewMode]);


  const handleCreate = (data: Omit<Task, "id" | "done" | "timeSpent">) => {
    const newTask: Task = { ...data, id: `t${Date.now()}`, done: false, timeSpent: 0 };
    setTasks((prev) => [newTask, ...prev]);
    setCreating(false);
    setCreateForGoalId(null);
  };
  const attachToKey = (taskId: string, parentId: string | null) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, isKeyTask: true, parentTaskId: parentId } : t)));
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

  if (brainstormGoalId) {
    const g = goals.find((x) => x.id === brainstormGoalId);
    const goalAnswers = answersByGoal[brainstormGoalId] ?? {};
    if (brainstormQuestion != null) {
      return (
        <BrainstormAnswerScreen
          questionNumber={brainstormQuestion}
          initialAnswer={goalAnswers[brainstormQuestion] ?? ""}
          onBack={() => setBrainstormQuestion(null)}
          onSave={(text) =>
            setAnswersByGoal((prev) => ({
              ...prev,
              [brainstormGoalId]: { ...(prev[brainstormGoalId] ?? {}), [brainstormQuestion]: text },
            }))
          }
        />
      );
    }
    return (
      <BrainstormListScreen
        goalTitle={g?.title ?? "—"}
        answers={goalAnswers}
        onBack={() => { setBrainstormGoalId(null); onClearBrainstormGoalId?.(); }}
        onOpenQuestion={(idx) => setBrainstormQuestion(idx)}
      />
    );
  }

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

  if (pendingParentInsert && !attachExistingTaskId) {
    return (
      <CreateOrEditTaskScreen
        mode="create"
        goals={goals}
        defaultGoalId={pendingParentInsert.goalId}
        forceKeyContext={{ parentTaskId: pendingParentInsert.parentId, level: pendingParentInsert.level }}
        onCancel={() => setPendingParentInsert(null)}
        onSubmit={(d) => { handleCreate(d); setPendingParentInsert(null); }}
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

      {/* Переключатель режима: Список / Ключевые */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full p-1" style={{ background: "#f3efe7", border: "1px solid #ede8df" }}>
          {(["list", "key"] as ViewMode[]).map((m) => {
            const active = viewMode === m;
            return (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="tap rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors"
                style={
                  active
                    ? { background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff" }
                    : { background: "transparent", color: "#8a8a8a" }
                }
              >
                {m === "list" ? "📋 Список" : "🔑 Ключевые"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Фильтры — только в режиме "Список" */}
      {viewMode === "list" && (
        <div className="flex justify-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <FilterChip key={f.id} active={filter === f.id} label={f.label} onClick={() => setFilter(f.id)} />
          ))}
        </div>
      )}


      {grouped.length === 0 && (
        <div className="text-center text-[13px] text-[#FF6D00] py-10">
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

            {/* Кнопка Мозговой штурм — маленькая, сверху */}
            {isOpen && goal && (
              <div className="flex justify-center">
                <button
                  onClick={() => { setBrainstormGoalId(row.gid); setBrainstormQuestion(null); }}
                  className="tap inline-flex items-center gap-1 animate-fade-up"
                  style={{
                    background: "linear-gradient(135deg,#FFB300,#FF6D00)",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "5px 12px",
                    fontSize: 11.5,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    boxShadow: "0 2px 6px rgba(255,109,0,0.25)",
                  }}
                >
                  🧠 Мозговой штурм <span style={{ marginLeft: 2 }}>→</span>
                </button>
              </div>
            )}

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
                    (() => {
                      const original = goal.plan ?? "";
                      const isDirty = planDraft !== original;
                      const canSave = isDirty && planDraft.trim().length > 0;
                      return (
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
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span
                              className="text-[11.5px]"
                              style={{ color: isDirty ? "#FF6D00" : "#a8a8a8", fontWeight: isDirty ? 600 : 400 }}
                            >
                              {isDirty ? "● Несохранённые изменения" : "✓ Сохранено"}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingPlanGoalId(null)}
                                className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium"
                                style={{ background: "#fff", color: "#8a8a8a", border: "1px solid #ede8df" }}
                              >
                                <X className="h-3.5 w-3.5" /> Отмена
                              </button>
                              <button
                                disabled={!canSave}
                                onClick={() => {
                                  if (!canSave) return;
                                  onUpdateGoalPlan?.(row.gid, planDraft);
                                  setEditingPlanGoalId(null);
                                }}
                                className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all"
                                style={
                                  canSave
                                    ? { background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff", boxShadow: "0 2px 8px rgba(255,109,0,0.35)" }
                                    : { background: "#f3f4f6", color: "#9ca3af", border: "1px solid #e5e7eb", cursor: "not-allowed" }
                                }
                              >
                                <Check className="h-3.5 w-3.5" /> Сохранить
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="mt-1.5 text-[14px] leading-[1.6] text-foreground/90 whitespace-pre-wrap">
                      {goal.plan || "План пока не описан."}
                    </p>
                  )}
                </div>
              </article>
            )}

            {/* Заметки */}
            {isOpen && goal && (
              <NotesCard
                value={notesByGoal[row.gid] ?? ""}
                isEditing={editingNotesGoalId === row.gid}
                draft={notesDraft}
                onStartEdit={() => { setEditingNotesGoalId(row.gid); setNotesDraft(notesByGoal[row.gid] ?? ""); }}
                onChangeDraft={setNotesDraft}
                onCancel={() => setEditingNotesGoalId(null)}
                onSave={() => {
                  setNotesByGoal((prev) => ({ ...prev, [row.gid]: notesDraft }));
                  setEditingNotesGoalId(null);
                }}
              />
            )}


            {/* Задачи */}
            {viewMode === "list" ? (
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
            ) : (
              <KeyTreeSection
                goalId={row.gid}
                tasks={tasks}
                expanded={keyExpanded}
                onToggle={(id) => setKeyExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                onOpenTask={(id) => setOpenTaskId(id)}
                onAdd={() => {
                  const hasKey = tasks.some((t) => t.goalId === row.gid && t.isKeyTask);
                  if (!hasKey) {
                    setPendingParentInsert({ goalId: row.gid, parentId: null, level: 1 });
                  } else {
                    setAddKeyGoalId(row.gid);
                  }
                }}
                freeOpen={freeTasksExpanded.has(row.gid)}
                onToggleFree={() => setFreeTasksExpanded((prev) => { const n = new Set(prev); n.has(row.gid) ? n.delete(row.gid) : n.add(row.gid); return n; })}
                onAttachExisting={(taskId) => { setAttachExistingTaskId(taskId); setAddKeyGoalId(row.gid); }}
              />
            )}

          </div>
        );
      })}

      {addKeyGoalId && (
        <AddKeyLevelPopup
          goalId={addKeyGoalId}
          tasks={tasks}
          onClose={() => { setAddKeyGoalId(null); setAttachExistingTaskId(null); }}
          onPick={(parentId, level) => {
            if (attachExistingTaskId) {
              attachToKey(attachExistingTaskId, parentId);
              setAttachExistingTaskId(null);
              setAddKeyGoalId(null);
            } else {
              setPendingParentInsert({ goalId: addKeyGoalId, parentId, level });
              setAddKeyGoalId(null);
            }
          }}
        />
      )}
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
          className={`tap relative w-full text-left bg-card rounded-2xl px-3 py-2.5 shadow-card transition-all duration-100 active:scale-[0.98] active:bg-[#fff7ed] cursor-pointer animate-fade-up overflow-hidden`}
          style={{
            border: isTimerActive ? "2px solid #FF6D00" : "1px solid #ede8df",
            paddingLeft: task.deadline === "⬜ Не определён" ? undefined : 14,
          }}
        >
          {task.deadline !== "⬜ Не определён" && (
            <span
              aria-hidden
              style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 5, background: c.bg,
              }}
            />
          )}
          <div className="flex items-center gap-2.5">
            {task.isKeyTask && (
              <span aria-label="Ключевая задача" className="shrink-0 text-[14px] leading-none">🔑</span>
            )}
            <span
              className="flex-1 text-[14px] font-semibold leading-snug break-words"
              style={task.done ? { textDecoration: "line-through", color: "#8a8a8a" } : undefined}
            >
              {task.title}
              {task.isRecurring && <span aria-label="Повторяющаяся"> 🔁</span>}
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
        <button onClick={onBack} className="tap inline-flex items-center gap-1.5 text-[14px] text-[#FF6D00]">
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
        style={{
          background: "linear-gradient(135deg, #8BC34A, #4CAF50)",
          boxShadow: "0 6px 20px rgba(76,175,80,0.35)",
        }}
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
  mode, goals, task, defaultGoalId, onCancel, onSubmit, forceKeyContext,
}: {
  mode: "create" | "edit";
  goals: TaskGoalRef[];
  task?: Task;
  defaultGoalId?: string | null;
  onCancel: () => void;
  onSubmit: (data: Omit<Task, "id" | "done" | "timeSpent">) => void;
  /** Если задан — задача создаётся в дереве ключевых, поля скрыты, показывается ярлык уровня. */
  forceKeyContext?: { parentTaskId: string | null; level: number };
}) {
  const [goalId, setGoalId] = useState<string>(task?.goalId ?? defaultGoalId ?? "");
  const [title, setTitle] = useState<string>(task?.title ?? "");
  const [deadline, setDeadline] = useState<TaskDeadline>(task?.deadline ?? "⬜ Не определён");
  const [duration, setDuration] = useState<string>(task?.duration ?? "");
  const [feeling, setFeeling] = useState<number>(task?.feeling ?? 0);
  const [isRecurring, setIsRecurring] = useState<boolean>(task?.isRecurring ?? false);

  const valid = title.trim().length >= 3 && duration.length > 0 && feeling > 0;


  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="tap inline-flex items-center gap-1.5 text-[14px] text-[#FF6D00]">
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
                  style={{ width: 36, height: 36, background: "linear-gradient(135deg,#FFB300,#FF6D00)" }}
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
          autoFocus
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

      {/* Регулярная задача */}
      <Section title="Регулярная задача">
        <button
          onClick={() => setIsRecurring((v) => !v)}
          className="tap w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
          style={
            isRecurring
              ? { background: "#fff3e0", border: "1px solid #FF6D00" }
              : { background: "#fff", border: "1px solid #ede8df" }
          }
        >
          <span
            className="shrink-0 inline-flex items-center justify-center rounded-md"
            style={{
              width: 22, height: 22,
              background: isRecurring ? "#FF6D00" : "#fff",
              border: `2px solid ${isRecurring ? "#FF6D00" : "#d1d5db"}`,
            }}
          >
            {isRecurring && <Check className="h-3.5 w-3.5" style={{ color: "#fff" }} />}
          </span>
          <span className="flex-1 text-[14px] font-medium">🔁 Задача повторяется</span>
        </button>
      </Section>

      {forceKeyContext && (
        <div
          className="rounded-xl px-3 py-2 text-[12px]"
          style={{ background: "#fff3e0", border: "1px solid #FF6D00", color: "#B45309" }}
        >
          🔑 Задача будет добавлена в дерево ключевых, уровень {forceKeyContext.level}
        </div>
      )}

      <button
        disabled={!valid}
        onClick={() =>
          valid &&
          onSubmit({
            goalId,
            title: title.trim(),
            deadline,
            duration,
            feeling,
            isRecurring,
            ...(forceKeyContext
              ? { isKeyTask: true, parentTaskId: forceKeyContext.parentTaskId }
              : {}),
          })
        }
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

/* ---------------- Карточка «Заметки» ---------------- */

function NotesCard({
  value, isEditing, draft, onStartEdit, onChangeDraft, onCancel, onSave,
}: {

  value: string;
  isEditing: boolean;
  draft: string;
  onStartEdit: () => void;
  onChangeDraft: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!isEditing) return;
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [draft, isEditing]);

  return (
    <article
      className="bg-card rounded-2xl overflow-hidden animate-fade-up"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #ede8df" }}
    >
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-[11px] font-medium uppercase"
            style={{ color: "#8a8a8a", letterSpacing: "0.5px" }}
          >
            Заметки
          </p>
          {!isEditing && (
            <button
              onClick={onStartEdit}
              aria-label="Изменить заметки"
              className="tap inline-flex items-center justify-center rounded-full"
              style={{ width: 26, height: 26, color: "#9a8f7e", border: "1px solid #ede8df", background: "#fff" }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => onChangeDraft(e.target.value)}
              rows={2}
              autoFocus
              placeholder="Добавьте заметки по этой цели..."
              className="w-full rounded-xl p-2.5 text-[14px] leading-[1.6] text-foreground/90 outline-none resize-none placeholder:text-muted-foreground"
              style={{ border: "1px solid #ede8df", background: "#fff", minHeight: 60 }}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span
                className="text-[11.5px]"
                style={{ color: draft !== value ? "#FF6D00" : "#a8a8a8", fontWeight: draft !== value ? 600 : 400 }}
              >
                {draft !== value ? "● Несохранённые изменения" : "✓ Сохранено"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onCancel}
                  className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium"
                  style={{ background: "#fff", color: "#8a8a8a", border: "1px solid #ede8df" }}
                >
                  <X className="h-3.5 w-3.5" /> Отмена
                </button>
                <button
                  disabled={draft === value}
                  onClick={onSave}
                  className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={
                    draft !== value
                      ? { background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff", boxShadow: "0 2px 8px rgba(255,109,0,0.35)" }
                      : { background: "#f3f4f6", color: "#9ca3af", border: "1px solid #e5e7eb", cursor: "not-allowed" }
                  }
                >
                  <Check className="h-3.5 w-3.5" /> Сохранить
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p
            className="mt-1.5 text-[14px] leading-[1.6] whitespace-pre-wrap"
            style={{ color: value ? undefined : "#a8a8a8" }}
          >
            {value || "Добавьте заметки по этой цели..."}
          </p>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   Ключевые задачи (дерево 5×5)
   ============================================================ */

const KEY_LEVEL_META: Record<number, { label: string; color: string }> = {
  1: { label: "Ключевые задачи уровень 1", color: "#E88200" },
  2: { label: "Подзадачи уровень 2", color: "#1D9E75" },
  3: { label: "Подзадачи уровень 3", color: "#534AB7" },
  4: { label: "Подзадачи уровень 4", color: "#E24444" },
  5: { label: "Подзадачи уровень 5", color: "#D4A017" },
};

function getKeyChildren(tasks: Task[], goalId: string, parentId: string | null): Task[] {
  return tasks.filter(
    (t) => t.goalId === goalId && t.isKeyTask && (t.parentTaskId ?? null) === parentId
  );
}

function getTaskLevel(tasks: Task[], task: Task): number {
  let lvl = 1;
  let cur: Task | undefined = task;
  const seen = new Set<string>();
  while (cur?.parentTaskId && !seen.has(cur.id) && lvl < 10) {
    seen.add(cur.id);
    const parent = tasks.find((t) => t.id === cur!.parentTaskId);
    if (!parent) break;
    cur = parent;
    lvl++;
  }
  return lvl;
}

function KeyTreeSection({
  goalId, tasks, expanded, onToggle, onOpenTask, onAdd,
  freeOpen, onToggleFree, onAttachExisting,
}: {
  goalId: string;
  tasks: Task[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onOpenTask: (id: string) => void;
  onAdd: () => void;
  freeOpen: boolean;
  onToggleFree: () => void;
  onAttachExisting: (taskId: string) => void;
}) {
  const roots = getKeyChildren(tasks, goalId, null);
  const totalKey = tasks.filter((t) => t.goalId === goalId && t.isKeyTask).length;
  const freeTasks = tasks.filter((t) => t.goalId === goalId && !t.isKeyTask);

  const renderNode = (task: Task, level: number): React.ReactNode => {
    const meta = KEY_LEVEL_META[level] ?? KEY_LEVEL_META[5];
    const color = meta.color;
    const children = getKeyChildren(tasks, goalId, task.id);
    const canExpand = children.length > 0;
    const isOpen = expanded.has(task.id);
    const bg = `linear-gradient(160deg, #ffffff 0%, ${color}12 80%, ${color}35 100%)`;

    return (
      <div key={task.id} style={{ marginLeft: (level - 1) * 14 }}>
        <div
          onClick={() => { if (canExpand) onToggle(task.id); }}
          role="button"
          className="tap relative w-full rounded-2xl px-3 py-2.5 shadow-card overflow-hidden animate-fade-up"
          style={{
            background: bg,
            border: "1px solid #ede8df",
            cursor: canExpand ? "pointer" : "default",
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Кружок статуса — только визуал */}
            <span
              className="shrink-0 inline-flex items-center justify-center rounded-full"
              style={{
                width: 20, height: 20,
                border: `2px solid ${task.done ? color : "#d1d5db"}`,
                background: task.done ? color : "transparent",
              }}
            >
              {task.done && <Check className="h-3 w-3" style={{ color: "#fff" }} />}
            </span>

            {/* Текст — тап открывает задачу */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenTask(task.id); }}
              className="tap flex-1 min-w-0 text-left"
            >
              <div
                className="text-[14px] font-semibold leading-snug break-words"
                style={{ color: "#111111", textDecoration: task.done ? "line-through" : undefined }}
              >
                {task.title}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: "#6b6b6b" }}>
                {task.deadline}{task.duration && task.duration !== "—" ? ` · ${task.duration}` : ""}
                {task.isRecurring ? " · 🔁" : ""}
              </div>
            </button>

            {/* Круглая стрелочка */}
            {canExpand && (
              <span
                className="shrink-0 inline-flex items-center justify-center rounded-full"
                style={{
                  width: 28, height: 28,
                  background: isOpen ? color : `${color}26`,
                  transition: "transform 0.2s ease, background 0.2s ease",
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4 2 L8 6 L4 10" stroke={isOpen ? "#fff" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {isOpen && canExpand && (
          <div className="mt-2 space-y-2">
            {children.map((c) => renderNode(c, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {roots.length === 0 && (
        <div className="text-center text-[12px] text-[#8a8a8a] py-4">
          Пока нет ключевых задач. Добавь первую ниже.
        </div>
      )}

      <div className="space-y-2">
        {roots.map((r) => renderNode(r, 1))}
      </div>

      <button
        onClick={onAdd}
        className="tap w-full inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-semibold"
        style={{ background: "#fff", color: "#FF6D00", border: "1px solid #FF6D00" }}
      >
        <Plus className="h-4 w-4" /> Добавить задачу
      </button>

      {/* Панель "Задачи из списка" */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #ede8df", background: "#fff" }}>
        <button
          onClick={onToggleFree}
          className="tap w-full flex items-center gap-2 px-3 py-2.5 text-left"
        >
          <span className="text-[14px]">📥</span>
          <span className="flex-1 text-[13px] font-medium">Задачи из списка</span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: "#f3efe7", color: "#6b6b6b" }}
          >
            {freeTasks.length} свободных
          </span>
          <ChevronDown
            className="h-4 w-4 transition-transform"
            style={{ transform: freeOpen ? "rotate(180deg)" : "none", color: "#8a8a8a" }}
          />
        </button>
        {freeOpen && (
          <div className="px-3 pb-3 space-y-2">
            {freeTasks.length === 0 && (
              <div className="text-center text-[12px] text-[#8a8a8a] py-2">
                Все задачи этой цели уже в дереве.
              </div>
            )}
            {freeTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ border: "1px solid #ede8df", background: "#fff" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{t.title}</div>
                  <div className="text-[11px]" style={{ color: "#8a8a8a" }}>{t.deadline}</div>
                </div>
                <button
                  onClick={() => onAttachExisting(t.id)}
                  className="tap shrink-0 rounded-full px-3 py-1 text-[11.5px] font-semibold"
                  style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff" }}
                >
                  + в ключевые
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Поп-ап выбора уровня для новой ключевой задачи ---------------- */

function AddKeyLevelPopup({
  goalId, tasks, onClose, onPick,
}: {
  goalId: string;
  tasks: Task[];
  onClose: () => void;
  onPick: (parentId: string | null, level: number) => void;
}) {
  const [pickingLevel, setPickingLevel] = useState<number | null>(null);

  // Для каждого уровня 1..5: сколько уже задач и список примеров.
  const levelStats: { level: number; tasks: Task[] }[] = [1, 2, 3, 4, 5].map((lvl) => ({
    level: lvl,
    tasks: tasks.filter((t) => t.goalId === goalId && t.isKeyTask && getTaskLevel(tasks, t) === lvl),
  }));

  // Отображаем: все уровни, где уже есть задачи, + один следующий пустой.
  const availableLevels: number[] = [];
  let addedNext = false;
  for (const s of levelStats) {
    if (s.tasks.length > 0) availableLevels.push(s.level);
    else if (!addedNext) { availableLevels.push(s.level); addedNext = true; }
  }
  // Первый уровень (корневые ключевые): максимум 5 → если уже 5, скрываем.
  const rootCount = levelStats[0].tasks.length;
  const filteredLevels = availableLevels.filter((lvl) => !(lvl === 1 && rootCount >= 5));

  // Если пользователь тапнул уровень → определяем список кандидатов-родителей.
  const parentCandidates = (level: number): Task[] => {
    if (level === 1) return [];
    return tasks.filter((t) => t.goalId === goalId && t.isKeyTask && getTaskLevel(tasks, t) === level - 1
      && getKeyChildren(tasks, goalId, t.id).length < 5);
  };

  const handleLevelClick = (level: number) => {
    if (level === 1) { onPick(null, 1); return; }
    const cands = parentCandidates(level);
    if (cands.length === 0) return;
    if (cands.length === 1) { onPick(cands[0].id, level); return; }
    setPickingLevel(level);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "#F5F1EA", borderRadius: 20,
          padding: 16, maxHeight: "85vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        className="animate-fade-up"
      >
        {pickingLevel == null ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[15px] font-semibold">Куда добавить задачу?</div>
              <button onClick={onClose} className="tap text-[#8a8a8a]"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2">
              {filteredLevels.map((lvl) => {
                const meta = KEY_LEVEL_META[lvl];
                const existing = levelStats[lvl - 1].tasks;
                const cands = parentCandidates(lvl);
                const disabled = lvl !== 1 && cands.length === 0;
                const needsPick = lvl !== 1 && cands.length > 1;
                return (
                  <button
                    key={lvl}
                    disabled={disabled}
                    onClick={() => handleLevelClick(lvl)}
                    className="tap w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3"
                    style={{
                      background: "#fff",
                      border: `1.5px dashed ${meta.color}80`,
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    <span style={{ width: 4, alignSelf: "stretch", background: meta.color, borderRadius: 2 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold" style={{ color: meta.color }}>{meta.label}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "#6b6b6b" }}>
                        {existing.length === 0
                          ? "Пока пусто"
                          : existing.slice(0, 3).map((t) => t.title).join(" · ")
                            + (existing.length > 3 ? ` +${existing.length - 3}` : "")}
                      </div>
                    </div>
                    {needsPick && (
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                        <path d="M4 2 L8 6 L4 10" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setPickingLevel(null)} className="tap text-[13px] text-[#FF6D00]">‹ Назад к уровням</button>
              <button onClick={onClose} className="tap text-[#8a8a8a]"><X className="h-5 w-5" /></button>
            </div>
            <div className="text-[15px] font-semibold mb-3">К какой из них это относится?</div>
            <div className="space-y-2">
              {parentCandidates(pickingLevel).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPick(p.id, pickingLevel)}
                  className="tap w-full text-left rounded-xl px-3 py-2.5"
                  style={{ background: "#fff", border: "1px solid #ede8df" }}
                >
                  <div className="text-[13px] font-semibold">{p.title}</div>
                  <div className="text-[11px]" style={{ color: "#8a8a8a" }}>{p.deadline}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

