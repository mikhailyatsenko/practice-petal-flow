import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";

export const Route = createFileRoute("/_app/library")({
  head: () => ({
    meta: [
      { title: "Библиотека — Клуб «Моя жизнь»" },
      { name: "description", content: "Технические инструкции и база знаний клуба." },
    ],
  }),
  component: LibraryScreen,
});

function LibraryScreen() {
  return (
    <div className="px-4">
      <SectionHeader emoji="📚" title="Библиотека" subtitle="Инструкции и материалы клуба" />

      <SubItemList
        items={[
          { emoji: "🛡️", title: "Как установить VPN",     subtitle: "Инструкция для разных устройств" },
          { emoji: "⚙️", title: "Настройки приложения",    subtitle: "Уведомления, язык, аккаунт" },
          { emoji: "📖", title: "База знаний клуба",       subtitle: "Ответы на частые вопросы" },
          { emoji: "🎬", title: "Полезные материалы",      subtitle: "Видео, статьи и подборки" },
        ]}
      />
    </div>
  );
}
