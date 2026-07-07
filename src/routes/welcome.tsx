import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Globe } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Выбор страны — Клуб «Моя жизнь»" },
      { name: "description", content: "Выберите страну банковской карты для входа в клуб." },
      { property: "og:title", content: "Выбор страны — Клуб «Моя жизнь»" },
      { property: "og:description", content: "Выберите страну банковской карты для входа в клуб." },
    ],
  }),
  component: WelcomePage,
});

const COUNTRY_KEY = "selectedCountry";

function WelcomePage() {
  const navigate = useNavigate();

  const selectCountry = (country: "ru" | "kz") => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COUNTRY_KEY, country);
    }
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8 safe-top safe-bottom">
        <div className="flex justify-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
          >
            <Globe className="h-3.5 w-3.5" /> Добро пожаловать
          </span>
        </div>

        <h1 className="mt-5 text-center text-[26px] font-semibold leading-tight tracking-tight">
          Выберите страну
        </h1>
        <p className="mt-2.5 text-center text-[14px] leading-snug text-muted-foreground">
          Укажите, где выпущена ваша банковская карта
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => selectCountry("ru")}
            className="tap flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #FFB300, #FF6D00)",
              boxShadow: "0 8px 24px rgba(255, 109, 0, 0.35)",
            }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[12px] font-semibold">
              RU
            </span>
            Россия
          </button>
          <button
            onClick={() => selectCountry("kz")}
            className="tap flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              boxShadow: "0 8px 24px rgba(34, 197, 94, 0.35)",
            }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[12px] font-semibold">
              KZ
            </span>
            Казахстан
          </button>
        </div>


        <p className="mt-6 text-center text-[12px] leading-snug text-muted-foreground">
          Важно: приём платежей работает только с банковскими картами России и
          Казахстана. Если у вас карта другой страны, оплата не пройдёт.
        </p>
      </div>
    </div>
  );
}
