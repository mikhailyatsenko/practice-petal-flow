import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideMenu } from "@/components/layout/SideMenu";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <Topbar onMenu={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />

      <main className="pb-28">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
