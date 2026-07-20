import { Link } from "@tanstack/react-router";
import { Menu, Bell } from "lucide-react";
import { useBellMode } from "@/lib/bellMode";
import { useUnreadCount } from "@/lib/notificationsStore";

interface TopbarProps {
  onMenu: () => void;
  stickyTop?: number;
}

export function Topbar({ onMenu, stickyTop = 0 }: TopbarProps) {
  const bellOn = useBellMode();
  const unread = useUnreadCount();

  return (
    <header
      className="safe-top sticky z-30 px-4 pt-2 pb-2 bg-background/85 backdrop-blur-md"
      style={{ top: stickyTop }}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onMenu}
          aria-label="Меню"
          className="tap h-9 w-9 rounded-[10px] bg-card hairline shadow-card flex items-center justify-center"
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>

        <div className="text-center min-w-0">
          <p className="text-[12px] leading-tight text-muted-foreground">Добро пожаловать</p>
          <h1 className="text-[16px] leading-tight font-medium truncate">Клуб Моя Жизнь</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            aria-label="История уведомлений"
            className={
              "tap relative h-9 w-9 rounded-full flex items-center justify-center " +
              (unread > 0 ? "bg-card hairline shadow-card" : "")
            }
          >
            <Bell
              className={
                "h-[18px] w-[18px] " +
                (unread > 0 ? "text-[#FF6D00]" : "text-muted-foreground/50")
              }
              strokeWidth={2.2}
              style={
                unread > 0
                  ? { animation: "topbar-bell-shake 2.4s ease-in-out infinite" }
                  : { opacity: 0.45 }
              }
            />
            {unread > 0 && (
              <span
                aria-hidden
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1"
                style={{ background: "#E53935", boxShadow: "0 0 0 2px hsl(var(--background))" }}
              >
                {unread}
              </span>
            )}
            <style>{`
              @keyframes topbar-bell-shake {
                0%, 60%, 100% { transform: rotate(0deg); }
                65% { transform: rotate(-14deg); }
                70% { transform: rotate(12deg); }
                75% { transform: rotate(-8deg); }
                80% { transform: rotate(6deg); }
                85% { transform: rotate(-3deg); }
                90% { transform: rotate(1deg); }
              }
            `}</style>
          </Link>

          <Link
            to="/library"
            aria-label="Библиотека"
            className="tap h-9 w-9 rounded-full bg-card hairline shadow-card flex items-center justify-center text-[20px] leading-none"
          >
            <span aria-hidden="true">📚</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
