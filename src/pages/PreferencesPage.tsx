import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Droplets, Sun, Ruler, Globe, ArrowRight, ArrowLeft, HeartPulse, ShieldCheck, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { HealthSensitivity } from "@/types";

export function PreferencesPage() {
  const { prefs, setPrefs, setOnboarded } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notif, setNotif] = useState(prefs.notifications);
  const [units, setUnits] = useState(prefs.units);
  const [lang, setLang] = useState(prefs.language);
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

  const finish = () => {
    setPrefs({ units, language: lang, notifications: notif, healthSensitivities: healthSens });
    setOnboarded(true);
    navigate("/");
  };

  return (
    <div>
      <button
        onClick={() => navigate(prefs.personas.includes("health") ? "/onboarding/health" : "/onboarding/persona")}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition active:scale-95 hover:bg-slate-50"
        aria-label={t("common.back")}
      >
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t("onboarding.preferences")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("onboarding.prefDesc")}</p>
      </div>

      <Section title={t("profile.notifications")} icon={<Bell size={16} />}>
        <Toggle
          icon={<Droplets size={16} />}
          label={t("profile.rainAlerts")}
          desc={t("profile.rainAlertsDesc")}
          checked={notif.rain}
          onChange={(v) => setNotif({ ...notif, rain: v })}
        />
        <Toggle
          icon={<Sun size={16} />}
          label={t("profile.uvAlerts")}
          desc={t("profile.uvAlertsDesc")}
          checked={notif.uv}
          onChange={(v) => setNotif({ ...notif, uv: v })}
        />
        <Toggle
          icon={<Bell size={16} />}
          label={t("profile.severeWeather")}
          desc={t("profile.severeWeatherDesc")}
          checked={notif.severe}
          onChange={(v) => setNotif({ ...notif, severe: v })}
        />
      </Section>

      <Section title={t("profile.units")} icon={<Ruler size={16} />}>
        <Choice
          options={[
            { v: "metric", label: t("profile.metric") },
            { v: "imperial", label: t("profile.imperial") },
          ]}
          value={units}
          onChange={(v) => setUnits(v as "metric" | "imperial")}
        />
      </Section>

      <Section title={t("profile.language")} icon={<Globe size={16} />}>
        <Choice
          options={[
            { v: "en", label: "English" },
            { v: "hi", label: "हिन्दी" },
          ]}
          value={lang}
          onChange={(v) => setLang(v as "en" | "hi")}
        />
      </Section>

      <Section title={t("health.title")} icon={<HeartPulse size={16} />}>
        <p className="mb-2 text-xs text-slate-500">{t("health.subtitle")}</p>
        <div className="space-y-2">
          {(["respiratory", "pollen", "sun", "none", "prefer-not-to-say"] as HealthSensitivity[]).map((s) => {
            const active = healthSens.includes(s);
            const labelKey = s === "prefer-not-to-say" ? "health.preferNotToSay" : `health.${s}`;
            return (
              <button
                key={s}
                onClick={() => toggleHealth(s)}
                className={`flex w-full items-center justify-between rounded-2xl p-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{healthEmoji(s)}</span>
                  {t(labelKey)}
                </span>
                {active && <Check size={16} />}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate-400" />
          <span>{t("health.privacyNote")}</span>
        </div>
      </Section>

      <div className="mt-8 flex justify-end">
        <button onClick={finish} className="btn-primary">
          {t("onboarding.enterMyDay")} <ArrowRight size={16} />
        </button>
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
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="text-brand-600">{icon}</span>
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
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
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <div>
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <div className="text-xs text-slate-500">{desc}</div>
        </div>
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

function Choice({
  options,
  value,
  onChange,
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`flex-1 rounded-2xl p-3 text-sm font-medium transition ${
            value === o.v
              ? "bg-brand-600 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          {o.label}
        </button>
      ))}
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
