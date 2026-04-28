import { useSyncExternalStore } from "react";

// Общий источник истины для статуса doneToday по всем 5 практикам.
// id совпадают с id в initialPractices на главной:
//   "self-prog" | "charge" | "essay" | "skill" | "wishes"
type PracticeId = "self-prog" | "charge" | "essay" | "skill" | "wishes";

type DoneMap = Record<PracticeId, boolean>;

// Демо-старт: «Зарядка желаний» уже выполнена для разработчика, остальные — нет.
let state: DoneMap = {
  "self-prog": false,
  charge: true,
  essay: false,
  skill: false,
  wishes: false,
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

const getSnapshot = () => state;

export function setPracticeDone(id: PracticeId, value: boolean = true) {
  if (state[id] === value) return;
  state = { ...state, [id]: value };
  emit();
}

export function usePracticesDone(): DoneMap {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function usePracticeDone(id: PracticeId): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state[id],
    () => state[id],
  );
}

export type { PracticeId };
