import { useApp } from "@/context/AppContext";
import type { FeedbackValue } from "@/types";

export function useCardFeedback(cardId: string) {
  const { feedback, addFeedback } = useApp();
  const existing = feedback.find((f) => f.cardId === cardId);
  return {
    value: existing?.value as FeedbackValue | undefined,
    submit: (value: FeedbackValue, tags?: string[]) => addFeedback(cardId, value, tags),
  };
}
