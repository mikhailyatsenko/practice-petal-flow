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
  const h = String(Math.floor(left / 3600)).padStart(2, "0");
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function TrialScreen() {
  const router = useRouter();
  const time = useCountdown(24 * 3600);
  return (
    <div className="px-5 pt-3 pb-10">
      <BackButton onClick={() => router.history.back()} />

      <div
        className="mt-3 rounded-3xl p-6 text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg,#16a34a 0%,#22c55e 50%,#4ade80 100%)",
          boxShadow: "0 20px 40px -15px rgba(22,163,74,0.45)",
        }}
      >
        <div className="text-[12px] uppercase opacity-95" style={{ letterSpacing: 1 }}>
          Специальное предложение
        </div>
        <h1 className="mt-1 text-[26px] font-bold leading-tight">
          Первый месяц за 1₽
        </h1>
        <p className="mt-2 text-[14px] opacity-95">
          Попробуйте все возможности клуба за 1₽. Через 30 дней — 1000₽ за следующий месяц. Отписаться можно в любой момент.
        </p>
        <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
          <div className="text-[11px] opacity-90">До конца предложения</div>
          <div className="text-[28px] font-bold tabular-nums">{time}</div>
        </div>
      </div>

      <Link
        to="/subscribe/confirm"
        search={{ amount: 1 }}
        className="mt-8 flex w-full items-center justify-center rounded-full py-5 text-[17px] font-semibold text-white transition-transform active:scale-[0.98]"
        style={{
          background:
            "linear-gradient(135deg,#16a34a 0%,#22c55e 45%,#4ade80 100%)",
          boxShadow:
            "0 18px 35px -10px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
        }}
      >
        Вступить в клуб за 1₽
      </Link>
      <p className="mt-3 text-center text-[12px] text-muted-foreground">
        Списание каждые 30 дней · отписаться можно в любой момент
      </p>
    </div>
  );
}
