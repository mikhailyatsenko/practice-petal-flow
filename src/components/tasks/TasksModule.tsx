import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, Check, Play, Square, ChevronDown, X, Brain, Key, ChevronRight, ChevronLeft } from "lucide-react";
import { BrainstormListScreen, BrainstormAnswerScreen } from "./Brainstorm";
import { GanttView } from "./GanttView";

/* Блокировщик прокрутки страницы во время drag-and-drop на тач-устройствах.
   Обычный touch-action / e.preventDefault на pointermove не работает на iOS,
   поэтому вешаем нативный non-passive touchmove listener на document. */
const preventTouchMove = (e: TouchEvent) => { e.preventDefault(); };
let touchBlockCount = 0;
function startBlockingTouchScroll() {
  if (typeof document === "undefined") return;
  if (touchBlockCount === 0) {
    document.addEventListener("touchmove", preventTouchMove, { passive: false });
  }
  touchBlockCount++;
}
function stopBlockingTouchScroll() {
  if (typeof document === "undefined") return;
  if (touchBlockCount === 0) return;
  touchBlockCount--;
  if (touchBlockCount === 0) {
    document.removeEventListener("touchmove", preventTouchMove);
  }
}


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
  | "🟩 На день"
  | "🟦 На неделю"
  | "🟪 На месяц"
  | "🟧 Квартал"
  | "🟥 На полгода"
  | "🟫 На год";

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
  { value: "🟩 На день",      label: "🟩 На день" },
  { value: "🟦 На неделю",    label: "🟦 На неделю" },
  { value: "🟪 На месяц",     label: "🟪 На месяц" },
  { value: "🟧 Квартал",      label: "🟧 Квартал" },
  { value: "🟥 На полгода",   label: "🟥 На полгода" },
  { value: "🟫 На год",       label: "🟫 На год" },
];

const DEADLINE_COLORS: Record<TaskDeadline, { bg: string; border?: string }> = {
  "⬜ Не определён": { bg: "#D3D1C7", border: "#b8b8b8" },
  "🟩 На день":      { bg: "#22A06B" },
  "🟦 На неделю":    { bg: "#378ADD" },
  "🟪 На месяц":     { bg: "#7F77DD" },
  "🟧 Квартал":      { bg: "#E88200" },
  "🟥 На полгода":   { bg: "#D14343" },
  "🟫 На год":       { bg: "#8B5A2B" },
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

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDaysLocal(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ganttDatesForDeadline(deadline: TaskDeadline): Pick<Task, "startDate" | "endDate"> {
  const today = startOfToday();
  const spanDays = deadline === "🟩 На день" ? 0
    : deadline === "🟦 На неделю" ? 6
    : deadline === "🟪 На месяц" ? 29
    : deadline === "🟧 Квартал" ? 89
    : deadline === "🟥 На полгода" ? 181
    : deadline === "🟫 На год" ? 364
    : null;

  if (spanDays == null) return { startDate: undefined, endDate: undefined };
  return { startDate: isoLocal(today), endDate: isoLocal(addDaysLocal(today, spanDays)) };
}

type FilterId = "all" | "open" | "day" | "week" | "month" | "quarter" | "halfyear" | "year";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "day",      label: "🟩 День" },
  { id: "week",     label: "🟦 Неделя" },
  { id: "month",    label: "🟪 Месяц" },
  { id: "quarter",  label: "🟧 Квартал" },
  { id: "halfyear", label: "🟥 Полгода" },
  { id: "year",     label: "🟫 Год" },
  { id: "open",     label: "⬜ Открытые" },
  { id: "all",      label: "📋 Все задачи" },
];


type ViewMode = "list" | "key" | "gantt";



