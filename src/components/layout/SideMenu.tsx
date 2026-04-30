import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Settings, LifeBuoy, LogOut, CheckCircle2, PlayCircle, Users, UsersRound, RotateCcw, CalendarPlus, Cog, Bell, BellOff, Layers } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { resetAllPractices, advanceToNextDay } from "@/lib/practicesStore";
import { useBuddyRequestMode, toggleBuddyRequestMode } from "@/lib/buddyRequestMode";
import { useFoursomeRequestMode, toggleFoursomeRequestMode } from "@/lib/foursomeRequestMode";
import { usePreviewLevel, togglePreviewLevel, type PreviewLevel } from "@/lib/previewLevel";

interface SideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenOnboarding?: () => void;
}

export function SideMenu({ open, onOpenChange, onOpenOnboarding }: SideMenuProps) {
  const buddyMode = useBuddyRequestMode();
  const foursomeMode = useFoursomeRequestMode();
  const previewLevel = usePreviewLevel();
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
          </div>
        </div>

        <nav className="px-2 py-3">
          <Link
            to="/flywheel"
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <Cog className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>⚙️ Маховик успеха</span>
          </Link>

          <Link
            to="/onboarding"
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <PlayCircle className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Вводная страница</span>
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
            search={{ demo: "has" }}
            onClick={() => onOpenChange(false)}
            className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-foreground"
          >
            <UsersRound className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Четвёрка — есть четвёрка</span>
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
            Демо-уровни
          </div>
          {([1, 2, 3, 4, 5] as PreviewLevel[]).map((n) => {
            const active = previewLevel === n;
            return (
              <button
                key={n}
                onClick={() => {
                  togglePreviewLevel(n);
                  if (!active) onOpenChange(false);
                }}
                className="tap w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium transition-colors"
                style={{
                  color: active ? "#FF6D00" : "#1a1a1a",
                  border: active ? "1.5px solid #FF6D00" : "1.5px solid transparent",
                  background: active ? "rgba(255,109,0,0.06)" : "transparent",
                  marginBottom: 4,
                }}
              >
                <Layers className="h-[18px] w-[18px]" strokeWidth={2} />
                <span>
                  {active ? `Выключить уровень ${n}` : `Включить уровень ${n}`}
                </span>
              </button>
            );
          })}

          <div className="my-2 border-t border-border" />
          <MenuItem icon={Settings} label="Настройки" />
          <MenuItem icon={LifeBuoy} label="Поддержка" />
          <MenuItem icon={LogOut} label="Выход" danger />
        </nav>

        <div className="px-5 pt-2 pb-5 mt-auto absolute bottom-0 left-0 right-0">
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
