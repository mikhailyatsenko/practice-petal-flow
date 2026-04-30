// Анимированная карточка-заглушка для закрытого раздела «Четвёрка».
// 4 персонажа вращаются по орбите вокруг центральной иконки рукопожатия.

interface FoursomeLockedPreviewProps {
  unlockLevel?: number;
}

export function FoursomeLockedPreview({ unlockLevel = 3 }: FoursomeLockedPreviewProps) {
  const ORBIT = 120; // диаметр орбиты
  const R = ORBIT / 2;

  // 4 персонажа через 90°
  const people: Array<{ emoji: string; angle: number }> = [
    { emoji: "🧑", angle: 0 },
    { emoji: "👩", angle: 90 },
    { emoji: "🧔", angle: 180 },
    { emoji: "👱", angle: 270 },
  ];

  return (
    <div
      className="mx-auto"
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: "28px 20px",
      }}
    >
      <style>{`
        @keyframes flp-orbit-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes flp-orbit-counter {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .flp-orbit { animation: flp-orbit-rotate 14s linear infinite; }
        .flp-counter { animation: flp-orbit-counter 14s linear infinite; }
      `}</style>

      {/* Анимация */}
      <div
        className="relative mx-auto"
        style={{ width: ORBIT + 40, height: ORBIT + 40 }}
      >
        {/* Пунктирное кольцо */}
        <div
          className="absolute"
          style={{
            left: "50%", top: "50%",
            width: ORBIT, height: ORBIT,
            transform: "translate(-50%, -50%)",
            border: "1.5px dashed #FFB300",
            borderRadius: "50%",
            opacity: 0.55,
          }}
        />

        {/* Центральная иконка */}
        <div
          className="absolute"
          style={{
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 32,
            lineHeight: 1,
            fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
          }}
        >
          🤝
        </div>

        {/* Вращающаяся орбита с персонажами */}
        <div
          className="flp-orbit absolute"
          style={{
            left: "50%", top: "50%",
            width: ORBIT, height: ORBIT,
            marginLeft: -R, marginTop: -R,
          }}
        >
          {people.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const x = R + Math.cos(rad) * R;
            const y = R + Math.sin(rad) * R;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: x, top: y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Контр-вращение, чтобы персонаж оставался прямо */}
                <div
                  className="flp-counter"
                  style={{
                    fontSize: 24,
                    lineHeight: 1,
                    fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
                  }}
                >
                  {p.emoji}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Тексты */}
      <div className="text-center mt-5">
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
          Раздел закрыт
        </p>
        <p style={{ fontSize: 13, color: "#8a8a8a", lineHeight: 1.5, marginTop: 4 }}>
          Четвёрка откроется на {unlockLevel} уровне
        </p>
      </div>

      {/* Бейдж */}
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
