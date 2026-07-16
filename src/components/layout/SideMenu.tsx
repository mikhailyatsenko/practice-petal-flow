import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Settings, LifeBuoy, LogOut, CheckCircle2, PlayCircle, Users, UsersRound, RotateCcw, CalendarPlus, Bell, BellOff, Sparkles, Crown, ShieldCheck, Globe, Video, CalendarClock, Gift } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { resetAllPractices, advanceToNextDay } from "@/lib/practicesStore";
import { useBuddyRequestMode, toggleBuddyRequestMode } from "@/lib/buddyRequestMode";
import { useFoursomeRequestMode, toggleFoursomeRequestMode } from "@/lib/foursomeRequestMode";
import { useCallReminder, toggleCallReminderMode } from "@/lib/callReminderMode";
import { usePreviewLevel, togglePreviewLevel, type PreviewLevel } from "@/lib/previewLevel";
import { useLevel4Gift, toggleGiftMode, resetGift } from "@/lib/level4Gift";
import { useLevel1DoneMode, toggleLevel1DoneMode, setLevel1DoneMode } from "@/lib/level1DoneMode";
import { useLevel2DoneMode, toggleLevel2DoneMode, setLevel2DoneMode } from "@/lib/level2DoneMode";
import { useLevel3DoneMode, toggleLevel3DoneMode, setLevel3DoneMode } from "@/lib/level3DoneMode";
import { useLevel4DoneMode, toggleLevel4DoneMode, setLevel4DoneMode } from "@/lib/level4DoneMode";
import { useLevel5WaitingMode, toggleLevel5WaitingMode, setLevel5WaitingMode } from "@/lib/level5WaitingMode";
import { setPreviewLevel } from "@/lib/previewLevel";
import { TelegramIcon, MaxIcon } from "@/components/icons/MessengerIcons";

interface SideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenOnboarding?: () => void;
}

