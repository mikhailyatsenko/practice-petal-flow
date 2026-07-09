import { useSyncExternalStore } from "react";
import { toast } from "sonner";

const PRACTICE_TITLES: Record<PracticeId, string> = {
  "self-prog": "Самопрограммирование",
  charge: "Вдохновение желаниями",
  essay: "Моя жизнь мечты",
  skill: "Развитие навыка",
  wishes: "Шаг к желанию",
};

function notifyPracticeDone(id: PracticeId) {
  try {
    toast.success(`✅ Привычка сделана: ${PRACTICE_TITLES[id]}`);
  } catch {
    /* ignore */
  }
}

// Общий источник истины для статуса doneToday по всем 5 практикам.
// id совпадают с id в initialPractices на главной:
//   "self-prog" | "charge" | "essay" | "skill" | "wishes"
type PracticeId = "self-prog" | "charge" | "essay" | "skill" | "wishes";

type DoneMap = Record<PracticeId, boolean>;

// Состояние вдохновения желаний/целей: id → количество тапов лайка.
// 5 тапов = 100% (см. DesireCharge: inRound = ((total-1) % 5) + 1).
type ChargesMap = Record<string, number>;

// Смещение прогресса по дням относительно базовых значений на «Дне 1».
// Каждое нажатие «Следующий день» увеличивает offset для всех практик,
// которые были отмечены сделанными в этот день.
type ProgressOffsetMap = Record<PracticeId, number>;

interface StoreState {
  done: DoneMap;
  charges: ChargesMap;
  // Сколько дней подряд/всего пользователь «заряжал» конкретное желание/цель.
  // Инкрементируется только на первом тапе нового дня. Бейджик с цифрой 1/2/3
  // показывает именно это значение, когда у элемента есть хотя бы 1 тап сегодня.
  daysCount: ChargesMap;
  // Сколько всего объектов (желаний + целей), которые надо «вдохновить» (=поставить лайк).
  totalItems: number;
  progressOffset: ProgressOffsetMap;
}

let state: StoreState = {
  done: {
    "self-prog": false,
    charge: false,
    essay: false,
    skill: false,
    wishes: false,
  },
  charges: {},
  daysCount: {},
  totalItems: 0,
  progressOffset: {
    "self-prog": 0,
    charge: 0,
    essay: 0,
    skill: 0,
    wishes: 0,
  },
};

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

// ----- doneToday -----

export function setPracticeDone(id: PracticeId, value: boolean = true) {
  if (state.done[id] === value) return;
  const wasDone = state.done[id];
  state = { ...state, done: { ...state.done, [id]: value } };
  if (!wasDone && value) notifyPracticeDone(id);
  emit();
}

export function usePracticesDone(): DoneMap {
  return useSyncExternalStore(
    subscribe,
    () => state.done,
    () => state.done,
  );
}

export function usePracticeDone(id: PracticeId): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state.done[id],
    () => state.done[id],
  );
}

// ----- charges (вдохновение желаний / целей) -----

export function bumpCharge(id: string) {
  const current = state.charges[id] ?? 0;
  // Кап на 5 тапов в день (один круг = один день, второй круг в тот же день нельзя).
  if (current >= 5) return;
  const next = current + 1;
  // На первом тапе нового дня инкрементируем счётчик дней (бейдж 1/2/3...).
  const nextDays =
    current === 0
      ? { ...state.daysCount, [id]: (state.daysCount[id] ?? 0) + 1 }
      : state.daysCount;
  state = {
    ...state,
    charges: { ...state.charges, [id]: next },
    daysCount: nextDays,
  };
  maybeAutoCompleteCharge();
  emit();
}

export function getDaysCountFor(id: string): number {
  return state.daysCount[id] ?? 0;
}

export function useDaysCount(id: string): number {
  return useSyncExternalStore(
    subscribe,
    () => state.daysCount[id] ?? 0,
    () => state.daysCount[id] ?? 0,
  );
}

export function setChargeTotal(total: number) {
  if (state.totalItems === total) return;
  state = { ...state, totalItems: total };
  maybeAutoCompleteCharge();
  emit();
}

// Если выполнены оба условия вдохновения желаниями — автоматически засчитываем
// практику «charge», даже если пользователь сейчас не на её странице.
function maybeAutoCompleteCharge() {
  if (state.done.charge) return;
  const values = Object.values(state.charges);
  const charged = values.filter((v) => v > 0).length;
  let maxLevel = 0;
  for (const v of values) if (v > maxLevel) maxLevel = v;
  const cond1 = state.totalItems > 0 && charged >= state.totalItems;
  const cond2 = maxLevel >= 5;
  if (cond1 && cond2) {
    state = { ...state, done: { ...state.done, charge: true } };
    notifyPracticeDone("charge");
    try {
      const d = new Date();
      const today = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      localStorage.setItem("charge-done-v1", today);
    } catch {
      /* ignore */
    }
  }
}

export function getChargeFor(id: string): number {
  return state.charges[id] ?? 0;
}

export function useChargesMap(): ChargesMap {
  return useSyncExternalStore(
    subscribe,
    () => state.charges,
    () => state.charges,
  );
}

export function useCharge(id: string): number {
  return useSyncExternalStore(
    subscribe,
    () => state.charges[id] ?? 0,
    () => state.charges[id] ?? 0,
  );
}

interface ChargeStats {
  total: number;
  charged: number; // у скольких объектов >=1 лайк
  maxPercent: number; // максимум среди всех (5 тапов = 100%)
}