const SAMPLE_TASKS = (goals: TaskGoalRef[]): Task[] => {
  if (goals.length === 0) return [];
  const g0 = goals[0]?.id ?? "";
  const g1 = goals[1]?.id ?? g0;
  const g2 = goals[2]?.id ?? g0;
  return [
    { id: "t1", goalId: g0, title: "Купить кроссовки для длинных дистанций", deadline: "🟩 На день", duration: "1 час", feeling: 8, done: false, timeSpent: 0 },
    { id: "t2", goalId: g0, title: "Составить план тренировок на месяц", deadline: "🟧 Квартал", duration: "2 часа", feeling: 7, done: false, timeSpent: 0 },
    { id: "t3", goalId: g0, title: "Зарегистрироваться на ближайший полумарафон", deadline: "🟪 На месяц", duration: "30 мин", feeling: 9, done: false, timeSpent: 0 },
    { id: "t4", goalId: g1, title: "Найти преподавателя испанского", deadline: "🟦 На неделю", duration: "1 час", feeling: 6, done: false, timeSpent: 0 },
    { id: "t5", goalId: g1, title: "Пройти базовый курс грамматики", deadline: "🟧 Квартал", duration: "Более 10 часов", feeling: 5, done: false, timeSpent: 0 },

    { id: "t6", goalId: g2, title: "Открыть накопительный счёт", deadline: "🟩 На день", duration: "30 мин", feeling: 7, done: false, timeSpent: 0 },
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
  const [keyGanttUnlocked, setKeyGanttUnlocked] = useState<boolean>(false);
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const requestViewMode = (m: ViewMode) => {
    if ((m === "key" || m === "gantt") && !keyGanttUnlocked) {
      setShowUnlockPopup(true);
      return;
    }
    setViewMode(m);
  };
  const unlockKeyGantt = () => {
    setKeyGanttUnlocked(true);
    setShowUnlockPopup(false);
    if (attachExistingTaskId) {
      const goalId = tasks.find((x) => x.id === attachExistingTaskId)?.goalId;
      if (goalId) setAddKeyGoalId(goalId);
    }
  };
  
  const [pendingParentInsert, setPendingParentInsert] = useState<{ goalId: string; parentId: string | null; level: number } | null>(null);
  const [attachExistingTaskId, setAttachExistingTaskId] = useState<string | null>(null);
  const [keyExpanded, setKeyExpanded] = useState<Set<string>>(new Set());
  const [addKeyGoalId, setAddKeyGoalId] = useState<string | null>(null);
  const [openGoalId, setOpenGoalId] = useState<string | null>(initialGoalId ?? null);
  const [creating, setCreating] = useState(false);
  const [createForGoalId, setCreateForGoalId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [confirmKeyToggle, setConfirmKeyToggle] = useState<"toKey" | "fromKey" | null>(null);
  const [editingPlanGoalId, setEditingPlanGoalId] = useState<string | null>(null);
  const [planDraft, setPlanDraft] = useState("");
  const [shatteringIds, setShatteringIds] = useState<Set<string>>(new Set());
  

  /* ---------- List-view drag & drop (reorder внутри своей цели) ---------- */
  const [listDrag, setListDrag] = useState<null | {
    taskId: string;
    goalId: string;
    x: number;
    y: number;
    targetIndex: number; // индекс среди задач той же цели (для before/after)
    mode: "before" | "after" | "inside";
    hoverTaskId: string | null; // для inside
    indicator: { top: number; left: number; width: number } | null;
    insideBox: { top: number; left: number; width: number; height: number } | null;
    hint: string;
    valid: boolean;
  }>(null);
  const listDragRef = useRef(listDrag);
  listDragRef.current = listDrag;
  const listLongPressRef = useRef<number | null>(null);
  const listStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const listActiveRef = useRef(false);
  const listSuppressClickRef = useRef(false);

  const collectDescendantsList = (rootId: string): Set<string> => {
    const set = new Set<string>();
    const walk = (pid: string) => {
      for (const t of tasks) {
        if (t.parentTaskId === pid && !set.has(t.id)) {
          set.add(t.id);
          walk(t.id);
        }
      }
    };
    walk(rootId);
    return set;
  };

  const updateListDropTarget = (x: number, y: number) => {
    const d = listDragRef.current;
    if (!d) return;
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const nodeEl = el?.closest('[data-list-dnd="1"]') as HTMLElement | null;
    const setInvalid = (hint: string) => setListDrag((p) => p ? { ...p, x, y, indicator: null, insideBox: null, valid: false, mode: "after", hoverTaskId: null, hint } : p);
    if (!nodeEl) { setInvalid("Отпусти в списке своей цели"); return; }
    const nodeGoalId = nodeEl.getAttribute("data-goal-id") || "";
    const nodeTaskId = nodeEl.getAttribute("data-task-id") || "";
    if (nodeGoalId !== d.goalId) { setInvalid("Только в рамках своей цели"); return; }
    if (nodeTaskId === d.taskId) { setInvalid("Тяни на другую задачу"); return; }

    const hovered = tasks.find((t) => t.id === nodeTaskId);
    const dragged = tasks.find((t) => t.id === d.taskId);
    if (!hovered || !dragged) { setInvalid("Отпусти в списке своей цели"); return; }

    const rect = nodeEl.getBoundingClientRect();
    const rel = (y - rect.top) / Math.max(rect.height, 1);
    let zone: "before" | "after" | "inside";
    if (rel < 0.3) zone = "before";
    else if (rel > 0.7) zone = "after";
    else zone = "inside";

    // inside: превращаем в под-ключевую задачу hovered
    if (zone === "inside") {
      if (!hovered.isKeyTask) {
        // не ключевая — inside делаем невозможным, трактуем как after
        zone = rel > 0.5 ? "after" : "before";
      } else {
        const hoveredLevel = getTaskLevel(tasks, hovered);
        if (hoveredLevel >= 5) { setInvalid("Достигнут максимум уровня вложенности"); return; }
        const descendants = collectDescendantsList(d.taskId);
        if (descendants.has(hovered.id)) { setInvalid("Нельзя вложить в свою подзадачу"); return; }
        const insideBox = { top: rect.top - 2, left: rect.left - 2, width: rect.width + 4, height: rect.height + 4 };
        setListDrag((p) => p ? {
          ...p, x, y,
          mode: "inside", hoverTaskId: hovered.id,
          targetIndex: -1, indicator: null, insideBox,
          valid: true, hint: "Станет подзадачей",
        } : p);
        return;
      }
    }

    // before / after
    const siblings = tasks.filter((t) => t.goalId === d.goalId && t.id !== d.taskId);
    const siblingIndex = siblings.findIndex((t) => t.id === nodeTaskId);
    if (siblingIndex < 0) { setInvalid("Отпусти в списке своей цели"); return; }
    const insertIndex = zone === "before" ? siblingIndex : siblingIndex + 1;
    const indicator = {
      top: zone === "before" ? rect.top - 2 : rect.bottom - 2,
      left: rect.left,
      width: rect.width,
    };
    const prev = siblings[insertIndex - 1];
    const next = siblings[insertIndex];
    const willBeKey =
      (prev && prev.isKeyTask && (!next || next.isKeyTask)) ||
      (!prev && next && next.isKeyTask);
    const hint = willBeKey
      ? (dragged.isKeyTask ? "Переставить в ключевые" : "Станет ключевой")
      : (dragged.isKeyTask ? "Станет не ключевой" : "Обычная задача");
    setListDrag((p) => p ? {
      ...p, x, y,
      mode: zone, hoverTaskId: null,
      targetIndex: insertIndex, indicator, insideBox: null,
      valid: true, hint,
    } : p);
  };

  const commitListDrop = () => {
    const d = listDragRef.current;
    if (!d || !d.valid) return;
    setTasks((prev) => {
      const list = prev.slice();
      const from = list.findIndex((t) => t.id === d.taskId);
      if (from < 0) return prev;
      const [item] = list.splice(from, 1);

      // Режим "inside" — становимся подзадачей hovered (ключевой)
      if (d.mode === "inside" && d.hoverTaskId) {
        const updated: Task = { ...item, isKeyTask: true, parentTaskId: d.hoverTaskId };
        const hoverIdx = list.findIndex((t) => t.id === d.hoverTaskId);
        const insertAt = hoverIdx < 0 ? list.length : hoverIdx + 1;
        list.splice(insertAt, 0, updated);
        return list;
      }

      // before / after
      const siblingIds = list.filter((t) => t.goalId === d.goalId).map((t) => t.id);
      const targetId = siblingIds[d.targetIndex];
      let insertAt: number;
      if (targetId) {
        insertAt = list.findIndex((t) => t.id === targetId);
      } else if (siblingIds.length > 0) {
        insertAt = list.findIndex((t) => t.id === siblingIds[siblingIds.length - 1]) + 1;
      } else {
        insertAt = list.length;
      }

      // Определяем классификацию по соседям
      const prevTask = d.targetIndex > 0 ? list.find((t) => t.id === siblingIds[d.targetIndex - 1]) : undefined;
      const nextTask = list.find((t) => t.id === siblingIds[d.targetIndex]);
      let updated: Task = item;
      const becomesKey =
        (prevTask && prevTask.isKeyTask && (!nextTask || nextTask.isKeyTask)) ||
        (!prevTask && nextTask && nextTask.isKeyTask);
      if (becomesKey) {
        const parentId = prevTask?.isKeyTask ? (prevTask.parentTaskId ?? null) : (nextTask?.parentTaskId ?? null);
        updated = { ...item, isKeyTask: true, parentTaskId: parentId };
      } else {
        updated = { ...item, isKeyTask: false, parentTaskId: null };
      }
      list.splice(insertAt, 0, updated);
      return list;
    });
  };

  const cancelListDrag = () => {
    if (listLongPressRef.current) { window.clearTimeout(listLongPressRef.current); listLongPressRef.current = null; }
    listActiveRef.current = false;
    listStartPosRef.current = null;
    stopBlockingTouchScroll();
    setListDrag(null);
  };


  const handleListPointerDown = (e: React.PointerEvent, task: Task) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    listStartPosRef.current = { x: e.clientX, y: e.clientY };
    const el = e.currentTarget as HTMLElement;
    const pid = e.pointerId;
    listLongPressRef.current = window.setTimeout(() => {
      listActiveRef.current = true;
      listSuppressClickRef.current = true;
      startBlockingTouchScroll();
      try { el.setPointerCapture(pid); } catch { /* noop */ }

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { (navigator as Navigator).vibrate?.(15); } catch { /* noop */ }
      }
      setListDrag({
        taskId: task.id,
        goalId: task.goalId,
        x: listStartPosRef.current!.x,
        y: listStartPosRef.current!.y,
        targetIndex: -1,
        mode: "after",
        hoverTaskId: null,
        indicator: null,
        insideBox: null,
        hint: "Тяни вверх/вниз",
        valid: false,
      });
    }, 350);
  };

  const handleListPointerMove = (e: React.PointerEvent) => {
    if (!listActiveRef.current) {
      if (listStartPosRef.current && listLongPressRef.current) {
        const dx = e.clientX - listStartPosRef.current.x;
        const dy = e.clientY - listStartPosRef.current.y;
        if (dx * dx + dy * dy > 64) {
          window.clearTimeout(listLongPressRef.current);
          listLongPressRef.current = null;
        }
      }
      return;
    }
    e.preventDefault();
    updateListDropTarget(e.clientX, e.clientY);
  };

  const handleListPointerUp = () => {
    if (listActiveRef.current) {
      commitListDrop();
      window.setTimeout(() => { listSuppressClickRef.current = false; }, 250);
    }
    cancelListDrag();
  };

  const handleListClickCapture = (e: React.MouseEvent) => {
    if (listSuppressClickRef.current) { e.stopPropagation(); e.preventDefault(); }
  };


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
    let list = tasks.slice();
    if (initialGoalId) list = list.filter((t) => t.goalId === initialGoalId);
    switch (filter) {
      case "open":    list = list.filter((t) => t.deadline === "⬜ Не определён"); break;
      case "day":     list = list.filter((t) => t.deadline === "🟩 На день"); break;
      case "week":    list = list.filter((t) => t.deadline === "🟦 На неделю"); break;
      case "month":   list = list.filter((t) => t.deadline === "🟪 На месяц"); break;
      case "quarter": list = list.filter((t) => t.deadline === "🟧 Квартал"); break;
      case "halfyear":list = list.filter((t) => t.deadline === "🟥 На полгода"); break;
      case "year":    list = list.filter((t) => t.deadline === "🟫 На год"); break;
    }

    // Порядок:
    // • в режиме списка внутри каждой цели: сначала ключевые задачи в порядке дерева
    //   (родитель → его подзадачи по уровням DFS), затем обычные задачи;
    //   внутри каждой группы выполненные — вниз.
    // • в режиме ключевых сначала идут ключевые по уровню (1..5), затем обычные;
    //   внутри уровня выполненные — вниз.
    if (viewMode === "list") {
      const byGoal = new Map<string, Task[]>();
      for (const t of list) {
        if (!byGoal.has(t.goalId)) byGoal.set(t.goalId, []);
        byGoal.get(t.goalId)!.push(t);
      }
      const goalOrder: string[] = [];
      const seen = new Set<string>();
      for (const g of goals) { goalOrder.push(g.id); seen.add(g.id); }
      for (const gid of byGoal.keys()) if (!seen.has(gid)) goalOrder.push(gid);
      const result: Task[] = [];
      for (const gid of goalOrder) {
        const items = byGoal.get(gid);
        if (!items || items.length === 0) continue;
        const keys = items.filter((t) => t.isKeyTask && !t.done);
        const nonKeys = items.filter((t) => !t.isKeyTask && !t.done);
        const doneItems = items.filter((t) => t.done);
        const keyIds = new Set(keys.map((k) => k.id));
        const childrenMap = new Map<string | null, Task[]>();
        for (const t of keys) {
          const p = t.parentTaskId ?? null;
          const key = p && keyIds.has(p) ? p : null;
          if (!childrenMap.has(key)) childrenMap.set(key, []);
          childrenMap.get(key)!.push(t);
        }
        const goalGroup: Task[] = [];
        const dfs = (parentId: string | null) => {
          const arr = childrenMap.get(parentId) ?? [];
          for (const t of arr) {
            goalGroup.push(t);
            dfs(t.id);
          }
        };
        dfs(null);
        goalGroup.push(...nonKeys);
        // Единое правило: любая выполненная задача уходит в самый низ своей цели.
        goalGroup.push(...doneItems);
        result.push(...goalGroup);
      }
      return result;

    }
    const rank = (t: Task) => (t.isKeyTask ? getTaskLevel(tasks, t) : 999);
    list.sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      return Number(a.done) - Number(b.done);
    });
    return list;
  }, [tasks, filter, initialGoalId, viewMode, goals]);

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


  const scrollToTop = () => {
    try { window.scrollTo({ top: 0, behavior: "auto" }); } catch { /* noop */ }
  };

  const handleCreate = (data: Omit<Task, "id" | "done" | "timeSpent">) => {
    const newTask: Task = { ...data, ...ganttDatesForDeadline(data.deadline), id: `t${Date.now()}`, done: false, timeSpent: 0 };
    setTasks((prev) => [...prev, newTask]);
    setCreating(false);
    setCreateForGoalId(null);
    requestAnimationFrame(scrollToTop);
  };
  const attachToKey = (taskId: string, parentId: string | null) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, isKeyTask: true, parentTaskId: parentId } : t)));
  };
  const handleSaveEdit = (updated: Task) => {
    const normalized = editingTask && updated.deadline !== editingTask.deadline
      ? { ...updated, ...ganttDatesForDeadline(updated.deadline) }
      : updated;
    setTasks((prev) => prev.map((t) => (t.id === normalized.id ? normalized : t)));
    setEditingTask(null);
    requestAnimationFrame(scrollToTop);
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
    if (shatteringIds.has(id)) return;
    // Считаем всё поддерево заранее — анимация должна идти параллельно на всех уровнях
    const subtree = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const t of tasks) {
        if (t.parentTaskId && subtree.has(t.parentTaskId) && !subtree.has(t.id)) {
          subtree.add(t.id);
          changed = true;
        }
      }
    }
    for (const sid of subtree) {
      if (activeTimerIds.has(sid)) {
        setActiveTimerIds((prev) => { const n = new Set(prev); n.delete(sid); return n; });
      }
    }
    setOpenTaskId(null);
    window.setTimeout(() => setShatteringIds(new Set(subtree)), 300);
    window.setTimeout(() => {
      setTasks((prev) => prev.map((t) => (subtree.has(t.id) ? { ...t, done: true } : t)));
      setShatteringIds((prev) => {
        const n = new Set(prev);
        for (const sid of subtree) n.delete(sid);
        return n;
      });
    }, 1150);
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
        onSwitchToPlan={() => {
          const gid = brainstormGoalId;
          setBrainstormGoalId(null);
          onClearBrainstormGoalId?.();
          setOpenGoalId(gid);
          window.setTimeout(() => {
            const el = document.querySelector(`[data-goal-plan="${gid}"]`);
            if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
          }, 120);
        }}
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
        <>
          <TaskDetailScreen
            task={t}
            goal={g}
            isTimerActive={activeTimerIds.has(t.id)}
            liveSeconds={elapsedMap[t.id] ?? 0}
            canAddSubtask={t.isKeyTask && getTaskLevel(tasks, t) < 5}
            onBack={() => setOpenTaskId(null)}
            onEdit={() => { setOpenTaskId(null); setEditingTask(t); }}
            onDelete={() => handleDelete(t.id)}
            onStartTimer={() => startTimer(t.id)}
            onStopTimer={() => stopTimer(t.id)}
            onMarkDone={() => handleMarkDone(t.id)}
            onMoveToKey={() => setConfirmKeyToggle("toKey")}
            onRemoveFromKey={() => setConfirmKeyToggle("fromKey")}
            onAddSubtask={() => {
              const lvl = getTaskLevel(tasks, t) + 1;
              setOpenTaskId(null);
              setPendingParentInsert({ goalId: t.goalId, parentId: t.id, level: lvl });
            }}
          />
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
          {showUnlockPopup && (
            <UnlockKeyGanttPopup
              onClose={() => { setShowUnlockPopup(false); setAttachExistingTaskId(null); }}
              onUnlock={unlockKeyGantt}
            />
          )}
          {confirmKeyToggle && (
            <ConfirmKeyTogglePopup
              mode={confirmKeyToggle}
              onCancel={() => setConfirmKeyToggle(null)}
              onConfirm={() => {
                if (confirmKeyToggle === "toKey") {
                  setAttachExistingTaskId(t.id);
                  if (!keyGanttUnlocked) {
                    setShowUnlockPopup(true);
                  } else {
                    setAddKeyGoalId(t.goalId);
                  }
                } else {
                  setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, isKeyTask: false, parentTaskId: null } : x)));
                }
                setConfirmKeyToggle(null);
              }}
            />
          )}
        </>
      );
    }
  }

  // ===== Лента =====
  return (
    <div className="px-4 pt-3 pb-2 space-y-3">

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
      <div className="w-full">
        <div className="flex w-full rounded-full p-1" style={{ background: "#f3efe7", border: "1px solid #ede8df" }}>
          {(["list", "key", "gantt"] as ViewMode[]).map((m) => {
            const active = viewMode === m;
            return (
              <button
                key={m}
                onClick={() => requestViewMode(m)}
                className="tap flex-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors"
                style={
                  active
                    ? { background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff" }
                    : { background: "transparent", color: "#8a8a8a" }
                }
              >
                {m === "list" ? "📋 Список" : m === "key" ? "🔑 Ключевые" : "📊 Гант"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Фильтры — только в режиме "Список" */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex justify-center gap-1.5 flex-wrap">
            {FILTERS.slice(0, 4).map((f) => (
              <FilterChip key={f.id} active={filter === f.id} label={f.label} onClick={() => setFilter(f.id)} />
            ))}
          </div>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {FILTERS.slice(4).map((f) => (
              <FilterChip key={f.id} active={filter === f.id} label={f.label} onClick={() => setFilter(f.id)} />
            ))}
          </div>
        </div>
      )}


      {viewMode === "gantt" && (
        <GanttView
          goals={goals}
          tasks={initialGoalId ? tasks.filter((t) => t.goalId === initialGoalId) : tasks}
          onUpdateTaskDates={(id, s, e) =>
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, startDate: s, endDate: e } : t)))
          }
          onOpenTask={(id) => setOpenTaskId(id)}
        />
      )}

      {viewMode !== "gantt" && grouped.length === 0 && (
        <div className="text-center text-[13px] text-[#FF6D00] py-10">
          Пока нет задач по выбранному фильтру. Добавь первую ✨
        </div>
      )}

      {viewMode !== "gantt" && grouped.map((row) => {
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
                className="tap shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1"
                style={
                  isOpen
                    ? { background: "rgba(255,109,0,0.12)", color: "#6b6b6b", border: "1px solid rgba(255,109,0,0.35)" }
                    : { background: "#fff", color: "#6b6b6b", border: "1px solid #d6d3cc" }
                }
              >
                {isOpen ? "Закрыть план" : "Открыть план"}
                <ChevronDown
                  className="h-3 w-3 transition-transform"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                />
              </button>
            </div>

            {/* Переключатель: План+Заметки / Мозговой штурм */}
            {isOpen && goal && (
              <div className="flex justify-center">
                <div className="inline-flex rounded-full p-1" style={{ background: "#f3efe7", border: "1px solid #ede8df" }}>
                  <button
                    className="tap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium"
                    style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff" }}
                  >
                    📝 План + Заметки
                  </button>
                  <button
                    onClick={() => { setBrainstormGoalId(row.gid); setBrainstormQuestion(null); }}
                    className="tap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium"
                    style={{ background: "transparent", color: "#8a8a8a" }}
                  >
                    🧠 Мозговой штурм
                  </button>
                </div>
              </div>
            )}

            {/* План реализации */}
            {isOpen && goal && (
              <article
                data-goal-plan={row.gid}
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
              <div className="space-y-2" style={{ touchAction: listDrag ? "none" : undefined }}>
                {(() => {
                  const activeKeys = row.items.filter((t) => t.isKeyTask && !t.done);
                  const nonKeyActive = row.items.filter((t) => !t.isKeyTask && !t.done);
                  const doneTasks = row.items.filter((t) => t.done);

                  const renderTask = (t: Task, level: number, inKeyTree: boolean) => {
                    const isDragging = listDrag?.taskId === t.id;
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        transition={{ layout: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } }}
                      >
                        <div
                          data-list-dnd="1"
                          data-task-id={t.id}
                          data-goal-id={t.goalId}
                          onPointerDown={(e) => handleListPointerDown(e, t)}
                          onPointerMove={handleListPointerMove}
                          onPointerUp={handleListPointerUp}
                          onPointerCancel={handleListPointerUp}
                          onClickCapture={handleListClickCapture}
                          style={{
                            marginLeft: inKeyTree ? (level === 1 ? 0 : 8) : 0,
                            opacity: isDragging ? 0.35 : 1,
                            transition: "opacity 0.15s ease",
                          }}
                        >
                          <TaskRow
                            task={t}
                            keyLevelColor={inKeyTree ? (KEY_LEVEL_META[getTaskLevel(tasks, t)] ?? KEY_LEVEL_META[5]).color : null}
                            isTimerActive={activeTimerIds.has(t.id)}
                            liveSeconds={elapsedMap[t.id] ?? 0}
                            isShattering={shatteringIds.has(t.id)}
                            onOpen={() => setOpenTaskId(t.id)}
                            onComplete={() => handleMarkDone(t.id)}
                          />
                        </div>
                      </motion.div>
                    );
                  };

                  const keyChildrenMap = new Map<string | null, Task[]>();
                  for (const t of activeKeys) {
                    const p = t.parentTaskId && activeKeys.some((x) => x.id === t.parentTaskId) ? t.parentTaskId : null;
                    if (!keyChildrenMap.has(p)) keyChildrenMap.set(p, []);
                    keyChildrenMap.get(p)!.push(t);
                  }
                  const renderKeyTree = (parentId: string | null, level: number): React.ReactNode[] => {
                    const arr = keyChildrenMap.get(parentId) ?? [];
                    return arr.flatMap((t) => (
                      <React.Fragment key={t.id}>
                        {renderTask(t, level, true)}
                        {renderKeyTree(t.id, level + 1)}
                      </React.Fragment>
                    ) as unknown as React.ReactNode[]);
                  };

                  return (
                    <>
                      {renderKeyTree(null, 1)}
                      {nonKeyActive.map((t) => renderTask(t, 1, false))}
                      {doneTasks.map((t) => {
                        const inKeyTree = !!t.isKeyTask;
                        const level = inKeyTree ? getTaskLevel(tasks, t) : 1;
                        return renderTask(t, level, inKeyTree);
                      })}
                      <div className="flex justify-center pt-1">
                        <button
                          onClick={() => { setCreateForGoalId(row.gid); setCreating(true); }}
                          className="tap inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
                          style={{ background: "rgba(0,0,0,0.03)", color: "#8a8a8a", border: "1px dashed #d4d4d4" }}
                        >
                          <Plus className="h-3.5 w-3.5" /> Добавить задачу
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>

            ) : (
              <KeyTreeSection
                goalId={row.gid}
                tasks={tasks}
                setTasks={setTasks}
                expanded={keyExpanded}
                onSetExpanded={setKeyExpanded}
                onOpenTask={(id) => setOpenTaskId(id)}
                onComplete={(id) => handleMarkDone(id)}
                shatteringIds={shatteringIds}
                activeTimerIds={activeTimerIds}
                elapsedMap={elapsedMap}
                onAdd={() => {
                  const hasKey = tasks.some((t) => t.goalId === row.gid && t.isKeyTask);
                  if (!hasKey) {
                    setPendingParentInsert({ goalId: row.gid, parentId: null, level: 1 });
                  } else {
                    setAddKeyGoalId(row.gid);
                  }
                }}
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

      {showUnlockPopup && (
        <UnlockKeyGanttPopup
          onClose={() => setShowUnlockPopup(false)}
          onUnlock={unlockKeyGantt}
        />
      )}

      {listDrag && listDrag.indicator && (
        <div
          style={{
            position: "fixed",
            top: listDrag.indicator.top,
            left: listDrag.indicator.left,
            width: listDrag.indicator.width,
            height: 3,
            borderRadius: 2,
            background: listDrag.valid ? "#FF6D00" : "#d14343",
            boxShadow: `0 0 0 3px ${listDrag.valid ? "rgba(255,109,0,0.18)" : "rgba(209,67,67,0.18)"}`,
            pointerEvents: "none",
            zIndex: 60,
          }}
        />
      )}
      {listDrag && listDrag.insideBox && (
        <div
          style={{
            position: "fixed",
            top: listDrag.insideBox.top,
            left: listDrag.insideBox.left,
            width: listDrag.insideBox.width,
            height: listDrag.insideBox.height,
            border: `2px dashed ${listDrag.valid ? "#FF6D00" : "#d14343"}`,
            borderRadius: 14,
            background: listDrag.valid ? "rgba(255,109,0,0.06)" : "rgba(209,67,67,0.06)",
            pointerEvents: "none",
            zIndex: 60,
          }}
        />
      )}
      {listDrag && (
        <div
          style={{
            position: "fixed",
            top: listDrag.y - 44,
            left: Math.min(Math.max(listDrag.x - 90, 8), (typeof window !== "undefined" ? window.innerWidth : 400) - 188),
            width: 180,
            pointerEvents: "none",
            zIndex: 61,
          }}
        >
          <div
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-center"
            style={{
              background: listDrag.valid ? "linear-gradient(135deg,#FFB300,#FF6D00)" : "#4b4b4b",
              color: "#fff",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            }}
          >
            {listDrag.hint}
          </div>
        </div>
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
  keyLevelColor,
  isTimerActive,
  liveSeconds,
  isShattering,
  onOpen,
  onComplete,
}: {
  task: Task;
  keyLevelColor?: string | null;
  isTimerActive: boolean;
  liveSeconds: number;
  isShattering?: boolean;
  onOpen: () => void;
  onComplete: () => void;
}) {

  
  const f = feelingOf(task.feeling);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Этапы анимации: tick (0-250ms) → strike (250-800ms) → done (карточка уходит вниз при ре-сортировке)
  const [stage, setStage] = useState<"idle" | "tick" | "strike">("idle");
  useEffect(() => {
    if (!isShattering) { setStage(task.done ? "strike" : "idle"); return; }
    // Гарантированно показать карточку перед стартом анимации
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setStage("tick");
    const t1 = window.setTimeout(() => setStage("strike"), 250);
    return () => { window.clearTimeout(t1); };
  }, [isShattering, task.done]);

  const checked = task.done || stage !== "idle";
  const striking = stage === "strike" || task.done;

  return (
    <div
      ref={wrapperRef}
      style={{
        transition: "opacity 0.5s ease",
        opacity: task.done ? 0.62 : 1,
      }}
    >
      <div>
        <div
          onClick={() => { if (stage === "idle") onOpen(); }}
          role="button"
          tabIndex={0}
          className={`tap relative w-full text-left rounded-2xl px-3 py-2.5 shadow-card transition-all duration-100 active:scale-[0.98] active:bg-[#fff7ed] cursor-pointer animate-fade-up overflow-hidden ${keyLevelColor ? "" : "bg-card"}`}
          style={{
            border: isTimerActive ? "2px solid #FF6D00" : "1px solid #ede8df",
            background: keyLevelColor
              ? `linear-gradient(160deg, #ffffff 0%, ${keyLevelColor}12 80%, ${keyLevelColor}35 100%)`
              : undefined,
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Кружок статуса — слева */}
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

            {/* Название + метаданные под ним */}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold leading-snug break-words">
                <span
                  style={{
                    color: striking ? "#8a8a8a" : undefined,
                    backgroundImage: "linear-gradient(currentColor, currentColor)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left 52%",
                    backgroundSize: striking ? "100% 1.5px" : "0% 1.5px",
                    transition: "background-size 0.55s ease, color 0.55s ease",
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                  }}
                >
                  {task.title}<span aria-label={f.label} className="ml-1">{f.emoji}</span>
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[11.5px]" style={{ color: "#6b6b6b" }}>
                <span>{task.deadline}</span>
                {task.duration && task.duration !== "—" && (
                  <>
                    <span style={{ color: "#c5c5c5" }}>·</span>
                    <span>{task.duration}</span>
                  </>
                )}
                {task.isRecurring && (
                  <>
                    <span style={{ color: "#c5c5c5" }}>·</span>
                    <span aria-label="Повторяющаяся">🔁 повторяется</span>
                  </>
                )}
                {task.timeSpent > 0 && !isTimerActive && !task.done && (
                  <>
                    <span style={{ color: "#c5c5c5" }}>·</span>
                    <span style={{ color: "#FF6D00" }}>⏱ {fmtTimeBig(task.timeSpent)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Ключик убран — ключевые задачи и так отличаются градиентом карточки */}
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
  task, goal, isTimerActive, liveSeconds, canAddSubtask,
  onBack, onEdit, onDelete, onStartTimer, onStopTimer, onMarkDone,
  onMoveToKey, onRemoveFromKey, onAddSubtask,
}: {
  task: Task;
  goal?: TaskGoalRef;
  isTimerActive: boolean;
  liveSeconds: number;
  canAddSubtask?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onMarkDone: () => void;
  onMoveToKey: () => void;
  onRemoveFromKey: () => void;
  onAddSubtask: () => void;
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

      {/* Ключевая / обычная задача */}
      <button
        onClick={task.isKeyTask ? onRemoveFromKey : onMoveToKey}
        className="tap w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-left bg-card"
        style={{ border: "1px solid #ede8df" }}
      >
        <span className="relative shrink-0 inline-flex items-center justify-center text-[16px] leading-none" style={{ width: 24, height: 24 }}>
          <span aria-hidden>🔑</span>
          {task.isKeyTask && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="block h-[2.5px] w-[26px] rotate-45 rounded-full" style={{ background: "#e11d48" }} />
            </span>
          )}
        </span>
        <span className="flex-1">
          <span className="block text-[14px] font-medium">
            {task.isKeyTask ? "Убрать из ключевых задач" : "Перенести в ключевые задачи"}
          </span>
          {task.isKeyTask && (
            <span className="block text-[11px] text-[#8a8a8a]">Сейчас это ключевая задача</span>
          )}
        </span>
        {task.isKeyTask ? (
          <X className="h-4 w-4" style={{ color: "#8a8a8a" }} />
        ) : (
          <ChevronRight className="h-4 w-4" style={{ color: "#8a8a8a" }} />
        )}
      </button>

      {task.isKeyTask && canAddSubtask && (
        <div className="flex justify-center -mt-1">
          <button
            onClick={onAddSubtask}
            className="tap inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
            style={{ background: "rgba(255,109,0,0.06)", color: "#FF6D00", border: "1px dashed rgba(255,109,0,0.4)" }}
          >
            <Plus className="h-3.5 w-3.5" /> Добавить подзадачу
          </button>
        </div>
      )}


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
            <Play className="h-4 w-4" /> {task.timeSpent > 0 ? "Продолжить работу" : "Начать работу"}
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

  const valid = title.trim().length >= 3 && duration.length > 0 && feeling > 0 && goalId.length > 0;


  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="tap inline-flex items-center gap-1.5 text-[14px] text-[#FF6D00]">
          <ArrowLeft className="h-4 w-4" /> Отмена
        </button>
        <h1 className="text-[15px] font-semibold">{mode === "create" ? "Новая задача" : "Изменить задачу"}</h1>
        <span className="w-12" />
      </div>

      {/* Цель — скрываем при создании ключевой подзадачи, цель уже выбрана */}
      {!forceKeyContext && !defaultGoalId && (
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
      )}

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
  1: { label: "Ключевые задачи уровень 1", color: "#1D9E75" },
  2: { label: "Подзадачи уровень 2", color: "#E88200" },
  3: { label: "Подзадачи уровень 3", color: "#534AB7" },
  4: { label: "Подзадачи уровень 4", color: "#E24444" },
  5: { label: "Подзадачи уровень 5", color: "#D4A017" },
};

function getKeyChildren(tasks: Task[], goalId: string, parentId: string | null): Task[] {
  return tasks
    .filter((t) => t.goalId === goalId && t.isKeyTask && (t.parentTaskId ?? null) === parentId)
    .sort((a, b) => Number(a.done) - Number(b.done));
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
  goalId, tasks, setTasks, expanded, onSetExpanded, onOpenTask, onComplete, shatteringIds, activeTimerIds, elapsedMap, onAdd,
}: {
  goalId: string;
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
  expanded: Set<string>;
  onSetExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  onOpenTask: (id: string) => void;
  onComplete: (id: string) => void;
  shatteringIds: Set<string>;
  activeTimerIds: Set<string>;
  elapsedMap: Record<string, number>;
  onAdd: () => void;
}) {
  const goalKeyTasks = tasks.filter((t) => t.goalId === goalId && t.isKeyTask);

  const hasDoneAncestor = (task: Task): boolean => {
    const seen = new Set<string>();
    let current: Task | null = task;
    while (current) {
      const pid: string | null | undefined = current.parentTaskId;
      if (!pid || seen.has(current.id)) break;
      seen.add(current.id);
      const parent: Task | undefined = goalKeyTasks.find((t) => t.id === pid);
      if (!parent) break;
      if (parent.done) return true;
      current = parent;
    }
    return false;
  };

  const activeKeyIds = new Set(goalKeyTasks.filter((t) => !t.done && !hasDoneAncestor(t)).map((t) => t.id));
  const normalizeActiveParent = (task: Task) => {
    const parentId = task.parentTaskId ?? null;
    return parentId && activeKeyIds.has(parentId) ? parentId : null;
  };
  const activeRoots = goalKeyTasks.filter((t) => !t.done && !hasDoneAncestor(t) && normalizeActiveParent(t) === null);
  const doneTasks = goalKeyTasks.filter((t) => t.done || hasDoneAncestor(t));
  const doneRoots = doneTasks.filter((t) => !t.parentTaskId || !doneTasks.some((p) => p.id === t.parentTaskId));
  const totalKey = goalKeyTasks.length;

  const getActiveChildren = (parentId: string): Task[] =>
    goalKeyTasks.filter((t) => !t.done && !hasDoneAncestor(t) && normalizeActiveParent(t) === parentId);
  const getDoneChildren = (parentId: string): Task[] =>
    doneTasks.filter((t) => t.parentTaskId === parentId).sort((a, b) => Number(a.done) - Number(b.done));

  // Собрать все id-потомков (включая сам корень, кроме первого)
  const collectDescendantIds = (rootId: string): string[] => {
    const acc: string[] = [];
    const walk = (pid: string) => {
      for (const c of getKeyChildren(tasks, goalId, pid)) {
        acc.push(c.id);
        walk(c.id);
      }
    };
    walk(rootId);
    return acc;
  };

  const toggleSubtree = (task: Task) => {
    const descendants = collectDescendantIds(task.id);
    if (descendants.length === 0) return;
    const isOpen = expanded.has(task.id);
    onSetExpanded((prev) => {
      const n = new Set(prev);
      if (isOpen) {
        n.delete(task.id);
        descendants.forEach((id) => n.delete(id));
      } else {
        n.add(task.id);
        descendants.forEach((id) => n.add(id));
      }
      return n;
    });
  };

  /* ---------- Drag & drop (long-press, pointer events) ---------- */
  const [drag, setDrag] = useState<null | {
    taskId: string;
    draggedLevel: number;
    x: number;
    y: number;
    targetParentId: string | null;
    targetIndex: number;
    targetLevel: number;
    mode: "before" | "after" | "inside";
    indicator: { top: number; left: number; width: number } | null;
    insideBox: { top: number; left: number; width: number; height: number } | null;
    hint: string;
    valid: boolean;
  }>(null);
  const dragRef = useRef(drag);
  dragRef.current = drag;
  const longPressRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const activeRef = useRef(false);
  const suppressClickRef = useRef(false);

  const forbiddenIds = (taskId: string): Set<string> => {
    const s = new Set<string>([taskId]);
    for (const id of collectDescendantIds(taskId)) s.add(id);
    return s;
  };

  const updateDropTarget = (x: number, y: number) => {
    const d = dragRef.current;
    if (!d) return;
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const nodeEl = el?.closest('[data-dnd-node="1"]') as HTMLElement | null;
    if (!nodeEl) {
      setDrag((prev) => prev ? { ...prev, x, y, indicator: null, insideBox: null, valid: false, hint: "Отпусти внутри дерева" } : prev);
      return;
    }
    const targetTaskId = nodeEl.getAttribute("data-task-id")!;
    const targetLevel = Number(nodeEl.getAttribute("data-level")!);
    const targetParentId = nodeEl.getAttribute("data-parent-id") || null;
    const rect = nodeEl.getBoundingClientRect();
    const relY = (y - rect.top) / rect.height;
    let mode: "before" | "after" | "inside" = "inside";
    if (relY < 0.3) mode = "before";
    else if (relY > 0.7) mode = "after";

    const forbidden = forbiddenIds(d.taskId);
    const draggedTask = tasks.find((t) => t.id === d.taskId);
    const currentParent = draggedTask?.parentTaskId ?? null;

    // Нельзя дропнуть на самого себя или потомка
    if (forbidden.has(targetTaskId)) {
      setDrag((prev) => prev ? { ...prev, x, y, indicator: null, insideBox: null, valid: false, hint: "Нельзя вложить в саму себя" } : prev);
      return;
    }

    let valid = true;
    let hint = "";
    let effectiveParentId: string | null;
    let effectiveLevel: number;
    let insertIndex: number;
    let indicator: { top: number; left: number; width: number } | null = null;
    let insideBox: { top: number; left: number; width: number; height: number } | null = null;

    if (mode === "inside") {
      effectiveParentId = targetTaskId;
      effectiveLevel = targetLevel + 1;
      if (effectiveLevel > 5) {
        valid = false; hint = "Максимум 5 уровней";
      } else {
        hint = `Станет подзадачей · уровень ${effectiveLevel}`;
      }
      const childSiblings = tasks.filter((t) => t.goalId === goalId && t.isKeyTask && (t.parentTaskId ?? null) === targetTaskId);
      insertIndex = childSiblings.length;
      insideBox = { top: rect.top - 2, left: rect.left - 2, width: rect.width + 4, height: rect.height + 4 };
    } else {
      const isTop = mode === "before";
      const siblings = tasks.filter((t) => t.goalId === goalId && t.isKeyTask && (t.parentTaskId ?? null) === targetParentId);
      const siblingIndex = siblings.findIndex((t) => t.id === targetTaskId);
      insertIndex = isTop ? siblingIndex : siblingIndex + 1;
      effectiveParentId = targetParentId;
      effectiveLevel = targetLevel;

      if (targetParentId && forbidden.has(targetParentId)) {
        valid = false; hint = "Нельзя вложить в саму себя";
      } else if (targetLevel === 1) {
        const currentRoots = tasks.filter((t) => t.goalId === goalId && t.isKeyTask && !t.parentTaskId);
        const isCurrentlyRoot = !currentParent;
        if (!isCurrentlyRoot && currentRoots.length >= 5) {
          valid = false; hint = "Уровень 1 заполнен (макс 5)";
        }
      }

      if (valid) {
        if (targetLevel === d.draggedLevel && targetParentId === currentParent) {
          hint = isTop ? "Переместить выше" : "Переместить ниже";
        } else if (targetLevel === d.draggedLevel) {
          hint = `Уровень ${targetLevel} · другой родитель`;
        } else {
          hint = `Перейдёт на уровень ${targetLevel}`;
        }
      }
      indicator = {
        top: isTop ? rect.top - 2 : rect.bottom - 2,
        left: rect.left,
        width: rect.width,
      };
    }

    setDrag((prev) => prev ? { ...prev, x, y, targetParentId: effectiveParentId, targetIndex: insertIndex, targetLevel: effectiveLevel, mode, indicator, insideBox, hint, valid } : prev);
  };

  const commitDrop = () => {
    const d = dragRef.current;
    if (!d || !d.valid) return;
    setTasks((prev) => {
      const list = prev.slice();
      const from = list.findIndex((t) => t.id === d.taskId);
      if (from < 0) return prev;
      const [item] = list.splice(from, 1);
      const updated: Task = { ...item, parentTaskId: d.targetParentId, isKeyTask: true };
      const siblingIds = list
        .filter((t) => t.goalId === goalId && t.isKeyTask && (t.parentTaskId ?? null) === d.targetParentId)
        .map((t) => t.id);
      const targetSiblingId = siblingIds[d.targetIndex];
      let insertAt: number;
      if (targetSiblingId) {
        insertAt = list.findIndex((t) => t.id === targetSiblingId);
      } else if (siblingIds.length > 0) {
        const lastId = siblingIds[siblingIds.length - 1];
        insertAt = list.findIndex((t) => t.id === lastId) + 1;
      } else if (d.targetParentId) {
        insertAt = list.findIndex((t) => t.id === d.targetParentId) + 1;
      } else {
        insertAt = list.length;
      }
      list.splice(insertAt, 0, updated);
      return list;
    });
  };

  const cancelDrag = () => {
    if (longPressRef.current) { window.clearTimeout(longPressRef.current); longPressRef.current = null; }
    activeRef.current = false;
    startPosRef.current = null;
    stopBlockingTouchScroll();
    setDrag(null);
  };

  const handlePointerDown = (e: React.PointerEvent, task: Task, level: number) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    const el = e.currentTarget as HTMLElement;
    const pid = e.pointerId;
    longPressRef.current = window.setTimeout(() => {
      activeRef.current = true;
      suppressClickRef.current = true;
      startBlockingTouchScroll();
      try { el.setPointerCapture(pid); } catch { /* noop */ }

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { (navigator as Navigator).vibrate?.(15); } catch { /* noop */ }
      }
      setDrag({
        taskId: task.id,
        draggedLevel: level,
        x: startPosRef.current!.x,
        y: startPosRef.current!.y,
        targetParentId: null,
        targetIndex: -1,
        targetLevel: level,
        mode: "after",
        indicator: null,
        insideBox: null,
        hint: "Тяни к нужному месту",
        valid: false,
      });
    }, 350);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeRef.current) {
      if (startPosRef.current && longPressRef.current) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        if (dx * dx + dy * dy > 64) {
          window.clearTimeout(longPressRef.current);
          longPressRef.current = null;
        }
      }
      return;
    }
    e.preventDefault();
    updateDropTarget(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (activeRef.current) {
      commitDrop();
      window.setTimeout(() => { suppressClickRef.current = false; }, 250);
    }
    cancelDrag();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const renderNode = (task: Task, level: number, parentId: string | null): React.ReactNode => {
    const meta = KEY_LEVEL_META[level] ?? KEY_LEVEL_META[5];
    const color = meta.color;
    const children = getActiveChildren(task.id);
    const canExpand = children.length > 0;
    const isOpen = expanded.has(task.id);
    const isDragging = drag?.taskId === task.id;

    return (
      <motion.div layout transition={{ layout: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } }} key={task.id} style={{ marginLeft: level === 1 ? 0 : 8 }}>
        <div
          data-dnd-node="1"
          data-task-id={task.id}
          data-level={level}
          data-parent-id={parentId ?? ""}
          onPointerDown={(e) => handlePointerDown(e, task, level)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={handleClickCapture}
          style={{
            touchAction: activeRef.current ? "none" : "auto",
            opacity: isDragging ? 0.35 : 1,
            transition: "opacity 0.15s ease",
          }}
        >
          <KeyNodeCard
            task={task}
            color={color}
            canExpand={canExpand}
            isOpen={isOpen}
            isShattering={shatteringIds.has(task.id)}
            isTimerActive={activeTimerIds.has(task.id)}
            liveSeconds={elapsedMap[task.id] ?? 0}
            onToggleTree={() => toggleSubtree(task)}
            onOpenTask={() => onOpenTask(task.id)}
            onComplete={() => onComplete(task.id)}
          />
        </div>

        {isOpen && canExpand && (
          <div className="mt-1 space-y-1">
            {children.map((c) => renderNode(c, level + 1, task.id))}
          </div>
        )}
      </motion.div>
    );
  };

  const renderDoneNode = (task: Task, level: number, parentId: string | null): React.ReactNode => {
    const meta = KEY_LEVEL_META[level] ?? KEY_LEVEL_META[5];
    const isDragging = drag?.taskId === task.id;
    const children = getDoneChildren(task.id);
    const canExpand = children.length > 0;
    const isOpen = expanded.has(task.id);

    return (
      <motion.div layout transition={{ layout: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } }} key={task.id} style={{ marginLeft: level === 1 ? 0 : 8 }}>
        <div
          data-dnd-node="1"
          data-task-id={task.id}
          data-level={level}
          data-parent-id={parentId ?? ""}
          onPointerDown={(e) => handlePointerDown(e, task, level)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={handleClickCapture}
          style={{
            touchAction: activeRef.current ? "none" : "auto",
            opacity: isDragging ? 0.35 : 1,
            transition: "opacity 0.15s ease",
          }}
        >
          <KeyNodeCard
            task={task}
            color={meta.color}
            canExpand={canExpand}
            isOpen={isOpen}
            isShattering={shatteringIds.has(task.id)}
            isTimerActive={activeTimerIds.has(task.id)}
            liveSeconds={elapsedMap[task.id] ?? 0}
            onToggleTree={() => toggleSubtree(task)}
            onOpenTask={() => onOpenTask(task.id)}
            onComplete={() => onComplete(task.id)}
          />
        </div>

        {isOpen && canExpand && (
          <div className="mt-1 space-y-1">
            {children.map((c) => renderDoneNode(c, level + 1, task.id))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-3" style={{ touchAction: drag ? "none" : undefined }}>
      {totalKey === 0 && (
        <div className="text-center text-[12px] text-[#8a8a8a] py-4">
          Пока нет ключевых задач. Добавь первую ниже.
        </div>
      )}

      <div className="space-y-2">
        {activeRoots.map((r) => renderNode(r, 1, null))}
        {doneTasks.map((t) => renderDoneNode(t))}
      </div>

      {/* Плавающая подсказка + линия-индикатор при drag */}
      {drag && drag.indicator && (
        <div
          style={{
            position: "fixed",
            top: drag.indicator.top,
            left: drag.indicator.left,
            width: drag.indicator.width,
            height: 3,
            borderRadius: 2,
            background: drag.valid ? "#FF6D00" : "#d14343",
            boxShadow: `0 0 0 3px ${drag.valid ? "rgba(255,109,0,0.18)" : "rgba(209,67,67,0.18)"}`,
            pointerEvents: "none",
            zIndex: 60,
          }}
        />
      )}
      {drag && drag.insideBox && (
        <div
          style={{
            position: "fixed",
            top: drag.insideBox.top,
            left: drag.insideBox.left,
            width: drag.insideBox.width,
            height: drag.insideBox.height,
            borderRadius: 14,
            border: `2px dashed ${drag.valid ? "#FF6D00" : "#d14343"}`,
            background: drag.valid ? "rgba(255,109,0,0.12)" : "rgba(209,67,67,0.10)",
            pointerEvents: "none",
            zIndex: 60,
          }}
        />
      )}
      {drag && (
        <div
          style={{
            position: "fixed",
            top: drag.y - 44,
            left: Math.min(Math.max(drag.x - 90, 8), (typeof window !== "undefined" ? window.innerWidth : 400) - 188),
            width: 180,
            pointerEvents: "none",
            zIndex: 61,
          }}
        >
          <div
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-center"
            style={{
              background: drag.valid ? "linear-gradient(135deg,#FFB300,#FF6D00)" : "#4b4b4b",
              color: "#fff",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            }}
          >
            {drag.hint || "Тяни к нужному месту"}
          </div>
        </div>
      )}



      <div className="flex justify-center">
        <button
          onClick={onAdd}
          className="tap inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
          style={{ background: "rgba(255,109,0,0.06)", color: "#FF6D00", border: "1px dashed rgba(255,109,0,0.4)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Добавить ключевую задачу
        </button>
      </div>

    </div>
  );
}


/* ---------------- Карточка ключевой задачи (с чек-анимацией и таймером) ---------------- */

function KeyNodeCard({
  task, color, canExpand, isOpen, isShattering, isTimerActive, liveSeconds,
  onToggleTree, onOpenTask, onComplete,
}: {
  task: Task;
  color: string;
  canExpand: boolean;
  isOpen: boolean;
  isShattering: boolean;
  isTimerActive: boolean;
  liveSeconds: number;
  onToggleTree: () => void;
  onOpenTask: () => void;
  onComplete: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<"idle" | "tick" | "strike">("idle");
  useEffect(() => {
    if (!isShattering) { setStage(task.done ? "strike" : "idle"); return; }
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setStage("tick");
    const t1 = window.setTimeout(() => setStage("strike"), 250);
    return () => { window.clearTimeout(t1); };
  }, [isShattering, task.done]);
  const checked = task.done || stage !== "idle";
  const striking = stage === "strike" || task.done;
  const bg = `linear-gradient(160deg, #ffffff 0%, ${color}12 80%, ${color}35 100%)`;

  return (
    <div
      ref={wrapperRef}
      style={{
        transition: "opacity 0.5s ease",
        opacity: task.done ? 0.62 : 1,
      }}
    >
      <div>
        <div
          onClick={() => { if (stage === "idle") onOpenTask(); }}
          role="button"
          className="tap relative w-full rounded-2xl px-3 py-2.5 shadow-card overflow-hidden animate-fade-up"
          style={{
            background: bg,
            border: isTimerActive ? `2px solid ${color}` : "1px solid #ede8df",
            cursor: "pointer",
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Кружок статуса — кликабельный */}
            <button
              type="button"
              aria-label={checked ? "Задача выполнена" : "Отметить выполненной"}
              onClick={(e) => { e.stopPropagation(); if (!checked) onComplete(); }}
              className="shrink-0 inline-flex items-center justify-center rounded-full"
              style={{
                width: 22, height: 22,
                background: checked ? color : "transparent",
                border: `2px solid ${checked ? color : "#d1d5db"}`,
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    strokeDasharray: 20,
                    strokeDashoffset: checked ? 0 : 20,
                    transition: "stroke-dashoffset 0.25s ease",
                  }}
                />
              </svg>
            </button>

            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold leading-snug break-words" style={{ color: striking ? "#8a8a8a" : "#111111" }}>
                <span
                  style={{
                    backgroundImage: "linear-gradient(currentColor, currentColor)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left 52%",
                    backgroundSize: striking ? "100% 1.5px" : "0% 1.5px",
                    transition: "background-size 0.55s ease, color 0.55s ease",
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                  }}
                >
                  {task.title}<span aria-label={feelingOf(task.feeling).label} className="ml-1">{feelingOf(task.feeling).emoji}</span>
                </span>
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: "#6b6b6b" }}>
                {task.deadline}{task.duration && task.duration !== "—" ? ` · ${task.duration}` : ""}{task.isRecurring ? ` · 🔁 повторяется` : ""}{task.timeSpent > 0 && !isTimerActive && !task.done ? ` · ` : ""}{task.timeSpent > 0 && !isTimerActive && !task.done ? <span style={{ color: "#FF6D00" }}>⏱ {fmtTimeBig(task.timeSpent)}</span> : null}
              </div>
            </div>

            {canExpand && (
              <button
                type="button"
                aria-label={isOpen ? "Свернуть подзадачи" : "Раскрыть все подзадачи"}
                onClick={(e) => { e.stopPropagation(); onToggleTree(); }}
                className="tap shrink-0 inline-flex items-center justify-center rounded-full"
                style={{
                  width: 28, height: 28,
                  background: color,
                  boxShadow: `0 2px 8px ${color}55`,
                  transition: "transform 0.2s ease",
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4 2 L8 6 L4 10" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>



          {isTimerActive && (
            <div className="mt-2 flex justify-center">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ background: `${color}1f`, color }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current task-pulse" />
                ▶ {fmtTime(task.timeSpent + liveSeconds)}
              </div>
            </div>
          )}
        </div>
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
  // Выполненные задачи исключаем — под них нельзя добавить подзадачу.
  const levelStats: { level: number; tasks: Task[] }[] = [1, 2, 3, 4, 5].map((lvl) => ({
    level: lvl,
    tasks: tasks.filter((t) => t.goalId === goalId && t.isKeyTask && !t.done && getTaskLevel(tasks, t) === lvl),
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

  // Если пользователь тапнул уровень → определяем список кандидатов-родителей (только невыполненные).
  const parentCandidates = (level: number): Task[] => {
    if (level === 1) return [];
    return tasks.filter((t) => t.goalId === goalId && t.isKeyTask && !t.done && getTaskLevel(tasks, t) === level - 1
      && getKeyChildren(tasks, goalId, t.id).filter((c) => !c.done).length < 5);
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

/* ---------------- Поп-ап разблокировки Ключевых задач и Ганта ---------------- */

function UnlockKeyGanttPopup({
  onClose,
  onUnlock,
}: {
  onClose: () => void;
  onUnlock: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const submit = () => {
    if (code.trim().toLowerCase() === "ключ") {
      onUnlock();
    } else {
      setError(true);
    }
  };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 420, background: "#fff",
          borderRadius: 20, padding: 18, boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          boxSizing: "border-box", overflow: "hidden",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[16px] font-semibold leading-snug text-foreground" style={{ flex: 1, minWidth: 0 }}>
            🔒 Открыть Ключевые задачи и Гант
          </h3>
          <button onClick={onClose} className="tap shrink-0 rounded-full p-1" aria-label="Закрыть">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <p className="text-[13px] leading-[1.5] mb-3" style={{ color: "#6b6b6b" }}>
          Чтобы открыть Ключевые задачи и диаграмму Ганта, посмотри видео, услышь кодовое слово и введи его ниже.
        </p>

        <div
          className="rounded-xl mb-3 overflow-hidden relative aspect-video w-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #2a1a05 0%, #4a2c0a 50%, #1a0e00 100%)",
          }}
        >
          <button
            aria-label="Воспроизвести"
            className="tap h-16 w-16 rounded-full flex items-center justify-center text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
          >
            <Play className="h-7 w-7 fill-white ml-1" />
          </button>
        </div>

        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Кодовое слово</span>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); if (error) setError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Введи кодовое слово"
            maxLength={40}
            className="mt-1 w-full rounded-xl px-3 py-2.5 text-[14px] outline-none"
            style={{ border: `1px solid ${error ? "#DC2626" : "#ede8df"}`, background: "#faf7f1", boxSizing: "border-box" }}
          />
        </label>
        {error && (
          <p className="mt-1.5 text-[12px]" style={{ color: "#DC2626" }}>
            Неверное кодовое слово. Посмотри видео ещё раз.
          </p>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="tap rounded-full px-3 py-2 text-[13px] font-medium"
            style={{ background: "#fff", color: "#8a8a8a", border: "1px solid #ede8df" }}
          >
            Отмена
          </button>
          <button
            onClick={submit}
            className="tap rounded-full px-4 py-2 text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)" }}
          >
            Открыть
          </button>
        </div>
      </div>
    </div>
  );
}



/* ---------------- Подтверждение переноса ключевой ---------------- */

function ConfirmKeyTogglePopup({
  mode, onCancel, onConfirm,
}: {
  mode: "toKey" | "fromKey";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isToKey = mode === "toKey";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-5" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-card" style={{ border: "1px solid #ede8df" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center">
          <span
            className="relative inline-flex items-center justify-center leading-none"
            style={{
              width: isToKey ? 34 : 44,
              height: isToKey ? 34 : 44,
              fontSize: isToKey ? 24 : 32,
            }}
          >
            <span aria-hidden>🔑</span>
            {!isToKey && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="block h-[3px] w-[46px] rotate-45 rounded-full" style={{ background: "#e11d48" }} />
              </span>
            )}
          </span>
        </div>
        <h3 className="mt-3 text-center text-[16px] font-semibold text-foreground">
          {isToKey ? "Перенести в ключевые задачи?" : "Убрать из ключевых задач?"}
        </h3>
        <p className="mt-1.5 text-center text-[13px] text-muted-foreground">
          {isToKey
            ? "Задача попадёт в дерево ключевых задач."
            : "Задача снова станет обычной задачей."}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={onCancel}
            className="tap rounded-full px-3 py-2 text-[13px] font-medium"
            style={{ background: "#fff", color: "#8a8a8a", border: "1px solid #ede8df" }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="tap rounded-full px-4 py-2 text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)" }}
          >
            {isToKey ? "Перенести" : "Убрать"}
          </button>
        </div>
      </div>
    </div>
  );
}
