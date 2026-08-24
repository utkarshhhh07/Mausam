import { Outlet } from "react-router-dom";
import { BottomNavigation, SideNavigation } from "@/components/BottomNavigation";
import { DemoModeButton } from "@/components/DemoModeButton";

export function AppLayout() {
  return (
    <div className="bg-slate-50 lg:flex lg:items-start lg:justify-center" style={{ minHeight: "100dvh" }}>
      <div className="hidden lg:mr-0 lg:block lg:self-stretch">
        <SideNavigation />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col bg-slate-50 lg:min-h-screen lg:max-w-lg lg:border-x lg:border-slate-200">
        <main className="flex-1 px-4 pb-28 pt-4 lg:pb-10">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
      <DemoModeButton />
    </div>
  );
}
