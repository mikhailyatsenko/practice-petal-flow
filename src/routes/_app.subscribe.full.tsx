import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { BackButton } from "@/components/layout/BackButton";
import { Check, Crown, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/_app/subscribe/full")({
  head: () => ({ meta: [{ title: "Подписка — Клуб «Моя жизнь»" }] }),
  component: FullScreen,
});

const benefits = [
  "Неограниченный доступ ко всем практикам",
  "Закрытое сообщество участников",
  "Новые материалы каждую неделю",
  "Отмена в любой момент",
];

function FullScreen() {
  const router = useRouter();

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
              Членство в клубе
            </span>
          </div>
          <h1 className="mt-3 text-[28px] font-bold leading-tight">
            Полный доступ к клубу
          </h1>
          <p className="mt-2 text-[14px] leading-snug opacity-95">
            Продолжайте развиваться вместе с сообществом. Получайте инструменты, поддержку и практики для осознанной жизни.
          </p>

          <div className="mt-5 flex items-baseline gap-2">
            <div className="text-[40px] font-bold leading-none">1000₽</div>
            <div className="text-[14px] opacity-90">/ каждые 30 дней</div>
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
          search={{ amount: 1000 }}
          className="tap btn-orange flex w-full items-center justify-center gap-2 py-5 text-[17px] font-semibold"
          style={{ borderRadius: 20, boxShadow: "var(--shadow-orange)" }}
        >
          <Crown className="h-5 w-5" />
          Вступить в клуб за 1000₽
        </Link>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          Списание 1000₽ каждые 30 дней · отмена в любой момент
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Лучшее предложение для постоянного роста</span>
      </div>
    </div>
  );
}
