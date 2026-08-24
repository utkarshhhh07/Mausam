import { useState } from "react";
import { HelpCircle, ThumbsUp, Meh, ThumbsDown } from "lucide-react";
import type { PersonalizedCard } from "@/types";
import { BottomSheet } from "./BottomSheet";
import { useCardFeedback } from "@/hooks/useCardFeedback";
import { useTranslation } from "@/hooks/useTranslation";
import { translate } from "@/i18n/translations";

export function PersonalizedCardItem({ card }: { card: PersonalizedCard }) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { value, submit } = useCardFeedback(card.id);
  const { t, lang } = useTranslation();

  const personaLabel = card.persona === "general"
    ? t("card.general")
    : translate(`persona.${card.persona}`, lang);

  return (
    <div className="card p-4 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{card.emoji}</span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {card.title}
            </div>
          </div>
        </div>
        <button
          onClick={() => setWhyOpen(true)}
          className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
        >
          <HelpCircle size={13} /> {t("card.whyThis")}
        </button>
      </div>

      <div className="mt-2 text-2xl font-bold text-slate-900">{card.value}</div>
      <p className="mt-1 text-sm text-slate-600">{card.meaning}</p>
      <div className="mt-3 rounded-2xl bg-sky-50 p-3 text-sm font-medium text-sky-900">
        {card.recommendation}
      </div>

      {card.meta && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Object.entries(card.meta).map(([k, v]) => (
            <span key={k} className="chip bg-slate-100 text-slate-600">
              {v}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="text-[11px] text-slate-400">
          {card.updatedAt} · {card.source}
        </div>
        <FeedbackControls
          value={value}
          onOpenTags={() => setFeedbackOpen(true)}
          onSubmit={(v) => submit(v)}
        />
      </div>

      <BottomSheet open={whyOpen} onClose={() => setWhyOpen(false)} title={t("card.whySeeing")}>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-700">{card.reason}</p>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("card.whatUses")}
            </div>
            <div className="mt-1.5 space-y-1 text-xs text-slate-600">
              <RuleRow label={t("card.yourPurpose")} value={`${card.emoji} ${personaLabel}`} />
              <RuleRow label={t("card.priority")} value={`${card.priority}/100`} />
              <RuleRow label={t("common.source")} value={card.source} />
              <RuleRow label={t("common.updated")} value={card.updatedAt} />
            </div>
          </div>
          <div className="rounded-2xl bg-brand-50 p-3 text-xs text-brand-800">
            {t("card.engineNote")}
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title={t("feedback.helpImprove")}
      >
        <p className="text-sm text-slate-600">{t("feedback.whatFeltOff")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["feedback.tooHot", "feedback.comfortable", "feedback.tooHumid", "feedback.tooWindy", "feedback.unexpectedRain"].map((tk) => (
            <button
              key={tk}
              onClick={() => {
                submit("not-useful", [t(tk)]);
                setFeedbackOpen(false);
              }}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
            >
              {t(tk)}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function RuleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

function FeedbackControls({
  value,
  onOpenTags,
  onSubmit,
}: {
  value?: "useful" | "okay" | "not-useful";
  onOpenTags: () => void;
  onSubmit: (v: "useful" | "okay" | "not-useful") => void;
}) {
  const { t } = useTranslation();
  if (value) {
    return (
      <span className="text-xs font-medium text-emerald-600">{t("feedback.thanks")}</span>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onSubmit("useful")}
        className="rounded-full p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
        aria-label={t("feedback.useful")}
      >
        <ThumbsUp size={15} />
      </button>
      <button
        onClick={() => onSubmit("okay")}
        className="rounded-full p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
        aria-label={t("feedback.okay")}
      >
        <Meh size={15} />
      </button>
      <button
        onClick={onOpenTags}
        className="rounded-full p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        aria-label={t("feedback.notUseful")}
      >
        <ThumbsDown size={15} />
      </button>
    </div>
  );
}
