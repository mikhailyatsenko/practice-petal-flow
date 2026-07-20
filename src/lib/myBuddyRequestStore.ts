// Хранилище твоей собственной заявки в разделе «Бадди» (демо, localStorage).
import { useEffect, useState } from "react";

export interface MyBuddyRequestData {
  day: string;
  time: string;
  job: string;
  bio: string;
  extra: string;
  channel: "tg" | "max";
}

const KEY = "my-buddy-request";
const EVT = "my-buddy-request-change";

export function getMyBuddyRequest(): MyBuddyRequestData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MyBuddyRequestData;
  } catch {
    return null;
  }
}

export function setMyBuddyRequest(data: MyBuddyRequestData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function clearMyBuddyRequest() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useMyBuddyRequest(): MyBuddyRequestData | null {
  const [data, setData] = useState<MyBuddyRequestData | null>(null);
  useEffect(() => {
    setData(getMyBuddyRequest());
    const sync = () => setData(getMyBuddyRequest());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return data;
}
