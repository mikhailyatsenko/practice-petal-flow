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
      <div className="mt-3 rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg,#F2A65A,#FF6D00)" }}>
        <div className="text-[12px] uppercase opacity-90" style={{ letterSpacing: 1 }}>Специальное предложение</div>
        <h1 className="mt-1 text-[26px] font-bold leading-tight">Вступить в клуб за 1₽</h1>
        <p className="mt-2 text-[14px] opacity-95">Только 24 часа — попробуйте все возможности клуба за символическую цену.</p>
        <div className="mt-4 rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
          <div className="text-[11px] opacity-90">До конца предложения</div>
          <div className="text-[28px] font-bold tabular-nums">{time}</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Feature emoji="🎯" title="Все практики и задания" text="Полный доступ к программе развития." />
        <Feature emoji="👥" title="Бадди и четвёрки" text="Поддержка единомышленников каждый день." />
        <Feature emoji="📚" title="Библиотека материалов" text="Видео, статьи и упражнения." />
        <Feature emoji="🤖" title="AI-наставник" text="Помощь и проверка заданий." />
      </div>

      <Link
        to="/subscribe/confirm"
        search={{ amount: 1 }}
        className="mt-6 flex w-full items-center justify-center rounded-2xl py-4 text-[16px] font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#FF8A3D,#FF5E62)" }}
      >
        Вступить за 1₽
      </Link>
      <p className="mt-3 text-center text-[12px] text-muted-foreground">Отписаться можно в любой момент</p>
    </div>
  );
}

function Feature({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="rounded-xl bg-card hairline p-4 flex gap-3">
      <div className="text-[22px]">{emoji}</div>
      <div>
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[13px] text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}
