import { useEffect } from "react";
import { CloudSun } from "lucide-react";

export function SplashPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
      <div className="animate-fade-in-up flex flex-col items-center">
        <div className="mb-4 rounded-3xl bg-white/15 p-5 backdrop-blur">
          <CloudSun size={48} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">MAUSAM MYDAY</h1>
        <p className="mt-2 text-sm text-white/80">Weather that helps you decide.</p>
      </div>
      <div className="absolute bottom-8 text-xs text-white/60">Powered by IMD-style data (demo)</div>
    </div>
  );
}

export function SplashRedirect({ to }: { to: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.hash = to;
    }, 1400);
    return () => clearTimeout(t);
  }, [to]);
  return <SplashPage />;
}
