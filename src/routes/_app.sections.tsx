import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";

export const Route = createFileRoute("/_app/sections")({
  head: () => ({
    meta: [
      { title: "Разделы магазина — Клуб «Моя жизнь»" },
      { name: "description", content: "Дополнительные разделы клуба, открываемые за очки." },
    ],
  }),
  component: SectionsScreen,
});

function SectionsScreen() {
  const navigate = useNavigate();
  return (
    <div className="px-4">
      <SectionHeader emoji="🧩" title="Разделы магазина" subtitle="Открывай дополнительные разделы за очки" />

      <SubItemList
        items={[
          { emoji: "💪", title: "Привычки",                subtitle: "Отслеживание любых привычек", price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/habits" }) },
          { emoji: "👑", title: "Качества характера",      subtitle: "Развитие 100+ качеств",       price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/qualities" }) },
          { emoji: "🌐", title: "Сферы жизни",                                                       price: "300 ⭐", locked: true },
          { emoji: "🧠", title: "Потребности",                                                       price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/needs" }) },
          { emoji: "💡", title: "Ценности",                                                          price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/values" }) },
          { emoji: "🤝", title: "Самоулучшение",            subtitle: "30 вопросов для рефлексии",    price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/self-improve" }) },
          { emoji: "🙏", title: "Дневник благодарности",                                              price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/gratitude" }) },
          { emoji: "🧭", title: "Дневник решений",                                                    price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/decisions" }) },
          { emoji: "📝", title: "Дневник ошибок",                                                     price: "300 ⭐", locked: true },
          { emoji: "⚖️", title: "Дневник ответственности",                                            price: "300 ⭐", locked: true },
          { emoji: "📔", title: "Создание дневников",                                                 price: "300 ⭐", locked: true },
          { emoji: "❄️", title: "Заморозка клуба",          subtitle: "Поставить клуб на паузу",     price: "300 ⭐", locked: true },
          { emoji: "🔰", title: "Страховка от пропуска",    subtitle: "Защита от обнуления",          price: "50 ⭐",  locked: true },
        ]}
      />
    </div>
  );
}
