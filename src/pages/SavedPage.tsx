import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getWeather } from "@/data/weather";
import { LOCATIONS } from "@/data/locations";
import { TopBar } from "@/components/TopBar";
import { LocationSwitcher } from "@/components/LocationSwitcher";
import { conditionEmoji, formatTemp } from "@/utils/weatherDisplay";
import { useTranslation } from "@/hooks/useTranslation";
import { translate } from "@/i18n/translations";
import { X, Plus, MapPin, Check } from "lucide-react";

export function SavedPage() {
  const { savedLocationIds, removeSavedLocation, setLocationId, location, prefs } = useApp();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  const saved = useMemo(
    () => LOCATIONS.filter((l) => savedLocationIds.includes(l.id)),
    [savedLocationIds],
  );

  return (
    <div className="-mx-4">
      <TopBar title={t("saved.title")} />
      <div className="px-4 pt-4">
        <div className="mb-4 text-sm text-slate-500">
          {t("saved.tapToSwitch")}
        </div>

        <div className="mb-4 space-y-2">
          {saved.map((l) => {
            const w = getWeather(l.id);
            const active = l.id === location.id;
            return (
              <div
                key={l.id}
                className={`card flex items-center justify-between p-3 ${
                  active ? "ring-2 ring-brand-400" : ""
                }`}
              >
                <button
                  onClick={() => {
                    setLocationId(l.id);
                    navigate("/");
                  }}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="text-3xl">{conditionEmoji(w.condition)}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                      <MapPin size={13} className="shrink-0 text-brand-600" />
                      <span className="truncate">{l.name}</span>
                      {active && (
                        <span className="chip bg-brand-100 text-brand-700">
                          <Check size={10} /> {t("common.current")}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatTemp(w.temp, prefs.units)} · {translate(`cond.${w.condition}`, lang)} · {t("weather.rain")} {w.rainProbability}%
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => removeSavedLocation(l.id)}
                  className="rounded-full p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                  aria-label={t("common.remove")}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
          {saved.length === 0 && (
            <div className="card p-6 text-center text-sm text-slate-500">
              {t("saved.none")}
            </div>
          )}
        </div>

        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Plus size={12} /> {t("saved.addLocation")}
        </div>
        <LocationSwitcher />
      </div>
    </div>
  );
}
