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

      <div
        className="mt-3 rounded-3xl p-6 text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg,#16a34a 0%,#22c55e 50%,#4ade80 100%)",
          boxShadow: "0 20px 40px -15px rgba(22,163,74,0.45)",
        }}
      >
        <div className="text-[12px] uppercase opacity-95" style={{ letterSpacing: 1 }}>
          Членство в клубе
        </div>
        <h1 className="mt-1 text-[26px] font-bold leading-tight">
          Полный доступ к клубу
        </h1>
        <p className="mt-2 text-[14px] opacity-95">
          Продолжайте развиваться вместе с сообществом. Списание 1000₽ каждые 30 дней. Отписаться можно в любой момент.
        </p>
        <div className="mt-4 flex items-baseline gap-2">
          <div className="text-[36px] font-bold">1000₽</div>
          <div className="text-[14px] opacity-90">/ каждые 30 дней</div>
        </div>
      </div>

      <Link
        to="/subscribe/confirm"
        search={{ amount: 1000 }}
        className="mt-8 flex w-full items-center justify-center rounded-full py-5 text-[17px] font-semibold text-white transition-transform active:scale-[0.98]"
        style={{
          background:
            "linear-gradient(135deg,#16a34a 0%,#22c55e 45%,#4ade80 100%)",
          boxShadow:
            "0 18px 35px -10px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
        }}
      >
        Вступить в клуб за 1000₽
      </Link>
      <p className="mt-3 text-center text-[12px] text-muted-foreground">
        Списание каждые 30 дней · отписаться можно в любой момент
      </p>
    </div>
  );
}
