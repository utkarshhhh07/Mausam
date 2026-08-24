import { getTimeline } from "@/utils/personalizationEngine";
import type { UserPreferences, WeatherData } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

export function Timeline({
  prefs,
  weather,
}: {
  prefs: UserPreferences;
  weather: WeatherData;
}) {
  const items = getTimeline(prefs, weather);
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-slate-500">
        {t("myday.noEvents")}
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 h-full w-px bg-slate-200" />
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="relative animate-fade-in-up">
            <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-brand-100" />
            <div className="card p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400">{it.time}</div>
                <span className="text-lg">{it.emoji}</span>
              </div>
              <div className="mt-0.5 text-sm font-medium text-slate-800">{it.label}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="chip bg-slate-100 text-slate-600">{it.metric}</span>
                {it.condition !== "—" && (
                  <span className="chip bg-sky-50 text-sky-700">{it.condition}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">{it.explanation}</p>
              <div className="mt-2 rounded-xl bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-800">
                {it.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
