import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
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
