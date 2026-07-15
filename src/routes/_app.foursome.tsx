import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, BookOpen, Play, Zap, Calendar, Globe, MessageCircle, Users, Check, X, Send } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { HowVideoCards } from "@/components/section/HowVideoCards";
import { TelegramIcon, MaxIcon } from "@/components/icons/MessengerIcons";


export const Route = createFileRoute("/_app/foursome")({
  validateSearch: (search: Record<string, unknown>): { demo?: "has" | "waiting" | "locked" } => {
    const d = search.demo;
    return d === "has" || d === "waiting" || d === "locked" ? { demo: d } : {};
  },
  head: () => ({
    meta: [
      { title: "Четвёрка — Клуб «Моя жизнь»" },
      { name: "description", content: "Две пары бадди — ежемесячный созвон и +2 очка каждый день." },
    ],
  }),
  component: FoursomeScreen,
});

// ───────────────────────── Types & demo data ─────────────────────────

interface Member {
  userId: string;
  name: string;
  avatar: string;
  job: string;
  username?: string;
  bio?: string;
}

interface FoursomeRequest {
  id: string;
  members: Member[]; // 2
  day: string;
  time: string;
  extra?: string;
}

interface FoursomeData {
  pair1: { members: Member[] };
  pair2: { members: Member[] };
  day: string;
  time: string;
}

type Screen =
  | { name: "locked" }
  | { name: "no_foursome" }
  | { name: "instructions"; from: "locked" | "no_foursome" }
  | { name: "create_request" }
  | { name: "browse_requests" }
  | { name: "waiting"; to: FoursomeRequest }
  | { name: "has_foursome" };

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

const DAY_FULL: Record<string, string> = {
  Пн: "Первый понедельник месяца",
  Вт: "Первый вторник месяца",
  Ср: "Первая среда месяца",
  Чт: "Первый четверг месяца",
  Пт: "Первая пятница месяца",
  Сб: "Первая суббота месяца",
  Вс: "Первое воскресенье месяца",
};

const ME: Member = { userId: "me", name: "Ты", avatar: "🙂", job: "Участник клуба" };
const MY_BUDDY: Member = { userId: "b1", name: "Алексей", avatar: "🧑‍💻", job: "Продакт-менеджер", username: "алексей" };

const DEMO_REQUESTS: FoursomeRequest[] = [
  {
    id: "f1",
    members: [
      { userId: "u1", name: "Анна", avatar: "🌸", job: "Маркетолог", bio: "Запускаю свой бренд косметики, цель — выйти на стабильные 300к/мес. Ищу системность и поддержку." },
      { userId: "u2", name: "Ольга", avatar: "🌿", job: "Психолог", bio: "Веду частную практику и онлайн-курс. Хочу окружение, где растут и не сливаются с целей." },
    ],
    day: "Вт",
    time: "19:00",
    extra: "Если первый вторник не подойдёт — готовы перенести на первую среду или четверг (19:00–21:00 МСК). Созваниваемся через Zoom.",
  },
  {
    id: "f2",
    members: [
      { userId: "u3", name: "Дмитрий", avatar: "🎯", job: "Предприниматель", bio: "Развиваю IT-агентство, цель года — 1М/мес. Ценю чёткие задачи и дисциплину." },
      { userId: "u4", name: "Сергей", avatar: "🚀", job: "Основатель стартапа", bio: "Делаю SaaS для малого бизнеса. Хочу окружение людей, которые тоже строят и не боятся больших целей." },
    ],
    day: "Чт",
    time: "20:00",
    extra: "Альтернативные слоты: первая пятница 19:00–21:00 МСК или первая суббота утром 10:00–12:00. Просим заранее предупреждать о переносах.",
  },
  {
    id: "f3",
    members: [
      { userId: "u5", name: "Мария", avatar: "✨", job: "Коуч", bio: "Расту в личном бренде, веду программу для женщин. Ищу длинную дистанцию и честную обратную связь." },
      { userId: "u6", name: "Ирина", avatar: "🌷", job: "HR-директор", bio: "Перехожу из найма в консалтинг. Нужна команда, которая держит в фокусе и помогает не откладывать." },
    ],
    day: "Ср",
    time: "10:00",
    extra: "Если утро не подходит — можем в первый вторник или четверг с 19:00 до 21:00 МСК. Созваниваемся через Яндекс Телемост.",
  },
];

const DEMO_FOURSOME: FoursomeData = {
  pair1: { members: [ME, MY_BUDDY] },
  pair2: {
    members: [
      { userId: "u7", name: "Елена", avatar: "🦋", job: "Архитектор", username: "elena_arc" },
      { userId: "u8", name: "Павел", avatar: "🎸", job: "Музыкант · продюсер", username: "pavel_m" },
    ],
  },
  day: "Ср",
  time: "19:00",
};

// ───────────────────────── Root ─────────────────────────

