// Анимированная карточка-заглушка для закрытой "Библиотеки знаний".
// Стопка книг, скрытая тремя слоями плывущего тумана.

interface LibraryLockedPreviewProps {
  unlockLevel?: number;
}

export function LibraryLockedPreview({ unlockLevel = 3 }: LibraryLockedPreviewProps) {
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
        @keyframes llp-fog-1 {
          0%, 100% { transform: translateX(-10px); }
          50%      { transform: translateX(10px); }
        }
        @keyframes llp-fog-2 {
          0%, 100% { transform: translateX(10px); }
          50%      { transform: translateX(-10px); }
        }
        .llp-fog-1 { animation: llp-fog-1 3s ease-in-out infinite; }
        .llp-fog-2 { animation: llp-fog-2 3.5s ease-in-out 0.5s infinite; }
        .llp-fog-3 { animation: llp-fog-1 2.8s ease-in-out 1s infinite; }
      `}</style>

      {/* Анимация 160x160 */}
      <div
        className="relative mx-auto"
        style={{ width: 160, height: 160 }}
      >
        {/* Книги снизу */}
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{
            fontSize: 64,
            opacity: 0.45,
            fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
            lineHeight: 1,
            paddingBottom: 4,
          }}
        >
          📚
        </div>

        {/* Слои тумана */}
        <div
          className="llp-fog-1 absolute"
          style={{
            width: 140, height: 32, top: 16, left: 10,
            background: "#e8e8e8",
            borderRadius: 16,
            opacity: 0.55,
          }}
        />
        <div
          className="llp-fog-2 absolute"
          style={{
            width: 120, height: 30, top: 56, left: 20,
            background: "#e8e8e8",
            borderRadius: 16,
            opacity: 0.65,
          }}
        />
        <div
          className="llp-fog-3 absolute"
          style={{
            width: 130, height: 30, top: 92, left: 14,
            background: "#e8e8e8",
            borderRadius: 16,
            opacity: 0.55,
          }}
        />
      </div>

      {/* Тексты */}
      <div className="text-center mt-5">
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
          Раздел закрыт
        </p>
        <p style={{ fontSize: 13, color: "#8a8a8a", lineHeight: 1.5, marginTop: 4 }}>
          Библиотека знаний откроется на {unlockLevel} уровне
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
