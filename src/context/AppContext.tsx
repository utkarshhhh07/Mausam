import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type {
  PersonaId,
  UserPreferences,
  LocationInfo,
  FeedbackEntry,
  FeedbackValue,
  HealthSensitivity,
} from "@/types";
import { LOCATIONS, getLocation } from "@/data/locations";
import { SCENARIOS } from "@/data/scenarios";

const STORAGE_KEY = "mausam-myday-state-v1";

interface AppState {
  onboarded: boolean;
  locationId: string;
  savedLocationIds: string[];
  prefs: UserPreferences;
  feedback: FeedbackEntry[];
}

interface AppContextValue extends AppState {
  location: LocationInfo;
  setOnboarded: (v: boolean) => void;
  setLocationId: (id: string) => void;
  toggleSavedLocation: (id: string) => void;
  removeSavedLocation: (id: string) => void;
  setPersonas: (p: PersonaId[]) => void;
  togglePersona: (p: PersonaId) => void;
  toggleHealthSensitivity: (s: HealthSensitivity) => void;
  setPrefs: (p: Partial<UserPreferences>) => void;
  addFeedback: (cardId: string, value: FeedbackValue, tags?: string[]) => void;
  applyScenario: (scenarioId: string) => void;
  resetAll: () => void;
}

const DEFAULT_PREFS: UserPreferences = {
  personas: ["fitness", "health"],
  units: "metric",
  language: "en",
  notifications: { rain: true, uv: true, severe: true },
  healthSensitivities: [],
};

const DEFAULT_STATE: AppState = {
  onboarded: false,
  locationId: "pune",
  savedLocationIds: ["pune"],
  prefs: DEFAULT_PREFS,
  feedback: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      prefs: { ...DEFAULT_PREFS, ...(parsed.prefs ?? {}) },
      feedback: parsed.feedback ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const value: AppContextValue = {
    ...state,
    location: getLocation(state.locationId),
    setOnboarded: (v) => setState((s) => ({ ...s, onboarded: v })),
    setLocationId: (id) =>
      setState((s) => ({
        ...s,
        locationId: id,
        savedLocationIds: s.savedLocationIds.includes(id)
          ? s.savedLocationIds
          : [...s.savedLocationIds, id],
      })),
    toggleSavedLocation: (id) =>
      setState((s) => ({
        ...s,
        savedLocationIds: s.savedLocationIds.includes(id)
          ? s.savedLocationIds.filter((x) => x !== id)
          : [...s.savedLocationIds, id],
      })),
    removeSavedLocation: (id) =>
      setState((s) => ({
        ...s,
        savedLocationIds: s.savedLocationIds.filter((x) => x !== id),
      })),
    setPersonas: (p) => setState((s) => ({ ...s, prefs: { ...s.prefs, personas: p } })),
    togglePersona: (p) =>
      setState((s) => ({
        ...s,
        prefs: {
          ...s.prefs,
          personas: s.prefs.personas.includes(p)
            ? s.prefs.personas.filter((x) => x !== p)
            : [...s.prefs.personas, p],
        },
      })),
    toggleHealthSensitivity: (sens) =>
      setState((s) => {
        const cur = s.prefs.healthSensitivities;
        if (sens === "none" || sens === "prefer-not-to-say") {
          const isOn = cur.includes(sens);
          return {
            ...s,
            prefs: { ...s.prefs, healthSensitivities: isOn ? [] : [sens] },
          };
        }
        const filtered = cur.filter((x) => x !== "none" && x !== "prefer-not-to-say");
        const isOn = filtered.includes(sens);
        return {
          ...s,
          prefs: {
            ...s.prefs,
            healthSensitivities: isOn ? filtered.filter((x) => x !== sens) : [...filtered, sens],
          },
        };
      }),
    setPrefs: (p) => setState((s) => ({ ...s, prefs: { ...s.prefs, ...p } })),
    addFeedback: (cardId, value, tags = []) =>
      setState((s) => ({
        ...s,
        feedback: [
          {
            id: `${Date.now()}-${cardId}`,
            cardId,
            locationId: s.locationId,
            value,
            tags,
            createdAt: new Date().toISOString(),
          },
          ...s.feedback,
        ].slice(0, 50),
      })),
    applyScenario: (scenarioId) => {
      const sc = SCENARIOS.find((x) => x.id === scenarioId);
      if (!sc) return;
      setState((s) => ({
        ...s,
        locationId: sc.locationId,
        prefs: { ...s.prefs, personas: sc.personas },
        onboarded: true,
        savedLocationIds: s.savedLocationIds.includes(sc.locationId)
          ? s.savedLocationIds
          : [...s.savedLocationIds, sc.locationId],
      }));
    },
    resetAll: () => {
      setState(DEFAULT_STATE);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { LOCATIONS };
