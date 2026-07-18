import { Link } from "@tanstack/react-router";
import { PartyPopper, Rocket } from "lucide-react";
import { useLevel1DoneMode } from "@/lib/level1DoneMode";
import { useLevel2DoneMode } from "@/lib/level2DoneMode";
import { useLevel3DoneMode } from "@/lib/level3DoneMode";
import { useLevel4DoneMode } from "@/lib/level4DoneMode";
import { useLevel5WaitingMode } from "@/lib/level5WaitingMode";

export function useLevelDoneBannerVisible() {
  const l1 = useLevel1DoneMode();
  const l2 = useLevel2DoneMode();
  const l3 = useLevel3DoneMode();
  const l4 = useLevel4DoneMode();
  const l5w = useLevel5WaitingMode();
  return l1 || l2 || l3 || l4 || l5w;
}

export function LevelDoneBanner() {
  const l1 = useLevel1DoneMode();
  const l2 = useLevel2DoneMode();
  const l3 = useLevel3DoneMode();
  const l4 = useLevel4DoneMode();
  const l5w = useLevel5WaitingMode();

  if (!(l1 || l2 || l3 || l4 || l5w)) return null;

  const isWaiting = l5w;
  const level = l1 ? 1 : l2 ? 2 : l3 ? 3 : l4 ? 4 : 5;
  const title = isWaiting
    ? "🚀 5-й уровень скоро откроется"
    : `🎉 ${level}-й уровень пройден!`;
  const subtitle = isWaiting
    ? "Открой карточку с деталями"
    : `Открой поздравление и переходи к ${level + 1}-му уровню`;

  return (
    <Link
      to="/"
      data-level-done-banner
      className="fixed left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-3 pb-2 block"
      style={{
        top: "var(--level-done-top, 0px)",
        paddingTop: "var(--level-done-pt, max(env(safe-area-inset-top), 8px))",
      }}
      aria-label={title}
    >
      <div
        className="relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 text-white shadow-[0_10px_30px_rgba(34,165,87,0.45)]"
        style={{
          background: "linear-gradient(135deg, #34C97A, #22A557)",
          animation: "level-done-pulse 1.8s ease-in-out infinite",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            animation: "level-done-shine 2.2s linear infinite",
          }}
        />

        <span className="relative h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
          {isWaiting ? <Rocket className="h-5 w-5" /> : <PartyPopper className="h-5 w-5" />}
        </span>

        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight">{title}</p>
          <p className="text-[12px] opacity-95 leading-tight mt-0.5">{subtitle}</p>
        </div>

        <span className="relative text-[12px] font-bold bg-white/25 rounded-full px-2.5 py-1">
          Открыть →
        </span>
      </div>

      <style>{`
        @keyframes level-done-pulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(34,165,87,0.45); }
          50% { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(34,165,87,0.6); }
        }
        @keyframes level-done-shine {
          0% { transform: translateX(0); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </Link>
  );
}
