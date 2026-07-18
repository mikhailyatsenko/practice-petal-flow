import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideMenu } from "@/components/layout/SideMenu";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { BuddyRequestBanner } from "@/components/layout/BuddyRequestBanner";
import { FoursomeRequestBanner } from "@/components/layout/FoursomeRequestBanner";
import { CallReminderBanner } from "@/components/layout/CallReminderBanner";
import { Level4GiftBanner } from "@/components/layout/Level4GiftBanner";
import { LevelDoneBanner, useLevelDoneBannerVisible } from "@/components/layout/LevelDoneBanner";
import { useBuddyRequestMode } from "@/lib/buddyRequestMode";
import { useFoursomeRequestMode } from "@/lib/foursomeRequestMode";
import { useCallReminder } from "@/lib/callReminderMode";
import { useLevel4GiftBannerVisible } from "@/lib/level4Gift";


export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// Measures actual rendered height of a fixed banner by its data-attribute.
function useBannerHeight(selector: string, active: boolean, deps: unknown[] = []) {
  const [h, setH] = useState(0);
  useEffect(() => {
    if (!active) {
      setH(0);
      return;
    }
    let ro: ResizeObserver | null = null;
    let raf = 0;
    const attach = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        raf = window.requestAnimationFrame(attach);
        return;
      }
      const update = () => setH(el.getBoundingClientRect().height);
      update();
      ro = new ResizeObserver(update);
      ro.observe(el);
      window.addEventListener("resize", update);
    };
    attach();
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, active, ...deps]);
  return active ? h : 0;
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOnboarding, setDemoOnboarding] = useState(false);
  const buddyMode = useBuddyRequestMode();
  const foursomeMode = useFoursomeRequestMode();
  const { mode: callMode, ack: callAck } = useCallReminder();
  const giftBannerOn = useLevel4GiftBannerVisible();
  const noLinkActive = callMode === "buddy-no-link" || callMode === "buddy-2h-no-link";
  const isTimed = callMode === "buddy-2h" || callMode === "buddy-2h-no-link" || callMode === "foursome-2h";
  const callBannerOn = !!callMode && (isTimed || noLinkActive || !callAck);

  const buddyH = useBannerHeight("[data-buddy-request-banner]", buddyMode);
  const foursomeH = useBannerHeight("[data-foursome-request-banner]", foursomeMode);
  const callH = useBannerHeight("[data-call-reminder-banner]", callBannerOn, [callMode]);
  const giftH = useBannerHeight("[data-level4-gift-banner]", giftBannerOn);

  const foursomeTop = buddyH;
  const callTop = buddyH + foursomeH;
  const giftTop = buddyH + foursomeH + callH;
  const topPad = buddyH + foursomeH + callH + giftH;

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
      <div
        style={
          {
            ["--level4-gift-top" as any]: `${giftTop}px`,
            ["--level4-gift-pt" as any]: giftTop > 0 ? "8px" : "max(env(safe-area-inset-top), 8px)",
          } as React.CSSProperties
        }
      >
        <Level4GiftBanner />
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
