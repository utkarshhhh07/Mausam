import type { WeatherData, WeatherAlert, LocationInfo, HourlyPoint, DailyPoint, WeatherCondition, AirQuality, MarineData } from "@/types";
import { WEATHER } from "@/data/weather";
import { ALERTS } from "@/data/alerts";
import { LOCATIONS, getLocation } from "@/data/locations";

// ── WMO weather code → internal condition ──────────────────
function wmoToCondition(code: number, isDay: boolean): WeatherCondition {
  if (code === 0) return isDay ? "sunny" : "clear-night";
  if (code <= 3) return isDay ? "partly-cloudy" : "clear-night";
  if (code >= 45 && code <= 48) return "fog";
  if (code >= 51 && code <= 57) return "rain";
  if (code >= 61 && code <= 67) return code >= 65 ? "heavy-rain" : "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "heavy-rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95 && code <= 99) return "thunderstorm";
  if (code >= 51 && code <= 67) return "rain";
  return "cloudy";
}

function uvCategory(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function aqiCategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

function pollenLevel(value: number | null): "low" | "moderate" | "high" | null {
  if (value === null || value === undefined) return null;
  if (value < 1) return "low";
  if (value < 5) return "moderate";
  return "high";
}

function windDirLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function seaConditionLabel(waveH: number): string {
  if (waveH < 0.5) return "Calm";
  if (waveH < 1.0) return "Moderate";
  if (waveH < 1.5) return "Rough";
  return "Very Rough";
}

function frostRiskFromTemp(soilTemp: number, minTemp: number): "none" | "low" | "moderate" {
  if (minTemp <= 0 || soilTemp <= 0) return "moderate";
  if (minTemp <= 4 || soilTemp <= 4) return "low";
  return "none";
}

function timeFromIso(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function dayLabel(iso: string, index: number): string {
  if (index === 0) return "Today";
  const d = new Date(iso);
  return d.toLocaleDateString("en", { weekday: "short" });
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en", { day: "numeric", month: "short" });
}

// ── Fetch helpers ──────────────────────────────────────────
async function fetchJson(url: string): Promise<any> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.json();
}

async function fetchWeatherApi(locationName: string): Promise<any | null> {
  try {
    const resp = await fetch(`/api/weather?q=${encodeURIComponent(locationName)}`);
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}

async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<any | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,apparent_temperature_min,apparent_temperature_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,sunrise,sunset,daylight_duration,sunshine_duration,precipitation_hours,precipitation_probability_max",
    hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,snow_depth,snowfall,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_80m,soil_temperature_6cm,soil_moisture_1_to_3cm",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,rain,showers,snowfall,weather_code",
    timezone: "auto",
    past_days: "3",
  });
  return fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`).catch(() => null);
}

async function fetchOpenMeteoAirQuality(lat: number, lon: number): Promise<any | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "pm10,pm2_5,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen,uv_index,dust,uv_index_clear_sky",
    current: "ragweed_pollen,olive_pollen,mugwort_pollen,grass_pollen,alder_pollen,birch_pollen,uv_index,dust,pm2_5,pm10,us_aqi,european_aqi,uv_index_clear_sky",
    timezone: "auto",
    past_days: "3",
    forecast_days: "7",
  });
  return fetchJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`).catch(() => null);
}

async function fetchOpenMeteoMarine(lat: number, lon: number): Promise<any | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_level_height_msl,sea_surface_temperature,ocean_current_velocity,ocean_current_direction",
    timezone: "auto",
    forecast_days: "3",
  });
  return fetchJson(`https://marine-api.open-meteo.com/v1/marine?${params}`).catch(() => null);
}

