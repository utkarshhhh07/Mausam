import { useState } from "react";
import { Search, LocateFixed, X, Plus } from "lucide-react";
import { LOCATIONS } from "@/data/locations";
import { getWeather } from "@/data/weather";
import { useApp } from "@/context/AppContext";
import { conditionEmoji, formatTemp } from "@/utils/weatherDisplay";
import { useTranslation } from "@/hooks/useTranslation";
import { translate } from "@/i18n/translations";

export function LocationSwitcher({ onPicked }: { onPicked?: () => void }) {
  const { locationId, setLocationId, savedLocationIds, toggleSavedLocation, prefs } = useApp();
  const [query, setQuery] = useState("");
  const { t, lang } = useTranslation();

  const filtered = LOCATIONS.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("saved.searchCity")}
          className="w-full rounded-full bg-white py-3 pl-11 pr-10 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <button
        onClick={() => {
          setLocationId("pune");
          onPicked?.();
        }}
        className="flex w-full items-center gap-3 rounded-2xl bg-brand-50 p-4 text-left transition hover:bg-brand-100"
      >
        <LocateFixed size={20} className="text-brand-600" />
        <div>
          <div className="text-sm font-semibold text-brand-900">{t("saved.useCurrent")}</div>
          <div className="text-xs text-brand-700">{t("saved.demoDefault")}</div>
        </div>
      </button>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("saved.suggested")}
        </div>
        {filtered.map((l) => {
          const w = getWeather(l.id);
          const active = l.id === locationId;
          const saved = savedLocationIds.includes(l.id);
          return (
            <div
              key={l.id}
              className={`flex items-center justify-between rounded-2xl bg-white p-3 ring-1 transition ${
                active ? "ring-2 ring-brand-400" : "ring-slate-100"
              }`}
            >
              <button
                onClick={() => {
                  setLocationId(l.id);
                  onPicked?.();
                }}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span className="text-2xl">{conditionEmoji(w.condition)}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{l.name}</div>
                  <div className="text-xs text-slate-500">
                    {formatTemp(w.temp, prefs.units)} · {translate(`cond.${w.condition}`, lang)}
                  </div>
                </div>
              </button>
              <button
                onClick={() => toggleSavedLocation(l.id)}
                className={`rounded-full p-2 transition ${
                  saved ? "text-brand-600 hover:bg-brand-50" : "text-slate-300 hover:bg-slate-100"
                }`}
                aria-label={saved ? t("saved.removeSaved") : t("saved.addSaved")}
              >
                {saved ? <X size={16} /> : <Plus size={16} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
