import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { getAlertsForLocation } from "@/data/alerts";
import { LOCATIONS } from "@/data/locations";
import { TopBar } from "@/components/TopBar";
import { severityConfig } from "@/components/AlertBanner";
import { EmptyState } from "@/components/States";
import { ShieldCheck, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { WeatherAlert } from "@/types";

const SEVERITY_ORDER: Record<string, number> = { red: 0, orange: 1, yellow: 2, info: 3 };

export function AlertsPage() {
  const { location, savedLocationIds } = useApp();
  const { t } = useTranslation();

  const allAlerts: WeatherAlert[] = useMemo(() => {
    const ids = Array.from(new Set([location.id, ...savedLocationIds]));
    return ids
      .flatMap((id) => getAlertsForLocation(id))
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [location.id, savedLocationIds]);

  const critical = allAlerts.filter((a) => a.severity === "red" || a.severity === "orange");
  const warning = allAlerts.filter((a) => a.severity === "yellow");
  const info = allAlerts.filter((a) => a.severity === "info");

  const groupTitle: Record<string, string> = {
    critical: t("alerts.critical"),
    warning: t("alerts.warning"),
    information: t("alerts.information"),
  };

  return (
    <div className="-mx-4">
      <TopBar title={t("alerts.title")} showLocation />
      <div className="px-4 pt-4">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-800 p-3 text-white">
          <ShieldCheck size={20} className="shrink-0 text-emerald-400" />
          <div className="text-xs">
            <div className="font-semibold">{t("alerts.priority")}</div>
            <div className="text-white/70">{t("alerts.priorityDesc")}</div>
          </div>
        </div>

        {allAlerts.length === 0 && (
          <EmptyState
            icon={<ShieldCheck size={40} />}
            title={t("alerts.noAlerts")}
            subtitle={t("alerts.calm")}
          />
        )}

        {critical.length > 0 && (
          <Group title={groupTitle.critical} count={critical.length} alerts={critical} />
        )}
        {warning.length > 0 && (
          <Group title={groupTitle.warning} count={warning.length} alerts={warning} />
        )}
        {info.length > 0 && (
          <Group title={groupTitle.information} count={info.length} alerts={info} />
        )}

        <div className="mt-6 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("alerts.severityLegend")}
          </div>
          {(["red", "orange", "yellow", "info"] as const).map((s) => {
            const c = severityConfig(s);
            return (
              <div key={s} className={`flex items-center gap-2 rounded-2xl ${c.bg} p-3`}>
                <span>{c.emoji}</span>
                <span className={`text-sm font-semibold ${c.text}`}>{t(c.labelKey)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Group({ title, count, alerts }: { title: string; count: number; alerts: WeatherAlert[] }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <span className="chip bg-slate-100 text-slate-600">{count}</span>
      </div>
      <div className="space-y-2">
        {alerts.map((a) => (
          <AlertDetailCard key={a.id} alert={a} />
        ))}
      </div>
    </div>
  );
}

function AlertDetailCard({ alert }: { alert: WeatherAlert }) {
  const cfg = severityConfig(alert.severity);
  const loc = LOCATIONS.find((l) => l.id === alert.locationId);
  const { t } = useTranslation();
  return (
    <div className={`w-full rounded-3xl border ${cfg.bg} ${cfg.border} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 text-xs font-bold tracking-wide ${cfg.text}`}>
          {cfg.emoji} {t(cfg.labelKey)}
        </div>
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{alert.title}</div>
      <div className="mt-1 text-sm text-slate-600">{alert.description}</div>
      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-white/60 p-2.5 text-xs text-slate-700">
        <span className="font-semibold text-slate-800">{t("alerts.action")}</span>
        <span>{alert.action}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin size={11} /> {loc?.name ?? alert.locationId}
        </span>
        <span>·</span>
        <span>{t("common.updated")} {alert.updatedAt}</span>
        <span>·</span>
        <span>{alert.source}</span>
      </div>
    </div>
  );
}
