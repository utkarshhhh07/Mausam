const express = require("express");
const router = express.Router();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHERAPI_BASE = "https://api.weatherapi.com/v1";

router.get("/weather", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing location query (q)" });
    if (!WEATHER_API_KEY) return res.status(500).json({ error: "WEATHER_API_KEY not configured" });

    const url = `${WEATHERAPI_BASE}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(q)}&aqi=yes`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: `WeatherAPI error: ${text}` });
    }
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
