import { createFileRoute } from "@tanstack/react-router";
import { SubItemList } from "@/components/section/SubItemList";
import { Copy, Share2 } from "lucide-react";

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
      {/* Header — иконка share + название (по референсу) */}
      <div className="flex flex-col items-center pt-6 pb-5">
        <Share2 className="h-9 w-9 text-muted-foreground" strokeWidth={1.75} />
        <h1 className="mt-2 text-[15px] font-medium text-muted-foreground tracking-wide">
          Партнёрка
        </h1>
        <p className="mt-2 text-[12.5px] text-muted-foreground/90 text-center max-w-[280px] leading-snug">
          1 друг = 1000 ₽ бонусов = бесплатное участие
        </p>
      </div>

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