const computeStats = (): ChargeStats => {
  const values = Object.values(state.charges);
  const charged = values.filter((v) => v > 0).length;
  let maxLevel = 0;
  for (const v of values) {
    if (v > maxLevel) maxLevel = v;
  }
  // 5 тапов = 100%; больше 5 — всё равно 100% (бейдж +2 и т.п. — это новый круг).
  const maxPercent = Math.min(maxLevel, 5) * 20;
  return { total: state.totalItems, charged, maxPercent };
};

let cachedStats: ChargeStats = computeStats();
let cachedStateRef: StoreState = state;
const getStatsSnapshot = (): ChargeStats => {
  if (cachedStateRef !== state) {
    cachedStateRef = state;
    cachedStats = computeStats();
  }
  return cachedStats;
};

export function useChargeStats(): ChargeStats {
  return useSyncExternalStore(subscribe, getStatsSnapshot, getStatsSnapshot);
}

// ----- reset (тестовая утилита для меню «Сбросить привычки») -----

const PRACTICE_LS_KEYS = [
  "self-prog-done-v2",
  "charge-done-v1",
  "essay-done-v1",
  "essay-today-added-v1",
  "skill-done-v1",
  "skill-today-v1",
  "step-done-v1",
];

export function resetAllPractices() {
  state = {
    done: {
      "self-prog": false,
      charge: false,
      essay: false,
      skill: false,
      wishes: false,
    },
    charges: {},
    daysCount: {},
    totalItems: state.totalItems,
    progressOffset: {
      "self-prog": 0,
      charge: 0,
      essay: 0,
      skill: 0,
      wishes: 0,
    },
  };
  try {
    for (const k of PRACTICE_LS_KEYS) localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
  emit();
}

// ----- «Следующий день» -----
// Базовые значения progress на «Дне 1» (см. initialPractices в _app.index.tsx).
const BASE_PROGRESS: Record<PracticeId, number> = {
  "self-prog": 17,
  charge: 12,
  essay: -6,
  skill: 22,
  wishes: 4,
};

export function useProgressOffset(): ProgressOffsetMap {
  return useSyncExternalStore(
    subscribe,
    () => state.progressOffset,
    () => state.progressOffset,
  );
}

// Базовые уровни (на «Дне 1»). Используются только когда progress > 0.
const BASE_LEVEL: Record<PracticeId, number> = {
  "self-prog": 1,
  charge: 0,
  essay: 0,
  skill: 2,
  wishes: 0,
};

// Вычисляет эффективные значения практики с учётом:
// • базы на «Дне 1»,
// • накопленного offset от «Следующий день»,
// • мгновенного «+1», если практика отмечена сделанной сегодня (но ещё не
//   подтверждена «Следующим днём»). Если база была отрицательной, первое
//   выполнение переводит сразу в +1 (а не «-5»).
export function computeEffective(id: PracticeId, doneToday: boolean) {
  const base = BASE_PROGRESS[id];
  const offset = state.progressOffset[id] ?? 0;
  let progress = base + offset;
  if (doneToday) {
    if (progress <= 0) progress = 1;
    else progress = progress + 1;
  }
  const rawProgress = progress;
  const streakDays = Math.max(0, progress);
  let level: number;
  if (progress <= 0) {
    level = 0;
  } else {
    // Сохраняем «ручной» базовый уровень (см. BASE_LEVEL), но не меньше 1,
    // если есть хоть один зелёный кружок.
    level = Math.max(1, BASE_LEVEL[id]);
  }
  return { progress, rawProgress, streakDays, level };
}

// Кэш снапшотов effective-значений по id, чтобы useSyncExternalStore
// получал стабильные ссылки и не уходил в бесконечный ререндер.
type EffectiveSnap = ReturnType<typeof computeEffective>;
const effectiveCache: Partial<Record<PracticeId, { state: StoreState; snap: EffectiveSnap }>> = {};
function getEffectiveSnap(id: PracticeId): EffectiveSnap {
  const cached = effectiveCache[id];
  if (cached && cached.state === state) return cached.snap;
  const snap = computeEffective(id, state.done[id]);
  effectiveCache[id] = { state, snap };
  return snap;
}

export function useEffectiveProgress(id: PracticeId) {
  return useSyncExternalStore(
    subscribe,
    () => getEffectiveSnap(id),
    () => getEffectiveSnap(id),
  );
}

// «Следующий день»: для каждой выполненной сегодня практики увеличиваем offset.
// Если базовый прогресс был отрицательным (пропуски) и текущий effective <= 0,
// первое выполнение переводит сразу в +1 зелёный кружок (а не в -5).
export function advanceToNextDay() {
  const ids: PracticeId[] = ["self-prog", "charge", "essay", "skill", "wishes"];
  const nextOffset: ProgressOffsetMap = { ...state.progressOffset };
  for (const id of ids) {
    if (!state.done[id]) continue;
    const base = BASE_PROGRESS[id];
    const current = base + nextOffset[id];
    if (current <= 0) {
      // Скачок: красные пропуски сменяются на 1 зелёный.
      nextOffset[id] = 1 - base;
    } else {
      nextOffset[id] = nextOffset[id] + 1;
    }
  }
  state = {
    ...state,
    progressOffset: nextOffset,
    charges: {},
    done: {
      "self-prog": false,
      charge: false,
      essay: false,
      skill: false,
      wishes: false,
    },
  };
  try {
    for (const k of PRACTICE_LS_KEYS) localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
  emit();
}

export type { PracticeId };
