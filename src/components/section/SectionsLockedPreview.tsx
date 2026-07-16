// Анимированная карточка-заглушка для закрытых блоков магазина.

const ITEMS = ["📚", "🎯", "💎", "🏆", "⭐", "🔥"];

interface SectionsLockedPreviewProps {
  unlockLevel?: number;
  title?: string;
  description?: string;
  badge?: string;
  variant?: "showcase" | "simple";
  icon?: string;
}

export function SectionsLockedPreview({
  unlockLevel = 5,
  title = "Раздел закрыт",
  description,
  badge,
  variant = "showcase",
}: SectionsLockedPreviewProps) {
  const desc = description ?? `Дополнительные разделы клуба откроются на ${unlockLevel} уровне`;
  const badgeText = badge ?? `Откроется на уровне ${unlockLevel}`;

  return (
    <div
      className="mx-auto"
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: variant === "showcase" ? "24px 20px" : "20px 18px",
      }}
    >
      {variant === "showcase" && (
        <>
          <style>{`
            @keyframes slp-scan {
              0%   { top: 0%;   opacity: 0; }
              10%  { opacity: 1; }
              90%  { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .slp-scan { animation: slp-scan 1.5s ease-in-out infinite; }
          `}</style>

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

            <div
              className="slp-scan absolute left-0 right-0 pointer-events-none"
              style={{
                height: 24,
                background:
                  "linear-gradient(180deg, rgba(255,179,0,0) 0%, rgba(255,109,0,0.55) 50%, rgba(255,179,0,0) 100%)",
                boxShadow: "0 0 12px rgba(255,109,0,0.45)",
              }}
            />

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
        </>
      )}

      <div className={`text-center ${variant === "showcase" ? "mt-5" : ""}`}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: "#8a8a8a", lineHeight: 1.5, marginTop: 6 }}>
          {desc}
        </p>
      </div>

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
          {badgeText}
        </span>
      </div>
    </div>
  );
}
