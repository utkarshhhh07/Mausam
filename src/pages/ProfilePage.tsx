import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { TopBar } from "@/components/TopBar";
import { PERSONAS } from "@/data/personas";
import { SCENARIOS } from "@/data/scenarios";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Bell, Globe, Ruler, RotateCcw, FlaskConical } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { translate } from "@/i18n/translations";

export function ProfilePage() {
  const { prefs, togglePersona, setPrefs, applyScenario, resetAll, feedback } = useApp();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const { t, lang } = useTranslation();

  return (
    <div className="-mx-4">
      <TopBar title={t("profile.title")} />
      <div className="px-4 pt-4 space-y-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
              U
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{t("profile.user")}</div>
              <div className="text-xs text-slate-500">
                {t("profile.stats", { interests: String(prefs.personas.length), feedback: String(feedback.length) })}
              </div>
            </div>
          </div>
        </div>

        <Section title={t("profile.myInterests")} icon={<Sparkles size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            {PERSONAS.map((p) => {
              const active = prefs.personas.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePersona(p.id)}
                  className={`flex items-center justify-between rounded-2xl p-3 text-left text-sm font-medium transition ${
                    active
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{p.emoji}</span>
                    {translate(`persona.${p.id}`, lang)}
                  </span>
                  {active && <Check size={16} />}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-400">{t("profile.interestsNote")}</p>
        </Section>

        <Section title={t("profile.notifications")} icon={<Bell size={16} />}>
          <NotifToggle
            label={t("profile.rainAlerts")}
            desc={t("profile.rainAlertsDesc")}
            checked={prefs.notifications.rain}
            onChange={(v) => setPrefs({ notifications: { ...prefs.notifications, rain: v } })}
          />
          <NotifToggle
            label={t("profile.uvAlerts")}
            desc={t("profile.uvAlertsDesc")}
            checked={prefs.notifications.uv}
            onChange={(v) => setPrefs({ notifications: { ...prefs.notifications, uv: v } })}
          />
          <NotifToggle
            label={t("profile.severeWeather")}
            desc={t("profile.severeWeatherDesc")}
            checked={prefs.notifications.severe}
            onChange={(v) => setPrefs({ notifications: { ...prefs.notifications, severe: v } })}
          />
        </Section>

        <Section title={t("profile.units")} icon={<Ruler size={16} />}>
          <div className="flex gap-2">
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setPrefs({ units: u })}
                className={`flex-1 rounded-2xl p-3 text-sm font-medium transition ${
                  prefs.units === u
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {u === "metric" ? t("profile.metric") : t("profile.imperial")}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t("profile.language")} icon={<Globe size={16} />}>
          <div className="flex gap-2">
            {(["en", "hi"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setPrefs({ language: l })}
                className={`flex-1 rounded-2xl p-3 text-sm font-medium transition ${
                  prefs.language === l
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {l === "en" ? "English" : "हिन्दी"}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t("profile.demoScenarios")} icon={<FlaskConical size={16} />}>
          <p className="mb-2 text-xs text-slate-400">{t("profile.demoDesc")}</p>
          <div className="space-y-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  applyScenario(s.id);
                  navigate("/");
                }}
                className="flex w-full items-center justify-between rounded-2xl bg-white p-3 text-left ring-1 ring-slate-100 transition hover:bg-slate-50"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.description}</div>
                </div>
                <span className="chip bg-brand-100 text-brand-700">{t("common.apply")}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title={t("profile.data")} icon={<RotateCcw size={16} />}>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full rounded-2xl bg-white p-3 text-sm font-medium text-red-600 ring-1 ring-red-100 transition hover:bg-red-50"
            >
              {t("profile.reset")}
            </button>
          ) : (
            <div className="rounded-2xl bg-red-50 p-3 ring-1 ring-red-100">
              <div className="text-sm font-semibold text-red-800">{t("profile.resetConfirm")}</div>
              <div className="mt-1 text-xs text-red-700">{t("profile.resetDesc")}</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    resetAll();
                    navigate("/welcome");
                  }}
                  className="flex-1 rounded-full bg-red-600 py-2 text-sm font-semibold text-white"
                >
                  {t("profile.resetYes")}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded-full bg-white py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          )}
        </Section>

        <div className="pb-2 text-center text-xs text-slate-300">
          {t("profile.footer")}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="text-brand-600">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function NotifToggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-2xl bg-white p-3 text-left ring-1 ring-slate-100"
    >
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        <div className="mt-0.5 text-xs leading-snug text-slate-500">{desc}</div>
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-brand-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
