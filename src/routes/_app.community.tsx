import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";

export const Route = createFileRoute("/_app/community")({
  head: () => ({
    meta: [
      { title: "Комьюнити — Клуб «Моя жизнь»" },
      { name: "description", content: "Канал, чат, Бадди и Четвёрка — поддержка участников клуба." },
    ],
  }),
  component: CommunityScreen,
});

function CommunityScreen() {
  const navigate = useNavigate();
  return (
    <div className="px-4">
      <SectionHeader emoji="👥" title="Комьюнити" subtitle="Поддержка, общение и партнёры по росту" />

      <SubItemList
        items={[
          { emoji: "📣", title: "Общий канал",  subtitle: "Новости и материалы от создателей" },
          { emoji: "💬", title: "Общий чат",    subtitle: "Общение участников и обмен опытом" },
          { emoji: "👥", title: "Бадди",        subtitle: "Партнёр для еженедельных созвонов", onClick: () => navigate({ to: "/buddy" }) },
          { emoji: "👨‍👩‍👧‍👦", title: "Четвёрка",   subtitle: "Группа из 4 человек, созвон раз в месяц", onClick: () => navigate({ to: "/foursome" }) },
          { emoji: "🛟", title: "Помощь",       subtitle: "Связь с администратором" },
        ]}
      />
    </div>
  );
}
