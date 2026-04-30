// Анимированная карточка-заглушка для закрытого раздела «Бадди».
// Два нейтральных персонажа обмениваются пузырями сообщений.

interface BuddyLockedPreviewProps {
  unlockLevel?: number;
}

export function BuddyLockedPreview({ unlockLevel = 2 }: BuddyLockedPreviewProps) {
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
        @keyframes blp-msg-rtl {
          0%   { left: 62%; opacity: 0; transform: translateY(0) scale(0.8); }
          15%  { opacity: 1; }
          50%  { left: 38%; opacity: 1; transform: translateY(-4px) scale(1); }
          85%  { opacity: 1; }
          100% { left: 14%; opacity: 0; transform: translateY(0) scale(0.8); }
        }
        @keyframes blp-msg-ltr {
          0%   { left: 14%; opacity: 0; transform: translateY(0) scale(0.8); }
          15%  { opacity: 1; }
          50%  { left: 38%; opacity: 1; transform: translateY(-4px) scale(1); }
          85%  { opacity: 1; }
          100% { left: 62%; opacity: 0; transform: translateY(0) scale(0.8); }
        }
        .blp-msg-1 { animation: blp-msg-ltr 3.6s ease-in-out infinite; }
        .blp-msg-2 { animation: blp-msg-rtl 3.6s ease-in-out 1.8s infinite; }
      `}</style>

      {/* Анимация */}
      <div
        className="relative mx-auto"
        style={{ width: 180, height: 80 }}
      >
        {/* Левый персонаж */}
        <div
          className="absolute"
          style={{
            left: 4, top: 22,
            fontSize: 36,
            lineHeight: 1,
            fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
          }}
        >
          🧑
        </div>
        {/* Правый персонаж */}
        <div
          className="absolute"
          style={{
            right: 4, top: 22,
            fontSize: 36,
            lineHeight: 1,
            fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
          }}
        >
          👩
        </div>

        {/* Пузыри сообщений */}
        <div
          className="blp-msg-1 absolute"
          style={{
            top: 18,
            fontSize: 22,
            lineHeight: 1,
            fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
          }}
        >
          💬
        </div>
        <div
          className="blp-msg-2 absolute"
          style={{
            top: 18,
            fontSize: 22,
            lineHeight: 1,
            fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
          }}
        >
          💬
        </div>
      </div>

      {/* Тексты */}
      <div className="text-center mt-5">
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
          Раздел закрыт
        </p>
        <p style={{ fontSize: 13, color: "#8a8a8a", lineHeight: 1.5, marginTop: 4 }}>
          Бадди откроется на {unlockLevel} уровне
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
