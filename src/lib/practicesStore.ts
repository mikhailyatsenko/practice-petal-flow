import { useSyncExternalStore } from "react";

// Общий источник истины для статуса doneToday по всем 5 практикам.
// id совпадают с id в initialPractices на главной:
//   "self-prog" | "charge" | "essay" | "skill" | "wishes"
type PracticeId = "self-prog" | "charge" | "essay" | "skill" | "wishes";

type DoneMap = Record<PracticeId, boolean>;

// Состояние зарядки желаний/целей: id → количество тапов лайка.
// 5 тапов = 100% (см. DesireCharge: inRound = ((total-1) % 5) + 1).
// Кап: значение никогда не превышает 5 (на 100% дошёл — больше не растёт).
type ChargesMap = Record<string, number>;

const CHARGE_MAX = 5;
const SHADOW_LS_KEY = "charges-shadow-v1";

// Загружаем «теневой» счётчик — он переживает «Сбросить привычки».
// Это позволяет показывать пользователю, сколько раз он реально лайкал пост,
// сразу после первого тапа после сброса.
const loadShadow = (): ChargesMap => {
  try {
    const raw = localStorage.getItem(SHADOW_LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as ChargesMap;
  } catch {
    /* ignore */
  }
  return {};
};

const saveShadow = (s: ChargesMap) => {
  try {
    localStorage.setItem(SHADOW_LS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
};

interface StoreState {
  done: DoneMap;
  charges: ChargesMap;
  // Скрытая память лайков, которая не очищается «Сбросить привычки».
  shadowCharges: ChargesMap;
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
  shadowCharges: typeof window !== "undefined" ? loadShadow() : {},
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
  const currentVisible = state.charges[id] ?? 0;
  const currentShadow = state.shadowCharges[id] ?? 0;
  // Кап 100%: не пускаем на второй круг — максимум 5 тапов.
  if (currentVisible >= CHARGE_MAX) return;
  // Видимое значение синхронизируется с реальной (теневой) историей,
  // так что после «Сбросить привычки» первый тап покажет, сколько раз
  // пост уже лайкали (1 → 2 → 3 после повторных сбросов), но не больше 5.
  const nextShadow = Math.min(CHARGE_MAX, currentShadow + 1);
  const nextVisible = Math.min(CHARGE_MAX, Math.max(currentVisible + 1, nextShadow));
  const nextShadowMap = { ...state.shadowCharges, [id]: nextShadow };
  state = {
    ...state,
    charges: { ...state.charges, [id]: nextVisible },
    shadowCharges: nextShadowMap,
  };
  saveShadow(nextShadowMap);
  maybeAutoCompleteCharge();
  emit();
}

export function setChargeTotal(total: number) {
  if (state.totalItems === total) return;
  state = { ...state, totalItems: total };
  maybeAutoCompleteCharge();
  emit();
}

// Если выполнены оба условия зарядки желаний — автоматически засчитываем
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
  "skill-done-v1",
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
    totalItems: state.totalItems,
  };
  try {
    for (const k of PRACTICE_LS_KEYS) localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
  emit();
}

export type { PracticeId };
