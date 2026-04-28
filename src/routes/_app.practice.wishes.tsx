import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { BackButton } from "@/components/layout/BackButton";

export const Route = createFileRoute("/_app/practice/wishes")({
  head: () => ({
    meta: [
      { title: "Воплощение желаний — Клуб «Моя жизнь»" },
      { name: "description", content: "Практика «Воплощение желаний»." },
    ],
  }),
  component: WishesPracticeScreen,
});

function WishesPracticeScreen() {
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-2">
      <BackButton onClick={() => void navigate({ to: "/" })} label="Главная" />
      <h1 className="text-xl font-semibold mb-2">Воплощение желаний</h1>
      <p className="text-muted-foreground">Скоро тут будет привычка.</p>
    </div>
  );
}
