import { Star } from "lucide-react";

export interface RewardPing {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export function RewardLayer({ pings }: { pings: RewardPing[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {pings.map((p) => (
        <div
          key={p.id}
          className="absolute flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-white shadow-glow-accent animate-pop-star"
          style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)" }}
        >
          <Star className="h-3 w-3 fill-white" />
          <span className="text-[12px] font-bold tabular-nums">+{p.amount}</span>
        </div>
      ))}
    </div>
  );
}
