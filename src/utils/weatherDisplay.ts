import type { WeatherCondition } from "@/types";

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function formatTemp(c: number, units: "metric" | "imperial"): string {
  return units === "imperial" ? `${cToF(c)}°` : `${c}°`;
}

export function formatWind(kmh: number, units: "metric" | "imperial"): string {
  if (units === "imperial") {
    return `${Math.round(kmh / 1.609)} mph`;
  }
  return `${kmh} km/h`;
}

export const CONDITION_LABEL: Record<WeatherCondition, string> = {
  sunny: "Sunny",
  "partly-cloudy": "Partly Cloudy",
  cloudy: "Cloudy",
  rain: "Rain",
  "heavy-rain": "Heavy Rain",
  thunderstorm: "Thunderstorm",
  fog: "Fog",
  "clear-night": "Clear Night",
};

export const CONDITION_EMOJI: Record<WeatherCondition, string> = {
  sunny: "☀️",
  "partly-cloudy": "⛅",
  cloudy: "☁️",
  rain: "🌧️",
  "heavy-rain": "⛈️",
  thunderstorm: "⛈️",
  fog: "🌫️",
  "clear-night": "🌙",
};

export function conditionEmoji(c: WeatherCondition): string {
  return CONDITION_EMOJI[c] ?? "🌤️";
}

export function conditionLabel(c: WeatherCondition): string {
  return CONDITION_LABEL[c] ?? "—";
}

export function uvCategory(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

export function aqiCategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export function aqiColor(aqi: number): string {
  if (aqi <= 50) return "bg-emerald-100 text-emerald-700";
  if (aqi <= 100) return "bg-lime-100 text-lime-700";
  if (aqi <= 200) return "bg-amber-100 text-amber-700";
  if (aqi <= 300) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}
