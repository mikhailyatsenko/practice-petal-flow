// Карточка закрытого раздела «Бадди» — форма как у LockedFeatureCard,
// но внутри круга — анимация партнёрства: два мужских персонажа
// и между ними рукопожатие 🤝.
import { Lock } from "lucide-react";

interface BuddyLockedPreviewProps {
  unlockLevel?: number;
}

export function BuddyLockedPreview({ unlockLevel = 2 }: BuddyLockedPreviewProps) {
  const from = "#FFB300";
  const to = "#FF6D00";
  const id = "blp";

  return (
    <div
      className="relative w-full bg-card hairline rounded-2xl px-4 py-5 shadow-card overflow-hidden select-none"
      aria-disabled="true"
    >
      {/* Заголовок над анимацией */}
      <div className="text-center mb-3">
        <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
          Раздел закрыт
        </p>
        <p style={{ fontSize: 12, color: "#8a8a8a", lineHeight: 1.4, marginTop: 2 }}>
          Бадди откроется на {unlockLevel} уровне
        </p>
      </div>
      <style>{`
        @keyframes ${id}-spin {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        @keyframes ${id}-pulse {
          0%,100% { transform: scale(1); opacity: 0.95; }
          50%     { transform: scale(1.06); opacity: 1; }
        }
        @keyframes ${id}-float {
          0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); }
        }
        @keyframes ${id}-blink {
          0%,100% { opacity: 0.25; } 50% { opacity: 1; }
        }
        @keyframes ${id}-shake-l {
          0%,100% { transform: translateX(0) rotate(-4deg); }
          50%     { transform: translateX(2px) rotate(4deg); }
        }
        @keyframes ${id}-shake-r {
          0%,100% { transform: translateX(0) rotate(4deg); }
          50%     { transform: translateX(-2px) rotate(-4deg); }
        }
        @keyframes ${id}-hand {
          0%,100% { transform: translate(-50%, -50%) scale(1); }
          50%     { transform: translate(-50%, -50%) scale(1.18); }
        }
      `}</style>

      <div className="flex items-center gap-3.5">
        {/* Анимированный значок 88×88 */}
        <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
          {/* Внешнее пунктирное кольцо */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px dashed ${from}`,
              opacity: 0.55,
              animation: `${id}-spin 14s linear infinite`,
            }}
          />
          {/* Внутренний нейтральный диск */}
          <div
            className="absolute rounded-full"
            style={{
              top: 14, left: 14, right: 14, bottom: 14,
              background: "#F5F1EA",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
              animation: `${id}-pulse 2.4s ease-in-out infinite`,
            }}
          />
          {/* Сцена партнёрства внутри диска */}
          <div
            className="absolute"
            style={{
              top: 14, left: 14, right: 14, bottom: 14,
              fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
            }}
          >
            {/* Левый мужчина */}
            <span
              className="absolute"
              style={{
                left: 2, top: "50%", transform: "translateY(-50%)",
                fontSize: 18, lineHeight: 1,
                animation: `${id}-shake-l 1.6s ease-in-out infinite`,
                transformOrigin: "center",
              }}
            >
              🧑
            </span>
            {/* Правый мужчина */}
            <span
              className="absolute"
              style={{
                right: 2, top: "50%", transform: "translateY(-50%)",
                fontSize: 18, lineHeight: 1,
                animation: `${id}-shake-r 1.6s ease-in-out infinite`,
                transformOrigin: "center",
              }}
            >
              🧑
            </span>
            {/* Рукопожатие в центре */}
            <span
              className="absolute"
              style={{
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 22, lineHeight: 1,
                animation: `${id}-hand 1.6s ease-in-out infinite`,
              }}
            >
              🤝
            </span>
          </div>
          {/* Замок в углу */}
          <div className="absolute" style={{ top: 2, right: 2 }}>
            <span
              style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Lock className="h-3 w-3" style={{ color: to }} strokeWidth={2.5} />
            </span>
          </div>
        </div>

        {/* Текст */}
        <div className="min-w-0 flex-1" style={{ animation: `${id}-float 3s ease-in-out infinite` }}>
          <h3 className="text-[15px] font-semibold leading-tight flex items-center gap-1.5">
            Бадди
            <span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif', fontSize: 14 }}>🔓</span>
          </h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug">
            Партнёр для еженедельных созвонов
          </p>
          <p
            className="mt-2 inline-block text-[11.5px] font-medium rounded-full px-2.5 py-1"
            style={{
              background: `linear-gradient(135deg, ${from}22, ${to}22)`,
              color: to,
            }}
          >
            🔒 Откроется на уровне {unlockLevel}
          </p>
        </div>
      </div>

      {/* Бейдж внизу */}
      <div className="flex justify-center mt-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(255,109,0,0.10)",
            color: "#FF6D00",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif' }}>🔒</span>
          Откроется на уровне {unlockLevel}
        </span>
      </div>
    </div>
  );
}
