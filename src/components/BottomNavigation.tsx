import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarClock, TriangleAlert, Sun, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const ITEMS = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/forecast", labelKey: "nav.forecast", icon: CalendarClock },
  { to: "/alerts", labelKey: "nav.alerts", icon: TriangleAlert },
  { to: "/myday", labelKey: "nav.myday", icon: Sun },
  { to: "/profile", labelKey: "nav.profile", icon: User },
];

export function BottomNavigation() {
  const loc = useLocation();
  const { t } = useTranslation();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/90 backdrop-blur-md safe-bottom lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {ITEMS.map((item) => {
          const active =
            item.to === "/"
              ? loc.pathname === "/"
              : loc.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 transition"
            >
              <Icon
                size={22}
                className={active ? "text-brand-600" : "text-slate-400"}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-brand-600" : "text-slate-400"
                }`}
              >
                {t(item.labelKey)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNavigation() {
  const loc = useLocation();
  const { t } = useTranslation();
  return (
    <nav className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col lg:py-6">
      <div className="mb-6 px-5">
        <div className="text-sm font-bold tracking-tight text-slate-900">MAUSAM</div>
        <div className="text-xs font-medium text-brand-600">MYDAY</div>
      </div>
      <div className="flex flex-col gap-1 px-3">
        {ITEMS.map((item) => {
          const active =
            item.to === "/"
              ? loc.pathname === "/"
              : loc.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon
                size={20}
                className={active ? "text-brand-600" : "text-slate-400"}
                strokeWidth={active ? 2.4 : 2}
              />
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
