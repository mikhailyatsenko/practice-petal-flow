import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { BackButton } from "@/components/layout/BackButton";
import { Check } from "lucide-react";

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

const GREEN_GRADIENT = "linear-gradient(135deg, #8DC63F 0%, #5BA229 55%, #3E6B1F 100%)";
const GREEN_SHADOW = "0 10px 24px -8px rgba(75, 130, 40, 0.55)";

function FullScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background px-5 pt-3 pb-10">
      <BackButton onClick={() => router.history.back()} />

      <div className="mt-2 text-center animate-fade-up">
        <div className="text-[13px] text-muted-foreground">Добро пожаловать</div>
        <div className="text-[20px] font-bold">Клуб «Моя жизнь»</div>
      </div>

      {/* Orange hero */}
      <div className="mt-5 animate-fade-up">
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white shadow-orange"
          style={{ background: "var(--gradient-orange)" }}
        >
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute right-10 bottom-6 h-16 w-16 rounded-full bg-white/10" />
          <span className="relative inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[12px] font-semibold backdrop-blur">
            👑 Членство в клубе
          </span>
          <h1 className="relative mt-4 text-[30px] font-extrabold leading-tight">
            Полный доступ<br />к клубу
          </h1>
          <p className="relative mt-3 text-[14px] leading-snug opacity-95">
            Продолжайте развиваться вместе с сообществом. Инструменты, поддержка и практики для осознанной жизни.
          </p>

          <div className="relative mt-5 flex items-baseline gap-2">
            <div className="text-[40px] font-extrabold leading-none">1 000 ₽</div>
            <div className="text-[14px] opacity-90">/ каждые 30 дней</div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-5 animate-fade-up" style={{ animationDelay: "60ms" }}>
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

      {/* Price card */}
      <div className="mt-4 animate-fade-up rounded-3xl bg-card hairline p-5 text-center" style={{ animationDelay: "120ms" }}>
        <div className="text-[13px] text-muted-foreground">Стоимость членства</div>
        <div className="mt-1 text-[36px] font-extrabold leading-none" style={{ color: "#FF6D00" }}>1 000 ₽</div>
        <div className="mt-1 text-[12px] text-muted-foreground">каждые 30 дней · отписка в любой момент</div>
      </div>

      {/* Green CTA */}
      <div className="mt-6 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <Link
          to="/subscribe/confirm"
          search={{ amount: 1000 }}
          className="tap flex w-full items-center justify-center gap-2 py-5 text-[17px] font-semibold text-white"
          style={{ background: GREEN_GRADIENT, borderRadius: 999, boxShadow: GREEN_SHADOW }}
        >
          ✅ Даю согласие
        </Link>
      </div>
    </div>
  );
}
