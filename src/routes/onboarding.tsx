import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Вход в клуб — Клуб «Моя жизнь»" },
      { name: "description", content: "Вводное видео и кодовое слово для входа в клуб." },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const country = typeof window !== "undefined" && localStorage.getItem("selectedCountry");
    if (!country) {
      navigate({ to: "/welcome" });
    }
  }, [navigate]);

  return (
    <Onboarding
      onComplete={() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("onboardingCompleted", "1");
        }
        navigate({ to: "/" });
      }}
      onClose={() => navigate({ to: "/" })}
    />
  );
}

