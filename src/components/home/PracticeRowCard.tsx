export type DayState = "done" | "missed" | "empty";

export interface PracticeRow {
  id: string;
  title: string;
  streakDays: number;
  doneToday: boolean;
  history: DayState[]; // 5 точек
}

interface PracticeRowCardProps {
  practice: PracticeRow;
  onToggle: (id: string) => void;
}

const dotColor = (s: DayState) => {
  switch (s) {
    case "done":   return "bg-success";
    case "missed": return "bg-danger";
    default:       return "bg-muted";
  }
};

export function PracticeRowCard({ practice, onToggle }: PracticeRowCardProps) {
  const { id, title, streakDays, doneToday, history } = practice;
  const streakActive = streakDays > 0;

  return (
    <button
      onClick={() => onToggle(id)}
      className="tap w-full bg-card hairline rounded-xl px-3.5 py-2.5 shadow-card flex items-center gap-3 text-left animate-fade-up"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-medium leading-tight truncate">{title}</h3>
        <p className={"mt-0.5 text-[11px] leading-tight " + (streakActive ? "text-success-dark" : "text-muted-foreground")}>
          Серия: {streakDays} {streakDays === 1 ? "день" : streakDays >= 2 && streakDays <= 4 ? "дня" : "дней"}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1">
          {history.map((s, i) => (
            <span key={i} className={"h-1.5 w-1.5 rounded-full " + dotColor(s)} />
          ))}
        </div>

        <div className="w-[64px] flex justify-end">
          {doneToday ? (
            <span className="rounded-full bg-success/15 text-success-dark text-[11px] font-medium px-2 py-1 whitespace-nowrap">
              +1 ⭐
            </span>
          ) : (
            <span className="tap btn-pill-orange btn-sm">
              сделать
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
