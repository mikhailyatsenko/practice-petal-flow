// Анимированная карточка-заглушка для закрытого "Маховика успеха".
// Используется на главной и на странице /flywheel когда раздел ещё не открыт.

const ICONS = ["🔥", "⭐", "🧠", "🎯", "👣"];

interface FlywheelLockedPreviewProps {
  unlockLevel?: number;
}

export function FlywheelLockedPreview({ unlockLevel = 3 }: FlywheelLockedPreviewProps) {
  return (
    <div
      className="mx-auto"
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: "28px 24px",
      }}
    >
      <style>{`
        @keyframes fwlp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fwlp-spin-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes fwlp-blink {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes fwlp-orbit {
          from { transform: rotate(var(--start-angle)) translateX(88px) rotate(calc(-1 * var(--start-angle))); }
          to   { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(88px) rotate(calc(-1 * var(--start-angle) - 360deg)); }
        }
        .fwlp-spin       { animation: fwlp-spin 18s linear infinite; }
        .fwlp-spin-mid   { animation: fwlp-spin-rev 12s linear infinite; }
        .fwlp-spin-wheel { animation: fwlp-spin 8s linear infinite; }
        .fwlp-orbit-icon { animation: fwlp-orbit 18s linear infinite; }
        .fwlp-dot        { animation: fwlp-blink 1.2s ease-in-out infinite; }
      `}</style>

      <div className="text-center">
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.3 }}>
          Скоро тут откроется 5 главных привычек
        </h2>
        <p style={{ fontSize: 13, color: "#8a8a8a", lineHeight: 1.5, marginTop: 10 }}>
          Дойди до {unlockLevel} уровня и маховик успеха откроется здесь
        </p>
      </div>

      <div className="relative mx-auto mt-8" style={{ width: 220, height: 220 }}>
        <div
          className="absolute inset-0 rounded-full fwlp-spin"
          style={{ border: "2.5px dashed #FFB300", opacity: 0.5 }}
        />
        <div
          className="absolute rounded-full fwlp-spin-mid"
          style={{
            top: 22, left: 22, right: 22, bottom: 22,
            border: "2px solid #FF6D00",
            opacity: 0.35,
          }}
        />
        <div
          className="absolute rounded-full fwlp-spin-wheel"
          style={{
            top: 56, left: 56, right: 56, bottom: 56,
            background: "linear-gradient(135deg, #FFB300, #FF6D00)",
            boxShadow: "0 6px 20px rgba(255,109,0,0.35)",
          }}
        >
          {[0, 36, 72, 108, 144].map((deg) => (
            <span
              key={deg}
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: 2, height: "100%",
                background: "rgba(255,255,255,0.45)",
                transform: `translate(-50%, -50%) rotate(${deg}deg)`,
                transformOrigin: "center",
              }}
            />
          ))}
        </div>
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            top: 78, left: 78, width: 64, height: 64,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            fontSize: 36,
            lineHeight: 1,
          }}
        >
          <span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif' }}>⚙️</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {ICONS.map((icon, i) => (
            <div
              key={i}
              className="fwlp-orbit-icon"
              style={{
                position: "absolute",
                // @ts-expect-error custom property
                "--start-angle": `${i * 72}deg`,
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#fff",
                border: "1.5px solid #ede8df",
                borderRadius: "50%",
                fontSize: 18,
                fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* Бейдж внизу */}
      <div className="flex justify-center mt-6">
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
