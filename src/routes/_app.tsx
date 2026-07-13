import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideMenu } from "@/components/layout/SideMenu";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { BuddyRequestBanner } from "@/components/layout/BuddyRequestBanner";
import { FoursomeRequestBanner } from "@/components/layout/FoursomeRequestBanner";
import { CallReminderBanner } from "@/components/layout/CallReminderBanner";
import { useBuddyRequestMode } from "@/lib/buddyRequestMode";
import { useFoursomeRequestMode } from "@/lib/foursomeRequestMode";
import { useCallReminder } from "@/lib/callReminderMode";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOnboarding, setDemoOnboarding] = useState(false);
  const buddyMode = useBuddyRequestMode();
  const foursomeMode = useFoursomeRequestMode();
  const { mode: callMode, ack: callAck } = useCallReminder();
  const callBannerOn = !!callMode && !callAck;

  const BANNER_H = 76;
  const topPad =
    (buddyMode ? BANNER_H : 0) +
    (foursomeMode ? BANNER_H : 0) +
    (callBannerOn ? BANNER_H : 0);

  const foursomeTop = buddyMode ? BANNER_H : 0;
  const callTop = foursomeTop + (foursomeMode ? BANNER_H : 0);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <BuddyRequestBanner />
      <div
        style={
          {
            ["--foursome-banner-top" as any]: `${foursomeTop}px`,
            ["--foursome-banner-pt" as any]: foursomeTop > 0 ? "8px" : "max(env(safe-area-inset-top), 8px)",
          } as React.CSSProperties
        }
      >
        <FoursomeRequestBanner />
      </div>
      <div
        style={
          {
            ["--call-reminder-top" as any]: `${callTop}px`,
            ["--call-reminder-pt" as any]: callTop > 0 ? "8px" : "max(env(safe-area-inset-top), 8px)",
          } as React.CSSProperties
        }
      >
        <CallReminderBanner />
      </div>


      <div style={{ paddingTop: topPad }}>
        <Topbar onMenu={() => setMenuOpen(true)} stickyTop={topPad} />
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
