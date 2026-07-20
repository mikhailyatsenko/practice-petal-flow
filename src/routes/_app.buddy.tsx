import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, BookOpen, Play, Zap, Check, X, Send, Pencil, ClipboardList, Video, Copy, Phone, Link } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { pluralAge } from "@/lib/agePlural";
import { HowVideoCards } from "@/components/section/HowVideoCards";
import { useBuddyCard, isBuddyCardFilled } from "@/lib/buddyCardStore";
import { setTelemostLink, useTelemostLink } from "@/lib/telemostLinkStore";
import { ackCallReminder, useCallReminder, formatCallCountdown, formatHMS } from "@/lib/callReminderMode";
import { useBuddySchedule, setBuddySchedule, DAYS_FULL } from "@/lib/buddyScheduleStore";
import { TelegramIcon, MaxIcon } from "@/components/icons/MessengerIcons";
import { LeaveMenu } from "@/components/layout/LeaveMenu";
import { LocalTimeHint } from "@/components/common/LocalTimeHint";

export const Route = createFileRoute("/_app/buddy")({
  validateSearch: (search: Record<string, unknown>): { demo?: "has" | "has-no-link" | "waiting" | "create-tg-no-username" | "create-max" | "start-max-bot" | "start-tg-bot" } => {
    const d = search.demo;
    if (
      d === "has" ||
      d === "has-no-link" ||
      d === "waiting" ||
      d === "create-tg-no-username" ||
      d === "create-max" ||
      d === "start-max-bot" ||
      d === "start-tg-bot"
    ) {
      return { demo: d };
    }
    return {};
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
  age: number;
  avatar: string;
  job: string;
  day: string;
  time: string;
  bio: string;
  extra?: string;
  channels: ("tg" | "max")[];
}

type Screen =
  | { name: "no_buddy" }
  | { name: "instructions" }
  | { name: "create_request" }
  | { name: "contact_step"; variant?: "max" | "tg-no-username" }
  | { name: "start_bot"; variant: "max" | "tg" }
  | { name: "browse_requests" }
  | { name: "waiting"; to: BuddyRequest }
  | { name: "has_buddy" };


const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

const DEMO_REQUESTS: BuddyRequest[] = [
  {
    id: "1",
    name: "Анна",
    age: 29,
    avatar: "🌸",
    job: "Маркетолог",
    day: "Ср",
    time: "19:00",
    bio: "Запускаю свой бренд косметики. Ищу партнёра, с которым будем держать друг друга в фокусе и без откладываний.",
    extra: "Если среда не подойдёт — могу также во вторник или четверг с 18:00 до 21:00 МСК. По выходным занята. Созваниваюсь через Яндекс Телемост.",
    channels: ["tg"],
  },
  {
    id: "2",
    name: "Дмитрий",
    age: 34,
    avatar: "🎯",
    job: "Предприниматель",
    day: "Пт",
    time: "10:00",
    bio: "Развиваю IT-агентство, цель — выйти на 1М/мес. Хочу системного бадди, кто умеет ставить чёткие задачи.",
    extra: "Кроме пятницы свободен в понедельник и среду утром (09:00–12:00 МСК). Прошу не опаздывать — у меня плотный график.",
    channels: ["max"],
  },
  {
    id: "3",
    name: "Мария",
    age: 41,
    avatar: "✨",
    job: "Коуч",
    day: "Вт",
    time: "20:00",
    bio: "Веду частную практику, расту в личном бренде. Ищу человека на длинную дистанцию, без воды.",
    extra: "Запасные слоты: четверг 19:00–21:00, суббота утром 10:00–12:00 МСК.",
    channels: ["max"],
  },
  {
    id: "4",
    name: "Игорь",
    age: 27,
    avatar: "🚀",
    job: "Фрилансер · дизайн",
    day: "Сб",
    time: "12:00",
    bio: "Перехожу из найма во фриланс, выстраиваю поток клиентов. Готов делиться прогрессом каждую неделю.",
    extra: "Помимо субботы могу в воскресенье днём и по будням после 20:00 МСК. Часовой пояс — Москва.",
    channels: ["tg"],
  },
];

// Твоя собственная заявка — показываем первой в списке (демо)
const MY_OWN_REQUEST: BuddyRequest = {
  id: "me",
  name: "Ты",
  age: 28,
  avatar: "🙂",
  job: "Твоя анкета",
  day: "Чт",
  time: "20:00",
  bio: "Моя заявка на поиск Бадди для еженедельных созвонов.",
  channels: ["tg"],
};

// Демо-бадди (Экран 6)
const DEMO_BUDDY: BuddyRequest = {
  id: "b1",
  name: "Алексей",
  age: 32,
  avatar: "🧑‍💻",
  job: "Продакт-менеджер",
  day: "Чт",
  time: "20:00",
  bio: "Развиваю продукт в финтехе, цель года — вырасти в директора. Ценю чёткость и регулярность.",
  channels: ["tg", "max"],
};

// ───────────────────────── Root ─────────────────────────

function BuddyScreen() {
  const { demo } = Route.useSearch();
  const initial: Screen =
    demo === "has" || demo === "has-no-link"
      ? { name: "has_buddy" }
      : demo === "waiting"
        ? { name: "waiting", to: DEMO_REQUESTS[0] }
        : demo === "create-tg-no-username" || demo === "create-max"
          ? { name: "contact_step" }
          : demo === "start-max-bot"
            ? { name: "start_bot", variant: "max" }
            : demo === "start-tg-bot"
              ? { name: "start_bot", variant: "tg" }
              : { name: "no_buddy" };

  const [screen, setScreen] = useState<Screen>(initial);
  const lastDemo = useRef(demo);
  useEffect(() => {
    if (lastDemo.current !== demo) {
      lastDemo.current = demo;
      setScreen(initial);
    }
      if (demo === "has" && !window.localStorage.getItem("telemost-meeting-link")) {
        setTelemostLink("https://telemost.yandex.ru/j/demo-buddy-room");
      }
  }, [demo]);

  const contactVariant: ContactVariant =
    demo === "create-max" ? "max" : demo === "create-tg-no-username" ? "tg-no-username" : "none";

  switch (screen.name) {
    case "no_buddy":
      return <NoBuddy onNavigate={setScreen} />;
    case "instructions":
      return <Instructions onBack={() => setScreen({ name: "no_buddy" })} />;
    case "create_request":
      return (
        <CreateRequest
          onBack={() => setScreen({ name: "no_buddy" })}
          onSubmit={() => {
            if (contactVariant !== "none") {
              setScreen({ name: "contact_step" });
            } else {
              setScreen({ name: "waiting", to: DEMO_REQUESTS[0] });
            }
          }}
        />
      );
    case "contact_step": {
      const v =
        screen.variant ?? (contactVariant === "none" ? "tg-no-username" : contactVariant);
      return (
        <ContactStep
          variant={v}
          onBack={() => setScreen({ name: "no_buddy" })}
          onDone={() => setScreen({ name: "waiting", to: DEMO_REQUESTS[0] })}
        />
      );
    }
    case "start_bot":
      return (
        <StartBotStep
          variant={screen.variant}
          onBack={() => setScreen({ name: "no_buddy" })}
          onNeedProfile={() =>
            setScreen({
              name: "contact_step",
              variant: screen.variant === "max" ? "max" : "tg-no-username",
            })
          }
          onDone={() => setScreen({ name: "waiting", to: DEMO_REQUESTS[0] })}
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
      return <HasBuddy onBack={() => setScreen({ name: "no_buddy" })} buddy={DEMO_BUDDY} noLink={demo === "has-no-link"} />;
  }
}


type ContactVariant = "none" | "tg-no-username" | "max";

// ───────────────────────── Shared header ─────────────────────────

function PageHeader({ title, onBack, badge, right }: { title: string; onBack: () => void; badge?: string; right?: React.ReactNode }) {
  return (
    <div className="relative flex items-center px-1 pt-2 pb-3">
      <div className="relative z-10">
        <BackButton onClick={onBack} />
      </div>
      <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
        {title}
      </h1>
      {right ? right : badge ? (
        <span
          className="ml-auto relative z-10 text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          {badge}
        </span>
      ) : null}
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

      {/* Ожидание — переход в карточку запросов */}
      <button
        onClick={() => onNavigate({ name: "waiting", to: DEMO_REQUESTS[0] })}
        className="tap mt-3 w-full rounded-2xl px-3.5 py-3 flex items-center gap-3 text-left animate-fade-up"
        style={{
          background: "linear-gradient(135deg, #fff8ee, #fff3e0)",
          border: "1px solid #ffd089",
        }}
      >
        <div
          className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-[22px]"
          style={{ background: "rgba(255,109,0,0.15)" }}
        >
          ⏳
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-tight" style={{ color: "#FF6D00" }}>
            Ожидание ответа
          </h3>
          <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "#b45309" }}>
            Посмотри отклики на твою заявку
          </p>
        </div>
        <span
          className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          {INCOMING_REQUESTS.length}
        </span>
      </button>

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

function CreateRequest({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [job, setJob] = useState("");
  const [bio, setBio] = useState("");
  const [extra, setExtra] = useState("");
  const [channel, setChannel] = useState<"tg" | "max" | null>(null);

  const valid = !!day && !!time && job.trim().length > 1 && bio.trim().length > 20 && !!channel;


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
            Напиши, в какие ещё дни и часы тебе удобно созваниваться, и любые другие важные моменты
          </p>
          <div className="relative">
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Например: Кроме среды свободна во вторник и четверг с 18:00 до 21:00 МСК."
              className="w-full bg-card rounded-xl px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
              style={{ minHeight: 90, border: `1px solid ${extra ? "#FF6D00" : "#ede8df"}` }}
            />
          </div>
        </div>

        {/* Preferred contact channel */}
        <div>
          <h3 className="text-[14px] font-semibold">Где ты хочешь, чтобы Бадди с тобой связался</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 mb-2">
            Выбери мессенджер для связи
          </p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { k: "tg" as const, label: "Telegram", Icon: TelegramIcon },
              { k: "max" as const, label: "MAX", Icon: MaxIcon },
            ]).map(({ k, label, Icon }) => {
              const active = channel === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setChannel(k)}
                  className="tap rounded-xl px-3 py-3 flex items-center justify-center gap-2 text-[14px] font-semibold transition-all"
                  style={{
                    background: active ? "linear-gradient(135deg, #FFB300, #FF6D00)" : "#fff",
                    color: active ? "#fff" : "#3a352d",
                    border: `1px solid ${active ? "#FF6D00" : "#ede8df"}`,
                    boxShadow: active ? "0 4px 14px rgba(255,109,0,0.25)" : "none",
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              );
            })}
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
        <RequestCard req={MY_OWN_REQUEST} onSend={() => {}} mine />
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

function RequestCard({ req, onSend, mine, pending }: { req: BuddyRequest; onSend: () => void; mine?: boolean; pending?: boolean }) {
  return (
    <div className="bg-card shadow-card rounded-2xl p-3.5 animate-fade-up">
      {mine && (
        <div className="mb-3 text-center">
          <span className="text-[18px] font-bold text-muted-foreground">Твоя заявка</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-[14px] flex items-center justify-center text-[24px]"
          style={{ background: "#FAF6EF" }}
        >
          {req.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold leading-tight">{req.name}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{req.job} · {pluralAge(req.age)}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex flex-wrap gap-1.5 justify-end">
            {req.channels.map((ch) => {
              const Icon = ch === "tg" ? TelegramIcon : MaxIcon;
              const label = ch === "tg" ? "Telegram" : "MAX";
              return (
                <span
                  key={ch}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 inline-flex items-center gap-1"
                  style={{ background: "#fff3e0", color: "#FF6D00" }}
                >
                  <Icon size={14} />
                  {label}
                </span>
              );
            })}
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 inline-flex items-center"
              style={{ background: "#fff3e0", color: "#FF6D00" }}
            >
              {req.day} · {req.time} МСК
            </span>
          </div>
          <LocalTimeHint time={req.time} />
        </div>
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

      {mine ? (
        <div
          className="mt-3 w-full rounded-xl py-2.5 text-[13px] font-semibold text-center"
          style={{ background: "#f3f4f6", color: "#6b7280" }}
        >
          Это твоя заявка
        </div>
      ) : pending ? (
        <div
          className="mt-3 w-full rounded-xl py-2.5 text-[13px] font-bold text-center inline-flex items-center justify-center gap-1.5"
          style={{ background: "#fff8dc", color: "#b45309" }}
        >
          <span aria-hidden>🕐</span> Ожидание ответа
        </div>
      ) : (
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
      )}
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
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [job, setJob] = useState("");
  const [bio, setBio] = useState("");
  const [extra, setExtra] = useState("");
  const valid = job.trim().length > 1 && bio.trim().length > 20;

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
        className="relative w-full max-w-md bg-card rounded-t-[24px] p-5 pb-7 animate-fade-up max-h-[92vh] overflow-y-auto"
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
          <h3 className="mt-3 text-[18px] font-bold">Запрос для {req.name}</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug px-2">
            {step === "intro"
              ? `Отправить ${req.name} запрос на созвон ${req.day} в ${req.time}?`
              : `Расскажи о себе — ${req.name} примет решение на основе твоей анкеты`}
          </p>
        </div>

        {step === "intro" ? (
          <div className="mt-5 space-y-2">
            <button
              onClick={() => setStep("form")}
              className="tap w-full rounded-2xl py-3.5 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                boxShadow: "0 6px 20px rgba(255,109,0,0.40)",
              }}
            >
              <Send className="h-4 w-4" /> Отправить запрос
            </button>
            {req.channels.includes("tg") && (
              <button
                className="tap w-full rounded-2xl py-3 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #2AABEE, #229ED9)",
                  boxShadow: "0 4px 14px rgba(34,158,217,0.30)",
                }}
              >
                <TelegramIcon size={16} /> Написать в Telegram
              </button>
            )}
            {req.channels.includes("max") && (
              <button
                className="tap w-full rounded-2xl py-3 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #2E7BFF, #7B4DFF)",
                  boxShadow: "0 4px 14px rgba(123,77,255,0.30)",
                }}
              >
                <MaxIcon size={16} /> Написать в MAX
              </button>
            )}
            <button
              onClick={onClose}
              className="tap w-full rounded-2xl py-3 text-[14px] font-medium inline-flex items-center justify-center gap-2"
              style={{ background: "transparent", border: "1px solid #ede8df", color: "var(--muted-foreground)" }}
            >
              <X className="h-4 w-4" /> Отмена
            </button>

          </div>
        ) : (
        <>


        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-[13px] font-semibold mb-1.5">Вид деятельности</h4>
            <input
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Например: Предприниматель, маркетолог..."
              className="w-full bg-card rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-colors"
              style={{ border: `1px solid ${job ? "#FF6D00" : "#ede8df"}` }}
            />
          </div>

          <div>
            <h4 className="text-[13px] font-semibold">Расскажи о себе</h4>
            <p className="text-[12px] text-muted-foreground mt-0.5 mb-1.5">
              Кто ты, чем живёшь, какие у тебя цели
            </p>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Например: Развиваю онлайн-школу, хочу выйти на 500к/мес."
                className="w-full bg-card rounded-xl px-3.5 py-2.5 pb-6 text-[14px] outline-none transition-colors resize-none"
                style={{ minHeight: 100, border: `1px solid ${bio ? "#FF6D00" : "#ede8df"}` }}
              />
              <span className="absolute right-3 bottom-2 text-[11px] text-muted-foreground">
                {bio.length} символов
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold">Дополнительные комментарии</h4>
            <p className="text-[12px] text-muted-foreground mt-0.5 mb-1.5">
              Необязательно — запасные слоты, важные моменты
            </p>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Например: могу также по вторникам вечером."
              className="w-full bg-card rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-colors resize-none"
              style={{ minHeight: 70, border: `1px solid ${extra ? "#FF6D00" : "#ede8df"}` }}
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={() => valid && onConfirm()}
            disabled={!valid}
            className="tap w-full rounded-2xl py-3.5 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #FFB300, #FF6D00)",
              boxShadow: valid ? "0 6px 20px rgba(255,109,0,0.40)" : "none",
              opacity: valid ? 1 : 0.45,
              cursor: valid ? "pointer" : "not-allowed",
            }}
          >
            <Check className="h-4 w-4" /> Отправить запрос
          </button>
          {req.channels.includes("tg") && (
            <button
              className="tap w-full rounded-2xl py-3 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #2AABEE, #229ED9)",
                boxShadow: "0 4px 14px rgba(34,158,217,0.30)",
              }}
            >
              <TelegramIcon size={16} /> Написать в Telegram
            </button>
          )}
          {req.channels.includes("max") && (
            <button
              className="tap w-full rounded-2xl py-3 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #2E7BFF, #7B4DFF)",
                boxShadow: "0 4px 14px rgba(123,77,255,0.30)",
              }}
            >
              <MaxIcon size={16} /> Написать в MAX
            </button>
          )}
          <button
            onClick={onClose}
            className="tap w-full rounded-2xl py-3 text-[14px] font-medium inline-flex items-center justify-center gap-2"
            style={{ background: "transparent", border: "1px solid #ede8df", color: "var(--muted-foreground)" }}
          >
            <X className="h-4 w-4" /> Отмена
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Screen 5: Waiting ─────────────────────────

