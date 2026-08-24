import type { Persona, PersonaId } from "@/types";

export const PERSONAS: Persona[] = [
  { id: "health", label: "Health", emoji: "❤️", description: "Air quality, UV, humidity awareness" },
  { id: "fitness", label: "Fitness", emoji: "🏃", description: "Best times to run, train, be active" },
  { id: "travel", label: "Travel", emoji: "✈️", description: "Destination weather & packing" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", description: "School runs, kid-safe conditions" },
  { id: "garden", label: "Garden / Farm", emoji: "🌱", description: "Rain, frost & soil guidance" },
  { id: "beach", label: "Beach", emoji: "🏖️", description: "Waves, tides & sea conditions" },
  { id: "commute", label: "Commute", emoji: "🚗", description: "Visibility, rain, storm alerts" },
  { id: "events", label: "Events", emoji: "🎉", description: "Outdoor event comfort index" },
];

export const PERSONA_LABEL: Record<PersonaId, string> = PERSONAS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p.label }),
  {} as Record<PersonaId, string>,
);
