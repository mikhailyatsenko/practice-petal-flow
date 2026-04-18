import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideMenu } from "@/components/layout/SideMenu";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOnboarding, setDemoOnboarding] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <Topbar onMenu={() => setMenuOpen(true)} />
      <SideMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenOnboarding={() => {
          setMenuOpen(false);
          setDemoOnboarding(true);
        }}
      />

      <main className="pb-28">
        <Outlet />
      </main>

      <BottomNav />

      <OnboardingGate />
      {demoOnboarding && (
        <Onboarding
          onComplete={() => setDemoOnboarding(false)}
          onClose={() => setDemoOnboarding(false)}
        />
      )}
    </div>
  );
}
