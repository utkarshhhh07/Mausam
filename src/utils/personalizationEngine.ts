import type {
  PersonaId,
  PersonalizedCard,
  UserPreferences,
  WeatherData,
  WeatherAlert,
  HealthSensitivity,
} from "@/types";
import { translate, type Language, type TranslationKey } from "@/i18n/translations";
import { CONDITION_LABEL } from "@/utils/weatherDisplay";

function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  return translate(key, lang, params);
}

/**
 * Rule-based personalization engine.
 * Ranks actionable weather cards for the user's selected personas.
 * Priority order: safety alert > time-sensitive decision > persona > general.
 */
export function getPersonalizedCards(
  prefs: UserPreferences,
  weather: WeatherData,
  alerts: WeatherAlert[],
): PersonalizedCard[] {
  const cards: PersonalizedCard[] = [];
  const { personas, language } = prefs;
  const has = (p: PersonaId) => personas.includes(p);

  // ---- FITNESS ----
  if (has("fitness")) {
    const bestWindow = findBestRunningWindow(weather);
    if (bestWindow) {
      const highRain = weather.rainProbability >= 80 || bestWindow.rainRisk;
      cards.push({
        id: "fitness-running-window",
        persona: "fitness",
        title: t("engine.bestRunningWindow", language),
        emoji: "🏃",
        value: `${bestWindow.start} – ${bestWindow.end}`,
        meaning: t("engine.fitness.meaning", language),
        recommendation: highRain
          ? t("engine.fitness.recIndoor", language)
          : bestWindow.rainRisk
            ? t("engine.fitness.recRain", language)
            : t("engine.fitness.recGood", language),
        updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
        source: weather.source,
        reason: t("reason.fitness.window", language, { end: bestWindow.end }),
        priority: highRain ? 92 : 90,
        meta: { temp: `${bestWindow.temp}°`, uv: `UV ${bestWindow.uv}` },
      });
    }

    if (weather.uv >= 8) {
      cards.push({
        id: "fitness-heat",
        persona: "fitness",
        title: t("engine.heatUVAlert", language),
        emoji: "🌡️",
        value: `UV ${weather.uv} — ${weather.uvCategory}`,
        meaning: t("engine.fitness.heatMeaning", language),
        recommendation: t("engine.fitness.heatRec", language),
        updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
        source: weather.source,
        reason: t("reason.fitness.heat", language, { uv: String(weather.uv), category: weather.uvCategory }),
        priority: 70,
      });
    }

    cards.push({
      id: "fitness-sun",
      persona: "fitness",
      title: t("engine.sunriseSunset", language),
      emoji: "🌅",
      value: `${weather.sunrise} → ${weather.sunset}`,
      meaning: t("engine.fitness.sunMeaning", language),
      recommendation: t("engine.fitness.sunRec", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.fitness.sun", language),
      priority: 40,
    });
  }

  // ---- HEALTH ----
  if (has("health")) {
    const aqiHigh = weather.airQuality.aqi > 150;
    cards.push({
      id: "health-aqi",
      persona: "health",
      title: t("engine.airQuality", language),
      emoji: "🌬️",
      value: `${weather.airQuality.aqi} — ${weather.airQuality.category}`,
      meaning: aqiHigh
        ? t("engine.health.aqiMeaningHigh", language)
        : t("engine.health.aqiMeaningOk", language),
      recommendation: aqiHigh
        ? t("engine.health.aqiRecHigh", language)
        : t("engine.health.aqiRecOk", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.airQuality.source,
      reason: t("reason.health.aqi", language, { aqi: String(weather.airQuality.aqi) }),
      priority: 80,
    });

    const uvHigh = weather.uv >= 8;
    cards.push({
      id: "health-uv",
      persona: "health",
      title: t("engine.uvIndexCard", language),
      emoji: "☀️",
      value: `${weather.uv} — ${weather.uvCategory}`,
      meaning: uvHigh
        ? t("engine.health.uvMeaningHigh", language)
        : t("engine.health.uvMeaningMod", language),
      recommendation: uvHigh
        ? t("engine.health.uvRecHigh", language)
        : t("engine.health.uvRecMod", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.health.uv", language, { uv: String(weather.uv) }),
      priority: 75,
    });

    if (weather.airQuality.pollen !== "low") {
      cards.push({
        id: "health-pollen",
        persona: "health",
        title: t("engine.pollen", language),
        emoji: "🌸",
        value: `${t("engine.pollen", language)}: ${weather.airQuality.pollen}`,
        meaning: t("engine.health.pollenMeaning", language),
        recommendation:
          weather.airQuality.pollen === "high"
            ? t("engine.health.pollenRecHigh", language)
            : t("engine.health.pollenRecMod", language),
        updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
        source: weather.airQuality.source,
        reason: t("reason.health.pollen", language),
        priority: 55,
      });
    }
  }

  // ---- HEALTH-SENSITIVITY (additional layer) ----
  const sens = prefs.healthSensitivities ?? [];
  const hasSens = (s: HealthSensitivity) => sens.includes(s);

  if (hasSens("respiratory") && weather.airQuality.aqi > 150) {
    cards.push({
      id: "health-sens-respiratory",
      persona: "health",
      title: t("health.respiratory.title", language),
      emoji: "🫁",
      value: `AQI ${weather.airQuality.aqi} — ${weather.airQuality.category}`,
      meaning: t("health.respiratory.title", language),
      recommendation: t("health.respiratory.rec", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.airQuality.source,
      reason: t("reason.health.respiratory", language, { aqi: String(weather.airQuality.aqi) }),
      priority: 85,
    });
  }

  if (hasSens("sun") && weather.uv >= 8) {
    cards.push({
      id: "health-sens-sun",
      persona: "health",
      title: t("health.sun.title", language),
      emoji: "☀️",
      value: `UV ${weather.uv} — ${weather.uvCategory}`,
      meaning: t("health.sun.title", language),
      recommendation: t("health.sun.rec", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.health.sun", language, { uv: String(weather.uv) }),
      priority: 84,
    });
  }

  if (hasSens("pollen")) {
    if (weather.airQuality.pollen !== "low") {
      cards.push({
        id: "health-sens-pollen",
        persona: "health",
        title: t("health.pollen.title", language),
        emoji: "🌼",
        value: `${t("engine.pollen", language)}: ${weather.airQuality.pollen}`,
        meaning: t("health.pollen.title", language),
        recommendation: t("health.pollen.rec", language),
        updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
        source: weather.airQuality.source,
        reason: t("reason.health.pollen", language, { level: weather.airQuality.pollen }),
        priority: 83,
      });
    } else {
      cards.push({
        id: "health-sens-pollen-unavailable",
        persona: "health",
        title: t("health.pollen.unavailable", language),
        emoji: "🌼",
        value: "—",
        meaning: t("health.pollen.unavailable", language),
        recommendation: t("health.pollen.unavailable", language),
        updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
        source: weather.airQuality.source,
        reason: t("reason.health.pollenUnavailable", language),
        priority: 40,
      });
    }
  }

  // ---- COMMUTE ----
  if (has("commute")) {
    const morning = weather.hourly.find((h) => h.hour === 8);
    const evening = weather.hourly.find((h) => h.hour === 18);
    const commuteRain = Math.max(morning?.rainProbability ?? 0, evening?.rainProbability ?? 0);
    const meaning =
      commuteRain > 50
        ? t("engine.commute.rainLikely", language)
        : commuteRain > 25
          ? t("engine.commute.rainPossible", language)
          : t("engine.commute.dry", language);
    const rec =
      commuteRain > 50
        ? t("engine.commute.leaveEarly", language)
        : t("engine.commute.normal", language);
    cards.push({
      id: "commute-conditions",
      persona: "commute",
      title: t("engine.commuteConditions", language),
      emoji: "🚗",
      value: `${t("weather.rain", language)} ${commuteRain}% · 8 AM / 6 PM`,
      meaning,
      recommendation: rec,
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.commute", language, { rain: String(commuteRain) }),
      priority: 78,
      meta: { [t("weather.visibility", language)]: `${weather.visibility} km` },
    });

    if (weather.visibility < 5) {
      cards.push({
        id: "commute-visibility",
        persona: "commute",
        title: t("engine.lowVisibility", language),
        emoji: "🌫️",
        value: `${weather.visibility} km`,
        meaning: t("engine.commute.lowVisMeaning", language),
        recommendation: t("engine.commute.lowVisRec", language),
        updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
        source: weather.source,
        reason: t("reason.commute.lowVis", language, { vis: String(weather.visibility) }),
        priority: 65,
      });
    }
  }

  // ---- FAMILY ----
  if (has("family")) {
    const schoolHour = weather.hourly.find((h) => h.hour === 8);
    const schoolRain = schoolHour?.rainProbability ?? 0;
    cards.push({
      id: "family-school",
      persona: "family",
      title: t("engine.schoolCommute", language),
      emoji: "🎒",
      value: `${t("weather.rain", language)} ${schoolRain}% · 8 AM`,
      meaning: schoolRain > 40 ? t("engine.family.rainExpected", language) : t("engine.family.dry", language),
      recommendation: schoolRain > 40 ? t("engine.family.carryUmbrella", language) : t("engine.family.normal", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.family.school", language, { rain: String(schoolRain) }),
      priority: 76,
    });

    if (weather.uv >= 8) {
      cards.push({
        id: "family-uv",
        persona: "family",
        title: t("engine.kidsUV", language),
        emoji: "🧒",
        value: `UV ${weather.uv}`,
        meaning: t("engine.family.uvMeaning", language),
        recommendation: t("engine.family.uvRec", language),
        updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
        source: weather.source,
        reason: t("reason.family.uv", language),
        priority: 60,
      });
    }
  }

  // ---- TRAVEL ----
  if (has("travel")) {
    const tomorrow = weather.daily[1];
    const rainTomorrow = tomorrow?.rainProbability ?? 0;
    const packingItems: string[] = [];
    if (rainTomorrow > 50) packingItems.push(t("feedback.unexpectedRain", language).toLowerCase());
    if (tomorrow && tomorrow.high < 20) packingItems.push("warm layer");
    if (weather.uv >= 6) packingItems.push("sunscreen");
    const packing = packingItems.length > 0 ? packingItems.join(", ") : "light layers";

    cards.push({
      id: "travel-destination",
      persona: "travel",
      title: t("engine.tomorrowIn", language, { location: weather.locationName }),
      emoji: "✈️",
      value: `${tomorrow?.high ?? weather.temp}° / ${tomorrow?.low ?? weather.temp - 6}° · ${t("weather.rain", language)} ${rainTomorrow}%`,
      meaning: rainTomorrow > 50 ? t("engine.travel.rainTomorrow", language) : t("engine.travel.clear", language),
      recommendation: t("engine.travel.packing", language, { items: packing }),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.travel", language, { location: weather.locationName, rain: String(rainTomorrow) }),
      priority: 72,
      meta: {
        forecast: tomorrow ? `${tomorrow.high}°/${tomorrow.low}°` : "—",
        rain: `${t("weather.rain", language)} ${rainTomorrow}%`,
        pack: packing,
      },
    });

    cards.push({
      id: "travel-packing",
      persona: "travel",
      title: t("engine.packingSuggestion", language),
      emoji: "🧳",
      value: packing,
      meaning: t("engine.travel.packingMeaning", language, { location: weather.locationName }),
      recommendation: t("engine.travel.carry", language, { items: packing }),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.travel.packing", language, { rain: String(rainTomorrow), high: String(tomorrow?.high ?? weather.temp) }),
      priority: 68,
    });
  }

  // ---- BEACH ----
  if (has("beach")) {
    const m = weather.marine;
    const unsuitable = m.waveHeight >= 1.5;
    cards.push({
      id: "beach-conditions",
      persona: "beach",
      title: t("engine.seaConditions", language),
      emoji: "🌊",
      value: `${t("weather.condition", language)} ${m.waveHeight} m · ${m.seaCondition}`,
      meaning: unsuitable ? t("engine.beach.unsuitable", language) : t("engine.beach.manageable", language),
      recommendation: unsuitable ? t("engine.beach.avoidSwim", language) : t("engine.beach.safe", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: m.source,
      reason: t("reason.beach", language, { waves: String(m.waveHeight), condition: m.seaCondition }),
      priority: 74,
    });
    cards.push({
      id: "beach-tide",
      persona: "beach",
      title: t("engine.tideTimings", language),
      emoji: "🕐",
      value: `${t("weather.sunrise", language)} ${m.tideHigh} · ${t("weather.sunset", language)} ${m.tideLow}`,
      meaning: t("engine.beach.tideMeaning", language),
      recommendation: t("engine.beach.tideRec", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: m.source,
      reason: t("reason.beach.tide", language),
      priority: 50,
    });
  }

  // ---- GARDEN / FARM ----
  if (has("garden")) {
    const rainHigh = weather.rainProbability > 50;
    cards.push({
      id: "garden-rain",
      persona: "garden",
      title: t("engine.gardenWatering", language),
      emoji: "🌱",
      value: `${t("weather.rain", language)} ${weather.rainProbability}% · ${weather.soilMoisture}% (demo)`,
      meaning: rainHigh ? t("engine.garden.rainMeaning", language) : t("engine.garden.dryMeaning", language),
      recommendation: rainHigh ? t("engine.garden.rainRec", language) : t("engine.garden.dryRec", language),
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.garden", language, { rain: String(weather.rainProbability) }),
      priority: 62,
    });
    if (weather.frostRisk !== "none") {
      cards.push({
        id: "garden-frost",
        persona: "garden",
        title: t("engine.frostRisk", language),
        emoji: "❄️",
        value: `${t("engine.frostRisk", language)}: ${weather.frostRisk}`,
        meaning: t("engine.garden.frostMeaning", language),
        recommendation: t("engine.garden.frostRec", language),
        updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
        source: weather.source,
        reason: t("reason.garden.frost", language, { risk: weather.frostRisk }),
        priority: 66,
      });
    }
  }

  // ---- EVENTS ----
  if (has("events")) {
    const score = eventScore(weather);
    const meaning =
      score >= 75
        ? t("engine.events.good", language)
        : score >= 50
          ? t("engine.events.acceptable", language)
          : t("engine.events.risky", language);
    const rec =
      score >= 75 ? t("engine.events.proceed", language) : t("engine.events.backup", language);
    cards.push({
      id: "events-score",
      persona: "events",
      title: t("engine.eventScore", language),
      emoji: "🎉",
      value: `${score} / 100`,
      meaning,
      recommendation: rec,
      updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
      source: weather.source,
      reason: t("reason.events", language, { score: String(score) }),
      priority: 64,
    });
  }

  // ---- GENERAL (always) ----
  const humidHigh = weather.humidity > 80;
  cards.push({
    id: "general-humidity",
    persona: "general",
    title: t("engine.humidity", language),
    emoji: "💧",
    value: `${weather.humidity}%`,
    meaning: humidHigh ? t("engine.general.humidHigh", language) : t("engine.general.humidOk", language),
    recommendation: humidHigh ? t("engine.general.humidRec", language) : t("engine.general.humidNormal", language),
    updatedAt: `${t("common.updated", language)} ${weather.lastUpdated}`,
    source: weather.source,
    reason: t("reason.general", language),
    priority: 30,
  });

  cards.sort((a, b) => b.priority - a.priority);
  return cards;
}

function findBestRunningWindow(weather: WeatherData): {
  start: string;
  end: string;
  temp: number;
  uv: number;
  rainRisk: boolean;
} | null {
  const morning = weather.hourly.filter((h) => h.hour >= 5 && h.hour <= 9);
  if (morning.length === 0) return null;
  let best = morning[0];
  for (const h of morning) {
    const score = h.rainProbability * 2 + h.uv * 3 - h.temp;
    const bestScore = best.rainProbability * 2 + best.uv * 3 - best.temp;
    if (score < bestScore) best = h;
  }
  const endHour = best.hour + 1;
  return {
    start: `${String(best.hour).padStart(2, "0")}:00`,
    end: `${String(endHour).padStart(2, "0")}:30`,
    temp: best.temp,
    uv: best.uv,
    rainRisk: best.rainProbability > 30,
  };
}

function eventScore(weather: WeatherData): number {
  let score = 100;
  score -= Math.max(0, weather.rainProbability - 20) * 0.5;
  if (weather.temp > 35 || weather.temp < 15) score -= 15;
  if (weather.wind > 25) score -= 10;
  if (weather.uv > 8) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * The single most important actionable recommendation ("Your Day").
 */
export function getYourDayRecommendation(
  prefs: UserPreferences,
  weather: WeatherData,
  alerts: WeatherAlert[],
): { title: string; value: string; detail: string; emoji: string } {
  const { language } = prefs;
  const critical = alerts.find((a) => a.severity === "red" || a.severity === "orange");
  if (critical) {
    const alertLabel =
      critical.severity === "red"
        ? t("alerts.redAlert", language)
        : t("alerts.orangeAlert", language);
    return {
      title: critical.title,
      value: alertLabel,
      detail: critical.action,
      emoji: critical.severity === "red" ? "🔴" : "🟠",
    };
  }

  if (prefs.personas.includes("fitness")) {
    const w = findBestRunningWindow(weather);
    if (w) {
      const highRain = weather.rainProbability >= 80;
      return {
        title: t("engine.bestRunningWindow", language),
        value: `${w.start} – ${w.end}`,
        detail: highRain
          ? t("engine.fitness.recIndoor", language)
          : t("engine.fitness.meaning", language),
        emoji: "🏃",
      };
    }
  }

  if (prefs.personas.includes("commute")) {
    const morning = weather.hourly.find((h) => h.hour === 8);
    if (morning && morning.rainProbability > 40) {
      return {
        title: t("engine.commuteConditions", language),
        value: `${morning.rainProbability}% · 8 AM`,
        detail: t("engine.commute.leaveEarly", language),
        emoji: "☂️",
      };
    }
  }

  if (prefs.personas.includes("health") && weather.uv >= 8) {
    return {
      title: t("engine.uvIndexCard", language),
      value: `UV ${weather.uv}`,
      detail: t("engine.health.uvRecHigh", language),
      emoji: "☀️",
    };
  }

  return {
    title: t("forecast.today", language),
    value: `${weather.temp}° · ${CONDITION_LABEL[weather.condition] ?? weather.condition}`,
    detail: t("insight.normal", language),
    emoji: "🌤️",
  };
}

/**
 * Today's top insight — the single most useful thing to know.
 * Changes based on location, persona, weather, alerts, and time.
 */
export function getTopInsight(
  prefs: UserPreferences,
  weather: WeatherData,
  alerts: WeatherAlert[],
): { title: string; emoji: string; key: string } {
  const { language, personas } = prefs;
  const critical = alerts.find((a) => a.severity === "red" || a.severity === "orange");
  if (critical) {
    return {
      title: critical.title,
      emoji: critical.severity === "red" ? "🔴" : "🟠",
      key: "alert",
    };
  }

  if (personas.includes("fitness")) {
    const w = findBestRunningWindow(weather);
    if (w && weather.rainProbability < 80) {
      return {
        title: t("insight.runningWindow", language, { time: w.end }),
        emoji: "🏃",
        key: "fitness",
      };
    }
    if (weather.rainProbability >= 80) {
      return {
        title: t("insight.indoorWorkout", language),
        emoji: "🏠",
        key: "fitness-indoor",
      };
    }
  }

  if (personas.includes("commute")) {
    const morning = weather.hourly.find((h) => h.hour === 8);
    if (morning && morning.rainProbability > 40) {
      return {
        title: t("insight.commuteRain", language),
        emoji: "☂️",
        key: "commute",
      };
    }
  }

  if (personas.includes("health") && weather.uv >= 8) {
    return {
      title: t("insight.highUV", language),
      emoji: "☀️",
      key: "health-uv",
    };
  }

  if (personas.includes("health") && weather.airQuality.aqi > 150) {
    return {
      title: t("insight.aqi", language, { aqi: String(weather.airQuality.aqi) }),
      emoji: "🌬️",
      key: "health-aqi",
    };
  }

  if (personas.includes("travel")) {
    const tomorrow = weather.daily[1];
    if (tomorrow && tomorrow.rainProbability > 50) {
      return {
        title: t("insight.packing", language, { location: weather.locationName }),
        emoji: "🧳",
        key: "travel",
      };
    }
  }

  if (personas.includes("beach") && weather.marine.waveHeight >= 1.5) {
    return {
      title: t("insight.beach", language, { location: weather.locationName }),
      emoji: "🌊",
      key: "beach",
    };
  }

  return {
    title: t("insight.normal", language),
    emoji: "🌤️",
    key: "normal",
  };
}

export interface TimelineItem {
  time: string;
  label: string;
  emoji: string;
  condition: string;
  metric: string;
  explanation: string;
  action: string;
}

/**
 * Build the My Day timeline from hourly data + personas.
 * Now produces rich timeline items with condition, metric, explanation, and action.
 */
export function getTimeline(
  prefs: UserPreferences,
  weather: WeatherData,
): TimelineItem[] {
  const items: TimelineItem[] = [];
  const { language, personas } = prefs;
  const has = (p: PersonaId) => personas.includes(p);

  if (has("fitness")) {
    const w = findBestRunningWindow(weather);
    if (w && weather.rainProbability < 80) {
      const h = weather.hourly.find((x) => x.hour === Number(w.start.slice(0, 2)));
      items.push({
        time: w.start,
        label: t("timeline.running", language),
        emoji: "🏃",
        condition: h ? CONDITION_LABEL[h.condition] ?? "—" : "—",
        metric: `${w.temp}° · UV ${w.uv}`,
        explanation: t("engine.fitness.meaning", language),
        action: t("engine.fitness.recGood", language),
      });
    } else if (weather.rainProbability >= 80) {
      items.push({
        time: "06:00",
        label: t("engine.fitness.recIndoor", language),
        emoji: "🏠",
        condition: "—",
        metric: `${t("weather.rain", language)} ${weather.rainProbability}%`,
        explanation: t("engine.fitness.recIndoor", language),
        action: t("engine.fitness.recIndoor", language),
      });
    }
  }

  if (has("family") || has("commute")) {
    const morning = weather.hourly.find((h) => h.hour === 8);
    if (morning && morning.rainProbability > 30) {
      items.push({
        time: "08:00",
        label: t("timeline.commuteRain", language),
        emoji: "☂️",
        condition: CONDITION_LABEL[morning.condition] ?? "—",
        metric: `${t("weather.rain", language)} ${morning.rainProbability}%`,
        explanation: morning.rainProbability > 50 ? t("engine.commute.rainLikely", language) : t("engine.commute.rainPossible", language),
        action: t("engine.commute.leaveEarly", language),
      });
    }
  }

  if (has("health")) {
    const highUv = weather.hourly.find((h) => h.uv >= 8);
    if (highUv) {
      items.push({
        time: highUv.time,
        label: t("timeline.highUV", language, { uv: String(highUv.uv) }),
        emoji: "☀️",
        condition: CONDITION_LABEL[highUv.condition] ?? "—",
        metric: `UV ${highUv.uv}`,
        explanation: t("engine.health.uvMeaningHigh", language),
        action: t("engine.health.uvRecHigh", language),
      });
    }
    const aqiHour = weather.hourly.find((h) => h.hour === 8);
    if (aqiHour && weather.airQuality.aqi > 100) {
      const level = weather.airQuality.aqi > 150 ? t("alerts.warning", language) : t("alerts.information", language);
      items.push({
        time: aqiHour.time,
        label: t("timeline.airQuality", language, { level }),
        emoji: "🌬️",
        condition: CONDITION_LABEL[aqiHour.condition] ?? "—",
        metric: `AQI ${weather.airQuality.aqi}`,
        explanation: t("engine.health.aqiMeaningHigh", language),
        action: t("engine.health.aqiRecHigh", language),
      });
    }
  }

  if (has("travel")) {
    const morning = weather.hourly.find((h) => h.hour === 7);
    if (morning) {
      items.push({
        time: morning.time,
        label: t("timeline.goodTravel", language),
        emoji: "✈️",
        condition: CONDITION_LABEL[morning.condition] ?? "—",
        metric: `${morning.temp}°`,
        explanation: t("engine.travel.clear", language),
        action: t("engine.travel.packing", language, { items: "light layers" }),
      });
    }
    const afternoon = weather.hourly.find((h) => h.hour === 14);
    if (afternoon && afternoon.rainProbability > 40) {
      items.push({
        time: afternoon.time,
        label: t("timeline.rainAfternoon", language),
        emoji: "🌧️",
        condition: CONDITION_LABEL[afternoon.condition] ?? "—",
        metric: `${t("weather.rain", language)} ${afternoon.rainProbability}%`,
        explanation: t("engine.travel.rainTomorrow", language),
        action: t("timeline.carryRainLayer", language),
      });
    }
  }

  if (has("beach")) {
    const morning = weather.hourly.find((h) => h.hour === 8);
    if (morning && weather.marine.waveHeight < 1.5) {
      items.push({
        time: morning.time,
        label: t("timeline.lowerWaves", language),
        emoji: "🌊",
        condition: weather.marine.seaCondition,
        metric: `${weather.marine.waveHeight} m`,
        explanation: t("engine.beach.manageable", language),
        action: t("engine.beach.safe", language),
      });
    }
    const afternoon = weather.hourly.find((h) => h.hour === 14);
    if (afternoon && weather.marine.waveHeight >= 1.5) {
      items.push({
        time: afternoon.time,
        label: t("timeline.strongerWinds", language),
        emoji: "💨",
        condition: weather.marine.seaCondition,
        metric: `${weather.marine.waveHeight} m · ${weather.marine.wind} km/h`,
        explanation: t("engine.beach.unsuitable", language),
        action: t("engine.beach.avoidSwim", language),
      });
    }
  }

  // Rain peak for everyone
  const rainPeak = [...weather.hourly].sort((a, b) => b.rainProbability - a.rainProbability)[0];
  if (rainPeak && rainPeak.rainProbability > 30) {
    // Avoid duplicate times
    if (!items.some((x) => x.time === rainPeak.time)) {
      items.push({
        time: rainPeak.time,
        label: t("timeline.rainIncreases", language),
        emoji: "🌧️",
        condition: CONDITION_LABEL[rainPeak.condition] ?? "—",
        metric: `${t("weather.rain", language)} ${rainPeak.rainProbability}%`,
        explanation: t("engine.commute.rainLikely", language),
        action: t("engine.commute.leaveEarly", language),
      });
    }
  }

  // Comfortable evening
  const comfortable = weather.hourly.find((h) => h.hour === 18);
  if (comfortable && !items.some((x) => x.time === "18:00")) {
    items.push({
      time: "18:00",
      label: t("timeline.comfortable", language),
      emoji: "🌤️",
      condition: CONDITION_LABEL[comfortable.condition] ?? "—",
      metric: `${comfortable.temp}°`,
      explanation: t("engine.general.humidOk", language),
      action: t("engine.general.humidNormal", language),
    });
  }

  // Sunset
  items.push({
    time: weather.sunset,
    label: t("timeline.sunset", language),
    emoji: "🌆",
    condition: "—",
    metric: weather.sunset,
    explanation: t("engine.fitness.sunMeaning", language),
    action: t("engine.fitness.sunRec", language),
  });

  return items.sort((a, b) => a.time.localeCompare(b.time));
}
