import { ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/hooks/useTranslation";

export function TopBar({
  title,
  showBack,
  showLocation,
}: {
  title?: string;
  showBack?: boolean;
  showLocation?: boolean;
}) {
  const navigate = useNavigate();
  const { location } = useApp();
  const { t } = useTranslation();
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-1.5 text-slate-600 transition hover:bg-slate-100"
          aria-label={t("common.back")}
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {title && <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>}
      </div>
      {showLocation && (
        <button
          onClick={() => navigate("/locations")}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
        >
          <MapPin size={14} className="text-brand-600" />
          {location.name}
        </button>
      )}
    </div>
  );
}
