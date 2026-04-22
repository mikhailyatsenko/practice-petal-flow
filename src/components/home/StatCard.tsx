import { forwardRef } from "react";

interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
  tone?: "orange" | "green" | "default";
  onClick?: () => void;
  pulse?: boolean;
  iconStyle?: React.CSSProperties;
  iconClassName?: string;
}

const toneClass = {
  orange: "text-primary",
  green: "text-success-dark",
  default: "text-foreground",
} as const;

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { emoji, label, value, tone = "default", onClick, pulse },
  ref,
) {
  return (
    <div
      data-stat-card
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={
        "bg-card hairline rounded-xl px-1.5 py-2.5 text-center shadow-card " +
        (onClick ? "cursor-pointer active:scale-95 transition-transform" : "")
      }
    >
      <div
        ref={ref}
        className="text-[14px] leading-none inline-block"
        style={{
          transition: "transform 150ms ease-out",
          transform: pulse ? "scale(1.5)" : "scale(1)",
        }}
      >
        {emoji}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={"mt-0.5 text-[13px] font-medium leading-tight " + toneClass[tone]}>
        {value}
      </div>
    </div>
  );
});
