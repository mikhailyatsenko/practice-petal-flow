import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, BookOpen, Play, Zap, MessageCircle, Check, X } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { HowVideoCards } from "@/components/section/HowVideoCards";

export const Route = createFileRoute("/_app/buddy")({
  validateSearch: (search: Record<string, unknown>): { demo?: "has" | "waiting" } => {
    const d = search.demo;
    return d === "has" || d === "waiting" ? { demo: d } : {};
  },
  head: () => ({
    meta: [
      { title: "Бадди — Клуб «Моя жизнь»" },
      { name: "description", content: "Найди партнёра для еженедельных созвонов и получай +2 очка каждый день." },
    ],
  }),
  component: BuddyScreen,
});

// ───────────────────────── Types & demo data ─────────────────────────

interface BuddyRequest {
  id: string;
  name: string;
  avatar: string;
  job: string;
  day: string;
  time: string;
  bio: string;
  extra?: string;
}

type Screen =
  | { name: "no_buddy" }
  | { name: "instructions" }
  | { name: "create_request" }
  | { name: "browse_requests" }
  | { name: "waiting"; to: BuddyRequest }
  | { name: "has_buddy" };

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

const DEMO_REQUESTS: BuddyRequest[] = [
  {
    id: "1",
    name: "Анна",
    avatar: "🌸",
    job: "Маркетолог",
    day: "Ср",
    time: "19:00",
    bio: "Запускаю свой бренд косметики. Ищу партнёра, с которым будем держать друг друга в фокусе и без откладываний.",
    extra: "Если среда не подойдёт — могу также во вторник или четверг с 18:00 до 21:00 МСК. По выходным занята. Созваниваюсь через Яндекс Телемост.",
  },
  {
    id: "2",
    name: "Дмитрий",
    avatar: "🎯",
    job: "Предприниматель",
    day: "Пт",
    time: "10:00",
    bio: "Развиваю IT-агентство, цель — выйти на 1М/мес. Хочу системного бадди, кто умеет ставить чёткие задачи.",
    extra: "Кроме пятницы свободен в понедельник и среду утром (09:00–12:00 МСК). Прошу не опаздывать — у меня плотный график.",
  },
  {
    id: "3",
    name: "Мария",
    avatar: "✨",
    job: "Коуч",
    day: "Вт",
    time: "20:00",
    bio: "Веду частную практику, расту в личном бренде. Ищу человека на длинную дистанцию, без воды.",
    extra: "Запасные слоты: четверг 19:00–21:00, суббота утром 10:00–12:00 МСК. Готова созваниваться через Zoom или Telemost.",
  },
  {
    id: "4",
    name: "Игорь",
    avatar: "🚀",
    job: "Фрилансер · дизайн",
    day: "Сб",
    time: "12:00",
    bio: "Перехожу из найма во фриланс, выстраиваю поток клиентов. Готов делиться прогрессом каждую неделю.",
    extra: "Помимо субботы могу в воскресенье днём и по будням после 20:00 МСК. Часовой пояс — Москва.",
  },
];

// Демо-бадди (Экран 6)
const DEMO_BUDDY: BuddyRequest = {
  id: "b1",
  name: "Алексей",
  avatar: "🧑‍💻",
  job: "Продакт-менеджер",
  day: "Чт",
  time: "20:00",
  bio: "Развиваю продукт в финтехе, цель года — вырасти в директора. Ценю чёткость и регулярность.",
};

// ───────────────────────── Root ─────────────────────────

function BuddyScreen() {
  const { demo } = Route.useSearch();
  const initial: Screen =
    demo === "has"
      ? { name: "has_buddy" }
      : demo === "waiting"
        ? { name: "waiting", to: DEMO_REQUESTS[0] }
        : { name: "no_buddy" };
  const [screen, setScreen] = useState<Screen>(initial);
  const lastDemo = useRef(demo);
  useEffect(() => {
    if (lastDemo.current !== demo) {
      lastDemo.current = demo;
      setScreen(initial);
    }
  }, [demo]);

  switch (screen.name) {
    case "no_buddy":
      return <NoBuddy onNavigate={setScreen} />;
    case "instructions":
      return <Instructions onBack={() => setScreen({ name: "no_buddy" })} />;
    case "create_request":
      return (
        <CreateRequest
          onBack={() => setScreen({ name: "no_buddy" })}
          onSubmit={() => setScreen({ name: "waiting", to: DEMO_REQUESTS[0] })}
        />
      );
    case "browse_requests":
      return (
        <BrowseRequests
          onBack={() => setScreen({ name: "no_buddy" })}
          onConfirm={(req) => setScreen({ name: "waiting", to: req })}
        />
      );
    case "waiting":
      return <Waiting to={screen.to} onBack={() => setScreen({ name: "no_buddy" })} />;
    case "has_buddy":
      return <HasBuddy onBack={() => setScreen({ name: "no_buddy" })} buddy={DEMO_BUDDY} />;
  }
}

