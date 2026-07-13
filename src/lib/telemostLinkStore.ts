const KEY = "telemost-meeting-link";

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
}
