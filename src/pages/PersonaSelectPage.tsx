import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { PERSONAS } from "@/data/personas";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/hooks/useTranslation";
import { translate } from "@/i18n/translations";

export function PersonaSelectPage() {
  const { prefs, togglePersona } = useApp();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const selected = prefs.personas;

  return (
    <div>
      <button
        onClick={() => navigate("/onboarding/location")}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition active:scale-95 hover:bg-slate-50"
        aria-label={t("common.back")}
      >
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t("onboarding.whatMatters")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("onboarding.personaDesc")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PERSONAS.map((p) => {
          const active = selected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => togglePersona(p.id)}
              className={`relative flex flex-col items-start rounded-3xl p-4 text-left transition active:scale-[0.98] ${
                active
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-white text-slate-900 ring-1 ring-slate-200"
              }`}
            >
              {active && (
                <span className="absolute right-3 top-3 rounded-full bg-white/20 p-0.5">
                  <Check size={14} />
                </span>
              )}
              <span className="text-3xl">{p.emoji}</span>
              <span className="mt-2 text-sm font-semibold">{translate(`persona.${p.id}`, lang)}</span>
              <span
                className={`mt-0.5 text-[11px] leading-snug ${
                  active ? "text-white/80" : "text-slate-500"
                }`}
              >
                {translate(`persona.${p.id}.desc`, lang)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {t("onboarding.selected", { n: String(selected.length) })}
        </span>
        <button
          disabled={selected.length === 0}
          onClick={() =>
            selected.includes("health")
              ? navigate("/onboarding/health")
              : navigate("/onboarding/preferences")
          }
          className="btn-primary"
        >
          {t("common.continue")} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
