import { useEffect } from "react";

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
  useEffect(() => {
    if (!statKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [statKey, onClose]);

  if (!statKey) return null;
  const info = INFO[statKey];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "fade-in 0.2s ease-out",
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "20px 16px 32px",
          width: "100%",
          maxWidth: 448,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          animation: "slide-up 0.25s ease-out",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: "#f0ebe0",
            borderRadius: 2,
            margin: "0 auto 16px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>{info.emoji}</span>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: info.color,
              margin: 0,
            }}
          >
            {info.title}
          </h3>
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: "#3a2f20",
            margin: 0,
          }}
        >
          {info.text}
        </p>
      </div>
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%);} to { transform: translateY(0);} }
      `}</style>
    </div>
  );
}
