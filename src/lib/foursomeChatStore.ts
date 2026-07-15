import { useEffect, useState } from "react";

export type FoursomeMessenger = "telegram" | "max";

const KEY = "foursome-chat";
const EVT = "foursome-chat-change";

export type FoursomeChat = { messenger: FoursomeMessenger; link: string };

export function getFoursomeChat(): FoursomeChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FoursomeChat) : null;
  } catch {
    return null;
  }
}

export function setFoursomeChat(v: FoursomeChat) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useFoursomeChat() {
  const [chat, setChat] = useState<FoursomeChat | null>(null);
  useEffect(() => {
    const sync = () => setChat(getFoursomeChat());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    sync();
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return chat;
}
