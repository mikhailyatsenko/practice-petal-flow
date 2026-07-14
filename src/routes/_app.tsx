import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

function useElementHeight(active: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    if (!active || !ref.current) {
      setH(0);
      return;
    }
    const el = ref.current;
    const update = () => setH(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [active]);
  return { ref, h: active ? h : 0 };
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOnboarding, setDemoOnboarding] = useState(false);
  const buddyMode = useBuddyRequestMode();
  const foursomeMode = useFoursomeRequestMode();
  const { mode: callMode, ack: callAck } = useCallReminder();
  const noLinkActive = callMode === "buddy-no-link" || callMode === "buddy-2h-no-link";
  const isTimed = callMode === "buddy-2h" || callMode === "buddy-2h-no-link";
  const callBannerOn = !!callMode && (isTimed || noLinkActive || !callAck);

  const buddy = useElementHeight(buddyMode);
  const foursome = useElementHeight(foursomeMode);
  const call = useElementHeight(callBannerOn);

  const foursomeTop = buddy.h;
  const callTop = buddy.h + foursome.h;
  const topPad = buddy.h + foursome.h + call.h;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <div ref={buddy.ref}>
        <BuddyRequestBanner />
      </div>
      <div
        ref={foursome.ref}
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
        ref={call.ref}
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
