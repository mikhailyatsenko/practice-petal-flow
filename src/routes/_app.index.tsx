import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StatCard } from "@/components/home/StatCard";
import { PathCard, type PathStep } from "@/components/home/PathCard";
import { PathLevels } from "@/components/home/PathLevels";
import { PracticeRowCard, type PracticeRow, type DayState } from "@/components/home/PracticeRowCard";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Клуб «Моя жизнь» — главная" },
      { name: "description", content: "5 ежедневных практик, статусы, серии и путь к воплощению целей." },
      { property: "og:title", content: "Клуб «Моя жизнь»" },
      { property: "og:description", content: "Превращай намерения в реальность через ежедневные практики." },
    ],
  }),
  component: HomeScreen,
});

const STATUSES = [
  { min: 0,    label: "Новичок"  },
  { min: 200,  label: "Практик"  },
  { min: 500,  label: "Эксперт"  },
  { min: 1000, label: "Мастер"   },
  { min: 2000, label: "Гуру"     },
  { min: 4000, label: "Легенда"  },
];

const statusFor = (stars: number) =>
  [...STATUSES].reverse().find((s) => stars >= s.min) ?? STATUSES[0];

const h = (p: string): DayState[] => {
  const arr = p.split("").map((c) => (c === "x" ? "done" : c === "." ? "missed" : "empty") as DayState);
  // дополнить до 30 пустыми слева
  while (arr.length < 30) arr.unshift("empty");
  return arr.slice(-30);
};

const initialPathSteps: PathStep[] = [
  { id: "s1", label: "День 1 — все 5 практик", done: true  },
  { id: "s2", label: "День 2 — все 5 практик", done: true  },
  { id: "s3", label: "День 3 — все 5 практик", done: true  },
  { id: "s4", label: "День 4 — все 5 практик", done: false },
  { id: "s5", label: "День 5 — все 5 практик", done: false },
  { id: "s6", label: "День 6 — все 5 практик", done: false },
  { id: "s7", label: "День 7 — все 5 практик", done: false },
];

const initialPractices: PracticeRow[] = [
  { id: "self-prog", title: "Программирование успеха", streakDays: 5, doneToday: true,  history: h("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"), level: 1, progress: 17 },
  { id: "charge",    title: "Зарядка об цель",         streakDays: 3, doneToday: true,  history: h("xxxxxxxxxxxxxxxxxxxxxxxx.xxxx"), level: 0, progress: 12 },
  { id: "essay",     title: "Жизнь мечты",             streakDays: 0, doneToday: false, history: h("xxxxxxxxxxxxxxxxxxxxxxxx......"), level: 0, progress: 8 },
  { id: "skill",     title: "Навык успеха",            streakDays: 7, doneToday: true,  history: h("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"), level: 2, progress: 22 },
  { id: "wishes",    title: "Воплощение желаний",      streakDays: 1, doneToday: false, history: h("xxxxxxxxxxxxxxxxxxxxxxxxxxxxx-"), level: 0, progress: 4 },
];

function HomeScreen() {
  const navigate = useNavigate();
  const [stars, setStars]         = useState(973);
  const [hit, setHit]             = useState(3);
  const [insurance]               = useState(0);
  const [practices, setPractices] = useState<PracticeRow[]>(initialPractices);
  const [pathSteps]               = useState<PathStep[]>(initialPathSteps);

  const status = statusFor(stars);
  const doneToday = useMemo(() => practices.filter((p) => p.doneToday).length, [practices]);

  const togglePractice = (id: string) => {
    setPractices((list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        const newDone = !p.doneToday;
        const newHistory: DayState[] = [...p.history];
        newHistory[newHistory.length - 1] = newDone ? "done" : "empty";
        setStars((s) => s + (newDone ? 1 : -1));
        return {
          ...p,
          doneToday: newDone,
          history: newHistory,
          streakDays: Math.max(0, p.streakDays + (newDone ? 1 : -1)),
        };
      })
    );
    setTimeout(() => {
      setPractices((list) => {
        const all = list.every((p) => p.doneToday);
        if (all) {
          setStars((s) => s + 1);
          setHit((h0) => h0 + 1);
        }
        return list;
      });
    }, 0);
  };

  return (
    <div className="px-4 pt-2">
      <section aria-label="Статистика" className="grid grid-cols-4 gap-2">
        <StatCard emoji="⭐" label="Очки"      value={String(stars)}        tone="orange" />
        <StatCard emoji="🔥" label="Хит"       value={`${hit} дн`}          tone="green"  />
        <StatCard emoji="💎" label="Статус"    value={status.label}         tone="orange" />
        <StatCard emoji="🔰" label="Страховка" value={`${insurance} шт`}                  />
      </section>

      <section className="mt-5">
        <h2 className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Твой путь
        </h2>
        <PathLevels />
      </section>

      <section id="today-practices" className="mt-5">
        <div className="px-1 mb-2 flex items-end justify-between">
          <h2 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Практики сегодня
          </h2>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {doneToday}/{practices.length}
          </span>
        </div>

        <div className="space-y-2">
          {practices.map((p) => (
            <PracticeRowCard key={p.id} practice={p} onToggle={togglePractice} />
          ))}
        </div>
      </section>

      <div className="h-2" />
      <span className="hidden">{String(!!navigate)}</span>
    </div>
  );
}
