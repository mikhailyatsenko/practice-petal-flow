import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";

export const Route = createFileRoute("/_app/wishes")({
  head: () => ({
    meta: [
      { title: "Желания — Клуб «Моя жизнь»" },
      { name: "description", content: "Воронка воплощения: Хотелки → Желания → Цели → Задачи → Воплощённые." },
    ],
  }),
  component: WishesScreen,
});

function WishesScreen() {
  return (
    <div className="px-4">
      <SectionHeader emoji="🌟" title="Желания" subtitle="Воронка воплощения — от мысли к результату" />

      <SubItemList
        items={[
          { emoji: "💭", title: "Хотелки",     subtitle: "Свободный список всего, что хочется" },
          { emoji: "✨", title: "Желания",     subtitle: "Осознанные желания из хотелок" },
          { emoji: "🎯", title: "Цели",        subtitle: "Конкретные цели с дедлайном" },
          { emoji: "✅", title: "Задачи",      subtitle: "Ежедневные задачи к целям" },
          { emoji: "🏆", title: "Воплощённые", subtitle: "Архив исполненных желаний и целей" },
        ]}
      />
    </div>
  );
}
