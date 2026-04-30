import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

interface TopbarProps {
  onMenu: () => void;
}

export function Topbar({ onMenu }: TopbarProps) {
  return (
    <header className="safe-top sticky top-0 z-30 px-4 pt-2 pb-2 bg-background/85 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onMenu}
          aria-label="Меню"
          className="tap h-9 w-9 rounded-[10px] bg-card hairline shadow-card flex items-center justify-center"
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>

        <div className="text-center min-w-0">
          <p className="text-[12px] leading-tight text-muted-foreground">Живи свою лучшую жизнь</p>
          <h1 className="text-[16px] leading-tight font-medium truncate">Клуб Моя жизнь</h1>
        </div>

        <Link
          to="/library"
          aria-label="Библиотека"
          className="tap h-9 w-9 rounded-full bg-card hairline shadow-card flex items-center justify-center text-[20px] leading-none"
        >
          <span aria-hidden="true">📚</span>
        </Link>
      </div>
    </header>
  );
}
