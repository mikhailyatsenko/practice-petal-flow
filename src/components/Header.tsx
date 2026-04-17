import { Flame, Star } from "lucide-react";

interface HeaderProps {
  greeting: string;
  club: string;
  stars: number;
  streak: number;
  starsBumpKey?: number;
}

export function Header({ greeting, club, stars, streak, starsBumpKey = 0 }: HeaderProps) {
  return (
    <header className="safe-top px-5 pt-3 pb-2 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-[13px] text-muted-foreground leading-tight">{greeting}</p>
        <h1 className="text-[17px] font-semibold leading-tight truncate">{club}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div
          key={starsBumpKey}
          className="flex items-center gap-1 rounded-full glass px-3 py-1.5 shadow-soft animate-fade-up"
        >
          <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold tabular-nums">{stars}</span>
        </div>

        <div
          className={
            "flex items-center gap-1 rounded-full px-3 py-1.5 text-white shadow-glow-accent " +
            (streak >= 3 ? "animate-pulse-glow" : "")
          }
          style={{ background: "var(--gradient-accent)" }}
        >
          <Flame className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold tabular-nums">{streak}</span>
        </div>
      </div>
    </header>
  );
}
