import { useEffect, useRef } from "react";

export type StatKey = "stars" | "hit" | "insurance" | "status";

interface StatInfo {
  emoji: string;
  title: string;
  color: string;
  text: string;
}

const INFO: Record<StatKey, StatInfo> = {
  stars: {
    emoji: "⭐",
    title: "Очки",
    color: "#FF6D00",
    text:
      "Очки — главная валюта клуба. Ты зарабатываешь +1 за каждую выполненную практику. Тратить очки можно в магазине на дополнительные разделы.",
  },
  hit: {
    emoji: "🔥",
    title: "Хит",
    color: "#16a34a",
    text:
      "Хит — это день, когда ты выполнил все 5 практик. Счётчик показывает, сколько дней подряд ты делаешь хиты. 7 хитов подряд = +10 очков бонус. 30 хитов подряд = +50 очков.",
  },
  insurance: {
    emoji: "🛡️",
    title: "Страховка",
    color: "#1a0e00",
    text:
      "Страховка защищает от обнуления прогресса при пропуске практики. Одна страховка = один защищённый пропуск. Купить страховку можно в магазине за 50 очков.",
  },
  status: {
    emoji: "💎",
    title: "Статус",
    color: "#FF6D00",
    text:
      "Статус растёт по мере накопления очков. Чем выше статус — тем больше множитель начисления очков. Новичок → Практик → Эксперт → Мастер → Гуру → Легенда.",
  },
};

interface Props {
  statKey: StatKey | null;
  onClose: () => void;
}

export function StatInfoSheet({ statKey, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // не закрывать если клик по StatCard (он сам переключит)
        const target = e.target as HTMLElement;
        if (target.closest("[data-stat-card]")) return;
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [statKey, onClose]);

  if (!statKey) return null;
  const info = INFO[statKey];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 40,
          animation: "fade-in 0.2s ease-out",
        }}
      />
      <div
        ref={ref}
        style={{
          position: "relative",
          zIndex: 50,
          marginTop: 10,
          background: "#fff",
          borderRadius: 16,
          padding: "14px 14px 16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          border: "0.5px solid rgba(0,0,0,0.06)",
          animation: "fade-in 0.2s ease-out",
        }}
        role="dialog"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{info.emoji}</span>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: info.color, margin: 0 }}>
            {info.title}
          </h3>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "#3a2f20", margin: 0 }}>
          {info.text}
        </p>
      </div>
    </>
  );
}
