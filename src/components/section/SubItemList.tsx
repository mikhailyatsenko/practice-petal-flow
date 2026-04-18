import { ChevronRight, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SubItem {
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  price?: string;     // "200 ⭐"
  locked?: boolean;
  onClick?: () => void;
}

interface SubItemListProps {
  items: SubItem[];
}

export function SubItemList({ items }: SubItemListProps) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <button
            key={i}
            onClick={it.onClick}
            className="tap w-full bg-card hairline rounded-xl px-3.5 py-3 shadow-card flex items-center gap-3 text-left animate-fade-up"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-xl">
              {it.emoji ?? (Icon ? <Icon className="h-5 w-5 text-foreground/70" /> : "•")}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-medium leading-tight truncate flex items-center gap-1.5">
                {it.title}
                {it.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
              </h3>
              {it.subtitle && (
                <p className="mt-0.5 text-[11.5px] text-muted-foreground leading-snug line-clamp-2">
                  {it.subtitle}
                </p>
              )}
            </div>
            {it.price ? (
              <span className="rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-1 shrink-0">
                {it.price}
              </span>
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface SectionHeaderProps {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ emoji, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="px-1 pt-2 pb-3">
      <h1 className="text-[22px] font-semibold leading-tight">
        {emoji && <span className="mr-1.5">{emoji}</span>}
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-[13px] text-muted-foreground leading-snug">{subtitle}</p>}
    </div>
  );
}
