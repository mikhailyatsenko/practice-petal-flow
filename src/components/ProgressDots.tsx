export type DotState = "done" | "missed" | "today" | "future";

interface ProgressDotsProps {
  states: DotState[];
}

const colorFor = (s: DotState) => {
  switch (s) {
    case "done":   return "bg-primary";
    case "missed": return "bg-danger";
    case "today":  return "bg-accent ring-2 ring-accent/30";
    default:       return "bg-muted";
  }
};

export function ProgressDots({ states }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {states.map((s, i) => (
        <span
          key={i}
          className={"h-2 w-2 rounded-full animate-dot-pop " + colorFor(s)}
          style={{ animationDelay: `${i * 30}ms` }}
        />
      ))}
    </div>
  );
}