export function SideMenu({ open, onOpenChange, onOpenOnboarding }: SideMenuProps) {
  const buddyMode = useBuddyRequestMode();
  const foursomeMode = useFoursomeRequestMode();
  const { mode: callMode } = useCallReminder();
  const previewLevel = usePreviewLevel();
  const gift = useLevel4Gift();
  const level1Done = useLevel1DoneMode();
  const level2Done = useLevel2DoneMode();
  const level3Done = useLevel3DoneMode();
  const level4Done = useLevel4DoneMode();
  const level5Waiting = useLevel5WaitingMode();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[320px] bg-background p-0 overflow-y-auto" data-version="v2">
        <SheetHeader className="sr-only">
          <SheetTitle>Меню</SheetTitle>
        </SheetHeader>

        <div className="safe-top px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full btn-orange flex items-center justify-center text-white font-semibold">
              <span className="relative z-10">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-medium leading-tight truncate">Александр</p>
              <p className="text-[12px] text-muted-foreground leading-tight truncate">@alex</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-card hairline px-3 py-2.5">
            <div className="flex items-center gap-2 text-[12px]">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Подписка активна до</span>
            </div>
            <p className="mt-0.5 text-[13.5px] font-medium">01.05.2026 · 13 дней</p>
            <Link
              to="/subscribe/manage"
              onClick={() => onOpenChange(false)}
              className="tap mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-card hairline px-3 py-2 text-[12px] font-medium text-foreground"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              Управление подпиской
            </Link>
          </div>
        </div>

        <nav className="px-2 py-3">
          <Link
            to="/welcome"
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <Globe className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Выбор страны</span>
          </Link>

          <Link
            to="/onboarding"
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <PlayCircle className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Вводная страница</span>
          </Link>


          <Link
            to="/subscribe/trial"
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Подписка за 1₽</span>
          </Link>
          <Link
            to="/subscribe/full"
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <Crown className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Подписка 1000₽</span>
          </Link>
          <Link
            to="/subscribe/confirm"
            search={{ amount: 1000 }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Подтверждение подписки</span>
          </Link>

          <button
            onClick={() => {
              advanceToNextDay();
              onOpenChange(false);
            }}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground font-medium"
          >
            <CalendarPlus className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>➡️ Следующий день</span>
          </button>

          <button
            onClick={() => {
              resetAllPractices();
              onOpenChange(false);
            }}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-primary font-medium"
          >
            <RotateCcw className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>🔄 Сбросить дни</span>
          </button>

          <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-muted-foreground/70" style={{ letterSpacing: 0.5 }}>
            Демо-страницы
          </div>
          <Link
            to="/buddy"
            search={{ demo: "has" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <Users className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Бадди — есть бадди</span>
          </Link>

          <Link
            to="/buddy"
            search={{ demo: "has-no-link" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <Users className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Мой Бадди — ссылка не создана</span>
          </Link>

          <Link
            to="/telemost-link"
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <Video className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Ссылка для созвонов</span>
          </Link>
          <Link
            to="/foursome-chat"
            search={{ messenger: "telegram" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <TelegramIcon size={18} />
            <span>Общий чат Четвёрки — Telegram</span>
          </Link>
          <Link
            to="/foursome-chat"
            search={{ messenger: "max" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <MaxIcon size={18} />
            <span>Общий чат Четвёрки — MAX</span>
          </Link>

          <button
            onClick={() => {
              toggleBuddyRequestMode();
            }}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
            style={{ color: buddyMode ? "#E53935" : "#FF6D00" }}
          >
            {buddyMode ? (
              <BellOff className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
            <span>
              {buddyMode ? "Выключить режим запроса бадди" : "Включить режим запроса бадди"}
            </span>
          </button>
          <Link
            to="/foursome"
            search={{ demo: "has", cards: "empty" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <UsersRound className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Четвёрка — карточки не заполнены</span>
          </Link>
          <Link
            to="/foursome"
            search={{ demo: "has", cards: "full" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <UsersRound className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Четвёрка — карточки заполнены</span>
          </Link>
          <button
            onClick={() => {
              toggleFoursomeRequestMode();
            }}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
            style={{ color: foursomeMode ? "#E53935" : "#FF6D00" }}
          >
            {foursomeMode ? (
              <BellOff className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
            <span>
              {foursomeMode ? "Выключить режим запроса четвёрки" : "Включить режим запроса четвёрки"}
            </span>
          </button>

          <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-muted-foreground/70" style={{ letterSpacing: 0.5 }}>
            Демо · мессенджеры
          </div>
          <Link
            to="/community"
            search={{ promote: "max" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <MaxIcon size={18} />
            <span>Открыть клуб в MAX</span>
          </Link>
          <Link
            to="/community"
            search={{ promote: "telegram" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <TelegramIcon size={18} />
            <span>Открыть клуб в Telegram</span>
          </Link>
          <Link
            to="/community"
            search={{ country: "kz" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <TelegramIcon size={18} />
            <span>Комьюнити — Казахстан</span>
          </Link>



          <Link
            to="/buddy"
            search={{ demo: "create-tg-no-username" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <TelegramIcon size={18} />
            <span>Заявка — Telegram без юзернейма</span>
          </Link>
          <Link
            to="/buddy"
            search={{ demo: "create-max" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <MaxIcon size={18} />
            <span>Заявка — MAX</span>
          </Link>

          <Link
            to="/buddy"
            search={{ demo: "start-max-bot" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <MaxIcon size={18} />
            <span>Отклик — запусти MAX-бота</span>
          </Link>
          <Link
            to="/buddy"
            search={{ demo: "start-tg-bot" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <TelegramIcon size={18} />
            <span>Отклик — запусти Telegram-бота</span>
          </Link>

          <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-muted-foreground/70" style={{ letterSpacing: 0.5 }}>
            Напоминание о созвоне
          </div>
          {([
            { m: "buddy" as const, label: "Завтра созвон с Бадди", off: "Выключить: завтра созвон с Бадди" },
            { m: "buddy-2h" as const, label: "2 часа до созвона с Бадди", off: "Выключить: 2 часа до созвона с Бадди" },
            { m: "buddy-no-link" as const, label: "Завтра созвон с Бадди — ссылки нет", off: "Выключить: завтра созвон с Бадди — ссылки нет" },
            { m: "buddy-2h-no-link" as const, label: "2 часа до созвона с Бадди — ссылки нет", off: "Выключить: 2 часа до созвона с Бадди — ссылки нет" },
            { m: "foursome" as const, label: "Завтра созвон с Четвёркой", off: "Выключить: завтра созвон с Четвёркой" },
            { m: "foursome-2h" as const, label: "2 часа до созвона с Четвёркой", off: "Выключить: 2 часа до созвона с Четвёркой" },
          ]).map(({ m, label, off }) => {
            const active = callMode === m;
            return (
              <button
                key={m}
                onClick={() => toggleCallReminderMode(m)}
                className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
                style={{ color: active ? "#E53935" : "#1E88E5" }}
              >
                <CalendarClock className="h-[18px] w-[18px]" strokeWidth={2} />
                <span>{active ? off : label}</span>
              </button>
            );
          })}

          <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-muted-foreground/70" style={{ letterSpacing: 0.5 }}>
            Демо-уровни
          </div>
          {([1, 2, 3, 4, 5, 6] as PreviewLevel[]).map((n) => {
            const active = previewLevel === n && !level1Done && !level2Done && !level3Done && !level4Done;
            return (
              <div key={n}>
                <button
                  onClick={() => {
                    if (level1Done) setLevel1DoneMode(false);
                    if (level2Done) setLevel2DoneMode(false);
                    if (level3Done) setLevel3DoneMode(false);
                    if (level4Done) setLevel4DoneMode(false);
                    togglePreviewLevel(n);
                  }}
                  className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
                  style={{ color: active ? "#E53935" : "#FF6D00" }}
                >
                  {active ? (
                    <BellOff className="h-[18px] w-[18px]" strokeWidth={2} />
                  ) : (
                    <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
                  )}
                  <span>
                    {active ? `Выключить уровень ${n}` : `Включить уровень ${n}`}
                  </span>
                </button>
                {n === 1 && (
                  <button
                    onClick={() => {
                      if (level2Done) setLevel2DoneMode(false);
                      if (level3Done) setLevel3DoneMode(false);
                      if (level4Done) setLevel4DoneMode(false);
                      if (!level1Done) {
                        setPreviewLevel(1);
                        setLevel1DoneMode(true);
                      } else {
                        toggleLevel1DoneMode();
                      }
                    }}
                    className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
                    style={{ color: level1Done ? "#E53935" : "#22A557" }}
                  >
                    {level1Done ? (
                      <BellOff className="h-[18px] w-[18px]" strokeWidth={2} />
                    ) : (
                      <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} />
                    )}
                    <span>
                      {level1Done ? "Выключить: 1-й уровень пройден" : "1-й уровень пройден"}
                    </span>
                  </button>
                )}
                {n === 2 && (
                  <button
                    onClick={() => {
                      if (level1Done) setLevel1DoneMode(false);
                      if (level3Done) setLevel3DoneMode(false);
                      if (level4Done) setLevel4DoneMode(false);
                      if (!level2Done) {
                        setPreviewLevel(2);
                        setLevel2DoneMode(true);
                      } else {
                        toggleLevel2DoneMode();
                      }
                    }}
                    className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
                    style={{ color: level2Done ? "#E53935" : "#22A557" }}
                  >
                    {level2Done ? (
                      <BellOff className="h-[18px] w-[18px]" strokeWidth={2} />
                    ) : (
                      <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} />
                    )}
                    <span>
                      {level2Done ? "Выключить: 2-й уровень пройден" : "2-й уровень пройден"}
                    </span>
                  </button>
                )}
                {n === 3 && (
                  <button
                    onClick={() => {
                      if (level1Done) setLevel1DoneMode(false);
                      if (level2Done) setLevel2DoneMode(false);
                      if (level4Done) setLevel4DoneMode(false);
                      if (!level3Done) {
                        setPreviewLevel(3);
                        setLevel3DoneMode(true);
                      } else {
                        toggleLevel3DoneMode();
                      }
                    }}
                    className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
                    style={{ color: level3Done ? "#E53935" : "#22A557" }}
                  >
                    {level3Done ? (
                      <BellOff className="h-[18px] w-[18px]" strokeWidth={2} />
                    ) : (
                      <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} />
                    )}
                    <span>
                      {level3Done ? "Выключить: 3-й уровень пройден" : "3-й уровень пройден"}
                    </span>
                  </button>
                )}
                {n === 4 && (
                  <button
                    onClick={() => {
                      if (level1Done) setLevel1DoneMode(false);
                      if (level2Done) setLevel2DoneMode(false);
                      if (level3Done) setLevel3DoneMode(false);
                      if (!level4Done) {
                        setPreviewLevel(4);
                        setLevel4DoneMode(true);
                      } else {
                        toggleLevel4DoneMode();
                      }
                    }}
                    className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
                    style={{ color: level4Done ? "#E53935" : "#22A557" }}
                  >
                    {level4Done ? (
                      <BellOff className="h-[18px] w-[18px]" strokeWidth={2} />
                    ) : (
                      <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} />
                    )}
                    <span>
                      {level4Done ? "Выключить: 4-й уровень пройден" : "4-й уровень пройден"}
                    </span>
                  </button>
                )}
              </div>
            );
          })}

          <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-muted-foreground/70" style={{ letterSpacing: 0.5 }}>
            Подарок за 4-й уровень
          </div>
          <button
            onClick={() => {
              // При включении сбрасываем факт активации, чтобы карточка/баннер снова появились.
              if (!gift.mode) resetGift();
              toggleGiftMode();
            }}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium"
            style={{ color: gift.mode ? "#E53935" : "#22A557" }}
          >
            <Gift className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>
              {gift.mode ? "Выключить: подарок за 4-й уровень" : "🎁 Подарок за переход на 4-й уровень"}
            </span>
          </button>


          <div className="my-2 border-t border-border" />
          <Link
            to="/settings"
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Настройки</span>
          </Link>
          <MenuItem icon={LifeBuoy} label="Поддержка" />
          <MenuItem icon={LogOut} label="Выход" danger />
        </nav>

        <div className="px-5 pt-4 pb-8">
          <button
            onClick={onOpenOnboarding}
            className="tap text-[11px] text-muted-foreground/70 underline underline-offset-2"
          >
            Демо онбординга
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MenuItem({ icon: Icon, label, danger }: { icon: typeof Settings; label: string; danger?: boolean }) {
  return (
    <button
      className={
        "tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] " +
        (danger ? "text-destructive" : "text-foreground")
      }
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}
