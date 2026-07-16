import { Link } from "@tanstack/react-router";
import { Gift } from "lucide-react";
import { useLevel4GiftBannerVisible } from "@/lib/level4Gift";

export function Level4GiftBanner() {
  const on = useLevel4GiftBannerVisible();
  if (!on) return null;

  return (
    <Link
      to="/partner"
      search={{ tab: "codes" }}
      data-level4-gift-banner
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-3 pt-[max(env(safe-area-inset-top),8px)] pb-2 block"
      aria-label="Заберите подарок за переход на 4-й уровень"
    >
      <div
        className="relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 text-white shadow-[0_10px_30px_rgba(34,165,87,0.45)]"
        style={{
          background: "linear-gradient(135deg, #34C97A, #22A557)",
          animation: "level4-gift-pulse 1.8s ease-in-out infinite",
        }}
      >
        {/* Глянец-блик */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            animation: "level4-gift-shine 2.2s linear infinite",
          }}
        />

        <span
          className="relative h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Gift className="h-5 w-5" />
        </span>

        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight">
            🎁 Заберите подарок за переход на 4-й уровень
          </p>
          <p className="text-[12px] opacity-95 leading-tight mt-0.5">
            Вам доступно 50 бонусных очков.
          </p>
        </div>

        <span className="relative text-[12px] font-bold bg-white/25 rounded-full px-2.5 py-1">
          Открыть →
        </span>
      </div>

      <style>{`
        @keyframes level4-gift-pulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(34,165,87,0.45); }
          50% { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(34,165,87,0.6); }
        }
        @keyframes level4-gift-shine {
          0% { transform: translateX(0); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </Link>
  );
}