// ── Normalize ──────────────────────────────────────────────
function normalizeWeatherData(
  location: LocationInfo,
  omWeather: any | null,
  omAir: any | null,
  omMarine: any | null,
  weatherApi: any | null,
): WeatherData {
  const mock = WEATHER[location.id] ?? WEATHER.pune;

  // If all APIs fail, return mock
  if (!omWeather && !weatherApi) {
    return { ...mock, isLive: false };
  }

  const om = omWeather?.current;
  const omDaily = omWeather?.daily;
  const omHourly = omWeather?.hourly;
  const isDay = om?.is_day === 1;

  // Current weather — prefer Open-Meteo, supplement with WeatherAPI
  const temp = Math.round(om?.temperature_2m ?? weatherApi?.current?.temp_c ?? mock.temp);
  const feelsLike = Math.round(om?.apparent_temperature ?? weatherApi?.current?.feelslike_c ?? mock.feelsLike);
  const condition = wmoToCondition(om?.weather_code ?? 0, isDay);
  const humidity = Math.round(om?.relative_humidity_2m ?? mock.humidity);
  const wind = Math.round(om?.wind_speed_10m ?? mock.wind);
  const windDir = windDirLabel(om?.wind_direction_10m ?? 0);
  const visibility = omHourly?.visibility?.[0] != null
    ? Math.round(omHourly.visibility[0] / 1000)
    : mock.visibility;

  // Precipitation
  const precipitation = om?.precipitation ?? 0;
  const rainProbability = omDaily?.precipitation_probability_max?.[0] ?? mock.rainProbability;
  const snowfall = om?.snowfall ?? 0;
  const snowDepth = omHourly?.snow_depth?.[0] ?? 0;

  // UV — prefer air quality API's uv_index, then weather API, then mock
  const uvRaw = omAir?.current?.uv_index ?? weatherApi?.current?.uv ?? mock.uv;
  const uv = Math.round(uvRaw);
  const uvCat = uvCategory(uv);

  // Sunrise/sunset
  const sunrise = omDaily?.sunrise?.[0] ? timeFromIso(omDaily.sunrise[0]) : mock.sunrise;
  const sunset = omDaily?.sunset?.[0] ? timeFromIso(omDaily.sunset[0]) : mock.sunset;

  // Soil
  const soilMoistureRaw = omHourly?.soil_moisture_1_to_3cm?.[0];
  const soilMoisture = soilMoistureRaw != null
    ? Math.round(soilMoistureRaw * 100)
    : mock.soilMoisture;
  const soilTemp = omHourly?.soil_temperature_6cm?.[0] != null
    ? Math.round(omHourly.soil_temperature_6cm[0])
    : 20;

  // Frost risk
  const minTemp = omDaily?.temperature_2m_min?.[0] ?? temp - 5;
  const frostRisk = frostRiskFromTemp(soilTemp, minTemp);

  // Air quality
  const aqiVal = Math.round(omAir?.current?.us_aqi ?? weatherApi?.current?.air_quality?.["us-epa-index"] * 50 ?? mock.airQuality.aqi);
  const pm25 = Math.round(omAir?.current?.pm2_5 ?? mock.airQuality.pm25);
  const pm10 = Math.round(omAir?.current?.pm10 ?? mock.airQuality.pm10);

  // Pollen — check all pollen types, use highest non-null
  const pollenTypes = ["grass_pollen", "birch_pollen", "alder_pollen", "mugwort_pollen", "olive_pollen", "ragweed_pollen"];
  let maxPollen: number | null = null;
  let pollenAvailable = false;
  for (const pt of pollenTypes) {
    const v = omAir?.current?.[pt];
    if (v != null) {
      pollenAvailable = true;
      if (maxPollen === null || v > maxPollen) maxPollen = v;
    }
  }
  const pollen = pollenLevel(maxPollen) ?? "low";

  const airQuality: AirQuality = {
    aqi: aqiVal,
    category: aqiCategory(aqiVal),
    pm25,
    pm10,
    pollen,
    pollenAvailable,
    source: omAir ? "Open-Meteo AQ" : (weatherApi ? "WeatherAPI" : mock.airQuality.source),
  };

  // Marine — only for coastal locations
  let marine: MarineData;
  if (location.coastal && omMarine && omMarine.hourly) {
    const mh = omMarine.hourly;
    const waveH = mh.wave_height?.[0] ?? 0;
    const wavePeriod = mh.wave_period?.[0] ?? 0;
    const waveDir = mh.wave_direction?.[0] != null ? windDirLabel(mh.wave_direction[0]) : "—";
    const swellH = mh.swell_wave_height?.[0] ?? 0;
    const swellPeriod = mh.swell_wave_period?.[0] ?? 0;
    const swellDir = mh.swell_wave_direction?.[0] != null ? windDirLabel(mh.swell_wave_direction[0]) : "—";
    const seaLevel = mh.sea_level_height_msl?.[0] ?? 0;
    const waterTemp = mh.sea_surface_temperature?.[0] ?? 0;
    const currentVel = mh.ocean_current_velocity?.[0] ?? 0;
    const currentDir = mh.ocean_current_direction?.[0] != null ? windDirLabel(mh.ocean_current_direction[0]) : "—";
    marine = {
      waveHeight: Math.round(waveH * 10) / 10,
      wavePeriod: Math.round(wavePeriod),
      waveDirection: waveDir,
      swellHeight: Math.round(swellH * 10) / 10,
      swellPeriod: Math.round(swellPeriod),
      swellDirection: swellDir,
      seaLevelHeight: Math.round(seaLevel * 100) / 100,
      waterTemp: Math.round(waterTemp),
      oceanCurrentVelocity: Math.round(currentVel * 100) / 100,
      oceanCurrentDirection: currentDir,
      wind,
      tideHigh: mock.marine.tideHigh,
      tideLow: mock.marine.tideLow,
      seaCondition: seaConditionLabel(waveH),
      source: "Open-Meteo Marine",
      available: true,
    };
  } else {
    marine = {
      ...mock.marine,
      wavePeriod: 0,
      waveDirection: "—",
      swellHeight: 0,
      swellPeriod: 0,
      swellDirection: "—",
      seaLevelHeight: 0,
      oceanCurrentVelocity: 0,
      oceanCurrentDirection: "—",
      available: false,
    };
  }

  // Hourly — build 24h from Open-Meteo
  const hourly: HourlyPoint[] = [];
  if (omHourly?.time) {
    const nowHour = new Date().getHours();
    for (let i = 0; i < Math.min(48, omHourly.time.length); i++) {
      const iso = omHourly.time[i];
      const d = new Date(iso);
      const h = d.getHours();
      if (h === nowHour || h === nowHour + 1 || (i < 24 && h >= 5 && h <= 22)) {
        const code = omHourly.weather_code?.[i] ?? 0;
        const vis = omHourly.visibility?.[i] != null ? omHourly.visibility[i] / 1000 : visibility;
        hourly.push({
          time: `${String(h).padStart(2, "0")}:00`,
          hour: h,
          temp: Math.round(omHourly.temperature_2m?.[i] ?? temp),
          feelsLike: Math.round(omHourly.apparent_temperature?.[i] ?? feelsLike),
          condition: wmoToCondition(code, h >= 6 && h <= 18),
          rainProbability: Math.round(omHourly.precipitation_probability?.[i] ?? 0),
          snowfall: Math.round((omHourly.snowfall?.[i] ?? 0) * 10) / 10,
          humidity: Math.round(omHourly.relative_humidity_2m?.[i] ?? humidity),
          wind: Math.round(omHourly.wind_speed_10m?.[i] ?? wind),
          uv: Math.round(omHourly.uv_index?.[i] ?? uv),
          visibility: Math.round(vis),
        });
      }
    }
  }
  if (hourly.length === 0) hourly.push(...mock.hourly.slice(0, 24));

  // Daily — 7-day from Open-Meteo
  const daily: DailyPoint[] = [];
  if (omDaily?.time) {
    for (let i = 0; i < Math.min(7, omDaily.time.length); i++) {
      const iso = omDaily.time[i];
      const code = omDaily.weather_code?.[i] ?? 0;
      daily.push({
        day: dayLabel(iso, i),
        dateLabel: dateLabel(iso),
        high: Math.round(omDaily.temperature_2m_max?.[i] ?? temp),
        low: Math.round(omDaily.temperature_2m_min?.[i] ?? temp - 5),
        condition: wmoToCondition(code, true),
        rainProbability: Math.round(omDaily.precipitation_probability_max?.[i] ?? 0),
        snowfall: Math.round((omDaily.snowfall?.[i] ?? 0) * 10) / 10,
        snowDepth: 0,
        sunrise: omDaily.sunrise?.[i] ? timeFromIso(omDaily.sunrise[i]) : mock.sunrise,
        sunset: omDaily.sunset?.[i] ? timeFromIso(omDaily.sunset[i]) : mock.sunset,
      });
    }
  }
  if (daily.length === 0) daily.push(...mock.daily);

  return {
    locationId: location.id,
    locationName: location.name,
    temp,
    feelsLike,
    condition,
    humidity,
    wind,
    windDirection: windDir,
    rainProbability,
    precipitation: Math.round(precipitation * 10) / 10,
    snowfall: Math.round(snowfall * 10) / 10,
    snowDepth: Math.round(snowDepth * 10) / 10,
    uv,
    uvCategory: uvCat,
    visibility,
    sunrise,
    sunset,
    lastUpdated: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    airQuality,
    marine,
    hourly,
    daily,
    soilMoisture,
    soilTemperature: soilTemp,
    frostRisk,
    source: "Open-Meteo + WeatherAPI",
    isLive: true,
  };
}

