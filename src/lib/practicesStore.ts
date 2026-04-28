import { useSyncExternalStore } from "react";

// Общий источник истины для статуса doneToday по всем 5 практикам.
// id совпадают с id в initialPractices на главной:
//   "self-prog" | "charge" | "essay" | "skill" | "wishes"
type PracticeId = "self-prog" | "charge" | "essay" | "skill" | "wishes";

type DoneMap = Record<PracticeId, boolean>;

// Состояние зарядки желаний/целей: id → количество тапов лайка.
// 5 тапов = 100% (см. DesireCharge: inRound = ((total-1) % 5) + 1).
type ChargesMap = Record<string, number>;

interface StoreState {
  done: DoneMap;
  charges: ChargesMap;
  // Сколько всего объектов (желаний + целей), которые надо «зарядить» (=поставить лайк).
  totalItems: number;
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
  totalItems: 0,
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
  state = { ...state, done: { ...state.done, [id]: value } };
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

// ----- charges (зарядка желаний / целей) -----

export function bumpCharge(id: string) {
  const next = (state.charges[id] ?? 0) + 1;
  state = { ...state, charges: { ...state.charges, [id]: next } };
  emit();
}

export function setChargeTotal(total: number) {
  if (state.totalItems === total) return;
  state = { ...state, totalItems: total };
  emit();
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

export type { PracticeId };