function FoursomeScreen() {
  const { demo } = Route.useSearch();
  const initial: Screen =
    demo === "has"
      ? { name: "has_foursome" }
      : demo === "waiting"
        ? { name: "waiting", to: DEMO_REQUESTS[0] }
        : demo === "locked"
          ? { name: "locked" }
          : { name: "no_foursome" };
  const [screen, setScreen] = useState<Screen>(initial);
  const lastDemo = useRef(demo);
  useEffect(() => {
    if (lastDemo.current !== demo) {
      lastDemo.current = demo;
      setScreen(initial);
    }
  }, [demo]);

  switch (screen.name) {
    case "locked":
      return <Locked onNavigate={setScreen} />;
    case "no_foursome":
      return <NoFoursome onNavigate={setScreen} />;
    case "instructions":
      return <Instructions onBack={() => setScreen(screen.from === "locked" ? { name: "locked" } : { name: "no_foursome" })} />;
    case "create_request":
      return (
        <CreateRequest
          onBack={() => setScreen({ name: "no_foursome" })}
        />

      );
    case "browse_requests":
      return (
        <BrowseRequests
          onBack={() => setScreen({ name: "no_foursome" })}
          onConfirm={(req) => setScreen({ name: "waiting", to: req })}
        />
      );
    case "waiting":
      return <Waiting to={screen.to} onBack={() => setScreen({ name: "no_foursome" })} />;
    case "has_foursome":
      return <HasFoursome onBack={() => setScreen({ name: "no_foursome" })} data={DEMO_FOURSOME} />;
  }
}

// ───────────────────────── Shared ─────────────────────────

const ORANGE_GRADIENT = "linear-gradient(135deg, #FFB300, #FF6D00)";
const LIME_GRADIENT = "linear-gradient(135deg, #8BC34A, #4CAF50)";

