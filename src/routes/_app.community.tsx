import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";
import { BuddyLockedPreview } from "@/components/section/BuddyLockedPreview";
import { FoursomeLockedPreview } from "@/components/section/FoursomeLockedPreview";
import { isFeatureUnlocked, unlockLevelOf, usePreviewLevel } from "@/lib/previewLevel";

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
  const previewLevel = usePreviewLevel();
  const buddyOpen = isFeatureUnlocked("buddy", previewLevel);
  const foursomeOpen = isFeatureUnlocked("foursome", previewLevel);

  return (
    <div className="px-4">
      <SectionHeader emoji="👥" title="Комьюнити" subtitle="Поддержка, общение и партнёры по росту" />

      {/* Сначала: Канал, Чат, Помощь (админ) */}
      <SubItemList
        items={[
          { emoji: "📣", title: "Общий канал", subtitle: "Новости и материалы от создателей" },
          { emoji: "💬", title: "Общий чат",   subtitle: "Общение участников и обмен опытом" },
          { emoji: "🛟", title: "Помощь",      subtitle: "Связь с администратором" },
        ]}
      />

      {/* Затем: Бадди и Четвёрка — открытые или с замком */}
      <div className="mt-3 space-y-2">
        {buddyOpen ? (
          <SubItemList
            items={[
              {
                emoji: "👥",
                title: "Бадди",
                subtitle: "Партнёр для еженедельных созвонов",
                onClick: () => navigate({ to: "/buddy" }),
              },
            ]}
          />
        ) : (
          <BuddyLockedPreview unlockLevel={unlockLevelOf("buddy")} />
        )}

        {foursomeOpen ? (
          <SubItemList
            items={[
              {
                emoji: "👥👥",
                title: "Четвёрка",
                subtitle: "Группа из 4 человек, созвон раз в месяц",
                onClick: () => navigate({ to: "/foursome" }),
              },
            ]}
          />
        ) : (
          <FoursomeLockedPreview unlockLevel={unlockLevelOf("foursome")} />
        )}
      </div>
    </div>
  );
}
