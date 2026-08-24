import { useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { translate, type Language } from "@/i18n/translations";

export function useTranslation() {
  const { prefs } = useApp();
  const lang: Language = prefs.language;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, lang, params),
    [lang],
  );

  return { t, lang };
}
