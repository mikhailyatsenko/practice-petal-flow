import { CalendarClock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ackCallReminder, useCallReminder } from "@/lib/callReminderMode";

export function CallReminderBanner() {
  const navigate = useNavigate();
  const { mode, ack } = useCallReminder();
  if (!mode || ack) return null;

  const isBuddy = mode === "buddy";
  const title = isBuddy ? "Завтра созвон с Бадди!" : "Завтра созвон с Четвёркой!";
  const subtitle = "Подготовься и приходи вовремя";

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[61] w-full max-w-md px-3 pb-2 block"
      style={{
        top: "var(--call-reminder-top, 0px)",
        paddingTop: "var(--call-reminder-pt, max(env(safe-area-inset-top), 8px))",
      }}
      role="status"
    >
      <button
        type="button"
        onClick={() => {
          if (isBuddy) navigate({ to: "/buddy", search: { demo: "has" } });
          else navigate({ to: "/foursome" });
        }}
        className="tap relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3 text-white shadow-[0_10px_30px_rgba(30,136,229,0.45)] w-full text-left"
        style={{
          background: "linear-gradient(135deg, #42A5F5, #1E88E5)",
          animation: "callrem-pulse 1.8s ease-in-out infinite",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
            animation: "callrem-shine 2.4s linear infinite",
          }}
        />
        <span className="relative h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-tight">{title}</p>
          <p className="text-[12px] opacity-95 leading-tight mt-0.5">{subtitle}</p>
        </div>
        <span
          className="relative text-[12px] font-bold bg-white/25 rounded-full px-3 py-1.5"
        >
          Открыть
        </span>
      </button>

      <style>{`
        @keyframes callrem-pulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(30,136,229,0.45); }
          50% { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(30,136,229,0.6); }
        }
        @keyframes callrem-shine {
          0% { transform: translateX(0); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}
