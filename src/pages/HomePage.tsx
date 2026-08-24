import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Sparkles,
  CalendarClock,
  Bell,
  Eye,
  MapPin,
  Lightbulb,
  CheckCircle2,
  CloudRain,
  FolderHeart,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getWeather } from "@/data/weather";
import { getAlertsForLocation } from "@/data/alerts";
import {
  getPersonalizedCards,
  getYourDayRecommendation,
  getTopInsight,
  getTimeline,
} from "@/utils/personalizationEngine";
import { WeatherHeader } from "@/components/WeatherHeader";
import { AlertBanner } from "@/components/AlertBanner";
import { PersonalizedCardItem } from "@/components/PersonalizedCard";
import { OfflineState, LoadingSkeleton } from "@/components/States";
import { BottomSheet } from "@/components/BottomSheet";
import { LocationSwitcher } from "@/components/LocationSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { translate } from "@/i18n/translations";
import type { PersonalizedCard } from "@/types";

export function HomePage() {
  const { location, prefs } = useApp();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const [yourDayOpen, setYourDayOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [locSheetOpen, setLocSheetOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  useMemo(() => {
    setLoading(true);
    setShowAll(false);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.id]);

  const weather = useMemo(() => getWeather(location.id), [location.id]);
  const alerts = useMemo(() => getAlertsForLocation(location.id), [location.id]);
  const criticalAlert = alerts.find((a) => a.severity === "red" || a.severity === "orange");
  const otherAlerts = alerts.filter((a) => a !== criticalAlert);
  const allCards = useMemo(
    () => getPersonalizedCards(prefs, weather, alerts),
    [prefs, weather, alerts],
  );
  const cards = showAll ? allCards : allCards.slice(0, 5);
  const hiddenCount = Math.max(0, allCards.length - 5);
  const yourDay = useMemo(
    () => getYourDayRecommendation(prefs, weather, alerts),
    [prefs, weather, alerts],
  );
  const topInsight = useMemo(
    () => getTopInsight(prefs, weather, alerts),
    [prefs, weather, alerts],
  );
  const timeline = useMemo(
    () => getTimeline(prefs, weather).slice(0, 4),
    [prefs, weather],
  );

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "greeting.morning" : hour < 17 ? "greeting.afternoon" : "greeting.evening";

  const personaLabels = prefs.personas
    .map((p) => translate(`persona.${p}`, lang))
    .join(", ");

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      {/* ── MAUSAM IDENTITY BAR ── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <CloudRain size={20} strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-slate-900">
              MAUSAM <span className="text-brand-600">MyDay</span>
            </div>
            <div className="text-[11px] text-slate-400">{t("home.prototypeNote")}</div>
          </div>
        </div>
        <button
          onClick={() => navigate("/alerts")}
          className="relative rounded-full bg-white p-2.5 ring-1 ring-slate-100 transition active:scale-90"
          aria-label={t("nav.alerts")}
        >
          <Bell size={18} className="text-slate-600" />
          {alerts.length > 0 && (
            <span
              className={`absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                criticalAlert ? "bg-red-500" : "bg-amber-400"
              }`}
            />
          )}
        </button>
      </div>

      {/* ── GREETING ── */}
      <div className="-mb-1">
        <div className="text-sm text-slate-500">{t(greetingKey)}</div>
        <div className="text-lg font-bold text-slate-900">{t("home.tagline")}</div>
      </div>

      {/* ── LOCATION SWITCHER ── */}
      <button
        onClick={() => setLocSheetOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left ring-1 ring-slate-100 transition active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <MapPin size={18} className="shrink-0 text-brand-600" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {location.name}, {location.region}
            </div>
            <div className="text-xs text-slate-400">
              {t("home.changeLocation")}
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="shrink-0 text-slate-300" />
      </button>

      {/* ── CURRENT WEATHER ── */}
      <WeatherHeader weather={weather} />

      {/* ── OFFLINE / DATA NOTE ── */}
      <OfflineState />

      {/* ── OFFICIAL WARNING (highest priority) ── */}
      {criticalAlert ? (
        <section className="space-y-2">
          <SectionLabel>
            <ShieldCheck size={12} className="inline" /> {t("home.safetyAlert")}
          </SectionLabel>
          <AlertBanner alert={criticalAlert} />
          {otherAlerts.slice(0, 1).map((a) => (
            <AlertBanner key={a.id} alert={a} />
          ))}
        </section>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-emerald-800">
              {t("home.noWarning")}
            </div>
            <div className="text-xs text-emerald-700">{t("home.noWarningDesc")}</div>
          </div>
        </div>
      )}

      {/* ── TODAY'S TOP INSIGHT ── */}
      {!criticalAlert && (
        <section>
          <SectionLabel>
            <Lightbulb size={12} className="inline" /> {t("home.topInsight")}
          </SectionLabel>
          <div className="card flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-white">
            <span className="text-3xl">{topInsight.emoji}</span>
            <p className="flex-1 text-sm font-medium leading-snug text-slate-800">
              {topInsight.title}
            </p>
          </div>
        </section>
      )}

      {/* ── YOUR DAY (single recommendation) ── */}
      <section>
        <SectionLabel>{t("home.yourDay")}</SectionLabel>
        <button
          onClick={() => setYourDayOpen(true)}
          className="card w-full p-4 text-left transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{yourDay.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {yourDay.title}
              </div>
              <div className="text-xl font-bold text-slate-900">{yourDay.value}</div>
              <div className="mt-0.5 text-sm text-slate-600">{yourDay.detail}</div>
            </div>
            <ChevronRight size={20} className="shrink-0 text-slate-300" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-xs text-slate-400">{t("home.tapDetails")}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/myday");
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"
            >
              {t("home.viewTimeline")} <CalendarClock size={14} />
            </button>
          </div>
        </button>
      </section>

      {/* ── PERSONALIZED ADVISORY CARDS ── */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <SectionLabel>
            <Sparkles size={12} className="inline" /> {t("home.personalized")}
          </SectionLabel>
          {allCards.length > 0 && (
            <span className="text-[11px] font-medium text-slate-400">
              {t("home.advisoryCount", { n: String(allCards.length) })}
            </span>
          )}
        </div>
        {cards.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-500">
            {t("home.selectInterests")}
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card: PersonalizedCard) => (
              <PersonalizedCardItem key={card.id} card={card} />
            ))}
            {hiddenCount > 0 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white p-3 text-sm font-semibold text-brand-600 ring-1 ring-slate-100 transition active:scale-[0.99]"
              >
                <ChevronDown size={16} />
                {t("home.viewAllAdvisories")} ·{" "}
                {t("home.moreAdvisories", { n: String(hiddenCount) })}
              </button>
            )}
            {showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(false)}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white p-3 text-sm font-semibold text-slate-500 ring-1 ring-slate-100 transition active:scale-[0.99]"
              >
                {t("common.close")}
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── MY DAY MINI-TIMELINE PREVIEW ── */}
      {timeline.length > 0 && (
        <section>
          <SectionLabel>{t("myday.title")}</SectionLabel>
          <div className="card p-4">
            <div className="space-y-3">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-14 shrink-0 text-xs font-semibold text-slate-400">
                    {item.time}
                  </div>
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.metric}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/myday")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-sm font-semibold text-brand-600 transition active:scale-[0.99] hover:bg-slate-100"
            >
              {t("home.viewFullTimeline")} <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* ── QUICK ACCESS TO MAUSAM ECOSYSTEM SERVICES ── */}
      <section>
        <SectionLabel>{t("home.quickAccess")}</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <QuickTile
            icon={<CalendarClock size={20} />}
            label={t("nav.forecast")}
            onClick={() => navigate("/forecast")}
          />
          <QuickTile
            icon={<Bell size={20} />}
            label={t("nav.alerts")}
            badge={alerts.length > 0 ? String(alerts.length) : undefined}
            onClick={() => navigate("/alerts")}
          />
          <QuickTile
            icon={<FolderHeart size={20} />}
            label={t("nav.saved")}
            onClick={() => navigate("/saved")}
          />
          <QuickTile
            icon={<CalendarClock size={20} />}
            label={t("nav.myday")}
            onClick={() => navigate("/myday")}
          />
        </div>
      </section>

      {/* ── SOURCE + TRUST FOOTER ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-white p-3 text-xs text-slate-400 ring-1 ring-slate-100">
        <Eye size={12} className="shrink-0" />
        <span>
          {t("home.showingCards", {
            n: String(allCards.length),
            personas: personaLabels || t("card.general"),
          })}
        </span>
        <span>·</span>
        <MapPin size={11} /> {weather.locationName}
        <span>·</span>
        <span>{weather.source}</span>
      </div>

      {/* ── PROTOTYPE DISCLAIMER ── */}
      <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-400">
        <Info size={14} className="mt-0.5 shrink-0 text-slate-300" />
        <span>
          {t("card.engineNote")}
        </span>
      </div>

      {/* ── LOCATION SWITCHER SHEET ── */}
      <BottomSheet
        open={locSheetOpen}
        onClose={() => setLocSheetOpen(false)}
        title={t("saved.title")}
      >
        <LocationSwitcher onPicked={() => setLocSheetOpen(false)} />
      </BottomSheet>

      {/* ── YOUR DAY DETAILS SHEET ── */}
      <BottomSheet
        open={yourDayOpen}
        onClose={() => setYourDayOpen(false)}
        title={t("home.yourDayDetails")}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{yourDay.emoji}</span>
            <div>
              <div className="text-sm font-semibold text-slate-900">{yourDay.title}</div>
              <div className="text-lg font-bold text-brand-700">{yourDay.value}</div>
            </div>
          </div>
          <p className="text-sm text-slate-600">{yourDay.detail}</p>
          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
            {t("home.yourDayExplainer", { location: weather.locationName })}
          </div>
          <button onClick={() => navigate("/myday")} className="btn-primary w-full">
            {t("home.viewFullTimeline")}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </div>
  );
}

function QuickTile({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card relative flex items-center gap-3 p-3.5 text-left transition active:scale-[0.97] hover:ring-slate-200"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <span className="flex-1 text-sm font-semibold text-slate-700">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-600">
          {badge}
        </span>
      )}
    </button>
  );
}
