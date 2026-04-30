import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideMenu } from "@/components/layout/SideMenu";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { BuddyRequestBanner } from "@/components/layout/BuddyRequestBanner";
import { FoursomeRequestBanner } from "@/components/layout/FoursomeRequestBanner";
import { PreviewLevelBanner, PREVIEW_BANNER_HEIGHT } from "@/components/layout/PreviewLevelBanner";
import { useBuddyRequestMode } from "@/lib/buddyRequestMode";
import { useFoursomeRequestMode } from "@/lib/foursomeRequestMode";
import { usePreviewLevel } from "@/lib/previewLevel";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOnboarding, setDemoOnboarding] = useState(false);
  const buddyMode = useBuddyRequestMode();
  const foursomeMode = useFoursomeRequestMode();
  const previewLevel = usePreviewLevel();

  const BANNER_H = 76;
  const previewH = previewLevel != null ? PREVIEW_BANNER_HEIGHT : 0;
  const topPad = previewH + (buddyMode ? BANNER_H : 0) + (foursomeMode ? BANNER_H : 0);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <PreviewLevelBanner />
      <BuddyRequestBanner />
      {/* Если активен и бадди-баннер, четвёрка-баннер опускается ниже него */}
      <div
        style={
          {
            ["--foursome-banner-top" as any]: buddyMode ? `${BANNER_H}px` : "0px",
            ["--foursome-banner-pt" as any]: buddyMode ? "8px" : "max(env(safe-area-inset-top), 8px)",
          } as React.CSSProperties
        }
      >
        <FoursomeRequestBanner />
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
