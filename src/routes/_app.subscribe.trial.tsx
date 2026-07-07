import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/layout/BackButton";
import { Check, Sparkles, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/_app/subscribe/trial")({
  head: () => ({ meta: [{ title: "Подписка за 1₽ — Клуб «Моя жизнь»" }] }),
  component: TrialScreen,
});

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(left / 3600)).padStart(2, "0");
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const benefits = [
  "Все практики и инструменты клуба",
  "Сообщество единомышленников",
  "Ежедневная поддержка и материалы",
  "Отмена в любой момент",
];

function TrialScreen() {
  const router = useRouter();
  const time = useCountdown(24 * 3600);

  return (
    <div className="min-h-screen bg-background px-5 pt-3 pb-10">
      <BackButton onClick={() => router.history.back()} />

      <div className="mt-4 animate-fade-up">
        <div
          className="rounded-3xl p-6 text-white shadow-orange"
          style={{ background: "var(--gradient-orange)" }}
        >
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
              Специальное предложение
            </span>
          </div>
          <h1 className="mt-3 text-[28px] font-bold leading-tight">
            Первый месяц за 1₽
          </h1>
          <p className="mt-2 text-[14px] leading-snug opacity-95">
            Попробуйте все возможности клуба за символическую цену. Через 30 дней продолжится автопродление по 1000₽/мес.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
            <Clock className="h-5 w-5 opacity-90" />
            <div>
              <div className="text-[11px] opacity-90">До конца предложения</div>
              <div className="text-[26px] font-bold tabular-nums leading-none">{time}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Что включено
        </p>
        <div className="space-y-2.5">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3 rounded-2xl bg-card hairline px-4 py-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(255,109,0,0.12)" }}>
                <Check className="h-3 w-3" style={{ color: "#FF6D00" }} />
              </div>
              <span className="text-[14px] leading-snug">{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <Link
          to="/subscribe/confirm"
          search={{ amount: 1 }}
          className="tap btn-orange flex w-full items-center justify-center gap-2 py-5 text-[17px] font-semibold"
          style={{ borderRadius: 20, boxShadow: "var(--shadow-orange)" }}
        >
          <Sparkles className="h-5 w-5" />
          Вступить в клуб за 1₽
        </Link>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          Списание 1₽, затем 1000₽ каждые 30 дней · отмена в любой момент
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Уже более тысячи участников в клубе</span>
      </div>
    </div>
  );
}
