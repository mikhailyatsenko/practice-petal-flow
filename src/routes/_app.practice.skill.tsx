import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_app/practice/skill")({
  head: () => ({
    meta: [
      { title: "Навык успеха — Клуб «Моя жизнь»" },
      { name: "description", content: "Практика «Навык успеха»." },
    ],
  }),
  component: SkillScreen,
});

function SkillScreen() {
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-2">
      <button
        onClick={() => void navigate({ to: "/" })}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Назад
      </button>
      <h1 className="text-xl font-semibold mb-2">Навык успеха</h1>
      <p className="text-muted-foreground">Скоро тут будет привычка.</p>
    </div>
  );
}
