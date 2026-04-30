import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideMenu } from "@/components/layout/SideMenu";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { BuddyRequestBanner } from "@/components/layout/BuddyRequestBanner";
import { useBuddyRequestMode } from "@/lib/buddyRequestMode";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOnboarding, setDemoOnboarding] = useState(false);
  const requestMode = useBuddyRequestMode();

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <BuddyRequestBanner />
      {/* Когда лента активна — сдвигаем весь контент вниз, чтобы она ничего не закрывала */}
      <div style={{ paddingTop: requestMode ? 76 : 0 }}>
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
      </div>

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
