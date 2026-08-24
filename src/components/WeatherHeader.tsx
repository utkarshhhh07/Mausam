import type { WeatherData } from "@/types";
import { Droplets, Wind, Eye, Thermometer, Sunrise, Sunset } from "lucide-react";
import { conditionEmoji, formatTemp, formatWind } from "@/utils/weatherDisplay";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/hooks/useTranslation";

export function WeatherHeader({ weather }: { weather: WeatherData }) {
  const { prefs } = useApp();
  const { t } = useTranslation();
  const unitLabel = prefs.units === "imperial" ? "°F" : "°C";
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-5 text-white shadow-lg">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-white/80">{weather.locationName}</div>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-5xl font-bold">{formatTemp(weather.temp, prefs.units)}</span>
              <span className="mb-1 text-lg">{unitLabel}</span>
            </div>
            <div className="mt-1 text-sm text-white/90">
              {conditionEmoji(weather.condition)} {t(`cond.${weather.condition}`)}
            </div>
          </div>
          <div className="text-right text-xs text-white/80">
            <div>{t("common.updated")}</div>
            <div className="font-medium text-white">{weather.lastUpdated}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <Stat icon={<Thermometer size={16} />} label={t("weather.feels")} value={formatTemp(weather.feelsLike, prefs.units)} />
          <Stat icon={<Droplets size={16} />} label={t("weather.humidity")} value={`${weather.humidity}%`} />
          <Stat icon={<Wind size={16} />} label={t("weather.wind")} value={formatWind(weather.wind, prefs.units)} />
          <Stat icon={<Eye size={16} />} label={t("weather.rain")} value={`${weather.rainProbability}%`} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-white/80">
          <span className="inline-flex items-center gap-1">
            <Sunrise size={14} /> {weather.sunrise}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sunset size={14} /> {weather.sunset}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 py-2">
      <div className="flex items-center justify-center text-white/80">{icon}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-white/70">{label}</div>
    </div>
  );
}
