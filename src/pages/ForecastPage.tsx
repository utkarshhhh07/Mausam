import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { getWeather } from "@/data/weather";
import { TopBar } from "@/components/TopBar";
import { HourlyForecast, DailyForecast, MiniBarChart } from "@/components/Forecast";
import { Sun, Droplets, Wind, Eye, Gauge, Sunrise, Sunset } from "lucide-react";
import { formatTemp, formatWind } from "@/utils/weatherDisplay";
import { useTranslation } from "@/hooks/useTranslation";

type Tab = "today" | "tomorrow" | "week";

export function ForecastPage() {
  const { location, prefs } = useApp();
  const weather = useMemo(() => getWeather(location.id), [location.id]);
  const [tab, setTab] = useState<Tab>("today");
  const { t } = useTranslation();

  const tabKey: Record<Tab, string> = {
    today: "forecast.today",
    tomorrow: "forecast.tomorrow",
    week: "forecast.week",
  };

  return (
    <div className="-mx-4">
      <TopBar title={t("forecast.title")} showLocation />
      <div className="px-4 pt-4">
        <div className="mb-4 flex gap-2 rounded-full bg-white p-1 ring-1 ring-slate-100">
          {(["today", "tomorrow", "week"] as Tab[]).map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                tab === tb ? "bg-brand-600 text-white" : "text-slate-600"
              }`}
            >
              {t(tabKey[tb])}
            </button>
          ))}
        </div>

        {tab === "today" && (
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{t("forecast.todayIn", { location: weather.locationName })}</div>
                  <div className="text-3xl font-bold text-slate-900">
                    {formatTemp(weather.temp, prefs.units)}
                  </div>
                  <div className="text-sm text-slate-500">{t(`cond.${weather.condition}`)}</div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {t("forecast.feelsLike")} {formatTemp(weather.feelsLike, prefs.units)}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("forecast.hourly")}
              </div>
              <HourlyForecast weather={weather} />
            </div>
            <MiniBarChart weather={weather} />
            <DetailGrid weather={weather} />
          </div>
        )}

        {tab === "tomorrow" && (
          <div className="space-y-4">
            <TomorrowCard weather={weather} />
            <div className="card p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("forecast.tomorrowRain")}
              </div>
              <div className="flex h-20 items-end gap-1">
                {weather.hourly.slice(6, 22).map((h) => (
                  <div key={h.time} className="flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t bg-sky-400"
                      style={{ height: `${h.rainProbability}%` }}
                    />
                    <div className="mt-1 text-[9px] text-slate-400">{h.time.slice(0, 2)}h</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "week" && (
          <div className="space-y-4">
            <DailyForecast weather={weather} />
          </div>
        )}
      </div>
    </div>
  );
}

function DetailGrid({ weather }: { weather: ReturnType<typeof getWeather> }) {
  const { prefs } = useApp();
  const { t } = useTranslation();
  const items = [
    { icon: <Sun size={16} />, label: t("weather.uvIndex"), value: `${weather.uv} · ${weather.uvCategory}` },
    { icon: <Droplets size={16} />, label: t("weather.humidity"), value: `${weather.humidity}%` },
    { icon: <Wind size={16} />, label: t("weather.wind"), value: `${formatWind(weather.wind, prefs.units)} ${weather.windDirection}` },
    { icon: <Eye size={16} />, label: t("weather.visibility"), value: `${weather.visibility} km` },
    { icon: <Gauge size={16} />, label: t("weather.aqi"), value: `${weather.airQuality.aqi} · ${weather.airQuality.category}` },
    { icon: <Sunrise size={16} />, label: t("weather.sunrise"), value: weather.sunrise },
    { icon: <Sunset size={16} />, label: t("weather.sunset"), value: weather.sunset },
    { icon: <Droplets size={16} />, label: t("weather.rainProb"), value: `${weather.rainProbability}%` },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <div key={it.label} className="card flex items-center gap-3 p-3">
          <span className="text-brand-600">{it.icon}</span>
          <div className="min-w-0">
            <div className="text-xs text-slate-400">{it.label}</div>
            <div className="truncate text-sm font-semibold text-slate-900">{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TomorrowCard({ weather }: { weather: ReturnType<typeof getWeather> }) {
  const { prefs } = useApp();
  const { t } = useTranslation();
  const tm = weather.daily[1];
  if (!tm) return null;
  return (
    <div className="card p-4">
      <div className="text-sm text-slate-500">{t("forecast.tomorrow")} · {tm.dateLabel}</div>
      <div className="mt-1 flex items-center justify-between">
        <div className="text-3xl font-bold text-slate-900">
          {formatTemp(tm.high, prefs.units)} / {formatTemp(tm.low, prefs.units)}
        </div>
      </div>
      <div className="mt-1 text-sm text-slate-500">
        {t(`cond.${tm.condition}`)} · {t("weather.rain")} {tm.rainProbability}%
      </div>
    </div>
  );
}
