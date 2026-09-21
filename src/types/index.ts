export type PersonaId =
  | "health"
  | "fitness"
  | "travel"
  | "family"
  | "garden"
  | "beach"
  | "commute"
  | "events";

export interface Persona {
  id: PersonaId;
  label: string;
  emoji: string;
  description: string;
}

export type AlertSeverity = "red" | "orange" | "yellow" | "info";

export interface WeatherAlert {
  id: string;
  locationId: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  action: string;
  source: string;
  updatedAt: string;
  category: "critical" | "warning" | "information";
}

export interface HourlyPoint {
  time: string; // "06:00"
  hour: number;
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  rainProbability: number;
  snowfall: number; // cm
  humidity: number;
  wind: number;
  uv: number;
  visibility: number; // km
}

export interface DailyPoint {
  day: string; // "Mon"
  dateLabel: string; // "12 Aug"
  high: number;
  low: number;
  condition: WeatherCondition;
  rainProbability: number;
  snowfall: number; // cm
  snowDepth: number; // cm
}

export type WeatherCondition =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "heavy-rain"
  | "thunderstorm"
  | "fog"
  | "clear-night"
  | "snow";

export interface AirQuality {
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  pollen: "low" | "moderate" | "high";
  pollenAvailable: boolean;
  source: string;
}

export interface MarineData {
  waveHeight: number; // metres
  wavePeriod: number; // seconds
  waveDirection: string;
  swellHeight: number; // metres
  swellPeriod: number; // seconds
  swellDirection: string;
  seaLevelHeight: number; // metres
  waterTemp: number;
  oceanCurrentVelocity: number; // m/s
  oceanCurrentDirection: string;
  wind: number;
  tideHigh: string;
  tideLow: string;
  seaCondition: string;
  source: string;
  available: boolean; // false for inland locations
}

export interface WeatherData {
  locationId: string;
  locationName: string;
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  humidity: number;
  wind: number;
  windDirection: string;
  rainProbability: number;
  precipitation: number; // mm
  snowfall: number; // cm
  snowDepth: number; // cm
  uv: number;
  uvCategory: string;
  visibility: number;
  sunrise: string;
  sunset: string;
  lastUpdated: string;
  airQuality: AirQuality;
  marine: MarineData;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  soilMoisture: number; // %
  soilTemperature: number; // °C
  frostRisk: "none" | "low" | "moderate";
  source: string;
  isLive: boolean;
}

export interface LocationInfo {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  coastal: boolean;
}

export type HealthSensitivity =
  | "respiratory"
  | "pollen"
  | "sun"
  | "none"
  | "prefer-not-to-say";

export type FeedbackValue = "useful" | "okay" | "not-useful";

export interface FeedbackEntry {
  id: string;
  cardId: string;
  locationId: string;
  value: FeedbackValue;
  tags: string[];
  createdAt: string;
}

export interface UserPreferences {
  personas: PersonaId[];
  units: "metric" | "imperial";
  language: "en" | "hi";
  notifications: {
    rain: boolean;
    uv: boolean;
    severe: boolean;
  };
  healthSensitivities: HealthSensitivity[];
}

export type PersonalizedCard = {
  id: string;
  persona: PersonaId | "general";
  title: string;
  emoji: string;
  value: string;
  meaning: string;
  recommendation: string;
  updatedAt: string;
  source: string;
  reason: string; // for "Why am I seeing this?"
  priority: number;
  meta?: Record<string, string>;
};
