import { sportsApiManager } from "../SportsApiManager";
import { cacheManager } from "../cache/CacheManager";
import { logger } from "../../../utils/logger";

const STANDINGS_CACHE_KEY = "sports_standings";
const STANDINGS_CACHE_TTL = 300; // 5 minutes

export class SportsStandingRepository {
  async getStandings(): Promise<any> {
    const cached = await cacheManager.get<any>(STANDINGS_CACHE_KEY);
    if (cached) return cached;

    logger.info("[SportsStandingRepository] Fetching fresh standings from API manager");
    const standings = await sportsApiManager.getStandings();
    await cacheManager.set(STANDINGS_CACHE_KEY, standings, STANDINGS_CACHE_TTL);
    return standings;
  }
}

// Export single instance
export const sportsStandingRepository = new SportsStandingRepository();
