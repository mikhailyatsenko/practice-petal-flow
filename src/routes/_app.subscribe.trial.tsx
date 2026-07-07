import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/layout/BackButton";

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
  return {
    h: String(Math.floor(left / 3600)).padStart(2, "0"),
    m: String(Math.floor((left % 3600) / 60)).padStart(2, "0"),
    s: String(left % 60).padStart(2, "0"),
  };
}

const GREEN_GRADIENT = "linear-gradient(135deg, #8DC63F 0%, #5BA229 55%, #3E6B1F 100%)";
const GREEN_SHADOW = "0 10px 24px -8px rgba(75, 130, 40, 0.55)";

function TrialScreen() {
  const router = useRouter();
  const { h, m, s } = useCountdown(24 * 3600);

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
            🎁 Специальное предложение
          </span>
          <h1 className="relative mt-4 text-[30px] font-extrabold leading-tight">
            Первый месяц<br />всего за 1 ₽
          </h1>
          <p className="relative mt-3 text-[14px] leading-snug opacity-95">
            Попробуйте все возможности клуба за 1 ₽. Через 30 дней — 1 000 ₽/месяц. Отписаться можно в любой момент.
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="mt-4 animate-fade-up rounded-3xl bg-card hairline p-5" style={{ animationDelay: "60ms" }}>
        <div className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          ⏳ Предложение заканчивается через
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          {[{ v: h, l: "часов" }, { v: m, l: "минут" }, { v: s, l: "секунд" }].map((u, i) => (
            <div key={u.l} className="flex items-center gap-2">
              <div
                className="flex w-[76px] flex-col items-center rounded-2xl py-2"
                style={{ background: "rgba(255,109,0,0.12)" }}
              >
                <div className="text-[30px] font-extrabold leading-none tabular-nums" style={{ color: "#FF6D00" }}>
                  {u.v}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{u.l}</div>
              </div>
              {i < 2 && <div className="text-[22px] font-bold" style={{ color: "#FF6D00" }}>:</div>}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          После истечения стоимость станет 1 000 ₽/месяц
        </p>
      </div>

      {/* Promo card */}
      <div className="mt-4 animate-fade-up rounded-3xl bg-card hairline p-5" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: "rgba(255,109,0,0.14)", color: "#FF6D00" }}>
            🔥 АКЦИЯ
          </span>
          <span className="text-[13px] text-muted-foreground">· вы экономите <span className="font-bold" style={{ color: "#3E6B1F" }}>999 ₽</span></span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex flex-col items-center rounded-2xl py-4" style={{ background: "rgba(255,109,0,0.10)" }}>
            <div className="text-[11px] text-muted-foreground">первый месяц</div>
            <div className="mt-2 text-[34px] font-extrabold leading-none" style={{ color: "#FF6D00" }}>1 ₽</div>
          </div>
          <div className="text-muted-foreground">→</div>
          <div className="flex flex-col items-center rounded-2xl bg-muted py-4">
            <div className="text-[11px] text-muted-foreground">вместо</div>
            <div className="mt-2 text-[24px] font-bold leading-none text-muted-foreground line-through">1 000 ₽</div>
          </div>
        </div>

        <div className="mt-4 border-t hairline pt-3 text-center">
          <div className="text-[14px] font-semibold">Далее — 1 000 ₽/месяц</div>
          <div className="text-[12px] text-muted-foreground">Отписка в любой момент</div>
        </div>
      </div>

      {/* Green CTA */}
      <div className="mt-6 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <Link
          to="/subscribe/confirm"
          search={{ amount: 1 }}
          className="tap flex w-full items-center justify-center gap-2 py-5 text-[17px] font-semibold text-white"
          style={{ background: GREEN_GRADIENT, borderRadius: 999, boxShadow: GREEN_SHADOW }}
        >
          Вступить за один рубль
        </Link>
      </div>
    </div>
  );
}
