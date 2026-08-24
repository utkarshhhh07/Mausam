import type { WeatherData } from "@/types";
import { conditionEmoji, formatTemp } from "@/utils/weatherDisplay";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/hooks/useTranslation";

export function HourlyForecast({ weather }: { weather: WeatherData }) {
  const { prefs } = useApp();
  const { t } = useTranslation();
  const hours = weather.hourly.slice(6, 22);
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
      {hours.map((h) => (
        <div
          key={h.time}
          className="flex min-w-[64px] flex-col items-center rounded-2xl bg-white p-2.5 ring-1 ring-slate-100"
        >
          <div className="text-xs font-medium text-slate-400">{h.time}</div>
          <div className="my-1 text-2xl">{conditionEmoji(h.condition)}</div>
          <div className="text-sm font-semibold text-slate-900">{formatTemp(h.temp, prefs.units)}</div>
          <div className="mt-1 text-[10px] text-sky-600">{h.rainProbability}%</div>
        </div>
      ))}
    </div>
  );
}

export function DailyForecast({ weather }: { weather: WeatherData }) {
  const { prefs } = useApp();
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      {weather.daily.map((d, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-slate-100"
        >
          <div className="w-16">
            <div className="text-sm font-semibold text-slate-900">
              {i === 0 ? t("forecast.today") : d.day}
            </div>
            <div className="text-xs text-slate-400">{d.dateLabel}</div>
          </div>
          <span className="text-2xl">{conditionEmoji(d.condition)}</span>
          <div className="text-xs text-sky-600">{d.rainProbability}%</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900">{formatTemp(d.high, prefs.units)}</span>
            <span className="text-slate-400">{formatTemp(d.low, prefs.units)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniBarChart({ weather }: { weather: WeatherData }) {
  const { t } = useTranslation();
  const hours = weather.hourly.slice(6, 22);
  const temps = hours.map((h) => h.temp);
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  const range = Math.max(1, max - min);
  return (
    <div className="card p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t("forecast.tempCurve")}
      </div>
      <div className="flex h-24 items-end gap-1.5">
        {hours.map((h) => {
          const heightPct = ((h.temp - min) / range) * 100;
          return (
            <div key={h.time} className="flex flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-brand-300 to-brand-600"
                style={{ height: `${Math.max(8, heightPct)}%` }}
              />
              <div className="mt-1 text-[9px] text-slate-400">{h.time.slice(0, 2)}h</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
