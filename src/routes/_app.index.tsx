import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { StatCard } from "@/components/home/StatCard";
import { PathCard, type PathStep } from "@/components/home/PathCard";
import { PathLevels } from "@/components/home/PathLevels";
import { PracticeRowCard, type PracticeRow, type DayState } from "@/components/home/PracticeRowCard";
import { StatInfoSheet, type StatKey } from "@/components/home/StatInfoSheet";

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
  { id: "self-prog", title: "Программирование успеха", streakDays: 17, doneToday: true,  history: [], level: 1, progress: 17 },
  { id: "charge",    title: "Зарядка об цель",         streakDays: 12, doneToday: true,  history: [], level: 0, progress: 12 },
  { id: "essay",     title: "Жизнь мечты",             streakDays: 0,  doneToday: false, history: [], level: 0, progress: -6 },
  { id: "skill",     title: "Навык успеха",            streakDays: 22, doneToday: true,  history: [], level: 2, progress: 22 },
  { id: "wishes",    title: "Воплощение желаний",      streakDays: 4,  doneToday: false, history: [], level: 0, progress: 4 },
];

interface FlyingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  phase: "start" | "end";
}

function HomeScreen() {
  const navigate = useNavigate();
  const [stars, setStars]         = useState(973);
  const [hit, setHit]             = useState(3);
  const [insurance]               = useState(0);
  const [practices, setPractices] = useState<PracticeRow[]>(initialPractices);
  const [pathSteps]               = useState<PathStep[]>(initialPathSteps);
  const [openStat, setOpenStat]   = useState<StatKey | null>(null);
  const [flyingStars, setFlyingStars] = useState<FlyingStar[]>([]);
  const [starPulse, setStarPulse] = useState(false);
  const starIconRef = useRef<HTMLDivElement>(null);
  const flyIdRef = useRef(0);

  const status = statusFor(stars);
  const doneToday = useMemo(() => practices.filter((p) => p.doneToday).length, [practices]);

  const launchStarFromRect = (from: DOMRect) => {
    if (!starIconRef.current) return;
    // Получаем bounds иконки-цели; если она в pulse-состоянии (scale 1.5),
    // центр не меняется, но возьмём его без учёта transform через offsetParent
    const iconEl = starIconRef.current;
    const to = iconEl.getBoundingClientRect();
    const id = ++flyIdRef.current;
    const star: FlyingStar = {
      id,
      startX: from.left + from.width / 2,
      startY: from.top + from.height / 2,
      endX: to.left + to.width / 2,
      endY: to.top + to.height / 2,
      phase: "start",
    };
    setFlyingStars((s) => [...s, star]);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyingStars((s) => s.map((x) => (x.id === id ? { ...x, phase: "end" } : x)));
      });
    });
    window.setTimeout(() => {
      setStars((v) => v + 1);
      setStarPulse(true);
      window.setTimeout(() => setStarPulse(false), 150);
      setFlyingStars((s) => s.filter((x) => x.id !== id));
    }, 2400);
  };

  const togglePractice = (id: string, origin?: HTMLElement | null) => {
    // Захватываем геометрию origin СРАЗУ (до любых ре-рендеров)
    const originRect = origin ? origin.getBoundingClientRect() : null;
    setPractices((list) => {
      const current = list.find((p) => p.id === id);
      if (!current) return list;
      const willBeDone = !current.doneToday;
      // Звёздочка летит ТОЛЬКО при переходе "не сделано" → "сделано"
      if (willBeDone && originRect) {
        launchStarFromRect(originRect);
      }
      return list.map((p) => {
        if (p.id !== id) return p;
        const newDone = !p.doneToday;
        const newHistory: DayState[] = [...p.history];
        newHistory[newHistory.length - 1] = newDone ? "done" : "empty";
        const hadMissed = p.progress < 0;
        const newProgress = newDone
          ? hadMissed ? 1 : p.progress + 1
          : Math.max(0, p.progress - 1);
        return {
          ...p,
          doneToday: newDone,
          history: newHistory,
          streakDays: newDone
            ? hadMissed ? 1 : p.streakDays + 1
            : Math.max(0, p.streakDays - 1),
          progress: newProgress,
        };
      });
    });
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
    <div className="px-4 pt-2 relative">
      <section aria-label="Статистика" style={{ position: "relative", zIndex: openStat ? 50 : undefined }}>
        <div className="grid grid-cols-4 gap-2">
          <StatCard ref={starIconRef} emoji="⭐" label="Очки" value={String(stars)} tone="orange" pulse={starPulse} onClick={() => setOpenStat(openStat === "stars" ? null : "stars")} />
          <StatCard emoji="🔥" label="Хит" value={`${hit} дн`} tone="green" onClick={() => setOpenStat(openStat === "hit" ? null : "hit")} />
          <StatCard emoji="🔰" label="Страховка" value={`${insurance} шт`} onClick={() => setOpenStat(openStat === "insurance" ? null : "insurance")} />
          <StatCard emoji="💎" label="Статус" value={status.label} tone="orange" onClick={() => setOpenStat(openStat === "status" ? null : "status")} />
        </div>
        <StatInfoSheet statKey={openStat} onClose={() => setOpenStat(null)} />
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

      {/* Летящие звёздочки */}
      {flyingStars.map((s) => {
        const x = s.phase === "start" ? s.startX : s.endX;
        const y = s.phase === "start" ? s.startY : s.endY;
        const scale = s.phase === "start" ? 1 : 0.4;
        const opacity = s.phase === "start" ? 1 : 0;
        return (
          <div
            key={s.id}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
              transition:
                "transform 2.4s cubic-bezier(0.4,0,0.2,1), opacity 0.8s 1.8s",
              opacity,
              fontSize: 20,
              pointerEvents: "none",
              zIndex: 70,
              lineHeight: 1,
            }}
          >
            ⭐
          </div>
        );
      })}

    </div>
  );
}
