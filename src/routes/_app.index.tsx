import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StatCard } from "@/components/home/StatCard";
import { type PathStep } from "@/components/home/PathCard";
import { PathLevels } from "@/components/home/PathLevels";
import { PracticeRowCard, type PracticeRow, type DayState } from "@/components/home/PracticeRowCard";
import { StatInfoSheet, type StatKey } from "@/components/home/StatInfoSheet";
import {
  StarBurst,
  FireFlames,
  Confetti,
  StatusRings,
} from "@/components/home/StatEffects";
import { usePracticesDone, setPracticeDone, computeEffective, type PracticeId } from "@/lib/practicesStore";
import { LockedFeatureCard } from "@/components/section/LockedFeatureCard";
import { FlywheelLockedPreview } from "@/components/section/FlywheelLockedPreview";
import { isFeatureUnlocked, unlockLevelOf, usePreviewLevel } from "@/lib/previewLevel";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Клуб «Моя жизнь» — главная" },
      { name: "description", content: "5 ежедневных практик, статусы, серии и путь к воплощению целей." },
      { property: "og:title", content: "Клуб «Моя жизнь»" },
      { property: "og:description", content: "Превращай намерения в реальность через ежедневные практики." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d688fa21-bb4d-4830-b13f-6c3c060d916d/id-preview-cb01a325--b3ed6122-13ef-4959-8afe-7cfa4ea31691.lovable.app-1776523090606.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d688fa21-bb4d-4830-b13f-6c3c060d916d/id-preview-cb01a325--b3ed6122-13ef-4959-8afe-7cfa4ea31691.lovable.app-1776523090606.png" },
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

// База практик. Поле doneToday здесь — заглушка; реальный статус берётся из practicesStore.
const initialPractices: PracticeRow[] = [
  { id: "self-prog", title: "Программирование успеха", streakDays: 17, doneToday: false, history: [], level: 1, progress: 17 },
  { id: "charge",    title: "Вдохновение желаниями",         streakDays: 12, doneToday: false, history: [], level: 0, progress: 12 },
  { id: "essay",     title: "Сочинение жизни мечты",       streakDays: 0,  doneToday: false, history: [], level: 0, progress: -6 },
  { id: "skill",     title: "Воплощение намерений",            streakDays: 22, doneToday: false, history: [], level: 2, progress: 22 },
  { id: "wishes",    title: "Шаг к цели",              streakDays: 4,  doneToday: false, history: [], level: 0, progress: 4 },
];

const SELF_PROG_DONE_KEY = "self-prog-done-v2";
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

interface FlyingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  phase: "start" | "end";
}

interface EffectInstance {
  id: number;
  type: "burst" | "fire" | "confetti" | "rings";
  x: number;
  y: number;
}

