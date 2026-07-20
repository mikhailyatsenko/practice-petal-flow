// Хранилище заявки твоей пары в разделе «Четвёрка» (демо, localStorage).
import { useEffect, useState } from "react";

export interface MyFoursomeRequestData {
  day: string;
  time: string;
  extra: string;
  messenger: "telegram" | "max";
}

const KEY = "my-foursome-request";
const EVT = "my-foursome-request-change";

export function getMyFoursomeRequest(): MyFoursomeRequestData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MyFoursomeRequestData;
  } catch {
    return null;
  }
}

export function setMyFoursomeRequest(data: MyFoursomeRequestData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function clearMyFoursomeRequest() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useMyFoursomeRequest(): MyFoursomeRequestData | null {
  const [data, setData] = useState<MyFoursomeRequestData | null>(null);
  useEffect(() => {
    setData(getMyFoursomeRequest());
    const sync = () => setData(getMyFoursomeRequest());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return data;
}
