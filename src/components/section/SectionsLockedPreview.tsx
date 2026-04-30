// Анимированная карточка-заглушка для закрытого "Магазина разделов".
// Витрина с размытыми иконками и сканирующей оранжевой полоской.

const ITEMS = ["📚", "🎯", "💎", "🏆", "⭐", "🔥"];

interface SectionsLockedPreviewProps {
  unlockLevel?: number;
}

export function SectionsLockedPreview({ unlockLevel = 4 }: SectionsLockedPreviewProps) {
  return (
    <div
      className="mx-auto"
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: "24px 20px",
      }}
    >
      <style>{`
        @keyframes slp-scan {
          0%   { top: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .slp-scan {
          animation: slp-scan 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Витрина */}
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          width: "100%",
          maxWidth: 280,
          height: 180,
          background: "linear-gradient(180deg, #ECECEC, #DEDEDE)",
          borderRadius: 16,
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        {/* Размытые иконки 2x3 */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            padding: 16,
            gap: 8,
            filter: "blur(3px)",
            opacity: 0.4,
          }}
        >
          {ITEMS.map((emoji, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                fontSize: 32,
                fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Сканирующая оранжевая полоса */}
        <div
          className="slp-scan absolute left-0 right-0 pointer-events-none"
          style={{
            height: 24,
            background:
              "linear-gradient(180deg, rgba(255,179,0,0) 0%, rgba(255,109,0,0.55) 50%, rgba(255,179,0,0) 100%)",
            boxShadow: "0 0 12px rgba(255,109,0,0.45)",
          }}
        />

        {/* Замок в правом нижнем углу */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            right: 10,
            bottom: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: 18,
            fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
          }}
        >
          🔒
        </div>
      </div>

      {/* Тексты */}
      <div className="text-center mt-5">
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
          Раздел закрыт
        </p>
        <p style={{ fontSize: 13, color: "#8a8a8a", lineHeight: 1.5, marginTop: 4 }}>
          Дополнительные разделы клуба откроются на {unlockLevel} уровне
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