function HomeScreen() {
  const navigate = useNavigate();
  const previewLevel = usePreviewLevel();
  const flywheelOpen = isFeatureUnlocked("flywheel", previewLevel);
  const [stars, setStars]         = useState(970);
  const [hit, setHit]             = useState(2);
  const [insurance, setInsurance] = useState(0);
  const doneMap = usePracticesDone();
  const practices = useMemo<PracticeRow[]>(
    () =>
      initialPractices.map((p) => {
        const id = p.id as PracticeId;
        const done = doneMap[id] ?? false;
        const eff = computeEffective(id, done);
        return {
          ...p,
          doneToday: done,
          progress: eff.progress,
          streakDays: eff.streakDays,
          level: eff.level,
        };
      }),
    [doneMap],
  );
  const [pathSteps]               = useState<PathStep[]>(initialPathSteps);
  const [openStat, setOpenStat]   = useState<StatKey | null>(null);
  const [flyingStars, setFlyingStars] = useState<FlyingStar[]>([]);
  const [starPulse, setStarPulse] = useState(false);
  const [hitPulse, setHitPulse]   = useState(false);
  const [insurancePulse, setInsurancePulse] = useState(false);
  const [insuranceTransform, setInsuranceTransform] = useState<string | null>(null);
  const [statusFlash, setStatusFlash] = useState(false);
  const [effects, setEffects]     = useState<EffectInstance[]>([]);
  // Статус: показываем "Эксперт" 🥇 в начале, затем флипаем на "Мастер" 💎
  const [statusDisplay, setStatusDisplay] = useState<{ emoji: string; label: string }>({
    emoji: "🥇",
    label: "Эксперт",
  });
  const [statusFlipDeg, setStatusFlipDeg] = useState(0);

  const starIconRef = useRef<HTMLDivElement>(null);
  const hitIconRef = useRef<HTMLDivElement>(null);
  const insuranceIconRef = useRef<HTMLDivElement>(null);
  const statusIconRef = useRef<HTMLDivElement>(null);
  const flyIdRef = useRef(0);
  const fxIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayedRef = useRef(false);

  void statusFor; // status вычисляется динамически в анимации флипа
  const doneToday = useMemo(() => practices.filter((p) => p.doneToday).length, [practices]);

  const spawnEffect = (type: EffectInstance["type"], x: number, y: number) => {
    const id = ++fxIdRef.current;
    setEffects((e) => [...e, { id, type, x, y }]);
  };

  const removeEffect = (id: number) =>
    setEffects((e) => e.filter((x) => x.id !== id));

  const triggerStarBurstAtIcon = () => {
    if (!starIconRef.current) return;
    const r = starIconRef.current.getBoundingClientRect();
    spawnEffect("burst", r.left + r.width / 2, r.top + r.height / 2);
    setStarPulse(true);
    window.setTimeout(() => setStarPulse(false), 200);
  };

  const launchStarFromRect = (
    from: DOMRect,
    onArrive?: () => void,
    opts?: { incrementCount?: boolean },
  ) => {
    if (!starIconRef.current) return;
    const to = starIconRef.current.getBoundingClientRect();
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
      if (opts?.incrementCount !== false) setStars((v) => v + 1);
      onArrive?.();
      setFlyingStars((s) => s.filter((x) => x.id !== id));
    }, 1200);
  };

  const togglePractice = (id: string, _origin?: HTMLElement | null) => {
    void _origin;
    // Все карточки только переходят на свои экраны — никаких тогглов и анимаций
    if (id === "self-prog") {
      void navigate({ to: "/practice/self-prog" });
      return;
    }
    if (id === "charge") {
      void navigate({ to: "/practice/wishes-charge" });
      return;
    }
    if (id === "essay") {
      void navigate({ to: "/practice/essay" });
      return;
    }
    if (id === "skill") {
      void navigate({ to: "/practice/skill" });
      return;
    }
    if (id === "wishes") {
      void navigate({ to: "/practice/step" });
      return;
    }
  };

  const markDone = (id: string) => {
    setPracticeDone(id as PracticeId, true);
  };

  // Все карточки всегда стартуют как "не сделано" — сохранённое состояние не читаем
  void SELF_PROG_DONE_KEY;
  void todayStr;

  // Авто-запуск всех анимаций при заходе на главную
  useEffect(() => {
    void autoplayedRef.current;

    const timeouts: number[] = [];
    const STAR_FLIGHT = 1200;
    const STAR_GAP = 200;
    const INITIAL_DELAY = 350;

    // 1) Звёздочки от 3 выполненных практик летят сразу (слева направо)
    timeouts.push(
      window.setTimeout(() => {
        if (!containerRef.current) return;
        const cards = containerRef.current.querySelectorAll<HTMLElement>(
          "#today-practices [data-practice-card]",
        );
        const doneCards: HTMLElement[] = [];
        cards.forEach((el) => {
          if (el.dataset.done === "1") doneCards.push(el);
        });
        doneCards.forEach((card, i) => {
          timeouts.push(
            window.setTimeout(() => {
              const r = card.getBoundingClientRect();
              launchStarFromRect(r, () => triggerStarBurstAtIcon());
            }, i * STAR_GAP),
          );
        });
      }, INITIAL_DELAY),
    );

    // Когда долетит последняя звезда
    const LAST_STAR_AT = INITIAL_DELAY + STAR_FLIGHT + 2 * STAR_GAP;

    // 2) 🔥 Хит — после звёзд
    const HIT_AT = LAST_STAR_AT + 400;
    timeouts.push(
      window.setTimeout(() => {
        if (!hitIconRef.current) return;
        const r = hitIconRef.current.getBoundingClientRect();
        spawnEffect("fire", r.left + r.width / 2, r.top + r.height / 2);
        setHitPulse(true);
        setHit((h) => h + 1);
        window.setTimeout(() => setHitPulse(false), 200);
      }, HIT_AT),
    );

    // 3) 🛡 Страховка
    const INS_AT = HIT_AT + 600;
    timeouts.push(
      window.setTimeout(() => {
        if (!insuranceIconRef.current) return;
        const r = insuranceIconRef.current.getBoundingClientRect();
        spawnEffect("confetti", r.left + r.width / 2, r.top + r.height / 2);
        setInsurance((v) => v + 1);
        setInsuranceTransform("scale(0.5)");
        window.setTimeout(() => setInsuranceTransform("scale(1.4)"), 100);
        window.setTimeout(() => setInsuranceTransform("scale(1)"), 100 + 350);
        window.setTimeout(() => setInsuranceTransform(null), 100 + 350 + 150);
      }, INS_AT),
    );

    // 4) 💎 Статус — флип Эксперт → Мастер, затем кольца + вспышка
    const FLIP_DURATION = 600;
    const FLIP_START = INS_AT + 700;
    timeouts.push(
      window.setTimeout(() => {
        setStatusFlipDeg(90);
        timeouts.push(
          window.setTimeout(() => {
            setStatusDisplay({ emoji: "💎", label: "Мастер" });
            setStatusFlipDeg(-90);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => setStatusFlipDeg(0));
            });
          }, FLIP_DURATION / 2),
        );
      }, FLIP_START),
    );

    const STATUS_FX_AT = FLIP_START + FLIP_DURATION;
    timeouts.push(
      window.setTimeout(() => {
        if (!statusIconRef.current) return;
        const r = statusIconRef.current.getBoundingClientRect();
        spawnEffect("rings", r.left + r.width / 2, r.top + r.height / 2);
        setStatusFlash(true);
        window.setTimeout(() => setStatusFlash(false), 160);
      }, STATUS_FX_AT),
    );

    setInsurancePulse(false);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // insurance transitions
  const insuranceTransitionForState = (() => {
    if (insuranceTransform === "scale(1.4)")
      return "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)";
    if (insuranceTransform === "scale(1)") return "transform 0.15s ease-out";
    if (insuranceTransform === "scale(0.5)") return "transform 0.1s ease-out";
    return "transform 150ms ease-out";
  })();

  return (
    <div ref={containerRef} className="px-4 pt-2 relative">
      <section aria-label="Статистика" style={{ position: "relative", zIndex: openStat ? 50 : undefined }}>
        <div className="grid grid-cols-4 gap-2">
          <StatCard
            ref={starIconRef}
            emoji="⭐"
            label="Очки"
            value={String(stars)}
            tone="orange"
            pulse={starPulse}
            onClick={() => setOpenStat(openStat === "stars" ? null : "stars")}
          />
          <StatCard
            ref={hitIconRef}
            emoji="🔥"
            label="Хит"
            value={`${hit} дн`}
            tone="green"
            pulse={hitPulse}
            iconStyle={hitPulse ? { transform: "scale(1.2)", transition: "transform 200ms ease-out" } : undefined}
            onClick={() => setOpenStat(openStat === "hit" ? null : "hit")}
          />
          <StatCard
            ref={insuranceIconRef}
            emoji="🔰"
            label="Страховка"
            value={`${insurance} шт`}
            pulse={insurancePulse}
            iconStyle={
              insuranceTransform
                ? { transform: insuranceTransform, transition: insuranceTransitionForState }
                : undefined
            }
            onClick={() => setOpenStat(openStat === "insurance" ? null : "insurance")}
          />
          <div
            style={{
              transform: `perspective(600px) rotateY(${statusFlipDeg}deg)`,
              transition: "transform 300ms ease-in-out",
            }}
          >
            <StatCard
              ref={statusIconRef}
              emoji={statusDisplay.emoji}
              label="Статус"
              value={statusDisplay.label}
              tone="orange"
              iconStyle={
                statusFlash
                  ? {
                      transform: "scale(1.6)",
                      boxShadow: "0 0 16px rgba(255,179,0,0.8)",
                      transition: "transform 160ms ease-out, box-shadow 160ms ease-out",
                      borderRadius: "50%",
                    }
                  : undefined
              }
              onClick={() => setOpenStat(openStat === "status" ? null : "status")}
            />
          </div>
        </div>
        <StatInfoSheet statKey={openStat} onClose={() => setOpenStat(null)} />
      </section>

      <section className="mt-5">
        <h2 className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Твой путь
        </h2>
        <PathLevels />
      </section>

      {flywheelOpen ? (
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
              <div key={p.id} data-practice-card data-done={p.doneToday ? "1" : "0"}>
                <PracticeRowCard
                  practice={p}
                  onToggle={togglePractice}
                  onMarkDone={markDone}
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-5">
          <FlywheelLockedPreview unlockLevel={unlockLevelOf("flywheel")} />
        </section>
      )}

      <div className="h-2" />
      <span className="hidden">{String(!!navigate)} {pathSteps.length}</span>

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
                "transform 1.2s cubic-bezier(0.4,0,0.2,1), opacity 0.4s 0.9s",
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

      {/* Эффекты для блоков статистики */}
      {effects.map((fx) => {
        if (fx.type === "burst")
          return <StarBurst key={fx.id} x={fx.x} y={fx.y} onDone={() => removeEffect(fx.id)} />;
        if (fx.type === "fire")
          return <FireFlames key={fx.id} x={fx.x} y={fx.y} onDone={() => removeEffect(fx.id)} />;
        if (fx.type === "confetti")
          return <Confetti key={fx.id} x={fx.x} y={fx.y} onDone={() => removeEffect(fx.id)} />;
        if (fx.type === "rings")
          return <StatusRings key={fx.id} x={fx.x} y={fx.y} onDone={() => removeEffect(fx.id)} />;
        return null;
      })}
    </div>
  );
}
