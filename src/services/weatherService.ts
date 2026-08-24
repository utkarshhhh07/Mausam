import type { WeatherData, WeatherAlert, LocationInfo } from "@/types";
import { WEATHER } from "@/data/weather";
import { ALERTS } from "@/data/alerts";
import { LOCATIONS } from "@/data/locations";

/**
 * Weather service layer.
 *
 * Today this reads from mock data. Tomorrow, swap the internals for live
 * IMD / CPCB / INCOIS API calls — the function signatures stay the same,
 * so the UI does not change.
 *
 *   UI  →  weatherService  →  mock data
 *   UI  →  weatherService  →  IMD API   (future)
 */

export const weatherService = {
  async getWeather(locationId: string): Promise<WeatherData> {
    return simulateLatency(WEATHER[locationId] ?? WEATHER.pune);
  },

  async getAlerts(locationId: string): Promise<WeatherAlert[]> {
    const alerts = ALERTS.filter((a) => a.locationId === locationId);
    return simulateLatency(sortAlerts(alerts));
  },

  async getAlertsForLocations(locationIds: string[]): Promise<WeatherAlert[]> {
    const set = new Set(locationIds);
    const alerts = ALERTS.filter((a) => set.has(a.locationId));
    return simulateLatency(sortAlerts(alerts));
  },

  getLocations(): LocationInfo[] {
    return LOCATIONS;
  },

  getLocation(id: string): LocationInfo {
    return LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0];
  },
};

export const alertService = {
  highestPriority(alerts: WeatherAlert[]): WeatherAlert | undefined {
    const order: Record<string, number> = { red: 0, orange: 1, yellow: 2, info: 3 };
    return [...alerts].sort((a, b) => order[a.severity] - order[b.severity])[0];
  },

  isCritical(a: WeatherAlert): boolean {
    return a.severity === "red" || a.severity === "orange";
  },
};

function sortAlerts(alerts: WeatherAlert[]): WeatherAlert[] {
  const order: Record<string, number> = { red: 0, orange: 1, yellow: 2, info: 3 };
  return [...alerts].sort((a, b) => order[a.severity] - order[b.severity]);
}

function simulateLatency<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), 250));
}
