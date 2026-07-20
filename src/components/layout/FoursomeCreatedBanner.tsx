import { useNavigate } from "@tanstack/react-router";
import { UsersRound } from "lucide-react";
import { useFoursomeCreatedMode, setFoursomeCreatedMode } from "@/lib/foursomeCreatedMode";

export function FoursomeCreatedBanner() {
  const on = useFoursomeCreatedMode();
  const navigate = useNavigate();
  if (!on) return null;

  const handleClick = () => {
    setFoursomeCreatedMode(false);
    navigate({ to: "/foursome", search: { demo: "has", cards: "full" } });
  };

  return (
    <div
      data-foursome-created-banner
      className="fixed left-1/2 -translate-x-1/2 z-[61] w-full max-w-md px-3 pb-2 block"
      style={{
        top: "var(--foursome-created-top, 0px)",
        paddingTop: "var(--foursome-created-pt, max(env(safe-area-inset-top), 8px))",
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="tap relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 w-full text-left text-white shadow-[0_10px_30px_rgba(255,109,0,0.45)]"
        style={{
          background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          animation: "foursome-created-pulse 1.6s ease-in-out infinite",
        }}
        aria-label="Четвёрка создана — открыть"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            animation: "foursome-created-shine 2.2s linear infinite",
          }}
        />
        <span className="relative h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
          <UsersRound className="h-5 w-5" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight">Четвёрка создана!</p>
          <p className="text-[12px] opacity-95 leading-tight mt-0.5">
            Ваша пара нашла вторую пару
          </p>
        </div>
        <span className="relative text-[12px] font-bold bg-white/25 rounded-full px-2.5 py-1 shrink-0">
          Открыть →
        </span>
      </button>
      <style>{`
        @keyframes foursome-created-pulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(255,109,0,0.45); }
          50% { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(255,109,0,0.6); }
        }
        @keyframes foursome-created-shine {
          0% { transform: translateX(0); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}
