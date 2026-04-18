import { Home, BarChart3, ShoppingBag, Users, User } from "lucide-react";

type Tab = "home" | "stats" | "shop" | "buddy" | "profile";

interface BottomNavProps {
  active: Tab;
  onChange: (t: Tab) => void;
}

const items: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home",    label: "Главная",  icon: Home },
  { id: "stats",   label: "Уровни",   icon: BarChart3 },
  { id: "shop",    label: "Магазин",  icon: ShoppingBag },
  { id: "buddy",   label: "Бадди",    icon: Users },
  { id: "profile", label: "Профиль",  icon: User },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pb-2">
      <div className="mx-auto max-w-md">
        <div className="grid grid-cols-5 items-center rounded-3xl glass shadow-card px-2 py-2">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onChange(it.id)}
                className="tap flex flex-col items-center gap-0.5 py-1.5"
              >
                <span
                  className={
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors " +
                    (isActive ? "text-white shadow-glow-primary" : "text-muted-foreground")
                  }
                  style={isActive ? { background: "var(--gradient-primary)" } : undefined}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span
                  className={"text-[10px] " + (isActive ? "text-foreground font-semibold" : "text-muted-foreground")}
                >
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
