import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";

export const Route = createFileRoute("/_app/sections")({
  head: () => ({
    meta: [
      { title: "Разделы — Клуб «Моя жизнь»" },
      { name: "description", content: "Дополнительные разделы клуба, открываемые за очки." },
    ],
  }),
  component: SectionsScreen,
});

function SectionsScreen() {
  return (
    <div className="px-4">
      <SectionHeader emoji="🧩" title="Разделы" subtitle="Открывай дополнительные разделы за очки" />

      <SubItemList
        items={[
          { emoji: "💪", title: "Привычки",                subtitle: "Отслеживание любых привычек", price: "200 ⭐", locked: true },
          { emoji: "👑", title: "Качества характера",      subtitle: "Развитие 100+ качеств",       price: "200 ⭐", locked: true },
          { emoji: "🌐", title: "Сферы жизни",                                                       price: "200 ⭐", locked: true },
          { emoji: "🧠", title: "Потребности",                                                       price: "200 ⭐", locked: true },
          { emoji: "💡", title: "Ценности",                                                          price: "200 ⭐", locked: true },
          { emoji: "🤝", title: "Самоулучшение",            subtitle: "30 вопросов для рефлексии",    price: "200 ⭐", locked: true },
          { emoji: "🙏", title: "Дневник благодарности",                                              price: "200 ⭐", locked: true },
          { emoji: "🧭", title: "Дневник решений",                                                    price: "200 ⭐", locked: true },
          { emoji: "📝", title: "Дневник ошибок",                                                     price: "200 ⭐", locked: true },
          { emoji: "⚖️", title: "Дневник ответственности",                                            price: "200 ⭐", locked: true },
          { emoji: "📔", title: "Создание дневников",                                                 price: "200 ⭐", locked: true },
          { emoji: "🔰", title: "Страховка привычки",       subtitle: "Защита от обнуления",          price: "50 ⭐",  locked: true },
        ]}
      />
    </div>
  );
}
