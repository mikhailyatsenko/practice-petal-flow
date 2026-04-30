import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useBuddyRequestMode } from "@/lib/buddyRequestMode";

export function BuddyRequestBanner() {
  const on = useBuddyRequestMode();
  if (!on) return null;

  return (
    <Link
      to="/buddy"
      search={{ demo: "waiting" }}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-3 pt-[max(env(safe-area-inset-top),8px)] pb-2 block"
      aria-label="У тебя новый запрос на бадди — открыть"
    >
      <div
        className="relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 text-white shadow-[0_10px_30px_rgba(255,109,0,0.45)]"
        style={{
          background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          animation: "buddy-banner-pulse 1.6s ease-in-out infinite",
        }}
      >
        {/* Глянец-блик, который пробегает по ленте */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            animation: "buddy-banner-shine 2.2s linear infinite",
          }}
        />

        <span
          className="relative h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center"
          style={{ animation: "buddy-banner-bell 1.2s ease-in-out infinite" }}
        >
          <Bell className="h-5 w-5" fill="#fff" />
        </span>

        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight">
            Новый запрос на бадди!
          </p>
          <p className="text-[12px] opacity-95 leading-tight mt-0.5">
            Тебя ждут — открой и ответь
          </p>
        </div>

        <span className="relative text-[12px] font-bold bg-white/25 rounded-full px-2.5 py-1">
          Открыть →
        </span>
      </div>

      <style>{`
        @keyframes buddy-banner-pulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(255,109,0,0.45); }
          50% { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(255,109,0,0.6); }
        }
        @keyframes buddy-banner-shine {
          0% { transform: translateX(0); }
          100% { transform: translateX(500%); }
        }
        @keyframes buddy-banner-bell {
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
