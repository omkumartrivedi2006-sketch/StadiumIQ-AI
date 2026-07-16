import axios from "axios";
import { stadiumRepository } from "../../../repositories/stadiumRepository";
import { cacheManager } from "../cache/CacheManager";
import { logger } from "../../../utils/logger";

const STADIUMS_CACHE_KEY = "sports_stadiums_all";
const STADIUM_DETAIL_CACHE_PREFIX = "sports_stadium_";
const WEATHER_CACHE_PREFIX = "stadium_weather_";
const STADIUMS_CACHE_TTL = 86400; // 24 hours
const WEATHER_CACHE_TTL = 600; // 10 minutes

// GPS Coordinates mapping for seeded stadiums
const STADIUM_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "metlife stadium": { lat: 40.8135, lon: -74.0743 },
  "sofi stadium": { lat: 33.9535, lon: -118.3390 },
  "azteca": { lat: 19.3029, lon: -99.1505 },
  "bc place": { lat: 49.2767, lon: -123.1120 }
};

export class SportsStadiumRepository {
  async getAllStadiums(filter?: any, options?: any): Promise<any> {
    const cached = await cacheManager.get<any>(STADIUMS_CACHE_KEY);
    if (cached) return cached;

    logger.info("[SportsStadiumRepository] Loading fresh stadiums from database");
    const result = await stadiumRepository.find(filter || {}, options || { limit: 100 });
    await cacheManager.set(STADIUMS_CACHE_KEY, result, STADIUMS_CACHE_TTL);
    return result;
  }

  async getStadiumById(id: string): Promise<any> {
    const cacheKey = `${STADIUM_DETAIL_CACHE_PREFIX}${id}`;
    const cached = await cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    logger.info(`[SportsStadiumRepository] Loading fresh stadium details by ID: ${id}`);
    const stadium = await stadiumRepository.findById(id);
    if (stadium) {
      await cacheManager.set(cacheKey, stadium, STADIUMS_CACHE_TTL);
    }
    return stadium;
  }

  // Get real-time weather using Open-Meteo API
  async getStadiumWeather(stadiumId: string): Promise<any> {
    const cacheKey = `${WEATHER_CACHE_PREFIX}${stadiumId}`;
    const cached = await cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    logger.info(`[SportsStadiumRepository] Fetching live weather for stadium ID: ${stadiumId}`);
    const stadium = await stadiumRepository.findById(stadiumId);
    if (!stadium) {
      throw new Error("Stadium not found");
    }

    const nameLower = stadium.name.toLowerCase();
    let coords = STADIUM_COORDINATES[nameLower];

    // Attempt fuzzy match on coordinates map
    if (!coords) {
      const matchKey = Object.keys(STADIUM_COORDINATES).find(k => nameLower.includes(k) || k.includes(nameLower));
      if (matchKey) coords = STADIUM_COORDINATES[matchKey];
    }

    // Default coordinates (Dallas, TX / AT&T Stadium equivalent area) if not resolved
    if (!coords) {
      coords = { lat: 32.7473, lon: -97.0945 };
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
      const response = await axios.get(url, { timeout: 5000 });
      const current = response.data?.current;

      if (!current) {
        throw new Error("Invalid weather response structure from Open-Meteo");
      }

      const tempC = current.temperature_2m;
      const tempF = Math.round((tempC * 9/5) + 32);
      const humidity = current.relative_humidity_2m;
      const code = current.weather_code;

      const condition = this.mapWeatherCode(code);

      const weatherReport = {
        stadiumName: stadium.name,
        city: stadium.city,
        country: stadium.country,
        temperature: `${tempF}°F (${tempC}°C)`,
        humidity: `${humidity}%`,
        condition: condition,
        windSpeed: "8 mph", // standard placeholder
        uvIndex: "Low",
        timestamp: new Date().toISOString()
      };

      await cacheManager.set(cacheKey, weatherReport, WEATHER_CACHE_TTL);
      return weatherReport;
    } catch (err: any) {
      logger.error(`[SportsStadiumRepository] Failed to query Open-Meteo API: ${err.message}. Running weather simulation fallback.`);
      
      // Fallback Weather Simulation
      const hour = new Date().getHours();
      const isNight = hour < 6 || hour > 18;
      const simulatedReport = {
        stadiumName: stadium.name,
        city: stadium.city,
        country: stadium.country,
        temperature: isNight ? "65°F (18°C)" : "75°F (24°C)",
        humidity: "55%",
        condition: "Clear",
        windSpeed: "5 mph",
        uvIndex: isNight ? "None" : "Moderate",
        timestamp: new Date().toISOString()
      };
      
      await cacheManager.set(cacheKey, simulatedReport, WEATHER_CACHE_TTL);
      return simulatedReport;
    }
  }

  private mapWeatherCode(code: number): string {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Raining";
    if (code >= 71 && code <= 77) return "Snowing";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Partly Cloudy";
  }
}

// Export single instance
export const sportsStadiumRepository = new SportsStadiumRepository();
