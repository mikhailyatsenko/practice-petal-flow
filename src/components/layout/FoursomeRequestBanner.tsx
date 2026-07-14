import { Link } from "@tanstack/react-router";
import { useFoursomeRequestMode } from "@/lib/foursomeRequestMode";

export function FoursomeRequestBanner() {
  const on = useFoursomeRequestMode();
  if (!on) return null;

  return (
    <Link
      to="/foursome"
      search={{ demo: "waiting" }}
      data-foursome-request-banner
      className="fixed left-1/2 -translate-x-1/2 z-[59] w-full max-w-md px-3 pb-2 block"
      style={{ top: "var(--foursome-banner-top, 0px)", paddingTop: "var(--foursome-banner-pt, max(env(safe-area-inset-top), 8px))" }}
      aria-label="У тебя новый запрос на четвёрку — открыть"
    >
      <div
        className="relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 text-white shadow-[0_10px_30px_rgba(255,109,0,0.45)]"
        style={{
          background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          animation: "foursome-banner-pulse 1.6s ease-in-out infinite",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            animation: "foursome-banner-shine 2.2s linear infinite",
          }}
        />

        <span
          className="relative h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-[18px]"
          style={{ animation: "foursome-banner-bell 1.2s ease-in-out infinite" }}
        >
          4️⃣
        </span>

        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight">
            Новый запрос на четвёрку!
          </p>
          <p className="text-[12px] opacity-95 leading-tight mt-0.5">
            Пара хочет к тебе — открой и ответь
          </p>
        </div>

        <span className="relative text-[12px] font-bold bg-white/25 rounded-full px-2.5 py-1">
          Открыть →
        </span>
      </div>

      <style>{`
        @keyframes foursome-banner-pulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(255,109,0,0.45); }
          50% { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(255,109,0,0.6); }
        }
        @keyframes foursome-banner-shine {
          0% { transform: translateX(0); }
          100% { transform: translateX(500%); }
        }
        @keyframes foursome-banner-bell {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-15deg); }
          30% { transform: rotate(12deg); }
          45% { transform: rotate(-8deg); }
          60% { transform: rotate(5deg); }
          75% { transform: rotate(-2deg); }
        }
      `}</style>
    </Link>
  );
}
