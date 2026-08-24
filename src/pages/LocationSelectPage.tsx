import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { LocationSwitcher } from "@/components/LocationSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

export function LocationSelectPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div>
      <button
        onClick={() => navigate("/welcome")}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition active:scale-95 hover:bg-slate-50"
        aria-label={t("common.back")}
      >
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t("onboarding.chooseLocation")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("onboarding.locationDesc")}</p>
      </div>
      <LocationSwitcher onPicked={() => navigate("/onboarding/persona")} />
      <div className="mt-8 flex justify-end">
        <button onClick={() => navigate("/onboarding/persona")} className="btn-primary">
          {t("common.continue")} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
