import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_app/practice/essay")({
  head: () => ({
    meta: [
      { title: "Жизнь мечты — Клуб «Моя жизнь»" },
      { name: "description", content: "Практика «Жизнь мечты»." },
    ],
  }),
  component: EssayScreen,
});

function EssayScreen() {
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-2">
      <button
        onClick={() => void navigate({ to: "/" })}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Назад
      </button>
      <h1 className="text-xl font-semibold mb-2">Жизнь мечты</h1>
      <p className="text-muted-foreground">Скоро тут будет привычка.</p>
    </div>
  );
}
