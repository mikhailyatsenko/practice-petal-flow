import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BackButton } from "@/components/layout/BackButton";

export const Route = createFileRoute("/_app/flywheel")({
  head: () => ({
    meta: [
      { title: "Маховик успеха — Клуб «Моя жизнь»" },
      { name: "description", content: "5 главных привычек откроются на 3 уровне." },
    ],
  }),
  component: FlywheelScreen,
});

const ICONS = ["🔥", "⭐", "🧠", "🎯", "👣"];

function FlywheelScreen() {
  const navigate = useNavigate();

  return (
    <div className="px-4" style={{ background: "#FAF6EF" }}>
      <style>{`
        @keyframes fw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fw-spin-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes fw-blink {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes fw-orbit {
          from { transform: rotate(var(--start-angle)) translateX(88px) rotate(calc(-1 * var(--start-angle))); }
          to   { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(88px) rotate(calc(-1 * var(--start-angle) - 360deg)); }
        }
        .fw-spin       { animation: fw-spin 18s linear infinite; }
        .fw-spin-mid   { animation: fw-spin-rev 12s linear infinite; }
        .fw-spin-wheel { animation: fw-spin 8s linear infinite; }
        .fw-orbit-icon { animation: fw-orbit 18s linear infinite; }
        .fw-dot        { animation: fw-blink 1.2s ease-in-out infinite; }
      `}</style>

      <div className="relative flex items-center px-1 pt-2 pb-3">
        <div className="relative z-10">
          <BackButton onClick={() => navigate({ to: "/" })} />
        </div>
        <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
          Маховик успеха
        </h1>
      </div>

      <div
        className="mx-auto mt-4"
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          padding: "28px 24px",
        }}
      >
        <div className="text-center">
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.3 }}>
            Скоро тут откроется маховик успеха
          </h2>
          <p style={{ fontSize: 13, color: "#8a8a8a", lineHeight: 1.5, marginTop: 10 }}>
            5 главных привычек откроются здесь, когда ты дойдёшь до 3 уровня
          </p>
        </div>

        {/* Animation block */}
        <div
          className="relative mx-auto mt-8"
          style={{ width: 220, height: 220 }}
        >
          {/* Outer dashed ring */}
          <div
            className="absolute inset-0 rounded-full fw-spin"
            style={{
              border: "2.5px dashed #FFB300",
              opacity: 0.5,
            }}
          />
          {/* Middle solid ring */}
          <div
            className="absolute rounded-full fw-spin-mid"
            style={{
              top: 22, left: 22, right: 22, bottom: 22,
              border: "2px solid #FF6D00",
              opacity: 0.35,
            }}
          />
          {/* Inner wheel with spokes */}
          <div
            className="absolute rounded-full fw-spin-wheel"
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
          {/* Center static gear */}
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

          {/* Orbiting icons */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {ICONS.map((icon, i) => (
              <div
                key={i}
                className="fw-orbit-icon"
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

        {/* Blinking dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {[0, 0.3, 0.6].map((delay, i) => (
            <span
              key={i}
              className="fw-dot"
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#FFB300",
                display: "inline-block",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
