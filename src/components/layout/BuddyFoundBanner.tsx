import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useBuddyFoundMode, setBuddyFoundMode } from "@/lib/buddyFoundMode";

export function BuddyFoundBanner() {
  const on = useBuddyFoundMode();
  const navigate = useNavigate();
  if (!on) return null;

  const handleClick = () => {
    setBuddyFoundMode(false);
    navigate({ to: "/buddy", search: { demo: "has-no-link" } });
  };

  return (
    <div
      data-buddy-found-banner
      className="fixed left-1/2 -translate-x-1/2 z-[61] w-full max-w-md px-3 pb-2 block"
      style={{
        top: "var(--buddy-found-top, 0px)",
        paddingTop: "var(--buddy-found-pt, max(env(safe-area-inset-top), 8px))",
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="tap relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 w-full text-left text-white shadow-[0_10px_30px_rgba(255,109,0,0.45)]"
        style={{
          background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          animation: "buddy-found-pulse 1.6s ease-in-out infinite",
        }}
        aria-label="Бадди найден — открыть"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            animation: "buddy-found-shine 2.2s linear infinite",
          }}
        />
        <span className="relative h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5" fill="#fff" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight">Бадди найден!</p>
          <p className="text-[12px] opacity-95 leading-tight mt-0.5">
            Твой Бадди — Алексей
          </p>
        </div>
        <span className="relative text-[12px] font-bold bg-white/25 rounded-full px-2.5 py-1 shrink-0">
          Открыть →
        </span>
      </button>
      <style>{`
        @keyframes buddy-found-pulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(255,109,0,0.45); }
          50% { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(255,109,0,0.6); }
        }
        @keyframes buddy-found-shine {
          0% { transform: translateX(0); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}
