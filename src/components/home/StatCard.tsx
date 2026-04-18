interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
  tone?: "orange" | "green" | "default";
}

const toneClass = {
  orange: "text-primary",
  green:  "text-success-dark",
  default: "text-foreground",
} as const;

export function StatCard({ emoji, label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="bg-card hairline rounded-xl px-1.5 py-2.5 text-center shadow-card">
      <div className="text-[14px] leading-none">{emoji}</div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={"mt-0.5 text-[13px] font-medium leading-tight " + toneClass[tone]}>{value}</div>
    </div>
  );
}
