import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";
import { BuddyLockedPreview } from "@/components/section/BuddyLockedPreview";
import { FoursomeLockedPreview } from "@/components/section/FoursomeLockedPreview";
import { isFeatureUnlocked, unlockLevelOf, usePreviewLevel } from "@/lib/previewLevel";
import { TelegramIcon, MaxIcon } from "@/components/icons/MessengerIcons";

export const Route = createFileRoute("/_app/community")({
  validateSearch: (search: Record<string, unknown>): { promote?: "max" | "telegram" } => {
    const p = search.promote;
    return p === "max" || p === "telegram" ? { promote: p } : {};
  },
  head: () => ({
    meta: [
      { title: "Комьюнити — Клуб «Моя жизнь»" },
      { name: "description", content: "Канал, чат, Бадди и Четвёрка — поддержка участников клуба." },
    ],
  }),
  component: CommunityScreen,
});

type ChannelKey = "channel" | "chat" | "help";

interface ChannelItem {
  key: ChannelKey;
  emoji: string;
  title: string;
  subtitle: string;
  telegram: string; // URL
  max: string; // URL
}

const CHANNELS: ChannelItem[] = [
  {
    key: "channel",
    emoji: "📣",
    title: "Общий канал",
    subtitle: "Новости и материалы от создателей",
    telegram: "https://t.me/mylife_club",
    max: "https://max.ru/mylife_club",
  },
  {
    key: "chat",
    emoji: "💬",
    title: "Общий чат",
    subtitle: "Общение участников и обмен опытом",
    telegram: "https://t.me/mylife_chat",
    max: "https://max.ru/mylife_chat",
  },
  {
    key: "help",
    emoji: "🛟",
    title: "Помощь",
    subtitle: "Связь с администратором",
    telegram: "https://t.me/mylife_admin",
    max: "https://max.ru/mylife_admin",
  },
];

function CommunityScreen() {
  const navigate = useNavigate();
  const previewLevel = usePreviewLevel();
  const buddyOpen = isFeatureUnlocked("buddy", previewLevel);
  const foursomeOpen = isFeatureUnlocked("foursome", previewLevel);
  const { promote } = Route.useSearch();

  const [openKey, setOpenKey] = useState<ChannelKey | null>(null);

  return (
    <div className="px-4">
      {promote === "max" && <PromoteBanner variant="max" />}
      {promote === "telegram" && <PromoteBanner variant="telegram" />}

      <SectionHeader emoji="👥" title="Комьюнити" subtitle="Поддержка, общение и партнёры по росту" />

      {/* Каналы с раскрытием мессенджеров */}
      <div className="space-y-2">
        {CHANNELS.map((c) => (
          <ChannelRow
            key={c.key}
            item={c}
            open={openKey === c.key}
            onToggle={() => setOpenKey(openKey === c.key ? null : c.key)}
          />
        ))}
      </div>

      {/* Затем: Бадди и Четвёрка — открытые или с замком */}
      <div className="mt-3 space-y-2">
        {buddyOpen ? (
          <SubItemList
            items={[
              {
                emoji: "👥",
                title: "Бадди",
                subtitle: "Партнёр для еженедельных созвонов",
                onClick: () => navigate({ to: "/buddy" }),
              },
            ]}
          />
        ) : (
          <BuddyLockedPreview unlockLevel={unlockLevelOf("buddy")} />
        )}

        {foursomeOpen ? (
          <SubItemList
            items={[
              {
                emoji: "👥👥",
                title: "Четвёрка",
                subtitle: "Группа из 4 человек, созвон раз в месяц",
                onClick: () => navigate({ to: "/foursome" }),
              },
            ]}
          />
        ) : (
          <FoursomeLockedPreview unlockLevel={unlockLevelOf("foursome")} />
        )}
      </div>
    </div>
  );
}

function ChannelRow({
  item,
  open,
  onToggle,
}: {
  item: ChannelItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card hairline rounded-xl shadow-card overflow-hidden">
      <button
        onClick={onToggle}
        className="tap w-full px-3.5 py-3 flex items-center gap-3 text-left"
      >
        <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-xl">
          {item.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-medium leading-tight truncate">{item.title}</h3>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground leading-snug line-clamp-2">
            {item.subtitle}
          </p>
        </div>
        <ChevronDown
          className="h-4 w-4 text-muted-foreground shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 animate-fade-up">
          <p className="px-1 pb-2 text-[11px] text-muted-foreground">
            {item.key === "help" ? "Напиши администратору в удобный мессенджер:" : "Открыть в удобном мессенджере:"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <MessengerLink href={item.telegram} kind="telegram" />
            <MessengerLink href={item.max} kind="max" />
          </div>
        </div>
      )}
    </div>
  );
}

function MessengerLink({ href, kind }: { href: string; kind: "telegram" | "max" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="tap flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium hairline bg-card"
    >
      {kind === "telegram" ? <TelegramIcon size={20} /> : <MaxIcon size={20} />}
      <span>{kind === "telegram" ? "Telegram" : "MAX"}</span>
    </a>
  );
}

function PromoteBanner({ variant }: { variant: "max" | "telegram" }) {
  const isMax = variant === "max";
  const href = isMax ? "https://max.ru/mylife_club" : "https://t.me/mylife_club";
  return (
    <div
      className="mt-2 mb-1 rounded-2xl p-3 animate-fade-up hairline"
      style={{ background: isMax ? "#f4f0ff" : "#eaf6fd" }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {isMax ? <MaxIcon size={40} /> : <TelegramIcon size={40} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold leading-tight">
            {isMax ? "Открой клуб и в MAX" : "Открой клуб и в Telegram"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground leading-snug">
            {isMax
              ? "Чтобы не терять сообщения от бадди и четвёрки, если они пишут в MAX."
              : "Чтобы не терять сообщения от бадди и четвёрки, если они пишут в Telegram."}
          </p>
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="tap mt-3 flex items-center justify-center rounded-xl w-full py-2 text-white font-semibold text-[13px] shadow-[0_4px_12px_rgba(255,109,0,0.30)]"
        style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
      >
        {isMax ? "Открыть в MAX →" : "Открыть в Telegram →"}
      </a>

      {false && (
        <div
          className="mt-2.5 relative aspect-video w-full rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2a1a05 0%, #4a2c0a 50%, #1a0e00 100%)" }}
        >
          <button
            aria-label="Воспроизвести"
            className="tap h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <span className="absolute bottom-2 right-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
            0:45
          </span>
        </div>
      )}

      <div className="mt-3 flex justify-center">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="tap inline-flex items-center justify-center rounded-xl px-10 py-2.5 text-white font-semibold text-[13.5px] shadow-[0_4px_12px_rgba(255,109,0,0.30)]"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          {isMax ? "Открыть в MAX →" : "Открыть в Telegram →"}
        </a>
      </div>
    </div>
  );
}

