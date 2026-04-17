import { Home, BarChart3, Users, User, Rocket } from "lucide-react";

type Tab = "home" | "stats" | "boost" | "friends" | "profile";

interface BottomNavProps {
  active: Tab;
  onChange: (t: Tab) => void;
  onBoost?: () => void;
}

const items: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home",    label: "Главная",  icon: Home },
  { id: "stats",   label: "Статус",   icon: BarChart3 },
  { id: "friends", label: "Друзья",   icon: Users },
  { id: "profile", label: "Профиль",  icon: User },
];

export function BottomNav({ active, onChange, onBoost }: BottomNavProps) {
  // split items around center for the dome
  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pb-2">
      <div className="relative mx-auto max-w-md">
        {/* Dome cutout via SVG mask alternative: use a curved bg */}
        <div className="relative grid grid-cols-5 items-end rounded-3xl glass shadow-card px-2 pt-2 pb-2">
          {[...left, { id: "boost" as Tab, label: "Старт", icon: Rocket }, ...right].map((it) => {
            const Icon = it.icon;
            const isCenter = it.id === "boost";
            const isActive = active === it.id;
            if (isCenter) {
              return (
                <div key={it.id} className="flex justify-center">
                  <button
                    onClick={onBoost}
                    aria-label="Старт практики"
                    className="tap -mt-7 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-glow-primary"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Icon className="h-6 w-6" />
                  </button>
                </div>
              );
            }
            return (
              <button
                key={it.id}
                onClick={() => onChange(it.id)}
                className="tap flex flex-col items-center gap-0.5 py-1.5"
              >
                <Icon
                  className={"h-5 w-5 transition-colors " + (isActive ? "text-primary-dark" : "text-muted-foreground")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
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
