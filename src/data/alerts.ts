import type { WeatherAlert } from "@/types";

export const ALERTS: WeatherAlert[] = [
  {
    id: "pune-thunderstorm",
    locationId: "pune",
    severity: "yellow",
    title: "Thunderstorm activity possible",
    description:
      "Thunderstorm with gusty winds (30-40 km/h) likely over parts of Pune district during late afternoon.",
    action: "Stay indoors during gusts. Avoid open areas and tall trees.",
    source: "IMD (demo)",
    updatedAt: "09:30 AM",
    category: "warning",
  },
  {
    id: "mumbai-heavy-rain",
    locationId: "mumbai",
    severity: "orange",
    title: "Heavy rainfall and strong winds expected",
    description:
      "Heavy to very heavy rainfall (64-115 mm) likely over Mumbai city & suburbs today. Strong winds 40-50 km/h.",
    action: "Avoid low-lying areas. Postpone non-essential travel. Keep emergency contacts ready.",
    source: "IMD (demo)",
    updatedAt: "08:15 AM",
    category: "critical",
  },
  {
    id: "delhi-heat",
    locationId: "delhi",
    severity: "orange",
    title: "Heat wave conditions",
    description:
      "Maximum temperature likely to reach 40-42°C. Heat wave conditions in parts of Delhi.",
    action: "Avoid outdoor exposure between 12-4 PM. Stay hydrated.",
    source: "IMD (demo)",
    updatedAt: "07:45 AM",
    category: "critical",
  },
  {
    id: "goa-high-waves",
    locationId: "goa",
    severity: "yellow",
    title: "High waves along coast",
    description:
      "Wave heights of 1.8-2.2 m expected. Surging waves possible on exposed beaches.",
    action: "Avoid swimming near rocky areas. Follow lifeguard instructions.",
    source: "INCOIS (demo)",
    updatedAt: "06:00 AM",
    category: "warning",
  },
  {
    id: "london-rain",
    locationId: "london",
    severity: "yellow",
    title: "Persistent rain tomorrow",
    description: "Rain expected through much of tomorrow with cooler temperatures.",
    action: "Carry waterproofs if travelling.",
    source: "Met Office (demo)",
    updatedAt: "Yesterday 22:00",
    category: "information",
  },
];

export function getAlertsForLocation(locationId: string): WeatherAlert[] {
  return ALERTS.filter((a) => a.locationId === locationId);
}
