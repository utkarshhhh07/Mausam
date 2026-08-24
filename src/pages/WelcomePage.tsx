import { useNavigate } from "react-router-dom";
import { CloudSun, Sparkles, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SCENARIOS } from "@/data/scenarios";
import { useTranslation } from "@/hooks/useTranslation";

export function WelcomePage() {
  const navigate = useNavigate();
  const { applyScenario, setPrefs, prefs } = useApp();
  const { t } = useTranslation();

  return (
    <div className="flex max-w-md mx-auto flex-col bg-gradient-to-b from-brand-50 via-white to-white px-5 pt-6 pb-5"
         style={{ minHeight: "100dvh" }}>
      {/* Branding + hero */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-lg animate-fade-in-up">
          <CloudSun size={48} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 animate-fade-in-up">
          MAUSAM MYDAY
        </h1>
        <p className="mt-1.5 text-sm font-medium text-brand-700 animate-fade-in-up">
          {t("welcome.tagline")}
        </p>
        <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-slate-600 animate-fade-in-up">
          {t("welcome.desc")}
        </p>
        <div className="mt-4 flex flex-col gap-2 text-left animate-fade-in-up">
          <Feature icon={<Sparkles size={14} />} text={t("welcome.feature1")} />
          <Feature icon={<ShieldCheck size={14} />} text={t("welcome.feature2")} />
        </div>
      </div>

      {/* Spacer pushes actions to bottom */}
      <div className="flex-1" />

      {/* Language selector */}
      <div className="mb-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("onboarding.chooseLanguage")}
        </div>
        <LanguageToggle
          value={prefs.language}
          onChange={(l) => setPrefs({ language: l })}
        />
      </div>

      {/* CTAs */}
      <div className="space-y-3 safe-bottom">
        <button
          onClick={() => navigate("/onboarding/location")}
          className="btn-primary w-full"
        >
          {t("welcome.getStarted")}
        </button>
        <div className="text-center text-xs text-slate-400">{t("welcome.demo")}</div>
        <div className="flex flex-wrap justify-center gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                applyScenario(s.id);
                navigate("/");
              }}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LanguageToggle({
  value,
  onChange,
}: {
  value: "en" | "hi";
  onChange: (v: "en" | "hi") => void;
}) {
  return (
    <div className="flex rounded-full bg-slate-100 p-1 ring-1 ring-slate-200">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
            value === l
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {l === "en" ? "English" : "हिन्दी"}
        </button>
      ))}
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-100">
      <span className="text-brand-600">{icon}</span>
      {text}
    </div>
  );
}
