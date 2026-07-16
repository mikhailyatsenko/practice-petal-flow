import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Users, Sparkles, KeyRound, ListTree } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Item {
  to: string;
  label: string;
  icon: LucideIcon;
  fab?: boolean;
}

const items: Item[] = [
  { to: "/",          label: "Главная",   icon: LayoutGrid },
  { to: "/community", label: "Комьюнити", icon: Users },
  { to: "/wishes",    label: "Желания",   icon: Sparkles, fab: true },
  { to: "/sections",  label: "Разделы",   icon: ListTree },
  { to: "/partner",   label: "Возможности", icon: KeyRound },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleIconPress = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget.querySelector<HTMLElement>("[data-nav-icon]");
    if (!target) return;
    target.style.transform = "scale(1.4)";
    window.setTimeout(() => {
      target.style.transform = "scale(1)";
    }, 150);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-card border-t border-border">
      <div className="mx-auto max-w-md grid grid-cols-5 px-2 pt-2.5 pb-7">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);

          if (it.fab) {
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={handleIconPress}
                className="flex flex-col items-center"
              >
                <span
                  data-nav-icon
                  className="tap btn-orange -mt-[18px] flex h-[50px] w-[50px] items-center justify-center !rounded-full"
                  style={{ boxShadow: "var(--shadow-orange-sm)", transition: "transform 0.15s ease" }}
                >
                  <Icon className="h-5 w-5 relative z-10" strokeWidth={2.2} />
                </span>
                <span className={"mt-1 text-[10.5px] " + (active ? "text-primary font-medium" : "text-muted-foreground")}>
                  {it.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={handleIconPress}
              className="tap flex flex-col items-center gap-1 py-1"
            >
              <Icon
                data-nav-icon
                style={{ transition: "transform 0.15s ease" }}
                className={"h-[22px] w-[22px] " + (active ? "text-primary" : "text-muted-foreground")}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className={"text-[10.5px] " + (active ? "text-primary font-medium" : "text-muted-foreground")}>
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
