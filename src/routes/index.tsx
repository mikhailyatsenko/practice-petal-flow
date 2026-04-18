import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { InkBackground } from "@/components/InkBackground";
import { Header } from "@/components/Header";
import { HeroCard } from "@/components/HeroCard";
import { PracticeCard, type Practice } from "@/components/PracticeCard";
import { BottomNav } from "@/components/BottomNav";
import { RewardLayer, type RewardPing } from "@/components/RewardToast";
import type { DotState } from "@/components/ProgressDots";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Клуб «Моя жизнь» — ежедневные практики воплощения целей" },
      { name: "description", content: "Система воплощения желаний: 5 ежедневных практик, статусы, уровни и серии ХИТ. Превращай намерения в результат." },
      { property: "og:title", content: "Клуб «Моя жизнь»" },
      { property: "og:description", content: "5 практик в день — воплощай свои цели системно." },
    ],
  }),
  component: HomeScreen,
});

/* ---------- Domain ---------- */

const STATUSES = [
  { min: 0,    label: "⚪ Новичок",   mult: 1.0 },
  { min: 200,  label: "🔥 Практик",   mult: 1.1 },
  { min: 500,  label: "🥇 Эксперт",   mult: 1.2 },
  { min: 1000, label: "💎 Мастер",    mult: 1.3 },
  { min: 2000, label: "👑 Гуру",      mult: 1.4 },
  { min: 4000, label: "⭐ Легенда",   mult: 1.5 },
];

function statusFor(stars: number) {
  return [...STATUSES].reverse().find((s) => stars >= s.min) ?? STATUSES[0];
}

const h = (pattern: string): DotState[] =>
  pattern.split("").map((c) =>
    c === "x" ? "done" : c === "." ? "missed" : c === "t" ? "today" : "future"
  );

const initialPractices: Practice[] = [
  {
    id: "self-prog",
    title: "Самопрограммирование",
    emoji: "⚡",
    reward: 1,
    levelNumber: 4,
    levelName: "Программист сознания 🧠",
    daysInLevel: 18,
    daysToNextLevel: 30,
    state: "available",
    history: h("xxxxxt-"),
    accent: "oklch(0.78 0.17 65)",
  },
  {
    id: "charge",
    title: "Зарядка об цель",
    emoji: "🎯",
    reward: 1,
    levelNumber: 2,
    levelName: "Мечтатель 💭",
    daysInLevel: 12,
    daysToNextLevel: 30,
    state: "available",
    history: h("xx.xxt-"),
    accent: "oklch(0.78 0.18 135)",
  },
  {
    id: "essay",
    title: "Жизнь моей мечты",
    emoji: "✍️",
    reward: 1,
    levelNumber: 0,
    levelName: "Спящий 😴",
    daysInLevel: 0,
    daysToNextLevel: 30,
    state: "danger",
    history: h("..x.x.t"),
    accent: "oklch(0.66 0.22 28)",
  },
  {
    id: "skill",
    title: "Навык успеха",
    emoji: "🏆",
    reward: 1,
    levelNumber: 3,
    levelName: "Хранитель формул 📜",
    daysInLevel: 22,
    daysToNextLevel: 30,
    state: "done",
    history: h("xxxxxx-"),
    accent: "oklch(0.78 0.17 65)",
  },
  {
    id: "tasks",
    title: "Задачи к целям",
    emoji: "🎯",
    reward: 1,
    levelNumber: 1,
    levelName: "Программирующий 🗣️",
    daysInLevel: 7,
    daysToNextLevel: 30,
    state: "available",
    history: h("xxxxxt-"),
    accent: "oklch(0.78 0.18 135)",
  },
];

/* ---------- Screen ---------- */

function HomeScreen() {
  const [stars, setStars]         = useState(248);
  const [streak, setStreak]       = useState(5);
  const [bumpKey, setBumpKey]     = useState(0);
  const [tab, setTab]             = useState<"home" | "stats" | "shop" | "buddy" | "profile">("home");
  const [practices, setPractices] = useState<Practice[]>(initialPractices);
  const [pings, setPings]         = useState<RewardPing[]>([]);

  const status = statusFor(stars);

  const doneToday  = practices.filter((p) => p.state === "done").length;
  const totalToday = practices.length;
  const isHit      = doneToday === totalToday;

  const todayStars = useMemo(
    () => practices.reduce((s, p) => s + (p.state === "done" ? p.reward : 0), 0) + (isHit ? 1 : 0),
    [practices, isHit]
  );

  const award = (amount: number, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setPings((p) => [...p, { id, amount, x, y }]);
    setStars((s) => s + amount);
    setBumpKey((k) => k + 1);
    window.setTimeout(() => setPings((p) => p.filter((it) => it.id !== id)), 950);
  };

  const completePractice = (id: string, ev: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (ev.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setPractices((list) =>
      list.map((p) => {
        if (p.id !== id || p.state === "done") return p;
        const newHistory: DotState[] = [...p.history];
        const todayIdx = newHistory.findIndex((d) => d === "today");
        if (todayIdx >= 0) newHistory[todayIdx] = "done";
        award(p.reward, rect.left + rect.width / 2, rect.top + rect.height / 2);
        // если это пятая → бонус +1
        const willBeDone = list.filter((x) => x.state === "done").length + 1;
        if (willBeDone === list.length) {
          window.setTimeout(() => award(1, window.innerWidth / 2, 120), 350);
          setStreak((s) => s + 1);
        }
        return {
          ...p,
          state: "done",
          history: newHistory,
          daysInLevel: Math.min(p.daysToNextLevel, p.daysInLevel + 1),
        };
      })
    );
  };

  const scrollToNext = () => {
    const next = practices.find((p) => p.state !== "done");
    if (next) {
      document.getElementById(`practice-${next.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="relative min-h-screen pb-28">
      <InkBackground />

      <Header
        greeting="Доброе утро · Клуб «Моя жизнь»"
        statusLabel={`${status.label} · ×${status.mult.toFixed(1)}`}
        stars={stars}
        streak={streak}
        starsBumpKey={bumpKey}
      />

      <HeroCard
        doneToday={doneToday}
        totalToday={totalToday}
        todayStars={todayStars}
        multiplier={status.mult}
        isHit={isHit}
        onCta={scrollToNext}
      />

      <section className="px-5 mt-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-[18px] font-bold leading-tight">5 практик дня</h2>
            <p className="text-[11.5px] text-muted-foreground">Каждый день — шаг к мечте</p>
          </div>
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {doneToday}/{totalToday}
          </span>
        </div>

        <div className="space-y-2.5">
          {practices.map((p, i) => (
            <div id={`practice-${p.id}`} key={p.id} style={{ animationDelay: `${i * 40}ms` }}>
              <PracticeCard practice={p} onComplete={completePractice} />
            </div>
          ))}
        </div>

        {/* Buddy hint */}
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-3.5 flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "color-mix(in oklab, var(--accent) 14%, transparent)" }}
          >
            👥
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight">Найди Бадди</p>
            <p className="text-[11.5px] text-muted-foreground leading-tight">
              +3 очка каждый день за партнёра по созвонам
            </p>
          </div>
          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent-dark">
            100 ⭐
          </span>
        </div>
      </section>

      <BottomNav active={tab} onChange={setTab} />
      <RewardLayer pings={pings} />
    </div>
  );
}
