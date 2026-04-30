// Карточка закрытого раздела «Четвёрка» — форма как у LockedFeatureCard,
// но внутри круга — анимация орбиты: 4 персонажа вращаются вокруг 🤝.
import { Lock } from "lucide-react";

interface FoursomeLockedPreviewProps {
  unlockLevel?: number;
}

export function FoursomeLockedPreview({ unlockLevel = 3 }: FoursomeLockedPreviewProps) {
  const from = "#FFB300";
  const to = "#FF6D00";
  const id = "flp";

  // 4 персонажа через 90°
  const people = ["🧑", "👩", "🧔", "👱"];
  // Радиус орбиты внутри диска (диск ≈ 60×60, центр в 30,30)
  const ORBIT_R = 22;

  return (
    <div
      className="relative w-full bg-card hairline rounded-2xl px-4 py-5 shadow-card overflow-hidden select-none"
      aria-disabled="true"
    >
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
        @keyframes ${id}-orbit {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        @keyframes ${id}-counter {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg); }
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
          {/* Внутренний градиентный диск */}
          <div
            className="absolute rounded-full"
            style={{
              top: 14, left: 14, right: 14, bottom: 14,
              background: `linear-gradient(135deg, ${from}, ${to})`,
              boxShadow: `0 6px 18px ${from}55`,
              animation: `${id}-pulse 2.4s ease-in-out infinite`,
            }}
          />
          {/* Сцена орбиты */}
          <div
            className="absolute"
            style={{
              top: 14, left: 14, right: 14, bottom: 14,
              fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
            }}
          >
            {/* Центральная иконка 🤝 */}
            <span
              className="absolute"
              style={{
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 20, lineHeight: 1,
                zIndex: 2,
              }}
            >
              🤝
            </span>
            {/* Вращающаяся орбита */}
            <div
              className="absolute"
              style={{
                left: 0, top: 0, right: 0, bottom: 0,
                animation: `${id}-orbit 9s linear infinite`,
              }}
            >
              {people.map((p, i) => {
                const rad = ((i * 90) * Math.PI) / 180;
                const x = 30 + Math.cos(rad) * ORBIT_R;
                const y = 30 + Math.sin(rad) * ORBIT_R;
                return (
                  <span
                    key={i}
                    className="absolute"
                    style={{
                      left: x, top: y,
                      fontSize: 13, lineHeight: 1,
                      transform: "translate(-50%, -50%)",
                      animation: `${id}-counter 9s linear infinite`,
                      transformOrigin: "center",
                    }}
                  >
                    {p}
                  </span>
                );
              })}
            </div>
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
            Четвёрка
            <span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif', fontSize: 14 }}>🔓</span>
          </h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug">
            Группа из 4 человек, созвон раз в месяц
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

      {/* Мигающие точки внизу */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {[0, 0.25, 0.5].map((d, i) => (
          <span
            key={i}
            style={{
              width: 5, height: 5, borderRadius: "50%",
              background: from, display: "inline-block",
              animation: `${id}-blink 1.2s ease-in-out ${d}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
