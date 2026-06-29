import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BackButton } from "@/components/layout/BackButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIMEZONES, setTimezone, useTimezone } from "@/lib/timezoneStore";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Настройки — Клуб «Моя жизнь»" },
      { name: "description", content: "Настройки приложения: часовой пояс и другие параметры." },
    ],
  }),
  component: SettingsScreen,
});

function SettingsScreen() {
  const navigate = useNavigate();
  const tz = useTimezone();
  const [now, setNow] = useState("");

  useEffect(() => {
    const update = () => {
      try {
        setNow(
          new Intl.DateTimeFormat("ru-RU", {
            timeZone: tz,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            weekday: "short",
            day: "2-digit",
            month: "short",
          }).format(new Date()),
        );
      } catch {
        setNow("");
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [tz]);

  return (
    <div className="px-4">
      <div className="relative flex items-center px-1 pt-2 pb-3">
        <div className="relative z-10">
          <BackButton onClick={() => navigate({ to: "/" })} />
        </div>
        <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
          Настройки
        </h1>
      </div>

      <section className="mt-2">
        <div className="rounded-2xl bg-card hairline p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
            <h2 className="text-[15px] font-semibold">Часовой пояс</h2>
          </div>
          <p className="text-[13px] text-muted-foreground leading-snug mb-3">
            Выберите часовой пояс — по нему будут считаться сутки и сроки заданий.
          </p>

          <Select value={tz} onValueChange={setTimezone}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите часовой пояс" />
            </SelectTrigger>
            <SelectContent className="max-h-[60vh]">
              {TIMEZONES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-3 rounded-xl bg-muted/40 px-3 py-2.5 text-[13px]">
            <span className="text-muted-foreground">Текущее время: </span>
            <span className="font-medium">{now}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
