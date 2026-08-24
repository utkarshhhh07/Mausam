import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { getWeather } from "@/data/weather";
import { TopBar } from "@/components/TopBar";
import { Timeline } from "@/components/Timeline";
import { CalendarClock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function MyDayPage() {
  const { location, prefs } = useApp();
  const weather = useMemo(() => getWeather(location.id), [location.id]);
  const { t } = useTranslation();

  return (
    <div className="-mx-4">
      <TopBar title={t("myday.title")} showLocation />
      <div className="px-4 pt-4">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
          <CalendarClock size={22} />
          <div>
            <div className="text-sm font-semibold">{t("myday.inLocation", { location: weather.locationName })}</div>
            <div className="text-xs text-white/80">{t("myday.subtitle")}</div>
          </div>
        </div>
        <Timeline prefs={prefs} weather={weather} />
        <div className="mt-6 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
          {t("myday.timelineNote")}
        </div>
      </div>
    </div>
  );
}
