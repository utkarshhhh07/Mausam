import { useEffect, useState } from "react";
import { weatherService } from "@/services/weatherService";
import type { WeatherData, WeatherAlert } from "@/types";

interface WeatherState {
  weather: WeatherData | null;
  alerts: WeatherAlert[];
  loading: boolean;
  error: boolean;
  refresh: () => void;
}

export function useWeather(locationId: string): WeatherState {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([
      weatherService.getWeather(locationId),
      weatherService.getAlerts(locationId),
    ])
      .then(([w, a]) => {
        if (cancelled) return;
        setWeather(w);
        setAlerts(a);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locationId, nonce]);

  return {
    weather,
    alerts,
    loading,
    error,
    refresh: () => setNonce((n) => n + 1),
  };
}