function PageHeader({ title, onBack, badge }: { title: string; onBack: () => void; badge?: string }) {
  return (
    <div className="relative flex items-center px-1 pt-2 pb-3">
      <div className="relative z-10">
        <BackButton onClick={onBack} />
      </div>
      <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
        {title}
      </h1>
      {badge && (
        <span
          className="ml-auto relative z-10 text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
          style={{ background: ORANGE_GRADIENT }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", ...style }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[13px] uppercase text-muted-foreground font-medium mb-2 px-1" style={{ letterSpacing: 0.5 }}>
      {children}
    </div>
  );
}

function MemberRow({ m, withMessage }: { m: Member; withMessage?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center text-[20px] shrink-0"
        style={{ background: "#FAF6EF" }}
      >
        {m.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold truncate">{m.name}</div>
        <div className="text-[12px] text-muted-foreground truncate">
          {m.job}
          {m.username ? ` · @${m.username}` : ""}
        </div>
      </div>
      {withMessage && m.username && (
        <a
          href={`https://t.me/${m.username}`}
          target="_blank"
          rel="noreferrer"
          className="tap h-9 w-9 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ background: LIME_GRADIENT }}
          aria-label="Написать"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="tap text-[13px] px-3 py-1.5 rounded-full border transition"
      style={
        active
          ? { background: "#fff3e0", color: "#FF6D00", borderColor: "#FF6D00", fontWeight: 700 }
          : { background: "#fff", color: "#1a1a1a", borderColor: "#ede8df" }
      }
    >
      {children}
    </button>
  );
}

function FormatRow({ time, text, lime }: { time: string; text: string; lime?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span
        className="text-[12px] font-bold text-white px-2.5 py-1 rounded-full shrink-0"
        style={{ background: lime ? LIME_GRADIENT : ORANGE_GRADIENT }}
      >
        {time}
      </span>
      <span className="text-[13px] text-foreground">{text}</span>
    </div>
  );
}

// ───────────────────────── Screen 1: Locked ─────────────────────────

function Locked({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const navigate = useNavigate();
  return (
    <div className="px-4 pb-8">
      <PageHeader title="Четвёрка" onBack={() => navigate({ to: "/community" })} />

      <div className="flex flex-col items-center text-center py-6 animate-fade-up">
        <div className="text-[56px] leading-none mb-3">🔒</div>
        <h2 className="text-[18px] font-bold mb-2">Сначала найди Бадди</h2>
        <p className="text-[14px] text-muted-foreground max-w-xs" style={{ lineHeight: 1.65 }}>
          Четвёрка — это две пары бадди. Чтобы попасть в Четвёрку, у тебя сначала должен быть активный Бадди.
        </p>
      </div>

      <div
        className="rounded-2xl p-4 mb-3 animate-fade-up"
        style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[20px]">👥👥</span>
          <span className="font-bold text-[14px]" style={{ color: "#FF6D00" }}>
            Что такое Четвёрка?
          </span>
        </div>
        <p className="text-[13px] text-foreground/80" style={{ lineHeight: 1.6 }}>
          Две пары бадди объединяются для ежемесячного созвона. Четыре человека — четыре истории роста — одна общая
          энергия движения вперёд.
        </p>
      </div>

      <Card className="p-4 mb-4 animate-fade-up">
        <SectionLabel>Что даёт Четвёрка</SectionLabel>
        <div className="space-y-3 mt-1">
          <BenefitRow icon={<Zap className="h-4 w-4" />} title="+2 очка каждый день" sub="Пока твоя пара состоит в Четвёрке" />
          <BenefitRow icon={<Calendar className="h-4 w-4" />} title="Ежемесячный созвон" sub="60 минут в первую неделю месяца" />
          <BenefitRow icon={<Globe className="h-4 w-4" />} title="Более широкий круг" sub="Новые идеи и свежий взгляд" />
        </div>
      </Card>

      <button
        onClick={() => navigate({ to: "/buddy" })}
        className="tap w-full py-3.5 rounded-2xl text-white text-[14px] font-bold flex items-center justify-center gap-2"
        style={{ background: ORANGE_GRADIENT }}
      >
        <Users className="h-4 w-4" /> Найти Бадди
      </button>
    </div>
  );
}

function BenefitRow({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0"
        style={{ background: ORANGE_GRADIENT }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-semibold">{title}</div>
        <div className="text-[12px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

// ───────────────────────── Screen 2: No foursome ─────────────────────────

function NoFoursome({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const navigate = useNavigate();
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");
  return (
    <div className="px-4 pb-8">
      <PageHeader title="Четвёрка" onBack={() => navigate({ to: "/community" })} />

      {/* Твоя пара */}
      <div
        className="rounded-2xl p-3.5 mb-4 flex items-center gap-3 animate-fade-up"
        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
      >
        <div className="flex-1">
          <div className="text-[12px] text-muted-foreground">Твоя пара</div>
          <div className="text-[14px] font-bold mt-0.5">Ты + {MY_BUDDY.name}</div>
        </div>
        <span
          className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
          style={{ background: LIME_GRADIENT }}
        >
          Бадди ✓
        </span>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center py-3 animate-fade-up">
        <div className="text-[52px] leading-none mb-3">👥👥</div>
        <h2 className="text-[18px] font-bold mb-2">У тебя пока нет Четвёрки</h2>
        <p className="text-[14px] text-muted-foreground max-w-xs" style={{ lineHeight: 1.6 }}>
          Найди другую пару для ежемесячных созвонов и получай{" "}
          <span style={{ color: "#FF6D00", fontWeight: 700 }}>+2 очка каждый день</span>
        </p>
      </div>

      {/* Бонус-баннер */}
      <div
        className="rounded-2xl p-3.5 mb-4 mt-2 flex items-center gap-3 animate-fade-up"
        style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
      >
        <Zap className="h-7 w-7 shrink-0" style={{ color: "#FF6D00" }} />
        <div className="flex-1">
          <div className="text-[14px] font-bold" style={{ color: "#FF6D00" }}>
            +2 очка каждый день
          </div>
          <div className="text-[12px] text-muted-foreground">Пока твоя пара состоит в Четвёрке</div>
        </div>
      </div>

      {/* Два способа */}
      <SectionLabel>Два способа найти Четвёрку</SectionLabel>
      <div className="space-y-2.5 mb-4">
        <ActionCard
          emoji="✍️"
          title="Оставить заявку"
          subtitle="Опишите пару — вас найдут"
          onClick={() => onNavigate({ name: "create_request" })}
        />
        <ActionCard
          emoji="🔍"
          title="Выбрать из заявок"
          subtitle="Просмотри заявки других пар"
          badge={String(DEMO_REQUESTS.length)}
          onClick={() => onNavigate({ name: "browse_requests" })}
        />
      </div>

      {/* Ожидание — переход к откликам */}
      <button
        onClick={() => onNavigate({ name: "waiting", to: DEMO_REQUESTS[0] })}
        className="tap mb-4 w-full rounded-2xl px-3.5 py-3 flex items-center gap-3 text-left animate-fade-up"
        style={{
          background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
          border: "1px solid #fdba74",
        }}
      >
        <div
          className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-[22px]"
          style={{ background: "rgba(255,109,0,0.15)" }}
        >
          ⏳
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-tight" style={{ color: "#9a3412" }}>
            Ожидание ответа
          </h3>
          <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "#c2410c" }}>
            Посмотри отклики на твою заявку
          </p>
        </div>
        <span
          className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          {DEMO_REQUESTS.length}
        </span>
      </button>

      {/* Формат */}
      <Card className="p-4 mb-4">
        <SectionLabel>Формат созвона · 60 минут</SectionLabel>
        <FormatRow time="10 мин" text="Первый участник делится успехами за месяц" />
        <FormatRow time="10 мин" text="Второй участник делится успехами за месяц" />
        <FormatRow time="10 мин" text="Третий участник делится успехами за месяц" />
        <FormatRow time="10 мин" text="Четвёртый участник делится успехами за месяц" />
        <FormatRow time="20 мин" text="Все ставят задачи на следующий месяц" />
      </Card>

      {/* Как работает — inline collapsible */}
      <section>
        <button
          onClick={() => setHowOpen((v) => !v)}
          className="tap w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
        >
          <span className="text-[18px] font-bold leading-none" style={{ color: "#E53935" }}>?</span>
          <span className="text-[14px] font-medium flex-1 text-left">Как работает раздел</span>
          <ChevronDown
            className="h-5 w-5 text-muted-foreground transition-transform"
            style={{ transform: howOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        {howOpen && (
          <div className="mt-3 animate-fade-up">
            <div className="flex rounded-xl mb-3" style={{ background: "#f0ebe2", padding: 4 }}>
              {([
                { k: "text", label: "📖 Текст" },
                { k: "video", label: "▶️ Видео" },
              ] as const).map((t) => {
                const active = howTab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setHowTab(t.k)}
                    className="tap flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors"
                    style={{
                      background: active ? ORANGE_GRADIENT : "transparent",
                      color: active ? "#fff" : "#6b6356",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {howTab === "text" ? (
              <div className="space-y-3">
                {INSTRUCTION_CARDS.map((c, i) => (
                  <Card
                    key={i}
                    className="p-4"
                    style={
                      c.important
                        ? { background: "#fff7ed", border: "1.5px solid #FB923C" }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[20px]">{c.emoji}</span>
                      <span
                        className="text-[14px] font-bold"
                        style={c.important ? { color: "#C2410C" } : undefined}
                      >
                        {c.title}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground/85 whitespace-pre-line" style={{ lineHeight: 1.65 }}>
                      {c.text}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <HowVideoCards
                first={{
                  title: "🎬 Что такое Четвёрка",
                  duration: "5:00",
                  caption:
                    "Как найти Четвёрку, как проходит процесс подтверждения и зачем встречаться раз в месяц.",
                }}
                second={{
                  title: "👥 Структура созвона Четвёрки",
                  duration: "4:30",
                  caption:
                    "Что делать на ежемесячных созвонах: формат, правила, темы и как получить максимум.",
                }}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ActionCard({
  emoji,
  title,
  subtitle,
  badge,
  onClick,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="tap w-full bg-white rounded-2xl p-3.5 flex items-center gap-3 text-left"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      <div className="h-11 w-11 rounded-xl flex items-center justify-center text-[22px] shrink-0" style={{ background: "rgba(255,138,0,0.12)" }}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[12px] text-muted-foreground">{subtitle}</div>
      </div>
      {badge ? (
        <span
          className="text-[12px] font-bold text-white px-2 py-1 rounded-full"
          style={{ background: ORANGE_GRADIENT }}
        >
          {badge}
        </span>
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
}

// ───────────────────────── Screen 3: Instructions ─────────────────────────

function Instructions({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"text" | "video">("text");
  return (
    <div className="px-4 pb-8">
      <PageHeader title="Как работает раздел" onBack={onBack} />

      <Card className="p-1.5 mb-4 flex">
        {(
          [
            { key: "text", label: "📖 Текст" },
            { key: "video", label: "▶️ Видео" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 text-[13px] rounded-xl font-medium transition"
            style={
              tab === t.key
                ? { background: ORANGE_GRADIENT, color: "#fff" }
                : { color: "#8a8a8a" }
            }
          >
            {t.label}
          </button>
        ))}
      </Card>

      {tab === "text" ? (
        <div className="space-y-3">
          {INSTRUCTION_CARDS.map((c, i) => (
            <Card
              key={i}
              className="p-4"
              style={
                c.important
                  ? { background: "#fff7ed", border: "1.5px solid #FB923C" }
                  : undefined
              }
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[20px]">{c.emoji}</span>
                <span
                  className="text-[14px] font-bold"
                  style={c.important ? { color: "#C2410C" } : undefined}
                >
                  {c.title}
                </span>
              </div>
              <p className="text-[13px] text-foreground/85 whitespace-pre-line" style={{ lineHeight: 1.65 }}>
                {c.text}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <HowVideoCards
          first={{
            title: "🎬 Что такое Четвёрка",
            duration: "5:00",
            caption:
              "Как найти Четвёрку, как проходит процесс подтверждения и зачем встречаться раз в месяц.",
          }}
          second={{
            title: "👥 Структура созвона Четвёрки",
            duration: "4:30",
            caption:
              "Что делать на ежемесячных созвонах: формат, правила, темы и как получить максимум.",
          }}
        />
      )}
    </div>
  );
}

const INSTRUCTION_CARDS: { emoji: string; title: string; text: string; important?: boolean }[] = [
  {
    emoji: "👥👥",
    title: "Что такое Четвёрка",
    text:
      "Четвёрка — это две пары бадди, которые объединяются для ежемесячного созвона. Четыре человека — четыре истории роста — одна общая энергия движения вперёд. Четвёрка доступна только если у тебя уже есть Бадди. Вы заходите как пара и ищете другую пару.",
  },
  {
    emoji: "💎",
    title: "Что даёт Четвёрка",
    text:
      "+2 очка каждый день пока твоя пара состоит в Четвёрке\nЕжемесячный созвон с тремя единомышленниками\nБолее широкий круг поддержки и новые идеи\nСвежий взгляд на твой путь от людей вне твоей пары",
  },
  {
    emoji: "🎯",
    title: "Как найти Четвёрку",
    text:
      "Нажми «Оставить заявку» — укажи удобный день первой недели месяца и время, опишите вашу пару. Или нажми «Выбрать из заявок».\n\nПроцесс подтверждения:\n1. Сначала подтверждает твой бадди\n2. Затем оба участника второй пары\n3. Если все четверо согласны — Четвёрка создана ✅\n4. Если кто-то отказал — приходит уведомление. Можно выбрать другую пару.",
  },
  {
    important: true,
    emoji: "⚠️",
    title: "Как сочетаются созвоны с бадди и Четвёркой",
    text:
      "Созвон с бадди проходит каждую неделю. Но в первую неделю каждого месяца ваш обычный созвон с бадди ЗАМЕНЯЕТСЯ на созвон Четвёркой — он не добавляется сверху.\n\nДругими словами: созвонов в этой неделе всё равно один, просто вместо разговора вдвоём вы встречаетесь вчетвером (вы, ваш бадди и вторая пара).\n\n📅 Как это выглядит по неделям месяца:\n• 1-я неделя — созвон Четвёркой (вместо бадди)\n• 2-я неделя — созвон с бадди\n• 3-я неделя — созвон с бадди\n• 4-я неделя — созвон с бадди\n\nТак что Четвёрка не добавляет нагрузки — она просто один раз в месяц расширяет ваш привычный созвон до четырёх человек.",
  },
  {
    emoji: "📞",
    title: "Формат созвона",
    text:
      "Созвоны проходят в первую неделю месяца.\n\n60 минут:\n— По 10 мин каждый: успехи за месяц, что получилось, что нет\n— 20 мин: все вместе ставят задачи на следующий месяц\n\n☝️ После созвона каждый фиксирует задачи в разделе «Задачи» и скидывает скрин в общий чат Четвёрки. Созвон считается завершённым только после этого.",
  },
  {
    emoji: "💡",
    title: "Рекомендация",
    text:
      "Раз в полгода меняй Четвёрку. Новые партнёры — это новый взгляд на твой путь, другая обратная связь и свежий опыт.",
  },
];

// ───────────────────────── Screen 4: Create request ─────────────────────────

function CreateRequest({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [extra, setExtra] = useState("");
  const [messenger, setMessenger] = useState<"telegram" | "max" | null>(null);
  const valid = !!day && !!time && !!messenger;

  return (
    <div className="px-4 pb-8">
      <PageHeader title="Оставить заявку" onBack={onBack} />
      <p className="text-[13px] text-foreground mb-4 px-1">
        Заявка подаётся от имени вашей пары. Другие пары увидят её в списке.
      </p>

      <div
        className="rounded-2xl p-3.5 mb-4 space-y-2.5"
        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
      >
        <div className="text-[12px] uppercase font-medium" style={{ letterSpacing: 0.5, color: "#15803d" }}>
          Ваша пара
        </div>
        <MemberRow m={ME} />
        <MemberRow m={MY_BUDDY} />
      </div>

      <Card className="p-4 mb-3">
        <div className="text-[14px] font-semibold mb-1">Удобный день</div>
        <div className="text-[11px] text-muted-foreground mb-3">
          Созвон проходит в первую неделю каждого месяца
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <Chip key={d} active={day === d} onClick={() => setDay(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="flex items-baseline gap-2 mb-3">
          <div className="text-[14px] font-semibold">Удобное время</div>
          <div className="text-[11px] text-muted-foreground">по Москве (МСК)</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {HOURS.map((h) => (
            <Chip key={h} active={time === h} onClick={() => setTime(h)}>
              {h}
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-[14px] font-semibold mb-1">Дополнительные комментарии</div>
        <div className="text-[11px] text-muted-foreground mb-3">
          Напишите, в какие ещё дни и часы вы можете созваниваться, в каком сервисе и любые другие важные детали для второй пары
        </div>
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Например: Если первая среда не подойдёт — готовы перенести на первый вторник или четверг (19:00–21:00 МСК)."
          className="w-full bg-card rounded-xl px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
          style={{ minHeight: 90, border: `1px solid ${extra ? "#FF6D00" : "#ede8df"}` }}
        />
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-[14px] font-semibold mb-1">Где будет общий чат Четвёрки?</div>
        <div className="text-[11px] text-muted-foreground mb-3">
          Выберите мессенджер, в котором будут общаться все четыре участника
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["telegram", "max"] as const).map((m) => {
            const active = messenger === m;
            const Icon = m === "telegram" ? TelegramIcon : MaxIcon;
            return (
              <button
                key={m}
                onClick={() => setMessenger(m)}
                className="tap flex items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-medium transition-colors"
                style={{
                  background: active ? "linear-gradient(135deg, #FFB300, #FF6D00)" : "#faf6ef",
                  color: active ? "#fff" : "#3a3527",
                  border: `1px solid ${active ? "transparent" : "#ede8df"}`,
                }}
              >
                <Icon size={18} />
                {m === "telegram" ? "Telegram" : "MAX"}
              </button>
            );
          })}
        </div>
      </Card>

      <button
        disabled={!valid}
        onClick={() =>
          messenger &&
          navigate({ to: "/foursome-chat", search: { messenger } })
        }
        className="tap w-full py-3.5 rounded-2xl text-white text-[14px] font-bold transition"
        style={{
          background: ORANGE_GRADIENT,
          opacity: valid ? 1 : 0.45,
          cursor: valid ? "pointer" : "not-allowed",
        }}
      >
        Продолжить
      </button>
    </div>
  );
}


// ───────────────────────── Screen 5: Browse requests ─────────────────────────

function BrowseRequests({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (req: FoursomeRequest) => void;
}) {
  const [confirming, setConfirming] = useState<FoursomeRequest | null>(null);

  return (
    <div className="px-4 pb-8">
      <PageHeader title="Заявки пар" onBack={onBack} badge={String(DEMO_REQUESTS.length)} />
      <p className="text-[13px] text-muted-foreground mb-4 px-1">
        Выбери пару, которая подходит по времени и духу
      </p>

      <div className="space-y-3">
        {DEMO_REQUESTS.map((req) => (
          <Card key={req.id} className="p-4">
            <div className="space-y-2 mb-3">
              {req.members.map((m) => (
                <div
                  key={m.userId}
                  className="rounded-xl p-2.5"
                  style={{ background: "#FAF6EF" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-[18px] shrink-0">
                      {m.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{m.job}</div>
                    </div>
                  </div>
                  {m.bio && (
                    <p className="text-[12px] text-foreground/80 mt-2" style={{ lineHeight: 1.5 }}>
                      {m.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#fff3e0", color: "#FF6D00" }}
              >
                📅 {DAY_FULL[req.day]}
              </span>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#fff3e0", color: "#FF6D00" }}
              >
                🕐 {req.time} МСК
              </span>
            </div>

            {req.extra && (
              <div
                className="mb-3 rounded-xl p-3 text-[13px]"
                style={{ background: "#fff8ee", border: "1px solid #ffe0a3", lineHeight: 1.5 }}
              >
                <div className="text-[11px] font-bold uppercase mb-1" style={{ color: "#FF6D00", letterSpacing: 0.4 }}>
                  💬 Доп. комментарии
                </div>
                <p className="text-foreground/85">{req.extra}</p>
              </div>
            )}

            <button
              onClick={() => setConfirming(req)}
              className="tap w-full py-2.5 rounded-xl text-white text-[13px] font-bold"
              style={{ background: ORANGE_GRADIENT }}
            >
              Отправить запрос
            </button>
          </Card>
        ))}
      </div>

      {confirming && (
        <ConfirmSheet
          req={confirming}
          onClose={() => setConfirming(null)}
          onConfirm={() => {
            const r = confirming;
            setConfirming(null);
            onConfirm(r);
          }}
        />
      )}
    </div>
  );
}

function ConfirmSheet({
  req,
  onClose,
  onConfirm,
}: {
  req: FoursomeRequest;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />
      <div
        className="relative w-full bg-white rounded-t-3xl p-5 pb-7 animate-slide-up"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 rounded-full" style={{ width: 40, height: 4, background: "#ede8df" }} />
        <div className="text-center mb-3">
          <div className="text-[40px] leading-none mb-2">👥👥</div>
          <h3 className="text-[17px] font-bold">Отправить запрос паре?</h3>
          <p className="text-[13px] text-muted-foreground mt-1">Оба участника получат уведомление</p>
        </div>

        <div className="rounded-2xl p-3.5 space-y-2.5 mb-3" style={{ background: "#FAF6EF" }}>
          {req.members.map((m) => (
            <MemberRow key={m.userId} m={m} />
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#fff3e0", color: "#FF6D00" }}
            >
              📅 {DAY_FULL[req.day]}
            </span>
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#fff3e0", color: "#FF6D00" }}
            >
              🕐 {req.time} МСК
            </span>
          </div>
        </div>

        {req.extra && (
          <div
            className="rounded-2xl p-3.5 mb-3 text-[13px]"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3", lineHeight: 1.5 }}
          >
            <div className="text-[11px] font-bold uppercase mb-1" style={{ color: "#FF6D00", letterSpacing: 0.4 }}>
              💬 Доп. комментарии
            </div>
            <p className="text-foreground/85">{req.extra}</p>
          </div>
        )}

        <p className="text-[13px] text-muted-foreground text-center mb-4 px-2" style={{ lineHeight: 1.5 }}>
          Сначала подтвердит твой бадди, затем оба участника пары. Если все согласны — Четвёрка создана ✅
        </p>

        <button
          onClick={onConfirm}
          className="tap w-full py-3.5 rounded-2xl text-white text-[14px] font-bold mb-2"
          style={{ background: ORANGE_GRADIENT }}
        >
          ✅ Отправить запрос
        </button>
        <button
          onClick={onClose}
          className="tap w-full py-3 rounded-2xl text-[14px] text-muted-foreground"
          style={{ border: "1px solid #ede8df", background: "transparent" }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── Screen 6: Waiting ─────────────────────────

// Входящие заявки от пар (демо)
const INCOMING_FOURSOME_REQUESTS: Array<{
  req: FoursomeRequest;
  // Кто из тройки уже подтвердил (помимо тебя). Возможные id: "theirA","theirB","myBuddy"
  confirmed: Array<"theirA" | "theirB" | "myBuddy">;
  note: string;
}> = [
  {
    req: DEMO_REQUESTS[1],
    confirmed: ["theirA"],
    note: "Их бадди уже подтвердил. Ждут тебя и твоего бадди.",
  },
  {
    req: DEMO_REQUESTS[2],
    confirmed: ["theirA", "theirB", "myBuddy"],
    note: "Все трое уже подтвердили. Ждут только твоего решения.",
  },
];

function Waiting({ to, onBack }: { to: FoursomeRequest; onBack: () => void }) {
  const [incoming, setIncoming] = useState(INCOMING_FOURSOME_REQUESTS);
  const [accepted, setAccepted] = useState<FoursomeRequest | null>(null);

  const decline = (id: string) => setIncoming((prev) => prev.filter((x) => x.req.id !== id));
  const accept = (req: FoursomeRequest) => {
    setAccepted(req);
    setIncoming([]);
  };

  return (
    <div className="px-4 pb-8">
      <PageHeader title="Ожидание" onBack={onBack} />

      {accepted ? (
        <div className="text-center pt-4 pb-5 animate-fade-up">
          <div className="text-[56px] leading-none">🎉</div>
          <h2 className="mt-3 text-[18px] font-bold">Четвёрка собрана!</h2>
          <p className="mt-2 text-[14px] text-muted-foreground leading-snug max-w-[320px] mx-auto">
            Ты подтвердил пару {accepted.members.map((m) => m.name).join(" и ")}. Согласуйте первый созвон в чате.
          </p>
        </div>
      ) : (
        <div className="text-center pt-4 pb-5 animate-fade-up">
          <div className="text-[56px] leading-none">⏳</div>
          <h2 className="mt-3 text-[18px] font-bold">Сейчас твоя очередь ответить</h2>
          <p className="mt-2 text-[14px] text-muted-foreground leading-snug max-w-[320px] mx-auto">
            На твою заявку откликнулись {incoming.length} пары. Подтверди подходящую — четвёрка соберётся сразу после твоего ответа.
          </p>
        </div>
      )}

      {/* Твоя заявка */}
      <h3 className="mt-2 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        Твоя заявка
      </h3>
      <Card className="p-3.5">
        <div className="space-y-2">
          {to.members.map((m) => (
            <MemberRow key={m.userId} m={m} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-border/50">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#fff3e0", color: "#FF6D00" }}>
            📅 {DAY_FULL[to.day]}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#fff3e0", color: "#FF6D00" }}>
            🕐 {to.time} МСК
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full ml-auto" style={{ background: "#fff8dc", color: "#b45309" }}>
            Ожидание
          </span>
        </div>
      </Card>

      {/* Входящие заявки */}
      {incoming.length > 0 && (
        <>
          <div className="mt-5 flex items-center justify-between px-1 mb-2">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Запросы на твою заявку
            </h3>
            <span
              className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full"
              style={{ background: ORANGE_GRADIENT }}
            >
              {incoming.length}
            </span>
          </div>
          <p className="px-1 text-[12px] text-muted-foreground mb-3 leading-snug">
            Эти пары хотят встать с вами в четвёрку. Подтверди подходящую или отклони.
          </p>

          <div className="space-y-3">
            {incoming.map((item) => (
              <IncomingFoursomeCard
                key={item.req.id}
                req={item.req}
                confirmed={item.confirmed}
                note={item.note}
                onAccept={() => accept(item.req)}
                onDecline={() => decline(item.req.id)}
              />
            ))}
          </div>
        </>
      )}

      <button
        onClick={onBack}
        className="tap mt-6 w-full py-3.5 rounded-2xl text-[14px] font-semibold"
        style={{ background: "#FAF6EF", color: "#FF6D00", border: "1px solid #ede8df" }}
      >
        Вернуться назад
      </button>
    </div>
  );
}

function IncomingFoursomeCard({
  req,
  confirmed,
  note,
  onAccept,
  onDecline,
}: {
  req: FoursomeRequest;
  confirmed: Array<"theirA" | "theirB" | "myBuddy">;
  note: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  // 4 участника: их пара (theirA, theirB), мой бадди (myBuddy), я (me)
  const status = (key: "theirA" | "theirB" | "myBuddy" | "me") => {
    if (key === "me") return "wait"; // решение пользователя сейчас
    return confirmed.includes(key as any) ? "ok" : "wait";
  };
  const totalConfirmed = confirmed.length;
  const allButMe = totalConfirmed === 3;

  return (
    <div className="bg-card hairline shadow-card rounded-2xl overflow-hidden animate-fade-up">
      {/* Шапка: дата/время созвона */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg, #fff8ee, #ffeacc)", borderBottom: "1px solid #ffe0a3" }}
      >
        <Calendar className="h-4 w-4" style={{ color: "#FF6D00" }} />
        <span className="text-[13px] font-bold" style={{ color: "#b45309" }}>
          {DAY_FULL[req.day] ?? req.day} · {req.time}
        </span>
      </div>

      <div className="p-4">
        {/* Раздел 1 — Их пара */}
        <SectionLabel>Их пара</SectionLabel>
        <div className="space-y-2.5">
          {req.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3">
              <div
                className="h-10 w-10 shrink-0 rounded-[12px] flex items-center justify-center text-[20px]"
                style={{ background: "#FAF6EF" }}
              >
                {m.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold leading-tight truncate">{m.name}</div>
                <div className="text-[12px] text-muted-foreground truncate">{m.job}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Раздел 2 — О себе */}
        <div className="mt-4">
          <SectionLabel>О себе</SectionLabel>
          <div className="rounded-[12px] p-3 text-[13px] space-y-2" style={{ background: "#FAF6EF", lineHeight: 1.55 }}>
            {req.members.map((m) => (
              <p key={m.userId}>
                <span className="font-semibold">{m.name}:</span> {m.bio}
              </p>
            ))}
          </div>
        </div>

        {/* Раздел 3 — Статус подтверждений */}
        <div className="mt-4">
          <SectionLabel>Статус подтверждений</SectionLabel>
          <div className="rounded-[12px] p-3 space-y-1.5" style={{ background: "#fff", border: "1px solid #ede8df" }}>
            <ConfirmRow label={`${req.members[0].name} (их пара)`} ok={status("theirA") === "ok"} />
            <ConfirmRow label={`${req.members[1].name} (их пара)`} ok={status("theirB") === "ok"} />
            <ConfirmRow label="Твой бадди (Алексей)" ok={status("myBuddy") === "ok"} />
            <div className="my-1 h-px" style={{ background: "#f1ebe0" }} />
            <ConfirmRow label="Ты — твоё решение" ok={false} pending />
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground leading-snug px-1">{note}</p>
        </div>

        {/* Действия */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onAccept}
            className="tap rounded-xl py-3 text-[13px] font-bold text-white inline-flex items-center justify-center gap-1.5"
            style={{ background: ORANGE_GRADIENT, boxShadow: "0 4px 14px rgba(255,109,0,0.35)" }}
          >
            <Check className="h-4 w-4" /> Подтвердить
          </button>
          <button
            onClick={onDecline}
            className="tap rounded-xl py-3 text-[13px] font-medium inline-flex items-center justify-center gap-1.5"
            style={{ background: "transparent", border: "1px solid #ede8df", color: "var(--muted-foreground)" }}
          >
            <X className="h-4 w-4" /> Отклонить
          </button>
        </div>

        <a
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="tap mt-2 w-full rounded-xl py-3 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5"
          style={{ background: "#FAF6EF", color: "#FF6D00", border: "1px solid #ede8df" }}
        >
          <Send className="h-4 w-4" /> Написать в мессенджере
        </a>
      </div>
    </div>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return ok ? (
    <span
      className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0"
      style={{ background: "#e8f5e9", color: "#2e7d32" }}
    >
      <Check className="h-3 w-3" /> ✓
    </span>
  ) : (
    <span
      className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
      style={{ background: "#fff8dc", color: "#b45309" }}
    >
      ждём
    </span>
  );
}

function ConfirmRow({ label, ok, pending }: { label: string; ok: boolean; pending?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px]">
      <span
        className="h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
        style={
          ok
            ? { background: "#2e7d32", color: "#fff" }
            : pending
              ? { background: "#FF6D00", color: "#fff" }
              : { background: "#fff", color: "#b45309", border: "1px solid #ffd28a" }
        }
      >
        {ok ? "✓" : pending ? "?" : "…"}
      </span>
      <span
        className="truncate"
        style={{ color: ok ? "#2e7d32" : pending ? "#b45309" : "var(--muted-foreground)", fontWeight: pending ? 700 : 500 }}
      >
        {label}
      </span>
    </div>
  );
}

function StepRow({ n, title, sub, active }: { n: number; title: string; sub: string; active?: boolean }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl"
      style={
        active
          ? { background: "#fff8dc", border: "1px solid #f59e0b" }
          : { background: "#FAF6EF", border: "1px solid #ede8df" }
      }
    >
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
        style={
          active
            ? { background: "#f59e0b", color: "#fff" }
            : { background: "#fff", color: "#8a8a8a", border: "1px solid #ede8df" }
        }
      >
        {n}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold" style={{ color: active ? "#b45309" : undefined }}>
          {title}
        </div>
        <div className="text-[12px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

// ───────────────────────── Screen 7: Has foursome ─────────────────────────

function HasFoursome({ data, onBack }: { data: FoursomeData; onBack: () => void }) {
  return (
    <div className="px-4 pb-8">
      <PageHeader title="Моя Четвёрка" onBack={onBack} />

      {/* Bonus banner */}
      <div
        className="rounded-2xl p-4 mb-4 flex items-center gap-3"
        style={{ background: LIME_GRADIENT, color: "#fff" }}
      >
        <Zap className="h-7 w-7 shrink-0" />
        <div className="flex-1">
          <div className="text-[15px] font-bold">+2 очка каждый день активны!</div>
          <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>
            Пока твоя пара состоит в Четвёрке
          </div>
        </div>
      </div>

      {/* Next call */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
      >
        <div
          className="text-[12px] uppercase font-medium mb-1"
          style={{ letterSpacing: 0.5, color: "#FF6D00" }}
        >
          Следующий созвон
        </div>
        <div className="text-[16px] font-bold" style={{ color: "#FF6D00" }}>
          📅 {DAY_FULL[data.day]} · {data.time} МСК
        </div>
        <div className="text-[12px] text-muted-foreground mt-1">Яндекс Телемост · 60 минут</div>
      </div>

      {/* Foursome composition */}
      <Card className="p-4 mb-4">
        <div className="text-[12px] uppercase font-medium mb-2.5" style={{ letterSpacing: 0.5, color: "#FF6D00" }}>
          Пара 1 · Ваша пара
        </div>
        <div className="space-y-2.5">
          {data.pair1.members.map((m) => (
            <MemberRow key={m.userId} m={m} />
          ))}
        </div>

        <div className="my-4" style={{ borderTop: "1px solid #ede8df" }} />

        <div className="text-[12px] uppercase font-medium mb-2.5" style={{ letterSpacing: 0.5, color: "#FF6D00" }}>
          Пара 2
        </div>
        <div className="space-y-2.5">
          {data.pair2.members.map((m) => (
            <MemberRow key={m.userId} m={m} withMessage />
          ))}
        </div>
      </Card>

      {/* Format */}
      <Card className="p-4">
        <SectionLabel>Формат созвона · 60 минут</SectionLabel>
        <FormatRow lime time="10 мин" text="Первый участник делится успехами за месяц" />
        <FormatRow lime time="10 мин" text="Второй участник делится успехами за месяц" />
        <FormatRow lime time="10 мин" text="Третий участник делится успехами за месяц" />
        <FormatRow lime time="10 мин" text="Четвёртый участник делится успехами за месяц" />
        <FormatRow lime time="20 мин" text="Все ставят задачи на следующий месяц" />
      </Card>
    </div>
  );
}
