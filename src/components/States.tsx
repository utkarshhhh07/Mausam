import { CloudOff, RefreshCw, MapPinOff, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 text-center ring-1 ring-slate-100">
      <div className="mb-3 text-slate-300">{icon ?? <MapPinOff size={40} />}</div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

export function OfflineState() {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();
  if (dismissed) return null;
  return (
    <div className="card flex items-center gap-3 bg-amber-50 p-4 ring-amber-100">
      <CloudOff size={22} className="shrink-0 text-amber-600" />
      <div className="flex-1 text-sm">
        <div className="font-semibold text-amber-800">{t("states.offline")}</div>
        <div className="text-amber-700">{t("states.offlineDesc")}</div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="rounded-full p-1 text-amber-600 transition hover:bg-amber-100"
        aria-label={t("common.close")}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-44 animate-pulse rounded-3xl bg-gradient-to-br from-brand-300 to-brand-500" />
      <div className="h-20 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
      <div className="h-20 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
      <div className="h-32 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
    </div>
  );
}
