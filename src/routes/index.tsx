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
      { title: "Клуб «Моя жизнь» — ежедневные практики" },
      { name: "description", content: "Мини-приложение ежедневных практик: трекер привычек, очки и серии." },
      { property: "og:title", content: "Клуб «Моя жизнь»" },
      { property: "og:description", content: "Ежедневные практики, очки и серии — превращайте рост в игру." },
    ],
  }),
  component: HomeScreen,
});

const initialChecklist = [
  { id: "water",   label: "Стакан воды натощак", done: true },
  { id: "breath",  label: "5 минут дыхания",     done: true },
  { id: "intent",  label: "Намерение на день",   done: false },
];

const h = (pattern: string): DotState[] =>
  pattern.split("").map((c) => (c === "x" ? "done" : c === "." ? "missed" : c === "t" ? "today" : "future"));

const initialPractices: Practice[] = [
  { id: "p1", title: "Утренние страницы",  emoji: "📓", reward: 1, state: "available", history: h("xxxxxt-") },
  { id: "p2", title: "Прогулка 20 минут",  emoji: "🚶", reward: 2, state: "available", history: h("xx.xxt-") },
  { id: "p3", title: "Чтение 10 страниц",  emoji: "📚", reward: 1, state: "done",      history: h("xxxxxx-") },
  { id: "p4", title: "Холодный душ",       emoji: "🚿", reward: 2, state: "danger",    history: h("x..x.t-") },
  { id: "p5", title: "Без сахара",         emoji: "🍎", reward: 3, state: "available", history: h("xxxxxt-") },
  { id: "p6", title: "Тренировка",         emoji: "🏋️", reward: 3, state: "locked",    history: h("xxxx---") },
];

function HomeScreen() {
  const [stars, setStars]         = useState(128);
  const [streak, setStreak]       = useState(5);
  const [bumpKey, setBumpKey]     = useState(0);
  const [tab, setTab]             = useState<"home" | "stats" | "boost" | "friends" | "profile">("home");
  const [checklist, setChecklist] = useState(initialChecklist);
  const [practices, setPractices] = useState<Practice[]>(initialPractices);
  const [pings, setPings]         = useState<RewardPing[]>([]);

  const progress = useMemo(() => {
    const d = checklist.filter((c) => c.done).length;
    return d / checklist.length;
  }, [checklist]);

  const award = (amount: number, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setPings((p) => [...p, { id, amount, x, y }]);
    setStars((s) => s + amount);
    setBumpKey((k) => k + 1);
    window.setTimeout(() => setPings((p) => p.filter((it) => it.id !== id)), 950);
  };

  const toggleChecklist = (id: string) => {
    setChecklist((list) =>
      list.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    );
  };

  const completePractice = (id: string, ev: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (ev.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setPractices((list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        const newHistory: DotState[] = [...p.history];
        const todayIdx = newHistory.findIndex((d) => d === "today");
        if (todayIdx >= 0) newHistory[todayIdx] = "done";
        award(p.reward, rect.left + rect.width / 2, rect.top + rect.height / 2);
        return { ...p, state: "done", history: newHistory };
      })
    );
    setStreak((s) => s + 0); // streak обновляется по дню; здесь оставляем
  };

  const heroSubtitle = `День ${streak} серии`;
  const heroTitle = progress < 1
    ? "Сделай ещё один шаг сегодня"
    : "Идеальный день — поздравляем 🎉";

  return (
    <div className="relative min-h-screen pb-28">
      <InkBackground />

      <Header
        greeting="Доброе утро"
        club="Клуб «Моя жизнь»"
        stars={stars}
        streak={streak}
        starsBumpKey={bumpKey}
      />

      <HeroCard
        title={heroTitle}
        subtitle={heroSubtitle}
        progress={progress}
        checklist={checklist}
        ctaLabel="Начать практику"
        onCta={() => {
          const first = practices.find((p) => p.state === "available" || p.state === "danger");
          if (first) {
            const el = document.getElementById(`practice-${first.id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }}
        onToggle={toggleChecklist}
      />

      <section className="px-5 mt-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-[18px] font-bold">Сегодняшние практики</h2>
          <span className="text-[12px] text-muted-foreground">
            {practices.filter((p) => p.state === "done").length}/{practices.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {practices.map((p, i) => (
            <div id={`practice-${p.id}`} key={p.id} style={{ animationDelay: `${i * 40}ms` }}>
              <PracticeCard practice={p} onComplete={completePractice} />
            </div>
          ))}
        </div>
      </section>

      <BottomNav active={tab} onChange={setTab} onBoost={() => setTab("home")} />
      <RewardLayer pings={pings} />
    </div>
  );
}
