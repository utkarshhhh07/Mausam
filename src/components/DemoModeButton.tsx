import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { SCENARIOS } from "@/data/scenarios";
import { FlaskConical, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomSheet } from "./BottomSheet";
import { useTranslation } from "@/hooks/useTranslation";

export function DemoModeButton() {
  const [open, setOpen] = useState(false);
  const { applyScenario, locationId, prefs } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const apply = (id: string) => {
    applyScenario(id);
    setOpen(false);
    navigate("/");
  };

  const activeScenario = SCENARIOS.find(
    (s) => s.locationId === locationId && JSON.stringify(s.personas) === JSON.stringify(prefs.personas),
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg transition active:scale-95 hover:bg-slate-800 lg:bottom-6 lg:right-6"
        aria-label={t("demo.title")}
      >
        <FlaskConical size={14} />
        {t("demo.title")}
        {activeScenario && (
          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t("demo.scenarios")}>
        <p className="text-sm text-slate-600">{t("demo.desc")}</p>
        <div className="mt-3 space-y-2">
          {SCENARIOS.map((s) => {
            const active = activeScenario?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => apply(s.id)}
                className={`flex w-full items-center justify-between rounded-2xl p-3 text-left ring-1 transition ${
                  active
                    ? "bg-brand-50 ring-2 ring-brand-300"
                    : "bg-white ring-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.description}</div>
                </div>
                {active ? (
                  <Check size={18} className="shrink-0 text-brand-600" />
                ) : (
                  <span className="chip bg-brand-100 text-brand-700">{t("common.apply")}</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full bg-slate-100 py-2.5 text-sm font-medium text-slate-600"
        >
          <X size={14} /> {t("common.close")}
        </button>
      </BottomSheet>
    </>
  );
}
