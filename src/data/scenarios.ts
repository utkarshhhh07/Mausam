import type { PersonaId } from "@/types";

export interface DemoScenario {
  id: string;
  label: string;
  description: string;
  locationId: string;
  personas: PersonaId[];
}

export const SCENARIOS: DemoScenario[] = [
  {
    id: "s1",
    label: "Fitness + Health (Pune)",
    description: "Hot weather, high UV, moderate AQI",
    locationId: "pune",
    personas: ["fitness", "health", "commute"],
  },
  {
    id: "s2",
    label: "Family + Commute (Mumbai)",
    description: "Heavy rain, Orange warning",
    locationId: "mumbai",
    personas: ["family", "commute"],
  },
  {
    id: "s3",
    label: "Travel (London)",
    description: "Rain expected tomorrow",
    locationId: "london",
    personas: ["travel"],
  },
  {
    id: "s4",
    label: "Beach (Goa)",
    description: "High waves, rough sea",
    locationId: "goa",
    personas: ["beach", "health"],
  },
];