const INCOMING_REQUESTS: BuddyRequest[] = [
  {
    id: "in1",
    name: "Сергей",
    age: 36,
    avatar: "🧗",
    job: "Основатель стартапа",
    day: "Ср",
    time: "19:00",
    bio: "Запускаю SaaS для логистики. Хочу бадди, который держит фокус и не сливается через месяц.",
    extra: "Свободен также по понедельникам вечером. Telegram: @sergey_demo",
    channels: ["tg"],
  },
  {
    id: "in2",
    name: "Ольга",
    age: 31,
    avatar: "🌿",
    job: "Психолог · частная практика",
    day: "Ср",
    time: "19:00",
    bio: "Развиваю практику и личный бренд. Ищу системного партнёра на длинную дистанцию.",
    extra: "Запасные слоты — четверг и пятница после 18:00 МСК. Telegram: @olga_demo",
    channels: ["tg"],
  },
];

function Waiting({ to, onBack }: { to: BuddyRequest; onBack: () => void }) {
  const [incoming, setIncoming] = useState<BuddyRequest[]>(INCOMING_REQUESTS);
  const [accepted, setAccepted] = useState<BuddyRequest | null>(null);
  const [tab, setTab] = useState<"incoming" | "outgoing">(
    INCOMING_REQUESTS.length > 0 ? "incoming" : "outgoing",
  );

  const decline = (id: string) => setIncoming((prev) => prev.filter((r) => r.id !== id));
  const accept = (req: BuddyRequest) => {
    setAccepted(req);
    setIncoming([]);
  };

  return (
    <div className="px-4 pb-6">
      <PageHeader title="Ожидание" onBack={onBack} />

      {accepted ? (
        <div className="text-center pt-4 pb-5 animate-fade-up">
          <div className="text-[56px] leading-none">🎉</div>
          <h2 className="mt-3 text-[18px] font-bold">Бадди найден!</h2>
          <p className="mt-2 text-[14px] text-muted-foreground leading-snug max-w-[320px] mx-auto">
            Ты подтвердил {accepted.name}. Напишите друг другу и согласуйте первый созвон.
          </p>
        </div>
      ) : (
        <>
          {/* Segmented tabs */}
          <div
            className="mt-2 grid grid-cols-2 p-1 rounded-2xl"
            style={{ background: "#FAF6EF", border: "1px solid #ede8df" }}
          >
            <button
              onClick={() => setTab("incoming")}
              className="tap relative rounded-xl py-2 text-[12px] font-bold inline-flex items-center justify-center gap-1.5 transition-all"
              style={
                tab === "incoming"
                  ? { background: "#fff", color: "#FF6D00", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
                  : { background: "transparent", color: "#a59a85" }
              }
            >
              Отклики на твою заявку
              {incoming.length > 0 && (
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
                >
                  {incoming.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("outgoing")}
              className="tap rounded-xl py-2 text-[12px] font-bold transition-all"
              style={
                tab === "outgoing"
                  ? { background: "#fff", color: "#FF6D00", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
                  : { background: "transparent", color: "#a59a85" }
              }
            >
              Твой запрос
            </button>
          </div>

          {tab === "incoming" ? (
            <div className="mt-4">
              {incoming.length > 0 ? (
                <>
                  <p className="px-1 text-[12px] text-muted-foreground mb-3 leading-snug">
                    Эти участники хотят стать твоим бадди. Подтверди подходящего или отклони.
                  </p>
                  <div className="space-y-3">
                    {incoming.map((r) => (
                      <IncomingRequestCard
                        key={r.id}
                        req={r}
                        onAccept={() => accept(r)}
                        onDecline={() => decline(r.id)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-[13px] text-muted-foreground">
                  Пока нет откликов на твою заявку.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <p className="px-1 text-[12px] text-muted-foreground mb-3 leading-snug">
                Ты отправил запрос на эту заявку. Ждём ответа — действий пока не требуется.
              </p>
              <RequestCard req={to} onSend={() => {}} pending />
            </div>
          )}
        </>
      )}

      <button
        onClick={onBack}
        className="tap mt-6 w-full rounded-2xl py-3.5 text-[14px] font-bold"
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

function IncomingRequestCard({
  req,
  onAccept,
  onDecline,
}: {
  req: BuddyRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
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
          <p className="text-[12px] text-muted-foreground mt-0.5">{req.job} · {pluralAge(req.age)}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "#fff3e0", color: "#FF6D00" }}
          >
            {req.day} · {req.time} МСК
          </span>
          <LocalTimeHint time={req.time} />
        </div>
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

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={onAccept}
          className="tap rounded-xl py-2.5 text-[13px] font-bold text-white inline-flex items-center justify-center gap-1.5"
          style={{
            background: "linear-gradient(135deg, #FFB300, #FF6D00)",
            boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
          }}
        >
          <Check className="h-4 w-4" /> Подтвердить
        </button>
        <button
          onClick={onDecline}
          className="tap rounded-xl py-2.5 text-[13px] font-medium inline-flex items-center justify-center gap-1.5"
          style={{ background: "transparent", border: "1px solid #ede8df", color: "var(--muted-foreground)" }}
        >
          <X className="h-4 w-4" /> Отклонить
        </button>
      </div>

      <a
        href="https://t.me/"
        target="_blank"
        rel="noopener noreferrer"
        className="tap mt-2 w-full rounded-xl py-2.5 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5"
        style={{ background: "#FAF6EF", color: "#FF6D00", border: "1px solid #ede8df" }}
      >
        <Send className="h-4 w-4" /> Написать в мессенджере
      </a>
    </div>
  );
}

function BuddyReminderTemplate({ time, timezone }: { time: string; timezone: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Привет! Напоминаю, завтра у нас созвон в ${time} ${timezone}.`;
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* noop */
      }
    }
  };
  return (
    <div className="mt-3">
      <p className="text-[13.5px] font-semibold leading-snug" style={{ color: "#1a0e00" }}>
        Напишите Бадди:
      </p>
      <div
        className="mt-2 rounded-xl p-3 flex items-center gap-3"
        style={{ background: "#FAF6EF", border: "1px solid #ece4d4" }}
      >
        <div
          className="flex-1 min-w-0 rounded-[16px] p-3"
          style={{ background: "#fff", border: "1px solid #ede8df" }}
        >
          <p className="text-[14px] leading-relaxed" style={{ color: "#2b2419" }}>
            {text}
          </p>
        </div>
        <button
          onClick={onCopy}
          className="tap shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors"
          style={{
            background: "#fff",
            color: copied ? "#16a34a" : "#FF6D00",
            border: copied ? "1px solid #16a34a" : "1px solid #FF6D00",
          }}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{copied ? "Скопировано" : "Скопировать"}</span>
        </button>
      </div>
    </div>
  );
}

function NoLinkTomorrowCard({ time, timezone }: { time: string; timezone: string }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const text = `Привет! Напоминаю, завтра у нас созвон в ${time} ${timezone}.`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* noop */
      }
    }
  };

  return (
    <div className="rounded-[24px] p-4 animate-fade-up bg-white hairline shadow-card">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          <Phone className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[17px] font-bold leading-tight" style={{ color: "#1a0e00" }}>
            Завтра созвон с Бадди
          </p>
          <p className="text-[13.5px] mt-1 leading-snug" style={{ color: "#2b2419" }}>
            Созвон:{" "}
            <span style={{ color: "#FF6D00", fontWeight: 700 }}>
              завтра в {time} {timezone}
            </span>
          </p>
        </div>
      </div>

      {/* Block 1 — Напомните Бадди */}
      <div
        className="mt-4 rounded-[20px] p-3.5"
        style={{ background: "#FAF6EF", border: "1px solid #ece4d4" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
          >
            1
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-tight" style={{ color: "#1a0e00" }}>
              Напомните Бадди
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#6b6356" }}>
              Напишите ему:
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <div
            className="flex-1 min-w-0 rounded-[16px] p-3"
            style={{ background: "#fff", border: "1px solid #ede8df" }}
          >
            <p className="text-[13.5px] leading-snug" style={{ color: "#2b2419" }}>
              {text}
            </p>
          </div>
          <button
            onClick={onCopy}
            className="tap shrink-0 rounded-lg px-3 py-2 text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
            style={{
              background: "#fff",
              color: copied ? "#16a34a" : "#FF6D00",
              border: copied ? "1px solid #16a34a" : "1px solid #FF6D00",
            }}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copied ? "Скопировано" : "Скопировать"}</span>
          </button>
        </div>
      </div>

      {/* Block 2 — Важно: ссылка ещё не создана */}
      <div
        className="mt-3 rounded-[20px] p-3.5"
        style={{ background: "#FAF6EF", border: "1px solid #ece4d4" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
          >
            2
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-tight" style={{ color: "#1a0e00" }}>
              Важно: ссылка ещё не создана
            </p>
            <p className="text-[13px] mt-1 leading-snug" style={{ color: "#6b6356" }}>
              Создайте ссылку заранее, чтобы завтра созвон состоялся без сбоев.
            </p>
          </div>
          <div
            className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
            style={{ background: "#fff", border: "1px solid #FF6D00" }}
          >
            <span style={{ color: "#FF6D00", fontWeight: 800, fontSize: 18 }}>!</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <button
        onClick={() => navigate({ to: "/telemost-link" })}
        className="tap relative mt-4 w-full overflow-hidden rounded-[20px] py-3.5 text-[15px] font-bold text-white inline-flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          boxShadow: "0 6px 20px rgba(255,109,0,0.35)",
        }}
      >
        <Link className="h-4 w-4 relative z-10" />
        <span className="relative z-10">Создать ссылку на созвон</span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
            transform: "translateX(-100%)",
            animation: "room-shimmer 2.6s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes room-shimmer {
            0% { transform: translateX(-100%); }
            65% { transform: translateX(200%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </button>
    </div>
  );
}

// ───────────────────────── Screen 6: Has buddy ─────────────────────────

function HasBuddy({ buddy, onBack, noLink }: { buddy: BuddyRequest; onBack: () => void; noLink?: boolean }) {
  const navigate = useNavigate();
  const card = useBuddyCard();
  const filled = isBuddyCardFilled(card);
  const meetingLink = useTelemostLink();
  const { mode: callMode, ack: callAck, startAt, now } = useCallReminder();
  const schedule = useBuddySchedule();
  const [editSchedule, setEditSchedule] = useState(false);
  const modeNoLinkTomorrow = callMode === "buddy-no-link";
  const modeNoLink2h = callMode === "buddy-2h-no-link" && startAt != null;
  const noLinkActive = modeNoLinkTomorrow || modeNoLink2h;
  const showCallInfo = !noLink && !noLinkActive && callMode === "buddy" && !callAck;
  const show2h = !noLink && !noLinkActive && callMode === "buddy-2h" && startAt != null;
  const countdown = show2h ? formatCallCountdown(startAt! - now) : null;
  const noLink2hCountdown = modeNoLink2h ? formatCallCountdown(startAt! - now) : null;

  return (
    <div className="px-4 pb-6">
      <PageHeader
        title="Мой Бадди"
        onBack={() => navigate({ to: "/community" })}
        right={
          <LeaveMenu
            menuItemLabel="Выйти из Бадди"
            confirmTitle="Выйти из Бадди?"
            confirmBody={
              <>
                <p>
                  Ваша пара Бадди будет расформирована. Вы потеряете доступ к карточке Бадди, общей ссылке на созвон и другим совместным функциям.
                </p>
                <p
                  className="mt-3 rounded-lg px-3 py-2.5 font-semibold"
                  style={{ background: "#fff2f2", color: "#b02020", border: "1px solid #f3c4c4" }}
                >
                  Важно: если вы состоите в Четвёрке, она также будет полностью расформирована для всех четырёх участников.
                </p>
                <p className="mt-3">
                  После выхода вам и другим участникам потребуется заново найти Бадди и сформировать новую Четвёрку.
                </p>
              </>
            }
            confirmButtonLabel="Выйти из Бадди"
            onConfirm={() => {
              try {
                ["buddy-card", "telemost-meeting-link", "buddy-schedule", "foursome-chat"].forEach((k) =>
                  window.localStorage.removeItem(k),
                );
              } catch { /* noop */ }
              navigate({ to: "/buddy", search: {} });
            }}
          />
        }
      />

      {noLinkActive ? null : noLink ? (
        <div
          className="rounded-2xl p-4 animate-fade-up hairline"
          style={{ background: "#effaf1", border: "1px solid #bfe6c8" }}
        >
          <p className="text-[15px] font-bold leading-tight" style={{ color: "#1f7a3a" }}>
            📞 Создайте ссылку на созвоны
          </p>
          <p className="text-[13px] mt-1.5 leading-snug" style={{ color: "#3d6b4d" }}>
            Получайте{" "}
            <span style={{ fontWeight: 700 }}>+2 очка каждый день</span>{" "}
            после того, как создадите постоянную ссылку для созвонов в Яндекс Телемосте.
          </p>
          <button
            onClick={() => navigate({ to: "/telemost-link" })}
            className="tap relative mt-3 w-full overflow-hidden rounded-2xl py-3 text-[14px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #8BC34A, #4CAF50)",
              boxShadow: "0 6px 20px rgba(76,175,80,0.35)",
            }}
          >
            <span className="relative z-10">Создать ссылку на созвоны</span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)",
                transform: "translateX(-100%)",
                animation: "green-shimmer 2.8s ease-in-out infinite",
              }}
            />
            <style>{`
              @keyframes green-shimmer {
                0% { transform: translateX(-100%); }
                45% { transform: translateX(200%); }
                100% { transform: translateX(200%); }
              }
            `}</style>
          </button>
        </div>
      ) : null}
      {modeNoLink2h && noLink2hCountdown ? (
        <>
          <div className="rounded-2xl p-5 animate-fade-up bg-card hairline shadow-card text-center">
            <p
              className="text-[12px] font-bold uppercase tracking-wider"
              style={{ color: "#16a34a", letterSpacing: "0.08em" }}
            >
              {noLink2hCountdown.started ? "Созвон с Бадди начался" : "До созвона с Бадди осталось"}
            </p>
            <p
              className="mt-1 font-extrabold leading-none tabular-nums"
              style={{
                color: "#1a0e00",
                fontSize: noLink2hCountdown.started ? 24 : 40,
                letterSpacing: noLink2hCountdown.started ? 0 : "0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {noLink2hCountdown.started ? "Сейчас" : formatHMS(startAt! - now)}
            </p>
          </div>
          <div
            className="mt-3 rounded-2xl p-4 animate-fade-up"
            style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
          >
            <p className="text-[14px] leading-snug" style={{ color: "#1a0e00", fontWeight: 500 }}>
              <span style={{ color: "#FF6D00", fontWeight: 800 }}>⚠️ Внимание!</span>{" "}
              Ссылка на комнату ещё не создана. Создайте её сейчас, чтобы успеть к созвону.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/telemost-link" })}
            className="tap relative mt-3 w-full overflow-hidden rounded-2xl py-3.5 text-[14px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #FFB300, #FF6D00)",
              boxShadow: "0 6px 20px rgba(255,109,0,0.35)",
            }}
          >
            <span className="relative z-10">Срочно создать ссылку</span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
                transform: "translateX(-100%)",
                animation: "room-shimmer 2.6s ease-in-out infinite",
              }}
            />
            <style>{`
              @keyframes room-shimmer {
                0% { transform: translateX(-100%); }
                65% { transform: translateX(200%); }
                100% { transform: translateX(200%); }
              }
            `}</style>
          </button>
        </>

      ) : modeNoLinkTomorrow ? (
        <NoLinkTomorrowCard time={schedule.time} timezone={schedule.timezone} />
      ) : show2h && countdown ? (
        <>
          <div className="rounded-2xl p-5 animate-fade-up bg-card hairline shadow-card text-center">
            <p
              className="text-[12px] font-bold uppercase tracking-wider"
              style={{ color: "#16a34a", letterSpacing: "0.08em" }}
            >
              {countdown.started ? "Созвон с Бадди начался" : "До созвона с Бадди осталось"}
            </p>
            <p
              className="mt-1 font-extrabold leading-none tabular-nums"
              style={{
                color: "#1a0e00",
                fontSize: countdown.started ? 24 : 40,
                letterSpacing: countdown.started ? 0 : "0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {countdown.started ? "Созвон с Бадди начался" : formatHMS(startAt! - now)}
            </p>
          </div>
          {meetingLink && (
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="tap mt-3 w-full overflow-hidden rounded-2xl py-3.5 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2 animate-fade-up relative"
              style={{
                background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                boxShadow: "0 6px 20px rgba(255,109,0,0.35)",
              }}
            >
              <Video className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Перейти в комнату созвона</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
                  transform: "translateX(-100%)",
                  animation: "room-shimmer 2.6s ease-in-out infinite",
                }}
              />
              <style>{`
                @keyframes room-shimmer {
                  0% { transform: translateX(-100%); }
                  65% { transform: translateX(200%); }
                  100% { transform: translateX(200%); }
                }
              `}</style>
            </a>
          )}
        </>
      ) : showCallInfo ? (
        <div
          className="rounded-2xl p-4 animate-fade-up bg-card hairline shadow-card"
        >
          <p className="text-[15px] font-bold leading-tight" style={{ color: "#1a0e00" }}>
            📞 Завтра созвон с Бадди
          </p>
          <p className="text-[13.5px] mt-1.5 leading-snug" style={{ color: "#2b2419", fontWeight: 500 }}>
            Напоминаем о созвоне с Бадди завтра в <span className="font-bold">{schedule.time} {schedule.timezone}</span>.
          </p>
          <BuddyReminderTemplate time={schedule.time} timezone={schedule.timezone} />
          <button
            onClick={ackCallReminder}
            className="tap relative mt-3 w-full overflow-hidden rounded-2xl py-3 text-[14px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              boxShadow: "0 6px 20px rgba(34, 197, 94, 0.35)",
            }}
          >
            <span className="relative z-10">Хорошо, напишу Бадди</span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)",
                transform: "translateX(-100%)",
                animation: "green-shimmer 2.8s ease-in-out infinite",
              }}
            />
            <style>{`
              @keyframes green-shimmer {
                0% { transform: translateX(-100%); }
                45% { transform: translateX(200%); }
                100% { transform: translateX(200%); }
              }
            `}</style>
          </button>
        </div>

      ) : (
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
      )}

      {!noLink && !noLinkActive && !show2h && meetingLink && (
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="tap mt-3 w-full rounded-2xl py-3.5 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2 animate-fade-up"
          style={{
            background: "linear-gradient(135deg, #FFB300, #FF6D00)",
            boxShadow: "0 6px 20px rgba(255,109,0,0.35)",
          }}
        >
          <Video className="h-4 w-4" />
          Перейти в комнату созвона
        </a>
      )}

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
              {buddy.job} · {pluralAge(buddy.age)} · @{buddy.name.toLowerCase()}
            </p>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <p className="text-[12px] font-bold" style={{ color: "#FF6D00" }}>
                📅 {schedule.day} · {schedule.time} {schedule.timezone}
              </p>
              <button
                type="button"
                onClick={() => setEditSchedule(true)}
                className="tap inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ color: "#FF6D00", background: "rgba(255,109,0,0.10)" }}
              >
                <Pencil className="h-3 w-3" /> Изменить
              </button>
            </div>
          </div>
        </div>

        <div
          className="mt-3 rounded-[10px] p-3 text-[13px]"
          style={{ background: "#FAF6EF", lineHeight: 1.5 }}
        >
          {buddy.bio}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {/* Buddy filled card section */}
        {filled ? (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#FF6D00",
                }}
              >
                КАРТОЧКА БАДДИ
              </span>
              <button
                onClick={() => navigate({ to: "/my-buddy-card" })}
                className="tap inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full"
                style={{
                  color: "#FF6D00",
                  background: "rgba(255,109,0,0.10)",
                }}
              >
                <Pencil className="h-3 w-3" /> Изменить
              </button>
            </div>

            <div className="space-y-3">
              <AnswerBlock title="Главная цель на 1–2 года" text={card.goal} />
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "#a59a85",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  3 сферы жизни
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {card.spheres.map((s, i) => (
                    <span
                      key={i}
                      className="text-[12px] font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #fff8ee, #fff3e0)",
                        color: "#FF6D00",
                        border: "1px solid #ffd089",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <AnswerBlock title="Сильные стороны" text={card.strengths} />
              <AnswerBlock title="Что мешает достигать успеха" text={card.blockers} />
              <AnswerBlock title="В чём нужна моя поддержка" text={card.support} />
            </div>
          </div>
        ) : (
          <div className="text-center animate-fade-up py-2">
            <div
              className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center text-[28px]"
              style={{ background: "#FAF6EF" }}
            >
              📋
            </div>
            <h4 className="mt-3 text-[15px] font-bold">Карточка Бадди не заполнена</h4>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground leading-snug max-w-[280px] mx-auto">
              Заполни карточку после первого созвона — так ты лучше узнаешь своего Бадди
            </p>
            <button
              onClick={() => navigate({ to: "/my-buddy-card" })}
              className="tap mt-4 w-full rounded-2xl py-3 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                boxShadow: "0 6px 20px rgba(255,109,0,0.35)",
              }}
            >
              <ClipboardList className="h-4 w-4" /> Заполнить карточку Бадди
            </button>
          </div>
        )}

        {/* Divider before Telegram */}
        <div className="my-4 border-t border-border" />

        <div className="space-y-2">
          {buddy.channels.includes("tg") && (
            <button
              className="tap w-full rounded-2xl py-3 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #2AABEE, #229ED9)",
                boxShadow: "0 6px 20px rgba(34,158,217,0.35)",
              }}
            >
              <TelegramIcon size={18} /> Написать в Telegram
            </button>
          )}
          {buddy.channels.includes("max") && (
            <button
              className="tap w-full rounded-2xl py-3 text-[14px] font-bold text-white inline-flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #2E7BFF, #7B4DFF)",
                boxShadow: "0 6px 20px rgba(123,77,255,0.35)",
              }}
            >
              <MaxIcon size={18} /> Написать в MAX
            </button>
          )}
        </div>
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

      {editSchedule && (
        <ScheduleEditDialog
          initial={schedule}
          channels={buddy.channels}
          onCancel={() => setEditSchedule(false)}
          onSave={(s) => {
            setBuddySchedule(s);
            setEditSchedule(false);
          }}
        />
      )}
    </div>
  );
}

const DAY_GENITIVE: Record<string, string> = {
  "Пн": "понедельника",
  "Вт": "вторника",
  "Ср": "среды",
  "Чт": "четверга",
  "Пт": "пятницы",
  "Сб": "субботы",
  "Вс": "воскресенья",
};
const DAY_ACC: Record<string, string> = {
  "Пн": "понедельник",
  "Вт": "вторник",
  "Ср": "среду",
  "Чт": "четверг",
  "Пт": "пятницу",
  "Сб": "субботу",
  "Вс": "воскресенье",
};
const DAY_FULL_NAMES: Record<string, string> = {
  "Пн": "Понедельник",
  "Вт": "Вторник",
  "Ср": "Среда",
  "Чт": "Четверг",
  "Пт": "Пятница",
  "Сб": "Суббота",
  "Вс": "Воскресенье",
};

function ScheduleEditDialog({
  initial,
  channels,
  onCancel,
  onSave,
}: {
  initial: { day: string; time: string; timezone: string };
  channels: ("tg" | "max")[];
  onCancel: () => void;
  onSave: (s: { day: string; time: string; timezone: string }) => void;
}) {
  const [day, setDay] = useState(initial.day);
  const [time, setTime] = useState(initial.time);
  const [step, setStep] = useState<"warn" | "edit" | "confirm" | "done">("warn");
  const [copied, setCopied] = useState(false);
  const [warnCopied, setWarnCopied] = useState(false);
  const TZ = "МСК";

  const warnText = "Привет! Предлагаю изменить день или время нашего созвона. Напиши, пожалуйста, согласен ли ты и какой вариант тебе подходит.";
  const notifyText = `Привет! Я изменил время нашего созвона. Теперь встречаемся в ${DAY_ACC[day] ?? day} в ${time} МСК.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notifyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  const copyWarn = async () => {
    try {
      await navigator.clipboard.writeText(warnText);
      setWarnCopied(true);
      setTimeout(() => setWarnCopied(false), 1800);
    } catch { /* noop */ }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/40 animate-fade-up"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "warn" && (
          <>
            <h3 className="text-[16px] font-bold mb-2">Сначала предупредите Бадди</h3>
            <p className="text-[13px] mb-4 leading-snug" style={{ color: "#3f3a33" }}>
              Перед изменением расписания сообщите об этом своему Бадди и согласуйте с ним новый день и время.
            </p>

            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#a59a85" }}>Напишите Бадди</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 rounded-2xl p-3.5" style={{ background: "#FAF6EF", border: "1px solid #ede8df" }}>
                <p className="text-[13px] leading-snug" style={{ color: "#3f3a33" }}>{warnText}</p>
              </div>
              <button
                onClick={copyWarn}
                className="tap shrink-0 rounded-xl px-3 py-2 text-[12px] font-bold inline-flex items-center gap-1"
                style={
                  warnCopied
                    ? { background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff" }
                    : { background: "#FAF6EF", border: "1px solid #ede8df", color: "#FF8A00" }
                }
              >
                {warnCopied ? <><Check size={14} /> Скопировано</> : <><Copy size={14} /> Скопировать</>}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {channels.includes("tg") && (
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap w-full rounded-xl py-2.5 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 text-white"
                  style={{ background: "#229ED9" }}
                >
                  <TelegramIcon size={16} /> Написать в Telegram
                </a>
              )}
              {channels.includes("max") && (
                <a
                  href="https://max.ru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap w-full rounded-xl py-2.5 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 text-white"
                  style={{ background: "linear-gradient(135deg, #2E7BFF, #7B4DFF)" }}
                >
                  <MaxIcon size={16} /> Написать в MAX
                </a>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="tap flex-1 rounded-xl py-2.5 text-[14px] font-medium"
                style={{ background: "transparent", border: "1px solid #ede8df", color: "var(--muted-foreground)" }}
              >
                Отмена
              </button>
              <button
                onClick={() => setStep("edit")}
                className="tap flex-[1.5] rounded-xl py-2.5 text-[14px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
                }}
              >
                Я написал Бадди — продолжить
              </button>
            </div>
          </>
        )}

        {step === "edit" && (
          <>
            <h3 className="text-[16px] font-bold mb-1">Изменить расписание созвона</h3>
            <p className="text-[12px] text-muted-foreground mb-4">
              Время указывается по Москве (МСК). Новое время увидят оба Бадди.
            </p>

            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">День недели</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {DAYS_FULL.map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className="tap px-3 py-1.5 rounded-full text-[13px] font-medium"
                  style={{
                    background: day === d ? "linear-gradient(135deg, #FFB300, #FF6D00)" : "#FAF6EF",
                    color: day === d ? "#fff" : "#5a5044",
                    border: day === d ? "none" : "1px solid #ede8df",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Время (МСК)</p>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mb-2 rounded-xl px-3 py-2.5 text-[14px] bg-background border border-border"
            />
            <p className="text-[11px] text-muted-foreground mb-5">Все созвоны в клубе фиксируются по московскому времени.</p>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("warn")}
                className="tap flex-1 rounded-xl py-2.5 text-[14px] font-medium"
                style={{ background: "transparent", border: "1px solid #ede8df", color: "var(--muted-foreground)" }}
              >
                Назад
              </button>
              <button
                onClick={() => {
                  if (day === initial.day && time === initial.time) { onCancel(); return; }
                  setStep("confirm");
                }}
                className="tap flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
                }}
              >
                Продолжить
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <h3 className="text-[16px] font-bold mb-3">Подтвердите изменение</h3>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 rounded-2xl p-3" style={{ background: "#FAF6EF", border: "1px solid #ede8df" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#FF8A00" }}>Было</p>
                <p className="text-[15px] font-bold" style={{ color: "#3f3a33" }}>{DAY_FULL_NAMES[initial.day] ?? initial.day}</p>
                <p className="text-[13px] font-medium" style={{ color: "#5a5044" }}>{initial.time} МСК</p>
              </div>
              <div className="shrink-0 text-[16px]" style={{ color: "#FF8A00" }}>→</div>
              <div className="flex-1 rounded-2xl p-3" style={{ background: "#FAF6EF", border: "1px solid #ede8df" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#FF8A00" }}>Будет</p>
                <p className="text-[15px] font-bold" style={{ color: "#3f3a33" }}>{DAY_FULL_NAMES[day] ?? day}</p>
                <p className="text-[13px] font-medium" style={{ color: "#5a5044" }}>{time} МСК</p>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[18px]">⚠️</span>
                <span className="text-[15px] font-bold" style={{ color: "#FF6D00" }}>ВНИМАНИЕ</span>
              </div>
              <p className="text-[13px] leading-snug mb-2" style={{ color: "#3f3a33", fontWeight: 500 }}>
                Новое расписание изменится и у вашего Бадди.
              </p>
              <p className="text-[13px] leading-snug" style={{ color: "#5a5044" }}>
                Убедитесь, что Бадди знает и согласен с новым расписанием.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("edit")}
                className="tap flex-1 rounded-2xl py-3 text-[14px] font-medium"
                style={{ background: "transparent", color: "#8b7f6f" }}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  onSave({ day, time, timezone: TZ });
                  setStep("done");
                }}
                className="tap flex-[1.5] rounded-2xl py-3 text-[13px] font-bold text-white leading-tight"
                style={{
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
                }}
              >
                Бадди предупреждён — изменить расписание
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <h3 className="text-[16px] font-bold mb-2">Расписание изменено</h3>
            <p className="text-[13px] text-foreground mb-4 leading-snug">
              Не забудьте написать Бадди и сообщить новое время созвона.
            </p>
            <div className="rounded-xl p-3 mb-4" style={{ background: "#FAF6EF", border: "1px solid #ede8df" }}>
              <p className="text-[13px] text-foreground leading-snug">{notifyText}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="tap flex-1 rounded-xl py-2.5 text-[14px] font-bold"
                style={{ background: "#FAF6EF", border: "1px solid #ede8df", color: "#5a5044" }}
              >
                {copied ? "Скопировано" : "Скопировать сообщение"}
              </button>
              <button
                onClick={onCancel}
                className="tap flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
                }}
              >
                Готово
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AnswerBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#a59a85",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {title}
      </p>
      <div
        className="rounded-[10px] p-3 text-[13px]"
        style={{ background: "#FAF6EF", lineHeight: 1.5, whiteSpace: "pre-wrap" }}
      >
        {text}
      </div>
    </div>
  );
}


// ───────────────────────── Screen: Contact step (после заявки) ─────────────────────────

function ContactStep({
  variant,
  onBack,
  onDone,
}: {
  variant: Exclude<ContactVariant, "none">;
  onBack: () => void;
  onDone: () => void;
}) {
  const isMax = variant === "max";
  return isMax ? (
    <ContactStepMax onBack={onBack} onDone={onDone} />
  ) : (
    <ContactStepTelegram onBack={onBack} onDone={onDone} />
  );
}

const TG_STEPS = [
  {
    title: "Открой настройки Telegram",
    text: "Внизу справа — иконка «Настройки» (шестерёнка). На iPhone — вкладка «Settings».",
  },
  {
    title: "Нажми «Изменить» рядом с именем",
    text: "В самом верху экрана настроек, справа от твоего имени и фото.",
  },
  {
    title: "Задай Username",
    text: "Пункт «Имя пользователя» / «Username». Придумай короткое латинское имя (a–z, 0–9, _). Оно должно быть свободным.",
  },
  {
    title: "Сохрани и вернись сюда",
    text: "После сохранения нажми «Проверить» внизу — мы обновим твой контакт автоматически.",
  },
];

function ContactStepTelegram({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [checks, setChecks] = useState(0);
  const [status, setStatus] = useState<"idle" | "not_found" | "checking">("idle");
  const [tab, setTab] = useState<"text" | "video">("text");

  const handleCheck = () => {
    setStatus("checking");
    setTimeout(() => {
      const next = checks + 1;
      setChecks(next);
      // В демо: первая проверка — не найдено, вторая — успех
      if (next >= 2) {
        onDone();
      } else {
        setStatus("not_found");
      }
    }, 700);
  };


  return (
    <div className="px-4 pb-8">
      <PageHeader title="Настрой Telegram" onBack={onBack} />

      <div className="flex items-center gap-2 mb-3 px-1">
        <TelegramIcon size={22} />
        <p className="text-[13px] text-muted-foreground leading-snug">
          Чтобы бадди мог тебе написать, задай username в Telegram — это займёт минуту.
        </p>
      </div>

      {/* Переключатель Текст / Видео */}
      <div className="flex rounded-xl mb-3" style={{ background: "#f0ebe2", padding: 4 }}>
        {([
          { k: "text" as const, label: "📖 Текст" },
          { k: "video" as const, label: "▶️ Видео" },
        ]).map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
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

      {tab === "video" ? (
        <div
          className="rounded-2xl mb-4 overflow-hidden hairline animate-fade-up"
          style={{ background: "linear-gradient(135deg, #eaf3ff, #dbe9ff)" }}
        >
          <div className="aspect-video flex items-center justify-center relative">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
            >
              <Play className="h-6 w-6" style={{ color: "#229ED9" }} fill="#229ED9" />
            </div>
          </div>
          <div className="px-4 py-3 bg-card">
            <p className="text-[13px] font-semibold">🎬 Видео: как задать username в Telegram</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">1:20 · пошагово, со скриншотами</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-4 animate-fade-up">
          {TG_STEPS.map((s, i) => (
            <div key={i} className="bg-card hairline shadow-card rounded-2xl p-3.5">
              <div className="flex items-start gap-3">
                <div
                  className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-semibold leading-tight">{s.title}</h4>
                  <p className="text-[13px] text-muted-foreground mt-1 leading-snug">{s.text}</p>
                </div>
              </div>
              <div
                className="mt-3 rounded-xl flex items-center justify-center text-[11px] text-muted-foreground"
                style={{
                  background: "repeating-linear-gradient(45deg, #f5efe4, #f5efe4 8px, #ede4d0 8px, #ede4d0 16px)",
                  height: 140,
                }}
              >
                скриншот шага {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}


      {status === "not_found" && (
        <div
          className="rounded-xl p-3 mb-3 text-[13px] flex items-start gap-2"
          style={{ background: "#fff4f4", border: "1px solid #ffcccc", color: "#c62828" }}
        >
          <X className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Username пока не найден. Убедись, что сохранил его в Telegram, и нажми «Проверить» ещё раз.
          </span>
        </div>
      )}

      <button
        disabled={status === "checking"}
        onClick={handleCheck}
        className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition-all"
        style={{
          background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          opacity: status === "checking" ? 0.6 : 1,
          boxShadow: "0 6px 20px rgba(255,109,0,0.40)",
        }}
      >
        {status === "checking" ? "Проверяем…" : "Проверить"}
      </button>
    </div>
  );
}

const MAX_STEPS = [
  {
    title: "Открой свой профиль в MAX",
    text: "Нижняя панель — вкладка «Профиль» (иконка человека справа).",
  },
  {
    title: "Нажми «Поделиться профилем»",
    text: "Кнопка «Поделиться» / значок стрелки. Выбери «Скопировать ссылку».",
  },
  {
    title: "Вернись сюда и вставь скопированное",
    text: "MAX копирует ссылку вместе с текстом — вставляй всё как есть, мы сами достанем ссылку.",
  },
];

function ContactStepMax({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"text" | "video">("text");


  const valid = pasted.trim().length > 5;

  const handleCheck = () => {
    if (!valid) {
      setError("Вставь то, что скопировал в MAX — вместе с текстом.");
      return;
    }
    setError(null);
    onDone();
  };

  return (
    <div className="px-4 pb-8">
      <PageHeader title="Получи ссылку в MAX" onBack={onBack} />

      <div className="flex items-center gap-2 mb-3 px-1">
        <MaxIcon size={22} />
        <p className="text-[13px] text-muted-foreground leading-snug">
          Скопируй ссылку на свой профиль в MAX и вставь её ниже — бадди сможет тебе написать.
        </p>
      </div>

      {/* Переключатель Текст / Видео */}
      <div className="flex rounded-xl mb-3" style={{ background: "#f0ebe2", padding: 4 }}>
        {([
          { k: "text" as const, label: "📖 Текст" },
          { k: "video" as const, label: "▶️ Видео" },
        ]).map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
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

      {tab === "video" ? (
        <div
          className="rounded-2xl mb-4 overflow-hidden hairline animate-fade-up"
          style={{ background: "linear-gradient(135deg, #fff1e0, #ffe3c2)" }}
        >
          <div className="aspect-video flex items-center justify-center relative">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
            >
              <Play className="h-6 w-6" style={{ color: "#FF6D00" }} fill="#FF6D00" />
            </div>
          </div>
          <div className="px-4 py-3 bg-card">
            <p className="text-[13px] font-semibold">🎬 Видео: как получить ссылку на профиль в MAX</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">1:10 · пошагово, со скриншотами</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-4 animate-fade-up">
          {MAX_STEPS.map((s, i) => (
            <div key={i} className="bg-card hairline shadow-card rounded-2xl p-3.5">
              <div className="flex items-start gap-3">
                <div
                  className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-semibold leading-tight">{s.title}</h4>
                  <p className="text-[13px] text-muted-foreground mt-1 leading-snug">{s.text}</p>
                </div>
              </div>
              <div
                className="mt-3 rounded-xl flex items-center justify-center text-[11px] text-muted-foreground"
                style={{
                  background: "repeating-linear-gradient(45deg, #f5efe4, #f5efe4 8px, #ede4d0 8px, #ede4d0 16px)",
                  height: 140,
                }}
              >
                скриншот шага {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}


      <div className="mb-3">
        <h3 className="text-[14px] font-semibold mb-1">Вставь скопированное</h3>
        <p className="text-[12px] text-muted-foreground mb-2">
          Вставляй всё как есть — вместе с текстом «Я пользуюсь мессенджером MAX…». Мы сами найдём ссылку.
        </p>
        <textarea
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Например: Я пользуюсь мессенджером MAX. Пиши мне: https://max.ru/u/…"
          className="w-full bg-card rounded-xl px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
          style={{ minHeight: 110, border: `1px solid ${pasted ? "#FF6D00" : "#ede8df"}` }}
        />
        {error && (
          <div
            className="mt-2 rounded-xl p-3 text-[13px] flex items-start gap-2"
            style={{ background: "#fff4f4", border: "1px solid #ffcccc", color: "#c62828" }}
          >
            <X className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleCheck}
        className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition-all"
        style={{
          background: "linear-gradient(135deg, #FFB300, #FF6D00)",
          opacity: valid ? 1 : 0.6,
          boxShadow: valid ? "0 6px 20px rgba(255,109,0,0.40)" : "none",
        }}
      >
        Проверить
      </button>
    </div>
  );
}

// ───────────────────────── Start bot step ─────────────────────────

function StartBotStep({
  variant,
  onBack,
  onNeedProfile,
  onDone,
}: {
  variant: "max" | "tg";
  onBack: () => void;
  onNeedProfile: () => void;
  onDone: () => void;
}) {
  const isMax = variant === "max";
  const Icon = isMax ? MaxIcon : TelegramIcon;
  const botName = isMax ? "@moya_zhizn_bot" : "@moya_zhizn_bot";
  const botUrl = isMax ? "https://max.ru/moya_zhizn_bot" : "https://t.me/moya_zhizn_bot";
  const accent = isMax ? "#FF6D00" : "#229ED9";
  const accentGrad = isMax
    ? "linear-gradient(135deg, #FFB300, #FF6D00)"
    : "linear-gradient(135deg, #2AABEE, #229ED9)";
  const bgSoft = isMax
    ? "linear-gradient(135deg, #fff1e0, #ffe3c2)"
    : "linear-gradient(135deg, #eaf3ff, #dbe9ff)";

  const currentMsg = isMax ? "Ты сейчас в Telegram" : "Ты сейчас в MAX";
  const targetName = isMax ? "MAX" : "Telegram";
  const authorMsg = isMax
    ? "Автор заявки, на которую ты хочешь откликнуться, оставил канал связи — MAX. Чтобы бадди мог тебе написать в MAX, сначала запусти бота клуба в MAX."
    : "Автор заявки, на которую ты хочешь откликнуться, оставил канал связи — Telegram. Чтобы бадди мог тебе написать в Telegram, сначала запусти бота клуба в Telegram.";

  const [checking, setChecking] = useState(false);
  const [notReady, setNotReady] = useState(false);

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setNotReady(true);
    }, 700);
  };

  return (
    <div className="px-4 pb-8">
      <PageHeader title={`Запусти бота в ${targetName}`} onBack={onBack} />

      <div
        className="rounded-2xl mb-4 p-4 hairline"
        style={{ background: bgSoft }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon size={26} />
          <span className="text-[13px] font-semibold" style={{ color: accent }}>
            {currentMsg} · нужен {targetName}
          </span>
        </div>
        <p className="text-[13px] leading-snug text-foreground/80">{authorMsg}</p>
      </div>

      <div className="bg-card hairline shadow-card rounded-2xl p-4 mb-4">
        <h3 className="text-[14px] font-semibold mb-2">Что нужно сделать</h3>
        <ol className="space-y-2 text-[13px] text-foreground/85 list-decimal pl-5">
          <li>Нажми «Перейти в {targetName} и нажать «Старт»» — откроется бот клуба.</li>
          <li>Нажми «Старт» в чате с ботом (или отправь /start).</li>
          <li>Вернись сюда и нажми «Я запустил бота, проверить».</li>
        </ol>
      </div>

      <a
        href={botUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="tap w-full rounded-2xl py-3.5 text-[14px] font-bold text-white flex items-center justify-center gap-2 mb-3"
        style={{ background: accentGrad, boxShadow: `0 6px 20px ${isMax ? "rgba(255,109,0,0.35)" : "rgba(34,158,217,0.35)"}` }}
      >
        <Icon size={18} />
        Перейти в {targetName} и нажать «Старт»
      </a>

      <button
        onClick={handleCheck}
        disabled={checking}
        className="w-full rounded-2xl py-3.5 text-[14px] font-bold transition-all bg-card hairline"
        style={{ color: accent, opacity: checking ? 0.6 : 1 }}
      >
        {checking ? "Проверяем…" : "Я запустил бота, проверить"}
      </button>

      {notReady && (
        <div
          className="mt-4 rounded-2xl p-4 animate-fade-up"
          style={{ background: "#fff8ea", border: "1px solid #ffd88a" }}
        >
          {isMax ? (
            <>
              <p className="text-[13px] font-semibold mb-1">Бот запущен ✅</p>
              <p className="text-[12.5px] text-foreground/80 leading-snug mb-3">
                Теперь пришли ссылку на свой профиль в MAX — бадди сможет тебе написать.
              </p>
              <button
                onClick={onNeedProfile}
                className="w-full rounded-xl py-3 text-[13px] font-bold text-white"
                style={{ background: accentGrad }}
              >
                Прислать ссылку на профиль MAX
              </button>
            </>
          ) : (
            <>
              <p className="text-[13px] font-semibold mb-1">Бот запущен, но…</p>
              <p className="text-[12.5px] text-foreground/80 leading-snug mb-3">
                У тебя не задан username в Telegram — бадди не сможет тебе написать. Задай короткое имя пользователя, это займёт минуту.
              </p>
              <button
                onClick={onNeedProfile}
                className="w-full rounded-xl py-3 text-[13px] font-bold text-white mb-2"
                style={{ background: accentGrad }}
              >
                Задать username в Telegram
              </button>
              <button
                onClick={onDone}
                className="w-full rounded-xl py-2.5 text-[12.5px] font-medium text-muted-foreground"
              >
                Демо: username уже есть — продолжить
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
