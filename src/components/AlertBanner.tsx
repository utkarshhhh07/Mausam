import type { AlertSeverity, WeatherAlert } from "@/types";
import { ChevronRight, TriangleAlert, Info, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const SEV_CONFIG: Record<
  AlertSeverity,
  { bg: string; border: string; text: string; labelKey: string; emoji: string }
> = {
  red: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-800",
    labelKey: "alerts.redAlert",
    emoji: "🔴",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-800",
    labelKey: "alerts.orangeAlert",
    emoji: "🟠",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-800",
    labelKey: "alerts.yellowAlert",
    emoji: "🟡",
  },
  info: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    labelKey: "alerts.advisory",
    emoji: "ℹ️",
  },
};

export function severityConfig(s: AlertSeverity) {
  return SEV_CONFIG[s];
}

export function AlertBanner({ alert }: { alert: WeatherAlert }) {
  const cfg = SEV_CONFIG[alert.severity];
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <button
      onClick={() => navigate("/alerts")}
      className={`w-full rounded-3xl border ${cfg.bg} ${cfg.border} p-4 text-left transition active:scale-[0.99]`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${cfg.text}`}>
          {alert.severity === "info" ? <Info size={22} /> : <TriangleAlert size={22} />}
        </div>
        <div className="flex-1">
          <div className={`text-xs font-bold tracking-wide ${cfg.text}`}>
            {cfg.emoji} {t(cfg.labelKey)}
          </div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">{alert.title}</div>
          <div className="mt-1 text-sm text-slate-600">{alert.description}</div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
            {t("alerts.viewDetails")} <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </button>
  );
}

export function AlertIcon({ severity }: { severity: AlertSeverity }) {
  const cfg = SEV_CONFIG[severity];
  const { t } = useTranslation();
  return (
    <span className={`chip ${cfg.bg} ${cfg.text}`}>
      {severity === "info" ? <Bell size={12} /> : <TriangleAlert size={12} />}
      {t(cfg.labelKey)}
    </span>
  );
}
