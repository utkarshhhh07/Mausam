import { Outlet } from "react-router-dom";

export function OnboardingLayout() {
  return (
    <div className="mx-auto flex max-w-md flex-col bg-gradient-to-b from-brand-50 to-white"
         style={{ minHeight: "100dvh" }}>
      <main className="flex-1 px-5 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  );
}
