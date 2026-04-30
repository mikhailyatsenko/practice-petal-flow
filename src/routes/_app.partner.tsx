import { createFileRoute } from "@tanstack/react-router";
import { SubItemList, SectionHeader } from "@/components/section/SubItemList";
import { Copy, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/partner")({
  head: () => ({
    meta: [
      { title: "Партнёрка — Клуб «Моя жизнь»" },
      { name: "description", content: "Приглашай друзей и делай участие в клубе бесплатным." },
    ],
  }),
  component: PartnerScreen,
});

function PartnerScreen() {
  return (
    <div className="px-4">
      <SectionHeader emoji="📍" title="Партнёрка" subtitle="Пригласи друга — и клуб станет бесплатным." />

      {/* Balance */}
      <div className="rounded-2xl bg-card hairline shadow-card p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Бонусы</p>
        <p className="mt-1 text-[24px] font-semibold">💰 0 ₽</p>

        <button className="tap btn-pill-orange mt-3 w-full">
          <span className="inline-flex items-center justify-center gap-2">
            <Copy className="h-4 w-4" /> Скопировать партнёрскую ссылку
          </span>
        </button>
      </div>

      {/* How bonuses work */}
      <div className="mt-3 rounded-2xl bg-card hairline shadow-card p-4">
        <p className="text-[14px] leading-snug text-foreground">
          Каждый раз когда твой друг оплачивает клуб — тебе начисляется столько бонусных рублей, сколько он заплатил.
        </p>
        <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">
          Бонусы списываются вместо реальных денег при твоей следующей оплате.
        </p>

        <div className="mt-4 flex items-stretch gap-1.5">
          <BonusStep
            title="Друг платит"
            line1="1 ₽ — первый месяц"
            line2="1 000 ₽ — каждый следующий"
          />
          <StepArrow />
          <BonusStep
            title="Тебе начисляется"
            line1="1 бонусный ₽ — в первый месяц"
            line2="1 000 бонусов ₽ — с каждой оплаты"
            highlight
          />
          <StepArrow />
          <BonusStep
            title="Ты не платишь"
            line1="когда наступает твой день оплаты"
            line2="списываются бонусные рубли"
          />
        </div>
      </div>

      <h2 className="mt-5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        Разделы
      </h2>
      <SubItemList
        items={[
          { emoji: "👫", title: "Приглашённые друзья", subtitle: "Список тех, кто пришёл по твоей ссылке" },
          { emoji: "📜", title: "История начислений", subtitle: "Все партнёрские бонусы за период" },
          { emoji: "ℹ️", title: "Как это работает", subtitle: "Условия и пример расчёта" },
        ]}
      />
    </div>
  );
}

function BonusStep({
  title,
  line1,
  line2,
  highlight,
}: {
  title: string;
  line1: string;
  line2: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-0 rounded-xl p-2.5 flex flex-col ${
        highlight
          ? "bg-primary/10 border border-primary/20"
          : "bg-secondary border border-border"
      }`}
    >
      <p
        className={`text-[11px] font-semibold leading-tight ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {title}
      </p>
      <p className="mt-1.5 text-[10.5px] leading-snug text-foreground/80">{line1}</p>
      <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground">{line2}</p>
    </div>
  );
}

function StepArrow() {
  return (
    <div className="flex items-center justify-center shrink-0">
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}