// ───────────────────────── Shared header ─────────────────────────

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
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ───────────────────────── Screen 1: No buddy ─────────────────────────

function NoBuddy({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const navigate = useNavigate();
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");
  return (
    <div className="px-4 pb-6">
      <PageHeader title="Бадди" onBack={() => navigate({ to: "/community" })} />

      {/* Hero */}
      <div className="text-center pt-3 pb-5 animate-fade-up">
        <div className="text-[56px] leading-none">🔍</div>
        <h2 className="mt-3 text-[18px] font-bold">У тебя пока нет Бадди</h2>
        <p className="mt-2 text-[13px] text-muted-foreground leading-snug max-w-[300px] mx-auto">
          Найди партнёра для еженедельных созвонов и получай{" "}
          <span style={{ color: "#FF6D00", fontWeight: 600 }}>+2 очка каждый день</span>
        </p>
      </div>

      {/* Bonus banner */}
      <div
        className="rounded-2xl p-3.5 flex items-center gap-3 animate-fade-up"
        style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
      >
        <Zap className="h-7 w-7 shrink-0" style={{ color: "#FF6D00" }} fill="#FF6D00" />
        <div className="min-w-0">
          <p className="text-[14px] font-bold leading-tight" style={{ color: "#FF6D00" }}>
            +2 очка каждый день
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">Пока у тебя есть активный Бадди</p>
        </div>
      </div>

      {/* Two ways */}
      <h3 className="mt-5 px-1 text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        Два способа найти Бадди
      </h3>
      <div className="space-y-2">
        <ActionCard
          emoji="✍️"
          title="Оставить заявку"
          subtitle="Расскажи о себе, и тебя найдут"
          onClick={() => onNavigate({ name: "create_request" })}
        />
        <ActionCard
          emoji="🔍"
          title="Выбрать из заявок"
          subtitle="Просмотри анкеты других участников"
          onClick={() => onNavigate({ name: "browse_requests" })}
          rightBadge={String(DEMO_REQUESTS.length)}
        />
      </div>

      {/* Format */}
      <h3 className="mt-5 px-1 text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        Формат созвона · 60 минут
      </h3>
      <div className="rounded-2xl bg-card hairline shadow-card p-4 space-y-3 animate-fade-up">
        <FormatRow time="20 мин" text="Ты делишься успехами за неделю" />
        <FormatRow time="20 мин" text="Партнёр делится своими успехами" />
        <FormatRow time="20 мин" text="Вместе ставите задачи на неделю" />
      </div>

      {/* How it works — inline collapsible */}
      <section className="mt-4">
        <button
          onClick={() => setHowOpen((v) => !v)}
          className="tap w-full bg-card hairline shadow-card rounded-2xl px-4 py-3.5 flex items-center gap-3"
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
                      background: active ? "linear-gradient(135deg, #FFB300, #FF6D00)" : "transparent",
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
                  <div key={i} className="bg-card hairline shadow-card rounded-2xl p-4 animate-fade-up">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[20px]">{c.emoji}</span>
                      <h3 className="text-[14px] font-bold">{c.title}</h3>
                    </div>
                    <p className="text-[13px] text-foreground/85 whitespace-pre-line" style={{ lineHeight: 1.65 }}>
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <HowVideoCards
                first={{
                  title: "🎬 Что такое Бадди и как это работает",
                  duration: "5:00",
                  caption:
                    "Подробно: как работает раздел, как найти хорошего бадди, правила созвонов и зачем это нужно.",
                }}
                second={{
                  title: "🤝 Как получить максимум от партнёрства",
                  duration: "4:20",
                  caption:
                    "Структура созвона, темы для обсуждения и частые ошибки бадди-пар.",
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
  onClick,
  rightBadge,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  rightBadge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="tap w-full bg-card hairline rounded-2xl px-3.5 py-3 shadow-card flex items-center gap-3 text-left animate-fade-up"
    >
      <div className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-[22px]" style={{ background: "rgba(255,138,0,0.12)" }}>
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>
        <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">{subtitle}</p>
      </div>
      {rightBadge ? (
        <span
          className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          {rightBadge}
        </span>
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
    </button>
  );
}

function FormatRow({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full shrink-0"
        style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
      >
        {time}
      </span>
      <span className="text-[13px] leading-snug">{text}</span>
    </div>
  );
}

function FormatRowGreen({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full shrink-0"
        style={{ background: "linear-gradient(135deg, #8BC34A, #4CAF50)" }}
      >
        {time}
      </span>
      <span className="text-[13px] leading-snug">{text}</span>
    </div>
  );
}

// ───────────────────────── Screen 2: Instructions ─────────────────────────

const INSTRUCTION_CARDS = [
  {
    emoji: "👥",
    title: "Что такое Бадди",
    text: "Есть вещи, которые сложно сделать в одиночку. Не потому что не хватает силы воли — а потому что рядом нет человека, который видит твой путь, поддерживает в трудные моменты и держит тебя в тонусе.\n\nБадди — партнёр, с которым ты созваниваешься каждую неделю. Вы обсуждаете цели, задачи, прогресс и поддерживаете друг друга.",
  },
  {
    emoji: "💎",
    title: "Что даёт Бадди",
    text: "+2 очка каждый день пока у тебя есть бадди\nЕженедельная поддержка и ответственность перед партнёром\nСвидетель твоих побед и прогресса",
  },
  {
    emoji: "🎯",
    title: "Как найти Бадди",
    text: "Нажми «Оставить заявку» — укажи удобный день недели и время, напиши о себе. Твоя заявка появится в списке и другой участник сможет к тебе присоединиться.\n\nИли нажми «Выбрать из заявок» — просмотри анкеты других участников и выбери того, кто подходит по времени и духу.\n\nКак только бадди найден — каждый день автоматически начисляется +2 очка.",
  },
  {
    emoji: "📞",
    title: "Формат созвона",
    text: "Созвоны проходят каждую неделю в согласованный день и время. Рекомендуем Яндекс Телемост — бесплатный и надёжный.\n\n60 минут:\n— 20 мин: первый рассказывает успехи за неделю\n— 20 мин: меняетесь ролями\n— 20 мин: вместе ставите задачи на следующую неделю\n\n☝️ После созвона каждый фиксирует задачи в разделе «Задачи» клуба и сразу скидывает скрин партнёру. Созвон считается завершённым только после того как оба скинули скрины. «Скину позже» — не принимается.",
  },
  {
    emoji: "💡",
    title: "Рекомендация",
    text: "Раз в полгода меняй бадди. Новый партнёр — это новый взгляд на твой путь, другая обратная связь и свежий опыт. Это помогает расти быстрее и не застревать в одной точке зрения.",
  },
];

function Instructions({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"text" | "video">("text");
  return (
    <div className="px-4 pb-6">
      <PageHeader title="Как работает раздел" onBack={onBack} />

      {/* Tabs */}
      <div className="bg-card hairline shadow-card rounded-full p-1 flex gap-1 mb-4">
        {(["text", "video"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="tap flex-1 rounded-full py-2 text-[13px] font-medium transition-colors"
              style={
                active
                  ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                  : { color: "var(--muted-foreground)", background: "transparent" }
              }
            >
              {t === "text" ? "📖 Текст" : "▶️ Видео"}
            </button>
          );
        })}
      </div>

      {tab === "text" ? (
        <div className="space-y-3">
          {INSTRUCTION_CARDS.map((c, i) => (
            <div key={i} className="bg-card hairline shadow-card rounded-2xl p-4 animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[20px]">{c.emoji}</span>
                <h3 className="text-[14px] font-bold">{c.title}</h3>
              </div>
              <p className="text-[13px] text-foreground/85 whitespace-pre-line" style={{ lineHeight: 1.65 }}>
                {c.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <HowVideoCards
          first={{
            title: "🎬 Что такое Бадди и как это работает",
            duration: "5:00",
            caption:
              "Подробно: как работает раздел, как найти хорошего бадди, правила созвонов и зачем это нужно.",
          }}
          second={{
            title: "🤝 Как получить максимум от партнёрства",
            duration: "4:20",
            caption:
              "Структура созвона, темы для обсуждения и частые ошибки бадди-пар.",
          }}
        />
      )}
    </div>
  );
}

// ───────────────────────── Screen 3: Create request ─────────────────────────

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="tap text-[13px] font-medium rounded-full px-3.5 py-1.5 transition-colors"
      style={
        active
          ? {
              background: "#fff3e0",
              color: "#FF6D00",
              border: "1px solid #FF6D00",
              fontWeight: 700,
            }
          : {
              background: "#fff",
              color: "var(--foreground)",
              border: "1px solid #ede8df",
            }
      }
    >
      {label}
    </button>
  );
}

function CreateRequest({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [job, setJob] = useState("");
  const [bio, setBio] = useState("");
  const [extra, setExtra] = useState("");

  const valid = !!day && !!time && job.trim().length > 1 && bio.trim().length > 20;

  return (
    <div className="px-4 pb-8">
      <PageHeader title="Оставить заявку" onBack={onBack} />
      <p className="text-[13px] text-muted-foreground -mt-2 mb-4 px-1">
        Заполни анкету — другие участники смогут найти тебя
      </p>

      <div className="space-y-5">
        {/* Day */}
        <div>
          <h3 className="text-[14px] font-semibold mb-2">Удобный день для созвона</h3>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <Chip key={d} label={d} active={day === d} onClick={() => setDay(d)} />
            ))}
          </div>
        </div>

        {/* Time */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-[14px] font-semibold">Удобное время</h3>
            <span className="text-[11px] text-muted-foreground">по Москве (МСК)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {HOURS.map((h) => (
              <Chip key={h} label={h} active={time === h} onClick={() => setTime(h)} />
            ))}
          </div>
        </div>

        {/* Job */}
        <div>
          <h3 className="text-[14px] font-semibold mb-2">Вид деятельности</h3>
          <input
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Например: Предприниматель, фрилансер, маркетолог..."
            className="w-full bg-card rounded-xl px-3.5 py-3 text-[14px] outline-none transition-colors"
            style={{ border: `1px solid ${job ? "#FF6D00" : "#ede8df"}` }}
          />
        </div>

        {/* Bio */}
        <div>
          <h3 className="text-[14px] font-semibold">Расскажи о себе</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 mb-2">
            Кто ты, чем живёшь, что вдохновляет, какие у тебя цели
          </p>
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Например: Развиваю онлайн-школу, хочу выйти на 500к/мес."
              className="w-full bg-card rounded-xl px-3.5 py-3 pb-7 text-[14px] outline-none transition-colors resize-none"
              style={{ minHeight: 120, border: `1px solid ${bio ? "#FF6D00" : "#ede8df"}` }}
            />
            <span className="absolute right-3 bottom-2 text-[11px] text-muted-foreground">
              {bio.length} символов
            </span>
          </div>
        </div>


        {/* Extra comments */}
        <div>
          <h3 className="text-[14px] font-semibold">Дополнительные комментарии</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 mb-2">
            Напиши, в какие ещё дни и часы тебе удобно созваниваться, в каком мессенджере, и любые другие важные моменты
          </p>
          <div className="relative">
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Например: Кроме среды свободна во вторник и четверг с 18:00 до 21:00 МСК. Созваниваюсь через Яндекс Телемост."
              className="w-full bg-card rounded-xl px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
              style={{ minHeight: 90, border: `1px solid ${extra ? "#FF6D00" : "#ede8df"}` }}
            />
          </div>
        </div>

        <button
          disabled={!valid}
          onClick={() => valid && onSubmit()}
          className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #FFB300, #FF6D00)",
            opacity: valid ? 1 : 0.45,
            cursor: valid ? "pointer" : "not-allowed",
            boxShadow: valid ? "0 6px 20px rgba(255,109,0,0.40)" : "none",
          }}
        >
          Опубликовать заявку
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── Screen 4: Browse requests ─────────────────────────

function BrowseRequests({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (req: BuddyRequest) => void;
}) {
  const [selected, setSelected] = useState<BuddyRequest | null>(null);

  return (
    <div className="px-4 pb-6">
      <PageHeader title="Заявки участников" onBack={onBack} badge={String(DEMO_REQUESTS.length)} />
      <p className="text-[13px] text-muted-foreground -mt-2 mb-4 px-1">
        Выбери того, кто подходит по времени и целям
      </p>

      <div className="space-y-3">
        {DEMO_REQUESTS.map((r) => (
          <RequestCard key={r.id} req={r} onSend={() => setSelected(r)} />
        ))}
      </div>

      {selected && (
        <ConfirmSheet
          req={selected}
          onClose={() => setSelected(null)}
          onConfirm={() => {
            const r = selected;
            setSelected(null);
            onConfirm(r);
          }}
        />
      )}
    </div>
  );
}

function RequestCard({ req, onSend }: { req: BuddyRequest; onSend: () => void }) {
  return (
    <div className="bg-card hairline shadow-card rounded-2xl p-3.5 animate-fade-up">
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-[14px] flex items-center justify-center text-[24px]"
          style={{ background: "#FAF6EF" }}
        >
          {req.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold leading-tight">{req.name}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{req.job}</p>
        </div>
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: "#fff3e0", color: "#FF6D00" }}
        >
          {req.day} · {req.time}
        </span>
      </div>

      <div
        className="mt-3 rounded-[10px] p-3 text-[13px]"
        style={{ background: "#FAF6EF", lineHeight: 1.5 }}
      >
        {req.bio}
      </div>

      {req.extra && (
        <div
          className="mt-2 rounded-[10px] p-3 text-[13px]"
          style={{ background: "#fff8ee", border: "1px solid #ffe0a3", lineHeight: 1.5 }}
        >
          <div className="text-[11px] font-bold uppercase mb-1" style={{ color: "#FF6D00", letterSpacing: 0.4 }}>
            💬 Доп. комментарии
          </div>
          <p className="text-foreground/85">{req.extra}</p>
        </div>
      )}

      <button
        onClick={onSend}
        className="tap mt-3 w-full rounded-xl py-2.5 text-[13px] font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
        }}
      >
        Отправить запрос
      </button>
    </div>
  );
}

function ConfirmSheet({
  req,
  onClose,
  onConfirm,
}: {
  req: BuddyRequest;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/45 animate-fade-up"
        style={{ animationDuration: "200ms" }}
      />
      {/* Sheet */}
      <div
        className="relative w-full max-w-md bg-card rounded-t-[24px] p-5 pb-7 animate-fade-up"
        style={{ animationDuration: "260ms", boxShadow: "0 -10px 40px rgba(0,0,0,0.18)" }}
      >
        <div className="mx-auto mb-4" style={{ width: 40, height: 4, borderRadius: 2, background: "#ede8df" }} />

        <div className="flex flex-col items-center text-center">
          <div
            className="h-16 w-16 rounded-[18px] flex items-center justify-center text-[32px]"
            style={{ background: "#FAF6EF" }}
          >
            {req.avatar}
          </div>
          <h3 className="mt-3 text-[18px] font-bold">{req.name}</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {req.job} · {req.day} в {req.time}
          </p>
        </div>

        <div
          className="mt-4 rounded-xl p-3 text-[13px]"
          style={{ background: "#FAF6EF", lineHeight: 1.5 }}
        >
          {req.bio}
        </div>

        {req.extra && (
          <div
            className="mt-2 rounded-xl p-3 text-[13px]"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3", lineHeight: 1.5 }}
          >
            <div className="text-[11px] font-bold uppercase mb-1" style={{ color: "#FF6D00", letterSpacing: 0.4 }}>
              💬 Доп. комментарии
            </div>
            <p className="text-foreground/85">{req.extra}</p>
          </div>
        )}

        <p className="text-[13px] text-muted-foreground text-center mt-4 leading-snug">
          Отправить запрос на партнёрство? {req.name} получит уведомление и сможет принять или отклонить.
        </p>

        <div className="mt-4 space-y-2">
          <button
            onClick={onConfirm}
            className="tap w-full rounded-2xl py-3.5 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #FFB300, #FF6D00)",
              boxShadow: "0 6px 20px rgba(255,109,0,0.40)",
            }}
          >
            <Check className="h-4 w-4" /> Отправить запрос
          </button>
          <button
            onClick={onClose}
            className="tap w-full rounded-2xl py-3 text-[14px] font-medium inline-flex items-center justify-center gap-2"
            style={{ background: "transparent", border: "1px solid #ede8df", color: "var(--muted-foreground)" }}
          >
            <X className="h-4 w-4" /> Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Screen 5: Waiting ─────────────────────────

function Waiting({ to, onBack }: { to: BuddyRequest; onBack: () => void }) {
  return (
    <div className="px-4 pb-6">
      <PageHeader title="Бадди" onBack={onBack} />

      <div className="text-center pt-4 pb-5 animate-fade-up">
        <div className="text-[56px] leading-none">⏳</div>
        <h2 className="mt-3 text-[18px] font-bold">Запрос отправлен!</h2>
        <p className="mt-2 text-[14px] text-muted-foreground leading-snug max-w-[300px] mx-auto">
          Ждём подтверждения от {to.name}. Придёт уведомление, когда он ответит.
        </p>
      </div>

      <div className="bg-card hairline shadow-card rounded-2xl p-3.5 animate-fade-up">
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 shrink-0 rounded-[14px] flex items-center justify-center text-[24px]"
            style={{ background: "#FAF6EF" }}
          >
            {to.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold leading-tight">{to.name}</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {to.job} · {to.day} {to.time}
            </p>
          </div>
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: "#fff8dc", color: "#b45309" }}
          >
            Ожидание
          </span>
        </div>
      </div>

      <button
        onClick={onBack}
        className="tap mt-4 w-full rounded-2xl py-3.5 text-[14px] font-bold"
        style={{
          background: "#FAF6EF",
          color: "#FF6D00",
          border: "1px solid #ede8df",
        }}
      >
        Вернуться назад
      </button>
    </div>
  );
}

// ───────────────────────── Screen 6: Has buddy ─────────────────────────

function HasBuddy({ buddy, onBack }: { buddy: BuddyRequest; onBack: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="px-4 pb-6">
      <PageHeader title="Мой Бадди" onBack={() => navigate({ to: "/community" })} />

      {/* Active bonus banner */}
      <div
        className="rounded-2xl p-4 flex items-center gap-3 animate-fade-up"
        style={{ background: "linear-gradient(135deg, #8BC34A, #4CAF50)" }}
      >
        <Zap className="h-8 w-8 shrink-0 text-white" fill="#fff" />
        <div className="min-w-0 text-white">
          <p className="text-[15px] font-bold leading-tight">+2 очка каждый день активны!</p>
          <p className="text-[12px] opacity-85 mt-0.5">Пока у тебя есть Бадди</p>
        </div>
      </div>

      {/* Buddy card */}
      <div className="mt-4 bg-card hairline shadow-card rounded-2xl p-4 animate-fade-up">
        <div className="flex items-center gap-3">
          <div
            className="h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center text-[28px]"
            style={{ background: "#FAF6EF" }}
          >
            {buddy.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-bold leading-tight">{buddy.name}</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {buddy.job} · @{buddy.name.toLowerCase()}
            </p>
            <p className="text-[12px] font-bold mt-1" style={{ color: "#FF6D00" }}>
              📅 {buddy.day} · {buddy.time}
            </p>
          </div>
        </div>

        <div
          className="mt-3 rounded-[10px] p-3 text-[13px]"
          style={{ background: "#FAF6EF", lineHeight: 1.5 }}
        >
          {buddy.bio}
        </div>

        <button
          className="tap mt-3 w-full rounded-2xl py-3 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #8BC34A, #4CAF50)",
            boxShadow: "0 6px 20px rgba(76,175,80,0.35)",
          }}
        >
          <MessageCircle className="h-4 w-4" /> Написать в Telegram
        </button>
      </div>

      {/* Format */}
      <h3 className="mt-5 px-1 text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        Формат вашего созвона · 60 мин
      </h3>
      <div className="rounded-2xl bg-card hairline shadow-card p-4 space-y-3 animate-fade-up">
        <FormatRowGreen time="20 мин" text="Ты делишься успехами за неделю" />
        <FormatRowGreen time="20 мин" text={`${buddy.name} делится своими успехами`} />
        <FormatRowGreen time="20 мин" text="Вместе ставите задачи на неделю" />
      </div>

      {/* Quad teaser */}
      <button
        className="tap mt-4 w-full rounded-2xl p-4 flex items-center gap-3 text-left animate-fade-up"
        style={{
          background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
          border: "1px solid #c4b5fd",
        }}
      >
        <span className="text-[26px]">👥👥</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight" style={{ color: "#6d28d9" }}>
            Теперь доступна Четвёрка!
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "#7c3aed" }}>
            Созвон раз в месяц с группой из 4 человек
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0" style={{ color: "#6d28d9" }} />
      </button>

    </div>
  );
}
