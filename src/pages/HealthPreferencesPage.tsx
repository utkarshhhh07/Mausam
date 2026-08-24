import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { HealthSensitivity } from "@/types";

export function HealthPreferencesPage() {
  const { prefs, setPrefs } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [healthSens, setHealthSens] = useState<HealthSensitivity[]>(prefs.healthSensitivities);

  const toggleHealth = (s: HealthSensitivity) => {
    setHealthSens((prev) => {
      if (s === "none" || s === "prefer-not-to-say") {
        const isOn = prev.includes(s);
        return isOn ? [] : [s];
      }
      const filtered = prev.filter((x) => x !== "none" && x !== "prefer-not-to-say");
      const isOn = filtered.includes(s);
      return isOn ? filtered.filter((x) => x !== s) : [...filtered, s];
    });
  };

  const continueNext = () => {
    setPrefs({ healthSensitivities: healthSens });
    navigate("/onboarding/preferences");
  };

  return (
    <div>
      <button
        onClick={() => navigate("/onboarding/persona")}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition active:scale-95 hover:bg-slate-50"
        aria-label={t("common.back")}
      >
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t("health.title")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("health.subtitle")}</p>
      </div>

      <div className="space-y-2">
        {(["respiratory", "pollen", "sun", "none", "prefer-not-to-say"] as HealthSensitivity[]).map((s) => {
          const active = healthSens.includes(s);
          const labelKey = s === "prefer-not-to-say" ? "health.preferNotToSay" : `health.${s}`;
          return (
            <button
              key={s}
              onClick={() => toggleHealth(s)}
              className={`flex w-full items-center justify-between rounded-2xl p-4 text-left text-sm font-medium transition ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-lg">{healthEmoji(s)}</span>
                {t(labelKey)}
              </span>
              {active && <Check size={18} />}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate-400" />
        <span>{t("health.privacyNote")}</span>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={continueNext} className="btn-primary">
          {t("common.continue")} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function healthEmoji(s: HealthSensitivity): string {
  switch (s) {
    case "respiratory": return "🫁";
    case "pollen": return "🌼";
    case "sun": return "☀️";
    case "none": return "✖️";
    case "prefer-not-to-say": return "—";
  }
}
