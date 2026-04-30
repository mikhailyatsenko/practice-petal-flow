import { createFileRoute } from "@tanstack/react-router";
import { SubItemList, SectionHeader } from "@/components/section/SubItemList";
import { Copy } from "lucide-react";

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