// ── Public service ─────────────────────────────────────────
export const weatherService = {
  async getWeather(locationId: string): Promise<WeatherData> {
    const location = getLocation(locationId);

    // Fetch all 4 APIs in parallel
    const [omWeather, omAir, omMarine, weatherApi] = await Promise.all([
      fetchOpenMeteoWeather(location.lat, location.lon),
      fetchOpenMeteoAirQuality(location.lat, location.lon),
      location.coastal ? fetchOpenMeteoMarine(location.lat, location.lon) : Promise.resolve(null),
      fetchWeatherApi(location.name),
    ]);

    // If all fail, use mock
    if (!omWeather && !omAir && !weatherApi) {
      return WEATHER[locationId] ?? WEATHER.pune;
    }

    return normalizeWeatherData(location, omWeather, omAir, omMarine, weatherApi);
  },

  async getAlerts(locationId: string): Promise<WeatherAlert[]> {
    const alerts = ALERTS.filter((a) => a.locationId === locationId);
    return sortAlerts(alerts);
  },

  async getAlertsForLocations(locationIds: string[]): Promise<WeatherAlert[]> {
    const set = new Set(locationIds);
    const alerts = ALERTS.filter((a) => set.has(a.locationId));
    return sortAlerts(alerts);
  },

  getLocations(): LocationInfo[] {
    return LOCATIONS;
  },

  getLocation(id: string): LocationInfo {
    return getLocation(id);
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
