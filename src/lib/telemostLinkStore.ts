import { useEffect, useState } from "react";

const KEY = "telemost-meeting-link";
const EVT = "telemost-link-change";

export function getTelemostLink(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setTelemostLink(link: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, link);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useTelemostLink() {
  const [link, setLink] = useState<string | null>(() => getTelemostLink());
  useEffect(() => {
    const sync = () => setLink(getTelemostLink());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return link;
}
