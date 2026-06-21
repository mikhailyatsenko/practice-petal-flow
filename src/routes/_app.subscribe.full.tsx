import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { BackButton } from "@/components/layout/BackButton";

export const Route = createFileRoute("/_app/subscribe/full")({
  head: () => ({ meta: [{ title: "Подписка — Клуб «Моя жизнь»" }] }),
  component: FullScreen,
});

function FullScreen() {
  const router = useRouter();
  return (
    <div className="px-5 pt-3 pb-10">
      <BackButton onClick={() => router.history.back()} />
      <div className="mt-3 rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg,#F2A65A,#FF6D00)" }}>
        <div className="text-[12px] uppercase opacity-90" style={{ letterSpacing: 1 }}>Членство в клубе</div>
        <h1 className="mt-1 text-[26px] font-bold leading-tight">Полный доступ к клубу</h1>
        <p className="mt-2 text-[14px] opacity-95">Развивайтесь вместе с сообществом единомышленников и наставниками.</p>
        <div className="mt-4 flex items-baseline gap-2">
          <div className="text-[36px] font-bold">1000₽</div>
          <div className="text-[14px] opacity-90">/ месяц</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Feature emoji="🎯" title="Все практики и задания" text="Полный доступ к программе развития." />
        <Feature emoji="👥" title="Бадди и четвёрки" text="Поддержка единомышленников каждый день." />
        <Feature emoji="📚" title="Библиотека материалов" text="Видео, статьи и упражнения." />
        <Feature emoji="🤖" title="AI-наставник" text="Помощь и проверка заданий." />
        <Feature emoji="🏆" title="Награды и уровни" text="Растите и получайте признание клуба." />
      </div>

      <Link
        to="/subscribe/confirm"
        search={{ amount: 1000 }}
        className="mt-6 flex w-full items-center justify-center rounded-2xl py-4 text-[16px] font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#F2A65A,#FF6D00)" }}
      >
        Вступить за 1000₽
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
